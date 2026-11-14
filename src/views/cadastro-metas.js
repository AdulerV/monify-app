import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro, mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import { hojeIso, paraNumero } from '../utils/formatacao';
import '../custom.css';

function CadastroMetas() {
  const { idParam } = useParams();
  const navigate = useNavigate();

  const edicao = idParam != null;
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [dataEnvio, setDataEnvio] = useState(hojeIso());
  const [dataAlvo, setDataAlvo] = useState('');
  const [investimentoInicial, setInvestimentoInicial] = useState('');
  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [carregando, setCarregando] = useState(edicao);

  function preencher(dados) {
    setNome(dados?.nome ?? '');
    setValor(dados?.valor ?? '');
    setDataEnvio(dados?.dataEnvio ?? hojeIso());
    setDataAlvo(dados?.dataAlvo ?? '');
    setInvestimentoInicial(dados?.investimentoInicial ?? '');
  }

  async function salvar() {
    const valorNumerico = paraNumero(valor);
    const inicial = paraNumero(investimentoInicial) ?? 0;
    if (!nome || nome.trim() === '' || !(valorNumerico > 0) || !dataEnvio || !dataAlvo) {
      mensagemErro('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }
    if (dataAlvo < dataEnvio) {
      mensagemErro('A data alvo não pode ser anterior à data inicial da meta.');
      return;
    }
    if (inicial < 0) {
      mensagemErro('O investimento inicial não pode ser negativo.');
      return;
    }

    const payload = { nome: nome.trim(), valor: valorNumerico, dataEnvio, dataAlvo, investimentoInicial: inicial };

    try {
      if (!edicao) {
        await api.post('/metasfinanceiras', payload);
        mensagemSucesso(`Meta "${nome}" cadastrada com sucesso!`);
      } else {
        await api.put(`/metasfinanceiras/${idParam}`, payload);
        mensagemSucesso(`Meta "${nome}" alterada com sucesso!`);
      }
      navigate('/listagem-metas');
    } catch (error) {
      mensagemErroApi(error, 'Erro ao salvar meta');
    }
  }

  useEffect(() => {
    async function buscarMeta() {
      if (!edicao) return;
      try {
        const response = await api.get(`/metasfinanceiras/${idParam}`);
        setDadosOriginais(response.data);
        preencher(response.data);
      } catch (error) {
        mensagemErroApi(error, 'Erro ao buscar dados da meta para edição.');
      } finally {
        setCarregando(false);
      }
    }

    buscarMeta(); // eslint-disable-next-line
  }, [idParam]);

  if (carregando) {
    return (
      <div className='container mt-5 text-center'>
        <p>Carregando informações da meta...</p>
      </div>
    );
  }

  return (
    <div className='container mb-5'>
      <Card title={edicao ? 'Editar Meta' : 'Cadastro de Meta'} icon='bi bi-cash-coin'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <FormGroup label='Nome: *' htmlFor='inputNome'>
                <input
                  type='text'
                  id='inputNome'
                  placeholder='Ex: Viagem, Carro, Reserva de Emergência...'
                  value={nome}
                  className='form-control'
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Data-Envio: *' htmlFor='inputDataEnvio'>
                <input
                  type='date'
                  id='inputDataEnvio'
                  value={dataEnvio}
                  className='form-control'
                  onChange={(e) => setDataEnvio(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Valor-Alvo (R$): *' htmlFor='inputValor'>
                <input
                  type='text'
                  id='inputValor'
                  value={valor}
                  placeholder='0,00'
                  className='form-control'
                  onChange={(e) => setValor(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Data-Alvo: *' htmlFor='inputDataAlvo'>
                <input
                  type='date'
                  id='inputDataAlvo'
                  value={dataAlvo}
                  className='form-control'
                  onChange={(e) => setDataAlvo(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Investimento inicial (R$):' htmlFor='inputInvestimentoInicial'>
                <input
                  type='text'
                  id='inputInvestimentoInicial'
                  value={investimentoInicial}
                  placeholder='0,00'
                  className='form-control'
                  onChange={(e) => setInvestimentoInicial(e.target.value)}
                />
              </FormGroup>

              <Stack spacing={1} padding={1} direction='row' className='mt-3'>
                <button onClick={salvar} type='button' className='btn btn-success'>
                  Salvar
                </button>
                <button onClick={() => preencher(dadosOriginais)} type='button' className='btn btn-warning'>
                  Restaurar
                </button>
                <button onClick={() => navigate('/listagem-metas')} type='button' className='btn btn-danger'>
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

export default CadastroMetas;
