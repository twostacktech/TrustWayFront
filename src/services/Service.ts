import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

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

type AtualizarDados<T> = (dados: T) => void

export const buscar = async <T>(url: string, setDados: AtualizarDados<T>, header?: AxiosRequestConfig) => {
  const resposta = await api.get(url, header)
  setDados(resposta.data)
}

export const cadastrar = async <T, D extends object>(
  url: string,
  dados: D,
  setDados: AtualizarDados<T>,
  header?: AxiosRequestConfig
) => {
  const resposta = await api.post<T>(url, dados, header)
  setDados(resposta.data)
  return resposta.data
}

export const atualizar = async <T, D extends object>(
  url: string,
  dados: D,
  setDados: AtualizarDados<T>,
  header?: AxiosRequestConfig
) => {
  const resposta = await api.put<T>(url, dados, header)
  setDados(resposta.data)
  return resposta.data
}

export const deletar = async (url: string, header?: AxiosRequestConfig) => {
  await api.delete(url, header)
}
