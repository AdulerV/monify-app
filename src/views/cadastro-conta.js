import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config/axios';
import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErro, mensagemErroApi } from '../components/toastr';
import logo from '../assets/monify-logocolorida.svg';
import '../custom.css';

const TAMANHO_MINIMO_SENHA = 6;

function CadastroConta() {
  const navigate = useNavigate();

  const [login, setLogin] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaRepeticao, setSenhaRepeticao] = useState('');
  const [carregando, setCarregando] = useState(false);

  const requisitos = [
    { ok: login.trim() !== '', texto: 'Login informado' },
    { ok: cpf.replace(/\D/g, '').length === 11, texto: 'CPF com 11 dígitos' },
    { ok: senha.length >= TAMANHO_MINIMO_SENHA, texto: `Senha com ${TAMANHO_MINIMO_SENHA}+ caracteres` },
    { ok: senha !== '' && senha === senhaRepeticao, texto: 'Senhas conferem' },
  ];

  async function cadastrar() {
    if (requisitos.some((r) => !r.ok)) {
      mensagemErro('Atenda a todos os requisitos antes de continuar.');
      return;
    }
    setCarregando(true);
    try {
      // cadastro publico sempre cria usuario comum (admin = false)
      await axios.post(`${BASE_URL}/usuarios`, {
        login: login.trim(),
        cpf: cpf.replace(/\D/g, ''),
        senha,
        senhaRepeticao,
        admin: false,
      });
      mensagemSucesso('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (error) {
      mensagemErroApi(error, 'Erro ao criar a conta.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className='cadastro-cliente-container'>
      <div className='cadastro-cliente-card-wrapper'>
        <Card title='Criar Conta'>
          <div className='text-center cadastro-cliente-topo'>
            <img src={logo} alt='Monify' className='cadastro-cliente-logo' />
            <p className='cadastro-cliente-subtitulo'>
              Crie sua conta e comece a controlar suas finanças
            </p>
          </div>

          <div className='row cadastro-cliente-formulario'>
            <div className='col-md-6'>
              <FormGroup label='Login *' htmlFor='inputLogin'>
                <input
                  type='text'
                  id='inputLogin'
                  className='form-control'
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  disabled={carregando}
                />
              </FormGroup>
            </div>
            <div className='col-md-6'>
              <FormGroup label='CPF *' htmlFor='inputCpf'>
                <input
                  type='text'
                  id='inputCpf'
                  maxLength='14'
                  placeholder='Somente números'
                  className='form-control'
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  disabled={carregando}
                />
              </FormGroup>
            </div>
            <div className='col-md-6'>
              <FormGroup label='Senha *' htmlFor='inputSenha'>
                <input
                  type='password'
                  id='inputSenha'
                  className='form-control'
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={carregando}
                />
              </FormGroup>
            </div>
            <div className='col-md-6'>
              <FormGroup label='Repita a Senha *' htmlFor='inputSenhaRepeticao'>
                <input
                  type='password'
                  id='inputSenhaRepeticao'
                  className='form-control'
                  value={senhaRepeticao}
                  onChange={(e) => setSenhaRepeticao(e.target.value)}
                  disabled={carregando}
                />
              </FormGroup>
            </div>

            <div className='col-12'>
              <div className='cadastro-cliente-requisitos'>
                <p>Requisitos</p>
                <div className='cadastro-cliente-requisitos-grid'>
                  {requisitos.map((r) => (
                    <span key={r.texto} className={r.ok ? 'requisito-ok' : 'requisito-pendente'}>
                      <i className={r.ok ? 'bi bi-check-circle-fill' : 'bi bi-circle'}></i>&nbsp;
                      {r.texto}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className='col-12'>
              <button
                onClick={cadastrar}
                className='btn btn-success w-100 cadastro-cliente-botao'
                disabled={carregando}
              >
                {carregando ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </div>

          <div className='cadastro-cliente-login'>
            Já possui uma conta?{' '}
            <span onClick={() => navigate('/login')}>FAÇA LOGIN</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CadastroConta;
