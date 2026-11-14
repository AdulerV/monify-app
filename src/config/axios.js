import axios from 'axios';
import { obterToken, deslogarUsuario } from '../utils/usuarioLogado';

export const BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = obterToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token expirado ou invalido: a API responde 401/403 nos recursos financeiros.
// (403 em /usuarios significa apenas "nao e administrador", entao nao desloga.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    if ((status === 401 || status === 403) && !url.startsWith('/usuarios')) {
      deslogarUsuario();
      window.location.href = '/login?sessao=expirada';
    }
    return Promise.reject(error);
  }
);

export default api;
