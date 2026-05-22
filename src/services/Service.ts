import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://trustway.onrender.com',
})

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('token') ??
    localStorage.getItem('authToken') ??
    localStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
  }

  return config
})

export const buscar = async (url: string, setDados: Function, header?: Object) => {
  const resposta = await api.get(url, header)
  setDados(resposta.data)
}

export const cadastrar = async (url: string, dados: Object, setDados: Function, header?: Object) => {
  const resposta = await api.post(url, dados, header)
  setDados(resposta.data)
  return resposta.data
}

export const atualizar = async (url: string, dados: Object, setDados: Function, header?: Object) => {
  const resposta = await api.put(url, dados, header)
  setDados(resposta.data)
  return resposta.data
}

export const deletar = async (url: string, header?: Object) => {
  await api.delete(url, header)
}
