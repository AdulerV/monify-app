import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import Card from '../components/card';
import FiltroPeriodo from '../components/filtroPeriodo';
import { mensagemSucesso, mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import { formatarMoeda, formatarData, filtrarPorPeriodo, anosDisponiveis, somarValores } from '../utils/formatacao';
import '../custom.css';

function ListagemLancamentos() {
  const navigate = useNavigate();

  const [dadosReceitas, setDadosReceitas] = useState([]);
  const [dadosDespesas, setDadosDespesas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroMes, setFiltroMes] = useState('Todos');
  const [filtroAno, setFiltroAno] = useState('Todos');

  const cadastrar = () => {
    navigate(`/cadastro-lancamentos`);
  };

  const editar = (id, tipo) => {
    navigate(`/cadastro-lancamentos/${id}?tipo=${tipo}`);
  };

  async function excluir(id, tipo) {
    try {
      if (tipo === 'Receita') {
        await api.delete(`/receitas/${id}`);
        mensagemSucesso(`Receita excluída com sucesso!`);
        setDadosReceitas((atuais) => atuais.filter((dado) => dado.id !== id));
      } else {
        await api.delete(`/despesas/${id}`);
        mensagemSucesso(`Despesa excluída com sucesso!`);
        setDadosDespesas((atuais) => atuais.filter((dado) => dado.id !== id));
      }
    } catch (error) {
      mensagemErroApi(error, 'Erro ao excluir o lançamento');
    }
  }

  useEffect(() => {
    async function carregarDadosLancamentos() {
      try {
        const [receitasRes, despesasRes] = await Promise.all([
          api.get('/receitas'),
          api.get('/despesas'),
        ]);
        setDadosReceitas(receitasRes.data.map((r) => ({ ...r, tipo: 'Receita' })));
        setDadosDespesas(despesasRes.data.map((d) => ({ ...d, tipo: 'Despesa' })));
      } catch (error) {
        mensagemErroApi(error, 'Erro ao carregar a listagem de lançamentos.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosLancamentos();
  }, []);

  if (carregando) {
    return (
      <div className='container mt-5 text-center'>
        <p>Carregando lançamentos...</p>
      </div>
    );
  }

  let lista = [];
  if (filtroTipo === 'Receita') lista = dadosReceitas;
  else if (filtroTipo === 'Despesa') lista = dadosDespesas;
  else lista = [...dadosReceitas, ...dadosDespesas];

  const lancamentosFiltrados = filtrarPorPeriodo(lista, 'data', filtroMes, filtroAno)
    .sort((a, b) => String(b.data).localeCompare(String(a.data)));

  const totalReceitas = somarValores(lancamentosFiltrados.filter((l) => l.tipo === 'Receita'));
  const totalDespesas = somarValores(lancamentosFiltrados.filter((l) => l.tipo === 'Despesa'));

  return (
    <div className='container'>
      <Card title='Listagem de Lançamentos' icon='bi bi-wallet2'>
        <p className='text-muted'>Total de suas Receitas e Despesas</p>

        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <Stack spacing={2} direction='row' alignItems='center' marginBottom={2}>
                <label className='label-filtro'><strong>Selecione o tipo:</strong></label>
                <select
                  className='form-select'
                  style={{ width: 200 }}
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value='Todos'>Todos</option>
                  <option value='Receita'>Receitas</option>
                  <option value='Despesa'>Despesas</option>
                </select>
              </Stack>

              <strong className='label-filtro'>Selecione o período:</strong>
              <FiltroPeriodo
                filtroMes={filtroMes}
                setFiltroMes={setFiltroMes}
                filtroAno={filtroAno}
                setFiltroAno={setFiltroAno}
                anos={anosDisponiveis([dadosReceitas, 'data'], [dadosDespesas, 'data'])}
              />

              <Stack spacing={2} direction='row' sx={{ mt: 2, mb: 2 }}>
                <div className='resumo-card receita'>
                  <span className='resumo-titulo'>Receitas</span>
                  <span className='resumo-valor positivo'>
                    {totalReceitas > 0 ? formatarMoeda(totalReceitas) : '—'} ▲
                  </span>
                </div>

                <div className='resumo-card despesa'>
                  <span className='resumo-titulo'>Despesas</span>
                  <span className='resumo-valor negativo'>
                    {totalDespesas > 0 ? formatarMoeda(totalDespesas) : '—'} ▼
                  </span>
                </div>

                <div className='resumo-card'>
                  <span className='resumo-titulo'>Saldo do Período</span>
                  <span className={`resumo-valor ${totalReceitas - totalDespesas >= 0 ? '' : 'negativo'}`}>
                    {formatarMoeda(totalReceitas - totalDespesas)}
                  </span>
                </div>
              </Stack>

              <Stack spacing={1} direction='row' marginBottom={3}>
                <button type='button' className='btn btn-primary' onClick={cadastrar}>
                  Novo Lançamento
                </button>
                <button onClick={() => navigate(-1)} type='button' className='btn btn-danger'>
                  Cancelar
                </button>
              </Stack>

              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>Tipo</th>
                    <th scope='col'>Nome</th>
                    <th scope='col'>Data</th>
                    <th scope='col'>Categoria</th>
                    <th scope='col'>Volume</th>
                    <th scope='col'>Valor</th>
                    <th scope='col'>Forma de Pagamento</th>
                    <th scope='col'>Parcelada</th>
                    <th scope='col' style={{ width: '100px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={9} className='text-center text-muted'>
                        Nenhum lançamento encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    lancamentosFiltrados.map((dado) => (
                      <tr key={`${dado.tipo}-${dado.id}`}>
                        <td>
                          <span className={`badge ${dado.tipo === 'Receita' ? 'bg-success' : 'bg-danger'}`}>
                            {dado.tipo}
                          </span>
                        </td>
                        <td>{dado.nome}</td>
                        <td>{formatarData(dado.data)}</td>
                        <td>{dado.tipo === 'Receita' ? dado.nomeCategoriaReceita : dado.nomeCategoriaDespesa}</td>
                        <td>{dado.volume ? 'Fixa' : 'Única'}</td>
                        <td>{formatarMoeda(dado.valor)}</td>
                        <td>{dado.tipo === 'Despesa' ? dado.nomeFormaPagamento : '—'}</td>
                        <td>
                          {dado.parcelada ? (
                            <a href={`/listagem-pagamentos?despesa=${dado.id}`}>{dado.quantidadeParcelas}x</a>
                          ) : dado.tipo === 'Despesa' ? 'Não' : '—'}
                        </td>
                        <td>
                          <Stack spacing={1} padding={0} direction='row'>
                            <IconButton aria-label='edit' onClick={() => editar(dado.id, dado.tipo)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label='delete'
                              onClick={() =>
                                window.confirm(
                                  dado.parcelada
                                    ? 'Tem certeza de que deseja excluir? As parcelas desta despesa também serão excluídas.'
                                    : 'Tem certeza de que deseja excluir?'
                                ) && excluir(dado.id, dado.tipo)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </td>
                      </tr>
                    ))
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

export default ListagemLancamentos;
