import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro, mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import { hojeIso, paraNumero, formatarMoeda } from '../utils/formatacao';
import '../custom.css';

function CadastroAportes() {
  const { idParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const edicao = idParam != null;
  const [valor, setValor] = useState('');
  const [dataEnvio, setDataEnvio] = useState(hojeIso());
  const [idMetaFinanceira, setIdMetaFinanceira] = useState(searchParams.get('meta') || '');
  const [metas, setMetas] = useState([]);
  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [carregando, setCarregando] = useState(true);

  function preencher(dados) {
    setValor(dados?.valor ?? '');
    setDataEnvio(dados?.dataEnvio ?? hojeIso());
    setIdMetaFinanceira(dados?.idMetaFinanceira ?? '');
  }

  async function salvar() {
    const valorNumerico = paraNumero(valor);
    if (!(valorNumerico > 0) || !dataEnvio || !idMetaFinanceira) {
      mensagemErro('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    const payload = { valor: valorNumerico, dataEnvio, idMetaFinanceira: Number(idMetaFinanceira) };

    try {
      if (!edicao) {
        await api.post('/aportes', payload);
        mensagemSucesso(`Aporte de ${formatarMoeda(valorNumerico)} cadastrado com sucesso!`);
      } else {
        await api.put(`/aportes/${idParam}`, payload);
        mensagemSucesso('Aporte alterado com sucesso!');
      }
      navigate(`/listagem-aportes?meta=${idMetaFinanceira}`);
    } catch (error) {
      mensagemErroApi(error, 'Erro ao salvar o aporte');
    }
  }

  useEffect(() => {
    async function carregar() {
      try {
        const metasRes = await api.get('/metasfinanceiras');
        setMetas(metasRes.data);
        if (edicao) {
          const response = await api.get(`/aportes/${idParam}`);
          setDadosOriginais(response.data);
          preencher(response.data);
        }
      } catch (error) {
        mensagemErroApi(error, 'Erro ao carregar dados do aporte.');
      } finally {
        setCarregando(false);
      }
    }

    carregar(); // eslint-disable-next-line
  }, [idParam]);

  if (carregando) {
    return (
      <div className='container mt-5 text-center'>
        <p>Carregando informações do aporte...</p>
      </div>
    );
  }

  return (
    <div className='container mb-5'>
      <Card title={edicao ? 'Editar Aporte' : 'Cadastro de Aporte'} icon='bi bi-piggy-bank'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <FormGroup label='Meta: *' htmlFor='selectMeta'>
                <select
                  className='form-select'
                  id='selectMeta'
                  value={idMetaFinanceira}
                  onChange={(e) => setIdMetaFinanceira(e.target.value)}
                >
                  <option value=''>Selecione...</option>
                  {metas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                      {m.status ? ' (concluída)' : ''}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup label='Data: *' htmlFor='inputDataEnvio'>
                <input
                  type='date'
                  id='inputDataEnvio'
                  value={dataEnvio}
                  className='form-control'
                  onChange={(e) => setDataEnvio(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Valor (R$): *' htmlFor='inputValor'>
                <input
                  type='text'
                  id='inputValor'
                  value={valor}
                  placeholder='0,00'
                  className='form-control'
                  onChange={(e) => setValor(e.target.value)}
                />
              </FormGroup>

              <Stack spacing={1} padding={1} direction='row' className='mt-3'>
                <button onClick={salvar} type='button' className='btn btn-success'>
                  Salvar
                </button>
                <button onClick={() => preencher(dadosOriginais)} type='button' className='btn btn-warning'>
                  Restaurar
                </button>
                <button onClick={() => navigate('/listagem-aportes')} type='button' className='btn btn-danger'>
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

export default CadastroAportes;
