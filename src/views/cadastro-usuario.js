import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../components/card';
import FormGroup from '../components/form-group';
import { mensagemSucesso, mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import '../custom.css';

function CadastroUsuario() {
  const { idParam } = useParams();
  const navigate = useNavigate();

  const baseURL = '/usuarios';
  const edicao = idParam != null;

  const [login, setLogin] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaRepeticao, setSenhaRepeticao] = useState('');
  const [admin, setAdmin] = useState(false);

  const [dados, setDados] = useState(null);

  function inicializar() {
    setLogin(dados?.login ?? '');
    setCpf(dados?.cpf ?? '');
    setSenha('');
    setSenhaRepeticao('');
    setAdmin(dados?.admin ?? false);
  }

  async function salvar() {
    const data = { login, cpf, senha, senhaRepeticao, admin };
    try {
      if (!edicao) {
        await api.post(baseURL, data);
        mensagemSucesso(`Usuário ${login} cadastrado com sucesso!`);
      } else {
        await api.put(`${baseURL}/${idParam}`, data);
        mensagemSucesso(`Usuário ${login} alterado com sucesso!`);
      }
      navigate(`/listagem-usuarios`);
    } catch (error) {
      mensagemErroApi(error, 'Erro ao salvar o usuário');
    }
  }

  // diferente da saa-app, preenche o formulario com a resposta recebida
  // (e nao com o estado anterior, que ainda estaria vazio)
  useEffect(() => {
    async function buscar() {
      if (!edicao) return;
      try {
        const response = await api.get(`${baseURL}/${idParam}`);
        setDados(response.data);
        setLogin(response.data.login);
        setCpf(response.data.cpf);
        setAdmin(response.data.admin);
      } catch (error) {
        mensagemErroApi(error, 'Erro ao buscar o usuário.');
      }
    }

    buscar(); // eslint-disable-next-line
  }, [idParam]);

  return (
    <div className='container mb-5'>
      <Card title={edicao ? 'Editar Usuário' : 'Cadastro de Usuário'} icon='bi bi-people'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <FormGroup label='Login: *' htmlFor='inputLogin'>
                <input
                  type='text'
                  id='inputLogin'
                  value={login}
                  className='form-control'
                  name='login'
                  onChange={(e) => setLogin(e.target.value)}
                />
              </FormGroup>
              <FormGroup label='CPF: *' htmlFor='inputCpf'>
                <input
                  type='text'
                  maxLength='11'
                  id='inputCpf'
                  value={cpf}
                  className='form-control'
                  name='cpf'
                  onChange={(e) => setCpf(e.target.value)}
                />
              </FormGroup>
              <FormGroup label={edicao ? 'Nova Senha: *' : 'Senha: *'} htmlFor='inputSenha'>
                <input
                  type='password'
                  id='inputSenha'
                  value={senha}
                  className='form-control'
                  name='senha'
                  onChange={(e) => setSenha(e.target.value)}
                />
              </FormGroup>
              <FormGroup label='Repita a Senha: *' htmlFor='inputRepitaSenha'>
                <input
                  type='password'
                  id='inputRepitaSenha'
                  value={senhaRepeticao}
                  className='form-control'
                  name='senhaRepeticao'
                  onChange={(e) => setSenhaRepeticao(e.target.value)}
                />
              </FormGroup>
              <div className='form-check mt-2'>
                <input
                  className='form-check-input'
                  type='checkbox'
                  id='checkAdmin'
                  checked={admin}
                  name='admin'
                  onChange={(e) => setAdmin(e.target.checked)}
                />
                <label className='form-check-label' htmlFor='checkAdmin'>
                  Administrador
                </label>
              </div>
              <Stack spacing={1} padding={1} direction='row' className='mt-3'>
                <button onClick={salvar} type='button' className='btn btn-success'>
                  Salvar
                </button>
                <button onClick={inicializar} type='button' className='btn btn-warning'>
                  Restaurar
                </button>
                <button onClick={() => navigate('/listagem-usuarios')} type='button' className='btn btn-danger'>
                  Cancelar
                </button>
              </Stack>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CadastroUsuario;
