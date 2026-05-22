import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { X } from "@phosphor-icons/react"

import { atualizar, cadastrar } from "../../services/Service"
import type Apolice from "../../models/Apolice"

type FormApoliceProps = {
  fecharModal: () => void
  atualizarListagem: () => Promise<void> | void
  adicionarApolice: (apolice: Apolice) => void
  apoliceEditando?: Apolice | null
}

function FormApolice({
  fecharModal,
  atualizarListagem,
  adicionarApolice,
  apoliceEditando,
}: FormApoliceProps) {
  const [salvando, setSalvando] = useState(false)

  const [formData, setFormData] = useState({
    dataInicio: "",
    mensalidade: "",
    status: "Ativa",
    percentualCobertura: "",
    valorFranquia: "",
  })

  useEffect(() => {
    if (apoliceEditando) {
      setFormData({
        dataInicio:
          typeof apoliceEditando.dataInicio === "string"
            ? apoliceEditando.dataInicio.split("T")[0]
            : "",
        mensalidade: apoliceEditando.mensalidade.toString(),
        status: apoliceEditando.status,
        percentualCobertura: apoliceEditando.percentualCobertura.toString(),
        valorFranquia: apoliceEditando.valorFranquia.toString(),
      })
    }
  }, [apoliceEditando])

  const atualizarCampo = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [evento.target.name]: evento.target.value,
    })
  }

  async function salvarApolice(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando) return

    setSalvando(true)

    const dadosParaEnviar = {
      dataInicio: formData.dataInicio,
      mensalidade: Number(formData.mensalidade),
      status: formData.status,
      percentualCobertura: Number(formData.percentualCobertura),
      valorFranquia: Number(formData.valorFranquia),
    }

    try {
      let apoliceSalva: Apolice

      if (apoliceEditando) {
        apoliceSalva = await atualizar(
          `/apolices/${apoliceEditando.id}`,
          { id: apoliceEditando.id, ...dadosParaEnviar },
          () => {}
        )
        toast.success("Apólice atualizada com sucesso!")
      } else {
        apoliceSalva = await cadastrar("/apolices", dadosParaEnviar, () => {})
        adicionarApolice(apoliceSalva)
        toast.success("Apólice cadastrada com sucesso!")
      }

      await atualizarListagem()
      fecharModal()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao salvar apólice. Verifique os dados.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#0c0c0e] p-6 shadow-2xl text-white">
        {/* Header do Modal */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
              {apoliceEditando ? "Editar apólice" : "Nova apólice"}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Preencha os dados da apólice.</p>
          </div>

          <button
            type="button"
            onClick={fecharModal}
            disabled={salvando}
            className="text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={salvarApolice} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Data de início
            </label>
            <input
              type="date"
              name="dataInicio"
              value={formData.dataInicio}
              onChange={atualizarCampo}
              required
              disabled={salvando}
              className="w-full rounded-lg border border-zinc-800 bg-[#121214] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Mensalidade
            </label>
            <input
              type="number"
              name="mensalidade"
              placeholder="R$ 0,00"
              value={formData.mensalidade}
              onChange={atualizarCampo}
              min="0"
              step="0.01"
              required
              disabled={salvando}
              className="w-full rounded-lg border border-zinc-800 bg-[#121214] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Percentual de cobertura (%)
            </label>
            <input
              type="number"
              name="percentualCobertura"
              placeholder="000"
              value={formData.percentualCobertura}
              onChange={atualizarCampo}
              min="0"
              max="100"
              step="0.01"
              required
              disabled={salvando}
              className="w-full rounded-lg border border-zinc-800 bg-[#121214] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Valor da franquia
            </label>
            <input
              type="number"
              name="valorFranquia"
              placeholder="R$ 0,00"
              value={formData.valorFranquia}
              onChange={atualizarCampo}
              min="0"
              step="0.01"
              required
              disabled={salvando}
              className="w-full rounded-lg border border-zinc-800 bg-[#121214] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={atualizarCampo}
              disabled={salvando}
              className="w-full rounded-lg border border-zinc-800 bg-[#121214] px-4 py-3 text-sm text-white outline-none focus:border-sky-500 transition-colors disabled:opacity-50 appearance-none"
            >
              <option value="Ativa">Ativa</option>
              <option value="Pendente">Pendente</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-900">
            <button
              type="button"
              onClick={fecharModal}
              disabled={salvando}
              className="text-sm font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-sky-700 active:scale-98 disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormApolice

// import { useEffect, useState } from "react"
// import { toast } from "react-toastify"

// import {
//   atualizar,
//   cadastrar,
// } from "../../services/Service"

// import type Apolice from "../../models/Apolice"

// type FormApoliceProps = {
//   fecharModal: () => void
//   atualizarListagem: () => Promise<void> | void
//   adicionarApolice: (apolice: Apolice) => void
//   apoliceEditando?: Apolice | null
// }

// function FormApolice({
//   fecharModal,
//   atualizarListagem,
//   adicionarApolice,
//   apoliceEditando,
// }: FormApoliceProps) {
//   const [salvando, setSalvando] = useState(false)

//   const [formData, setFormData] = useState({
//     dataInicio: "",
//     mensalidade: "",
//     status: "Ativa",
//     percentualCobertura: "",
//     valorFranquia: "",
//   })

//   useEffect(() => {
//     if (apoliceEditando) {
//       setFormData({
//         dataInicio:
//           typeof apoliceEditando.dataInicio === "string"
//             ? apoliceEditando.dataInicio.split("T")[0]
//             : "",

//         mensalidade:
//           apoliceEditando.mensalidade.toString(),

//         status: apoliceEditando.status,

//         percentualCobertura:
//           apoliceEditando.percentualCobertura.toString(),

//         valorFranquia:
//           apoliceEditando.valorFranquia.toString(),
//       })
//     }
//   }, [apoliceEditando])

//   const atualizarCampo = (
//     evento: React.ChangeEvent<
//       HTMLInputElement | HTMLSelectElement
//     >
//   ) => {
//     setFormData({
//       ...formData,
//       [evento.target.name]: evento.target.value,
//     })
//   }

//   async function salvarApolice(
//     evento: React.FormEvent<HTMLFormElement>
//   ) {
//     evento.preventDefault()

//     if (salvando) return

//     setSalvando(true)

//     const dadosParaEnviar = {
//       dataInicio: formData.dataInicio,
//       mensalidade: Number(formData.mensalidade),
//       status: formData.status,
//       percentualCobertura: Number(
//         formData.percentualCobertura
//       ),
//       valorFranquia: Number(
//         formData.valorFranquia
//       ),
//     }

//     try {
//       let apoliceSalva: Apolice

//       if (apoliceEditando) {
//         apoliceSalva = await atualizar(
//           `/apolices/${apoliceEditando.id}`,
//           {
//             id: apoliceEditando.id,
//             ...dadosParaEnviar,
//           },
//           () => {}
//         )

//         toast.success(
//           "Apólice atualizada com sucesso!"
//         )
//       } else {
//         apoliceSalva = await cadastrar(
//           "/apolices",
//           dadosParaEnviar,
//           () => {}
//         )

//         adicionarApolice(apoliceSalva)

//         toast.success(
//           "Apólice cadastrada com sucesso!"
//         )
//       }

//       await atualizarListagem()

//       fecharModal()
//     } catch (error) {
//       console.error(error)

//       toast.error(
//         "Erro ao salvar apólice. Verifique os dados."
//       )
//     } finally {
//       setSalvando(false)
//     }
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
//       <div className="w-full max-w-2xl rounded-2xl bg-white p-7 shadow-2xl">
//         <div className="mb-6 flex items-center justify-between">
//           <h2 className="text-2xl font-bold text-slate-950">
//             {apoliceEditando
//               ? "Editar apólice"
//               : "Nova apólice"}
//           </h2>

//           <button
//             type="button"
//             onClick={fecharModal}
//             disabled={salvando}
//             className="text-2xl text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             ×
//           </button>
//         </div>

//         <form
//           onSubmit={salvarApolice}
//           className="space-y-4"
//         >
//           <div>
//             <label className="mb-2 block font-semibold">
//               Data de início
//             </label>

//             <input
//               type="date"
//               name="dataInicio"
//               value={formData.dataInicio}
//               onChange={atualizarCampo}
//               required
//               disabled={salvando}
//               className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
//             />
//           </div>

//           <div>
//             <label className="mb-2 block font-semibold">
//               Mensalidade
//             </label>

//             <input
//               type="number"
//               name="mensalidade"
//               value={formData.mensalidade}
//               onChange={atualizarCampo}
//               min="0"
//               step="0.01"
//               required
//               disabled={salvando}
//               className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
//             />
//           </div>

//           <div>
//             <label className="mb-2 block font-semibold">
//               Percentual de cobertura (%)
//             </label>

//             <input
//               type="number"
//               name="percentualCobertura"
//               value={formData.percentualCobertura}
//               onChange={atualizarCampo}
//               min="0"
//               max="100"
//               step="0.01"
//               required
//               disabled={salvando}
//               className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
//             />
//           </div>

//           <div>
//             <label className="mb-2 block font-semibold">
//               Valor da franquia
//             </label>

//             <input
//               type="number"
//               name="valorFranquia"
//               value={formData.valorFranquia}
//               onChange={atualizarCampo}
//               min="0"
//               step="0.01"
//               required
//               disabled={salvando}
//               className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
//             />
//           </div>

//           <div>
//             <label className="mb-2 block font-semibold">
//               Status
//             </label>

//             <select
//               name="status"
//               value={formData.status}
//               onChange={atualizarCampo}
//               disabled={salvando}
//               className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none disabled:bg-slate-100"
//             >
//               <option>Ativa</option>
//               <option>Pendente</option>
//               <option>Cancelada</option>
//             </select>
//           </div>

//           <div className="flex justify-end gap-4 pt-3">
//             <button
//               type="button"
//               onClick={fecharModal}
//               disabled={salvando}
//               className="font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               Cancelar
//             </button>

//             <button
//               type="submit"
//               disabled={salvando}
//               className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
//             >
//               {salvando
//                 ? "Salvando..."
//                 : "Salvar"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default FormApolice

