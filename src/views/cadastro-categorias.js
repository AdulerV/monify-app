import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro, mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import { paraNumero } from '../utils/formatacao';
import '../custom.css';

function CadastroCategorias() {
  const { idParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const edicao = idParam != null;
  const [tipo, setTipo] = useState(searchParams.get('tipo') === 'Despesa' ? 'Despesa' : 'Receita');
  const [nome, setNome] = useState('');
  const [limiteGasto, setLimiteGasto] = useState(false);
  const [valorLimite, setValorLimite] = useState('');
  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [carregando, setCarregando] = useState(edicao);

  const recurso = tipo === 'Receita' ? 'categoriasreceita' : 'categoriasdespesa';

  function preencher(dados) {
    setNome(dados?.nome ?? '');
    setLimiteGasto(dados?.limiteGasto ?? false);
    setValorLimite(dados?.valorLimite ?? '');
  }

  async function salvar() {
    if (!nome || nome.trim() === '') {
      mensagemErro('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }
    const limite = paraNumero(valorLimite);
    if (tipo === 'Despesa' && limiteGasto && !(limite > 0)) {
      mensagemErro('Informe um valor limite maior que zero.');
      return;
    }

    const payload =
      tipo === 'Receita'
        ? { nome: nome.trim() }
        : { nome: nome.trim(), limiteGasto, valorLimite: limiteGasto ? limite : null };

    try {
      if (!edicao) {
        await api.post(`/${recurso}`, payload);
        mensagemSucesso(`Categoria "${nome}" cadastrada com sucesso!`);
      } else {
        await api.put(`/${recurso}/${idParam}`, payload);
        mensagemSucesso(`Categoria "${nome}" alterada com sucesso!`);
      }
      navigate('/listagem-categorias');
    } catch (error) {
      mensagemErroApi(error, 'Erro ao salvar a categoria');
    }
  }

  useEffect(() => {
    async function buscar() {
      if (!edicao) return;
      try {
        const response = await api.get(`/${recurso}/${idParam}`);
        setDadosOriginais(response.data);
        preencher(response.data);
      } catch (error) {
        mensagemErroApi(error, 'Erro ao buscar dados da categoria.');
      } finally {
        setCarregando(false);
      }
    }

    buscar(); // eslint-disable-next-line
  }, [idParam]);

  if (carregando) {
    return (
      <div className='container mt-5 text-center'>
        <p>Carregando informações da categoria...</p>
      </div>
    );
  }

  return (
    <div className='container mb-5'>
      <Card title={edicao ? 'Editar Categoria' : 'Cadastro de Categoria'} icon='bi bi-tags'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <FormGroup label='Tipo: *' htmlFor='selectTipo'>
                <select
                  className='form-select'
                  id='selectTipo'
                  value={tipo}
                  disabled={edicao}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value='Receita'>Receita</option>
                  <option value='Despesa'>Despesa</option>
                </select>
              </FormGroup>

              <FormGroup label='Nome: *' htmlFor='inputNome'>
                <input
                  type='text'
                  id='inputNome'
                  placeholder={tipo === 'Receita' ? 'Ex: Salário, Investimentos...' : 'Ex: Alimentação, Lazer...'}
                  value={nome}
                  className='form-control'
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormGroup>

              {tipo === 'Despesa' && (
                <>
                  <FormGroup label='Limite de gasto:' htmlFor='checkLimite'>
                    <div className='form-check'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        id='checkLimite'
                        checked={limiteGasto}
                        onChange={(e) => setLimiteGasto(e.target.checked)}
                      />
                      <label className='form-check-label' htmlFor='checkLimite'>
                        Limitar o gasto mensal desta categoria
                      </label>
                    </div>
                  </FormGroup>

                  {limiteGasto && (
                    <FormGroup label='Valor limite por mês (R$): *' htmlFor='inputValorLimite'>
                      <input
                        type='text'
                        id='inputValorLimite'
                        placeholder='0,00'
                        value={valorLimite}
                        className='form-control'
                        onChange={(e) => setValorLimite(e.target.value)}
                      />
                      <small className='text-muted'>
                        Despesas que ultrapassarem este valor no mês serão recusadas.
                      </small>
                    </FormGroup>
                  )}
                </>
              )}

              <Stack spacing={1} padding={1} direction='row' className='mt-3'>
                <button onClick={salvar} type='button' className='btn btn-success'>
                  Salvar
                </button>
                <button onClick={() => preencher(dadosOriginais)} type='button' className='btn btn-warning'>
                  Restaurar
                </button>
                <button onClick={() => navigate('/listagem-categorias')} type='button' className='btn btn-danger'>
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

export default CadastroCategorias;
