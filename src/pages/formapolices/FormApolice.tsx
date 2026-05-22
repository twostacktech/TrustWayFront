import axios from "axios";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { api, atualizar, cadastrar, deletar } from "../../services/Service";
import type Apolice from "../../models/Apolice";
import type Beneficiario from "../../models/Beneficiarios";
import type Cliente from "../../models/Cliente";

type FormApoliceProps = {
  fecharModal: () => void;
  atualizarListagem: () => Promise<void> | void;
  adicionarApolice: (apolice: Apolice) => void;
  apoliceEditando?: Apolice | null;
};

type BeneficiarioForm = {
  id_beneficiario?: number;
  nome: string;
  cpf: string;
  parentesco: string;
  percentual: string;
};

const criarBeneficiarioVazio = (): BeneficiarioForm => ({
  nome: "",
  cpf: "",
  parentesco: "",
  percentual: "",
});

const limparCPF = (valor: string) => valor.replace(/\D/g, "");

function FormApolice({
  fecharModal,
  atualizarListagem,
  adicionarApolice,
  apoliceEditando,
}: FormApoliceProps) {
  const [salvando, setSalvando] = useState(false);
  const [beneficiariosRemovidos, setBeneficiariosRemovidos] = useState<
    number[]
  >([]);
  const [formData, setFormData] = useState({
    cpf: apoliceEditando?.cliente?.cpf ?? "",
    cobertura: apoliceEditando?.cobertura ?? "Vida Individual",
    valor_segurado: apoliceEditando?.valor_segurado?.toString() ?? "",
    mensalidade: apoliceEditando?.mensalidade?.toString() ?? "",
    status: apoliceEditando?.status ?? "Ativa",
    data_inicio:
      typeof apoliceEditando?.data_inicio === "string"
        ? apoliceEditando.data_inicio.split("T")[0]
        : "",
  });
  const [beneficiarios, setBeneficiarios] = useState<BeneficiarioForm[]>(
    apoliceEditando?.beneficiario?.length
      ? apoliceEditando.beneficiario.map((beneficiario) => ({
          id_beneficiario: beneficiario.id_beneficiario,
          nome: beneficiario.nome,
          cpf: beneficiario.cpf,
          parentesco: beneficiario.parentesco,
          percentual: beneficiario.percentual.toString(),
        }))
      : [criarBeneficiarioVazio()],
  );
  function formatarCPF(valor: string) {
    return limparCPF(valor)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  }

  const atualizarCampo = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    let valor = evento.target.value;

    if (evento.target.name === "cpf") {
      valor = formatarCPF(valor);
    }

    setFormData({
      ...formData,
      [evento.target.name]: valor,
    });
  };

  const atualizarBeneficiario = (
    index: number,
    campo: keyof BeneficiarioForm,
    valor: string,
  ) => {
    let valorFormatado = valor;

    if (campo === "cpf") {
      valorFormatado = formatarCPF(valor);
    }

    setBeneficiarios((beneficiariosAtuais) =>
      beneficiariosAtuais.map((beneficiario, beneficiarioIndex) =>
        beneficiarioIndex === index
          ? { ...beneficiario, [campo]: valorFormatado }
          : beneficiario,
      ),
    );
  };

  const adicionarBeneficiario = () => {
    setBeneficiarios((beneficiariosAtuais) => [
      ...beneficiariosAtuais,
      criarBeneficiarioVazio(),
    ]);
  };

  const removerBeneficiario = (index: number) => {
    setBeneficiarios((beneficiariosAtuais) => {
      const beneficiarioRemovido = beneficiariosAtuais[index];

      if (beneficiarioRemovido?.id_beneficiario) {
        setBeneficiariosRemovidos((idsAtuais) => [
          ...idsAtuais,
          beneficiarioRemovido.id_beneficiario as number,
        ]);
      }

      return beneficiariosAtuais.filter(
        (_, beneficiarioIndex) => beneficiarioIndex !== index,
      );
    });
  };

  const obterMensagemErro = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const mensagem = error.response?.data?.message;

      if (Array.isArray(mensagem)) return mensagem.join("\n");
      if (typeof mensagem === "string") return mensagem;
      if (typeof error.response?.data === "string") return error.response.data;
    }

    return "Verifique os dados e tente novamente.";
  };

  async function salvarApolice(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (salvando) return;

    const percentualTotal = beneficiarios.reduce(
      (total, beneficiario) => total + Number(beneficiario.percentual),
      0,
    );

    if (Math.abs(percentualTotal - 100) > 0.01) {
      toast.error("A soma dos percentuais dos beneficiários precisa ser 100%.");
      return;
    }

    const cpfCliente = limparCPF(formData.cpf);

    const dadosParaEnviar = {
      data_inicio: formData.data_inicio,
      mensalidade: Number(formData.mensalidade),
      valor_segurado: Number(formData.valor_segurado),
      status: formData.status,
      cobertura: formData.cobertura,
      cliente: {
        cpf: cpfCliente,
      },
    };

    setSalvando(true);

    try {
      const apoliceSalva = apoliceEditando
        ? await atualizar(
            `/apolices/${apoliceEditando.id_apolice}`,
            {
              id_apolice: apoliceEditando.id_apolice,
              ...dadosParaEnviar,
              beneficiario: apoliceEditando.beneficiario ?? [],
            },
            () => {},
          )
        : await cadastrar("/apolices", dadosParaEnviar, () => {});
      const beneficiariosSalvos: Beneficiario[] = [];

      try {
        for (const idBeneficiario of beneficiariosRemovidos) {
          await deletar(`/beneficiarios/${idBeneficiario}`);
        }

        for (const beneficiario of beneficiarios) {
          const dadosBeneficiario = {
            id_beneficiario: beneficiario.id_beneficiario,
            nome: beneficiario.nome,
            cpf: limparCPF(beneficiario.cpf),
            parentesco: beneficiario.parentesco,
            percentual: Number(beneficiario.percentual),
            apolice: {
              id_apolice: apoliceSalva.id_apolice,
            },
          };
          const beneficiarioSalvo = beneficiario.id_beneficiario
            ? await atualizar("/beneficiarios", dadosBeneficiario, () => {})
            : await cadastrar("/beneficiarios", dadosBeneficiario, () => {});

          beneficiariosSalvos.push(beneficiarioSalvo);
        }
      } catch (error) {
        await atualizarListagem();
        toast.error(
          `A apólice foi salva, mas houve erro ao salvar beneficiários.\n${obterMensagemErro(
            error,
          )}`,
        );
        fecharModal();
        return;
      }

      let clienteApolice =
        apoliceSalva.cliente ??
        apoliceEditando?.cliente ??
        ({ cpf: cpfCliente } as Cliente);

      try {
        const respostaCliente = await api.get<Cliente>(`/clientes/${cpfCliente}`);
        clienteApolice = respostaCliente.data;
      } catch (error) {
        console.warn("Apólice salva, mas não foi possível buscar o cliente:", error);
      }

      const apoliceCompleta = {
        ...dadosParaEnviar,
        ...apoliceSalva,
        valor_segurado: Number(formData.valor_segurado),
        mensalidade: Number(formData.mensalidade),
        data_inicio: formData.data_inicio,
        cliente: clienteApolice,
        beneficiario: beneficiariosSalvos,
      } as Apolice;

      toast.success("Apólice cadastrada com sucesso!");
      await atualizarListagem();
      if (!apoliceEditando) adicionarApolice(apoliceCompleta);
      fecharModal();
    } catch (error) {
      console.error(error);
      toast.error(
        "Erro ao cadastrar apólice. Verifique os dados e tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-950">
            {apoliceEditando ? "Editar apólice" : "Nova apólice"}
          </h2>

          <button
            type="button"
            onClick={fecharModal}
            disabled={salvando}
            className="text-2xl text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={salvarApolice} className="space-y-4">
          <div>
            <label className="mb-2 block font-semibold">CPF do cliente</label>

            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={atualizarCampo}
              placeholder="Digite o CPF do cliente"
              maxLength={14}
              inputMode="numeric"
              required
              disabled={salvando}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Cobertura</label>

            <select
              name="cobertura"
              value={formData.cobertura}
              onChange={atualizarCampo}
              disabled={salvando}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
            >
              <option>Vida Individual</option>
              <option>Vida em Grupo</option>
              <option>Acidentes Pessoais</option>
              <option>Doenças Graves</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-semibold">
                Valor segurado (R$)
              </label>

              <input
                type="number"
                name="valor_segurado"
                value={formData.valor_segurado}
                onChange={atualizarCampo}
                min="0"
                step="0.01"
                required
                disabled={salvando}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Mensalidade</label>

              <input
                type="number"
                name="mensalidade"
                value={formData.mensalidade}
                onChange={atualizarCampo}
                min="0"
                step="0.01"
                required
                disabled={salvando}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-semibold">Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={atualizarCampo}
                disabled={salvando}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
              >
                <option>Ativa</option>
                <option>Pendente</option>
                <option>Cancelada</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold">Data de início</label>

              <input
                type="date"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={atualizarCampo}
                required
                disabled={salvando}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
              />
            </div>
          </div>

          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-950">
                Beneficiários
              </h3>

              <button
                type="button"
                onClick={adicionarBeneficiario}
                disabled={salvando}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={18} /> Adicionar
              </button>
            </div>

            <div className="space-y-4">
              {beneficiarios.map((beneficiario, index) => (
                <div
                  key={beneficiario.id_beneficiario ?? index}
                  className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-2"
                >
                  <input
                    type="text"
                    value={beneficiario.nome}
                    onChange={(evento) =>
                      atualizarBeneficiario(index, "nome", evento.target.value)
                    }
                    placeholder="Nome do beneficiário"
                    required
                    disabled={salvando}
                    className="rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
                  />

                  <input
                    type="text"
                    value={beneficiario.cpf}
                    onChange={(evento) =>
                      atualizarBeneficiario(index, "cpf", evento.target.value)
                    }
                    placeholder="CPF do beneficiário"
                    maxLength={14}
                    inputMode="numeric"
                    required
                    disabled={salvando}
                    className="rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
                  />

                  <input
                    type="text"
                    value={beneficiario.parentesco}
                    onChange={(evento) =>
                      atualizarBeneficiario(
                        index,
                        "parentesco",
                        evento.target.value,
                      )
                    }
                    placeholder="Parentesco"
                    required
                    disabled={salvando}
                    className="rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
                  />

                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={beneficiario.percentual}
                      onChange={(evento) =>
                        atualizarBeneficiario(
                          index,
                          "percentual",
                          evento.target.value,
                        )
                      }
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Percentual (%)"
                      required
                      disabled={salvando}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
                    />

                    {beneficiarios.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerBeneficiario(index)}
                        disabled={salvando}
                        className="rounded-xl bg-red-50 px-4 text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Remover beneficiário"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-3">
            <button
              type="button"
              onClick={fecharModal}
              disabled={salvando}
              className="font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormApolice;