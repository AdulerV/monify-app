import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import Card from '../components/card';
import { mensagemSucesso, mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import { formatarMoeda, formatarData, somarValores, SITUACOES_META } from '../utils/formatacao';
import '../custom.css';

function ListagemMetas() {
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);
  const [dadosAportes, setDadosAportes] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const cadastrar = () => {
    navigate(`/cadastro-metas`);
  };

  const editar = (id) => {
    navigate(`/cadastro-metas/${id}`);
  };

  async function excluir(id) {
    try {
      await api.delete(`/metasfinanceiras/${id}`);
      mensagemSucesso(`Meta excluída com sucesso!`);
      setDados((dadosAtuais) => dadosAtuais.filter((dado) => dado.id !== id));
      setDadosAportes((atuais) => atuais.filter((a) => a.idMetaFinanceira !== id));
    } catch (error) {
      mensagemErroApi(error, 'Erro ao excluir a meta');
    }
  }

  useEffect(() => {
    async function carregarDadosMetas() {
      try {
        const [metasRes, aportesRes] = await Promise.all([
          api.get('/metasfinanceiras'),
          api.get('/aportes'),
        ]);
        setDados(metasRes.data);
        setDadosAportes(aportesRes.data);
      } catch (error) {
        mensagemErroApi(error, 'Erro ao carregar a listagem de metas.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosMetas();
  }, []);

  function totalInvestido(meta) {
    const aportes = dadosAportes.filter((a) => a.idMetaFinanceira === meta.id);
    return somarValores(aportes) + Number(meta.investimentoInicial || 0);
  }

  if (carregando) {
    return (
      <div className='container mt-5 text-center'>
        <p>Carregando metas...</p>
      </div>
    );
  }

  // o status (concluida) e calculado pela API a cada aporte
  const metasFiltradas = dados.filter((meta) => {
    if (statusFiltro === 'CONCLUIDA') return meta.status;
    if (statusFiltro === 'ABERTA') return !meta.status;
    return true;
  });

  const totalInvestidoFiltrado = metasFiltradas.reduce((acc, meta) => acc + totalInvestido(meta), 0);

  return (
    <div className='container'>
      <Card title='Listagem de Metas Financeiras' icon='bi bi-cash-coin'>
        <p className='text-muted'>Consulte as suas metas financeiras</p>

        <Stack spacing={2} direction='row' alignItems='center' marginTop={2}>
          <label className='label-filtro'>Selecione o status Concluído ou Em Aberto:</label>
          <select
            className='form-select'
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            style={{ width: 200 }}
          >
            <option value=''>Todos</option>
            <option value='CONCLUIDA'>Concluída</option>
            <option value='ABERTA'>Em Aberto</option>
          </select>
        </Stack>

        <div className='row mt-3 mb-3'>
          <div className='col-md-3'>
            <div className='resumo-card'>
              <span className='resumo-titulo'>Total Investido (Filtrado)</span>
              <span className='resumo-valor'>{formatarMoeda(totalInvestidoFiltrado)}</span>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <Stack spacing={1} direction='row' className='mb-3'>
                <button type='button' className='btn btn-primary' onClick={cadastrar}>
                  Nova Meta
                </button>
                <button onClick={() => navigate(-1)} type='button' className='btn btn-danger'>
                  Cancelar
                </button>
              </Stack>

              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>Nome</th>
                    <th scope='col'>Data-Envio</th>
                    <th scope='col'>Valor-Alvo</th>
                    <th scope='col'>Data-Alvo</th>
                    <th scope='col'>Total Investido</th>
                    <th scope='col'>Progresso</th>
                    <th scope='col'>Situação</th>
                    <th scope='col' style={{ width: '140px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {metasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='text-center text-muted'>Nenhuma meta encontrada.</td>
                    </tr>
                  ) : (
                    metasFiltradas.map((dado) => {
                      const classe = dado.status ? 'text-success fw-bold' : '';
                      const investido = totalInvestido(dado);
                      const percentual = Math.min(100, (investido / dado.valor) * 100);
                      return (
                        <tr key={dado.id}>
                          <td className={classe}>
                            {dado.nome}
                            {dado.status && <i className='bi bi-check-circle-fill ms-2'></i>}
                          </td>
                          <td className={classe}>{formatarData(dado.dataEnvio)}</td>
                          <td className={classe}>{formatarMoeda(dado.valor)}</td>
                          <td className={classe}>{formatarData(dado.dataAlvo)}</td>
                          <td className={classe}>{formatarMoeda(investido)}</td>
                          <td style={{ minWidth: 140 }}>
                            <div className='progress'>
                              <div
                                className={`progress-bar ${dado.status ? 'bg-success' : ''}`}
                                role='progressbar'
                                style={{ width: `${percentual}%` }}
                                aria-valuenow={percentual}
                                aria-valuemin='0'
                                aria-valuemax='100'
                              >
                                {Math.round(percentual)}%
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${SITUACOES_META[dado.situacao]?.classe ?? 'bg-secondary'}`}>
                              {SITUACOES_META[dado.situacao]?.rotulo ?? '—'}
                            </span>
                          </td>
                          <td>
                            <Stack spacing={1} direction='row'>
                              <IconButton
                                aria-label='aportes'
                                title='Ver aportes'
                                onClick={() => navigate(`/listagem-aportes?meta=${dado.id}`)}
                              >
                                <i className='bi bi-piggy-bank' style={{ fontSize: 20 }}></i>
                              </IconButton>
                              <IconButton aria-label='edit' onClick={() => editar(dado.id)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                aria-label='delete'
                                onClick={() =>
                                  window.confirm('Tem certeza de que deseja excluir? Isso apagará os registros relacionados, como os aportes.') &&
                                  excluir(dado.id)
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ListagemMetas;
