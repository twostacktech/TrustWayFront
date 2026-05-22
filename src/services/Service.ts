import axios from "axios";

// Instância do Axios conectada à sua API hospedada no Render
export const api = axios.create({
    baseURL: "https://trustway.onrender.com"
});

// GET - Adicionado o parâmetro 'header' para enviar o Token de Autenticação
export const buscar = async (url: string, setDados: Function, header?: Object) => {
    const resposta = await api.get(url, header);
    setDados(resposta.data);
};

// POST - Adicionado o parâmetro 'header' para autorizar o cadastro
export const cadastrar = async (url: string, dados: Object, setDados: Function, header?: Object) => {
    const resposta = await api.post(url, dados, header);
    setDados(resposta.data);
    return resposta.data;
};

// PUT - Adicionado o parâmetro 'header' para autorizar a edição
export const atualizar = async (url: string, dados: Object, setDados: Function, header?: Object) => {
    const resposta = await api.put(url, dados, header);
    setDados(resposta.data);
    return resposta.data;
};

// DELETE - Adicionado o parâmetro 'header' para autorizar a exclusão
export const deletar = async (url: string, header?: Object) => {
    await api.delete(url, header);
};

// import axios from "axios";

// export const api = axios.create({
//     baseURL: "https://trustway.onrender.com"
// });

// export const buscar = async (url: string, setDados: Function) => {
//     const resposta = await api.get(url);
//     setDados(resposta.data);
// };

// export const cadastrar = async (url: string, dados: Object, setDados: Function) => {
//     const resposta = await api.post(url, dados);
//     setDados(resposta.data);
//     return resposta.data;
// };

// export const atualizar = async (url: string, dados: Object, setDados: Function) => {
//     const resposta = await api.put(url, dados);
//     setDados(resposta.data);
//     return resposta.data;
// };

// export const deletar = async (url: string) => {
//     await api.delete(url);
// };