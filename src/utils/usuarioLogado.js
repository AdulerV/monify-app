const CHAVE_TOKEN = '_monify_token';
const CHAVE_USUARIO = '_monify_user';

// dadosAutenticacao = resposta do POST /usuarios/auth: { login, token, admin }
export function salvarUsuarioLogado(dadosAutenticacao) {
  if (!dadosAutenticacao) return;
  const { token, login, admin } = dadosAutenticacao;
  localStorage.setItem(CHAVE_TOKEN, token);
  localStorage.setItem(
    CHAVE_USUARIO,
    JSON.stringify({ login, admin: admin === true })
  );
}

export function obterToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

export function obterUsuarioLogado() {
  const usuarioJson = localStorage.getItem(CHAVE_USUARIO);
  if (!usuarioJson || !obterToken()) return null;
  try {
    return JSON.parse(usuarioJson);
  } catch (error) {
    return null;
  }
}

export function deslogarUsuario() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
}
