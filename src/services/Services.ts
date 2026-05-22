import axios from "axios";

export const api = axios.create({
    baseURL: "https://trustway.onrender.com/swagger"
});

export const buscar = async (url: string, setDados: Function) => {
    const resposta = await api.get(url);
    setDados(resposta.data);
};

export const cadastrar = async (url: string, dados: Object, setDados: Function) => {
    const resposta = await api.post(url, dados);
    setDados(resposta.data);
    return resposta.data;
};

export const atualizar = async (url: string, dados: Object, setDados: Function) => {
    const resposta = await api.put(url, dados);
    setDados(resposta.data);
    return resposta.data;
};

export const deletar = async (url: string) => {
    await api.delete(url);
};
