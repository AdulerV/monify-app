import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import Card from '../components/card';
import { mensagemSucesso, mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import { formatarMoeda } from '../utils/formatacao';
import '../custom.css';

function ListagemCategorias() {
  const navigate = useNavigate();

  const [categoriasReceita, setCategoriasReceita] = useState([]);
  const [categoriasDespesa, setCategoriasDespesa] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [carregando, setCarregando] = useState(true);

  const cadastrar = () => {
    navigate(`/cadastro-categorias`);
  };

  const editar = (id, tipo) => {
    navigate(`/cadastro-categorias/${id}?tipo=${tipo}`);
  };

  async function excluir(id, tipo) {
    try {
      if (tipo === 'Receita') {
        await api.delete(`/categoriasreceita/${id}`);
        setCategoriasReceita((atuais) => atuais.filter((c) => c.id !== id));
      } else {
        await api.delete(`/categoriasdespesa/${id}`);
        setCategoriasDespesa((atuais) => atuais.filter((c) => c.id !== id));
      }
      mensagemSucesso('Categoria excluída com sucesso!');
    } catch (error) {
      mensagemErroApi(error, 'Erro ao excluir a categoria');
    }
  }

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const [receitaRes, despesaRes] = await Promise.all([
          api.get('/categoriasreceita'),
          api.get('/categoriasdespesa'),
        ]);
        setCategoriasReceita(receitaRes.data.map((c) => ({ ...c, tipo: 'Receita' })));
        setCategoriasDespesa(despesaRes.data.map((c) => ({ ...c, tipo: 'Despesa' })));
      } catch (error) {
        mensagemErroApi(error, 'Erro ao carregar as categorias.');
      } finally {
        setCarregando(false);
      }
    }

    carregarCategorias();
  }, []);

  if (carregando) {
    return (
      <div className='container mt-5 text-center'>
        <p>Carregando categorias...</p>
      </div>
    );
  }

  let lista = [];
  if (filtroTipo === 'Receita') lista = categoriasReceita;
  else if (filtroTipo === 'Despesa') lista = categoriasDespesa;
  else lista = [...categoriasReceita, ...categoriasDespesa];

  return (
    <div className='container'>
      <Card title='Listagem de Categorias' icon='bi bi-tags'>
        <p className='text-muted'>Categorias de entrada e saída dos seus lançamentos</p>

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

        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <Stack spacing={1} direction='row' marginBottom={3}>
                <button type='button' className='btn btn-primary' onClick={cadastrar}>
                  Nova Categoria
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
                    <th scope='col'>Limite de Gasto Mensal</th>
                    <th scope='col' style={{ width: '100px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.length === 0 ? (
                    <tr>
                      <td colSpan={4} className='text-center text-muted'>
                        Nenhuma categoria encontrada.
                      </td>
                    </tr>
                  ) : (
                    lista.map((dado) => (
                      <tr key={`${dado.tipo}-${dado.id}`}>
                        <td>
                          <span className={`badge ${dado.tipo === 'Receita' ? 'bg-success' : 'bg-danger'}`}>
                            {dado.tipo}
                          </span>
                        </td>
                        <td>{dado.nome}</td>
                        <td>
                          {dado.tipo === 'Despesa' && dado.limiteGasto ? formatarMoeda(dado.valorLimite) : '—'}
                        </td>
                        <td>
                          <Stack spacing={1} padding={0} direction='row'>
                            <IconButton aria-label='edit' onClick={() => editar(dado.id, dado.tipo)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label='delete'
                              onClick={() =>
                                window.confirm('Tem certeza de que deseja excluir?') && excluir(dado.id, dado.tipo)
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

export default ListagemCategorias;
