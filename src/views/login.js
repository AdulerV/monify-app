import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config/axios';
import { salvarUsuarioLogado, obterUsuarioLogado } from '../utils/usuarioLogado';
import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro, mensagemAlert } from '../components/toastr';
import logo from '../assets/monify-logocolorida.svg';
import '../custom.css';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (searchParams.get('sessao') === 'expirada') {
      mensagemAlert('Sua sessão expirou. Faça login novamente.');
    } else if (obterUsuarioLogado()) {
      navigate('/home');
    }
  }, [searchParams, navigate]);

  const handleLogin = () => {
    if (!login || login.trim() === '' || !senha || senha.trim() === '') {
      mensagemErro('Por favor, preencha o login e a senha.');
      return;
    }

    setCarregando(true);

    axios
      .post(`${BASE_URL}/usuarios/auth`, { login: login.trim(), senha })
      .then((response) => {
        salvarUsuarioLogado(response.data);
        mensagemSucesso('Seja bem-vindo(a) ao Monify!');
        navigate('/home');
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          mensagemErro('Login ou senha incorretos.');
        } else {
          mensagemErro('Erro ao tentar se conectar ao servidor.');
        }
      })
      .finally(() => {
        setCarregando(false);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className='login-container'>
      <div className='login-card-wrapper'>
        <Card title='Login'>
          <div className='text-center login-topo'>
            <img src={logo} alt='Monify' className='login-logo' />
            <p className='login-subtitulo'>Acesse sua conta para continuar</p>
          </div>

          <FormGroup label='Login *' htmlFor='login'>
            <input
              type='text'
              id='login'
              className='form-control'
              placeholder='Digite seu login'
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={carregando}
            />
          </FormGroup>

          <FormGroup label='Senha *' htmlFor='senha'>
            <input
              type='password'
              id='senha'
              className='form-control'
              placeholder='Digite sua senha'
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={carregando}
            />
          </FormGroup>

          <button
            onClick={handleLogin}
            className='btn btn-success w-100 login-botao'
            disabled={carregando}
          >
            {carregando ? 'Autenticando...' : 'Login'}
          </button>

          <div className='login-cadastro'>
            Não possui uma conta?{' '}
            <span onClick={() => navigate('/cadastro-conta')}>CADASTRE-SE</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Login;
