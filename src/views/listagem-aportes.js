import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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

function ListagemAportes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [dados, setDados] = useState([]);
  const [metas, setMetas] = useState([]);
  const [filtroMeta, setFiltroMeta] = useState(searchParams.get('meta') || 'Todas');
  const [filtroMes, setFiltroMes] = useState('Todos');
  const [filtroAno, setFiltroAno] = useState('Todos');
  const [carregando, setCarregando] = useState(true);

  const cadastrar = () => {
    navigate(filtroMeta !== 'Todas' ? `/cadastro-aportes?meta=${filtroMeta}` : `/cadastro-aportes`);
  };

  const editar = (id) => {
    navigate(`/cadastro-aportes/${id}`);
  };

  async function excluir(id) {
    try {
      await api.delete(`/aportes/${id}`);
      mensagemSucesso('Aporte excluído com sucesso!');
      setDados((atuais) => atuais.filter((dado) => dado.id !== id));
    } catch (error) {
      mensagemErroApi(error, 'Erro ao excluir o aporte');
    }
  }

  useEffect(() => {
    async function carregarAportes() {
      try {
        const [aportesRes, metasRes] = await Promise.all([api.get('/aportes'), api.get('/metasfinanceiras')]);
        setDados(aportesRes.data);
        setMetas(metasRes.data);
      } catch (error) {
        mensagemErroApi(error, 'Erro ao carregar a listagem de aportes.');
      } finally {
        setCarregando(false);
      }
    }

    carregarAportes();
  }, []);

  if (carregando) {
    return (
      <div className='container mt-5 text-center'>
        <p>Carregando aportes...</p>
      </div>
    );
  }

  const aportesFiltrados = filtrarPorPeriodo(dados, 'dataEnvio', filtroMes, filtroAno)
    .filter((a) => filtroMeta === 'Todas' || String(a.idMetaFinanceira) === String(filtroMeta))
    .sort((a, b) => String(b.dataEnvio).localeCompare(String(a.dataEnvio)));

  return (
    <div className='container'>
      <Card title='Listagem de Aportes' icon='bi bi-piggy-bank'>
        <p className='text-muted'>Valores investidos nas suas metas financeiras</p>

        <Stack spacing={2} direction='row' alignItems='center'>
          <label className='label-filtro'><strong>Selecione a meta:</strong></label>
          <select
            className='form-select'
            style={{ width: 260 }}
            value={filtroMeta}
            onChange={(e) => setFiltroMeta(e.target.value)}
          >
            <option value='Todas'>Todas</option>
            {metas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </Stack>

        <FiltroPeriodo
          filtroMes={filtroMes}
          setFiltroMes={setFiltroMes}
          filtroAno={filtroAno}
          setFiltroAno={setFiltroAno}
          anos={anosDisponiveis([dados, 'dataEnvio'])}
        />

        <div className='row mt-3 mb-3'>
          <div className='col-md-3'>
            <div className='resumo-card'>
              <span className='resumo-titulo'>Total Aportado (Filtrado)</span>
              <span className='resumo-valor positivo'>{formatarMoeda(somarValores(aportesFiltrados))}</span>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <Stack spacing={1} direction='row' className='mb-3'>
                <button type='button' className='btn btn-primary' onClick={cadastrar}>
                  Novo Aporte
                </button>
                <button onClick={() => navigate(-1)} type='button' className='btn btn-danger'>
                  Cancelar
                </button>
              </Stack>

              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>Meta</th>
                    <th scope='col'>Data</th>
                    <th scope='col'>Valor</th>
                    <th scope='col' style={{ width: '100px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {aportesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={4} className='text-center text-muted'>Nenhum aporte encontrado.</td>
                    </tr>
                  ) : (
                    aportesFiltrados.map((dado) => (
                      <tr key={dado.id}>
                        <td>{dado.nomeMetaFinanceira}</td>
                        <td>{formatarData(dado.dataEnvio)}</td>
                        <td>{formatarMoeda(dado.valor)}</td>
                        <td>
                          <Stack spacing={1} direction='row'>
                            <IconButton aria-label='edit' onClick={() => editar(dado.id)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label='delete'
                              onClick={() => window.confirm('Tem certeza de que deseja excluir?') && excluir(dado.id)}
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

export default ListagemAportes;
