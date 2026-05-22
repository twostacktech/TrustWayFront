import type Veiculo from "./Veiculo";

export interface Usuario {
    id: number;
    nome: string;
    cpf: string;
    // adicione outros campos do usuário se houver (ex: email)
}

export default interface Apolice {
    id: number;
    dataInicio: string | Date;
    mensalidade: number;
    status: string;
    percentualCobertura: number;
    valorFranquia: number;
    usuario: Usuario; // Mudou de 'cliente' para 'usuario'
    veiculo: Veiculo; // Mudou de 'placa' string para o objeto 'veiculo'
}

// // import type Usuario from "./Usuario";
// // import type Veiculo from "./Veiculo";

// export default interface Apolice {
//   id: number;
//   dataInicio: Date | string;
//   mensalidade: number | string;
//   status: string;
//   percentualCobertura: number;
//   valorFranquia: number;

// //   usuario?: Usuario;
// //   veiculo?: Veiculo;
// }
