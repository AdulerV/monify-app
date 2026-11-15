import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro, mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import { hojeIso, paraNumero, formatarMoeda } from '../utils/formatacao';
import '../custom.css';

function CadastroLancamentos() {
  const { idParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tipoInicial = searchParams.get('tipo') === 'Despesa' ? 'Despesa' : 'Receita';
  const edicao = idParam != null;

  const [tipo, setTipo] = useState(tipoInicial);
  const [nome, setNome] = useState('');
  const [data, setData] = useState(hojeIso());
  const [idCategoria, setIdCategoria] = useState('');
  const [volume, setVolume] = useState(false);
  const [valor, setValor] = useState('');
  const [idFormaPagamento, setIdFormaPagamento] = useState('');
  const [parcelada, setParcelada] = useState(false);
  const [quantidadeParcelas, setQuantidadeParcelas] = useState('');

  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [categoriasReceita, setCategoriasReceita] = useState([]);
  const [categoriasDespesa, setCategoriasDespesa] = useState([]);
  const [carregando, setCarregando] = useState(true);

  function preencher(dados) {
    setNome(dados?.nome ?? '');
    setData(dados?.data ?? hojeIso());
    setIdCategoria((tipo === 'Receita' ? dados?.idCategoriaReceita : dados?.idCategoriaDespesa) ?? '');
    setVolume(dados?.volume ?? false);
    setValor(dados?.valor ?? '');
    setIdFormaPagamento(dados?.idFormaPagamento ?? '');
    setParcelada(dados?.parcelada ?? false);
    setQuantidadeParcelas(dados?.quantidadeParcelas ?? '');
  }

  function restaurarDados() {
    preencher(dadosOriginais);
  }

  async function salvar() {
    const valorNumerico = paraNumero(valor);
    if (!nome || nome.trim() === '' || !data || !valorNumerico || !idCategoria) {
      mensagemErro('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }
    if (tipo === 'Despesa' && !idFormaPagamento) {
      mensagemErro('Por favor, selecione uma Forma de Pagamento para a Despesa (*)');
      return;
    }
    const qtdParcelas = Number(quantidadeParcelas);
    if (tipo === 'Despesa' && parcelada && !(Number.isInteger(qtdParcelas) && qtdParcelas >= 2 && qtdParcelas <= 120)) {
      mensagemErro('Informe a quantidade de parcelas (entre 2 e 120).');
      return;
    }

    const base = { nome: nome.trim(), data, volume, valor: valorNumerico };
    const recurso = tipo === 'Receita' ? 'receitas' : 'despesas';
    const payload =
      tipo === 'Receita'
        ? { ...base, idCategoriaReceita: Number(idCategoria) }
        : {
            ...base,
            idCategoriaDespesa: Number(idCategoria),
            idFormaPagamento: Number(idFormaPagamento),
            parcelada,
            quantidadeParcelas: parcelada ? Number(quantidadeParcelas) : null,
          };

    try {
      if (!edicao) {
        await api.post(`/${recurso}`, payload);
        mensagemSucesso(`${tipo} "${nome}" cadastrada com sucesso!`);
      } else {
        await api.put(`/${recurso}/${idParam}`, payload);
        mensagemSucesso(`${tipo} "${nome}" alterada com sucesso!`);
      }
      navigate('/listagem-lancamentos');
    } catch (error) {
      mensagemErroApi(error, 'Erro ao salvar o lançamento');
    }
  }

  useEffect(() => {
    async function carregar() {
      try {
        const [formasRes, catReceitaRes, catDespesaRes] = await Promise.all([
          api.get('/formaspagamento'),
          api.get('/categoriasreceita'),
          api.get('/categoriasdespesa'),
        ]);
        setFormasPagamento(formasRes.data);
        setCategoriasReceita(catReceitaRes.data);
        setCategoriasDespesa(catDespesaRes.data);

        if (edicao) {
          const recurso = tipoInicial === 'Receita' ? 'receitas' : 'despesas';
          const response = await api.get(`/${recurso}/${idParam}`);
          setDadosOriginais(response.data);
          preencher(response.data);
        }
      } catch (error) {
        mensagemErroApi(error, 'Erro ao carregar os dados do lançamento.');
      } finally {
        setCarregando(false);
      }
    }

    carregar(); // eslint-disable-next-line
  }, [idParam]);

  if (carregando) {
    return (
      <div className='container mt-5 text-center'>
        <p>Carregando informações do lançamento...</p>
      </div>
    );
  }

  const categorias = tipo === 'Receita' ? categoriasReceita : categoriasDespesa;
  const valorNumerico = paraNumero(valor) || 0;
  const qtd = Number(quantidadeParcelas);

  return (
    <div className='container mb-5'>
      <Card title={edicao ? `Editar ${tipo}` : 'Cadastro de Lançamento'} icon='bi bi-wallet2'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <FormGroup label='Tipo: *' htmlFor='selectTipo'>
                <select
                  className='form-select'
                  id='selectTipo'
                  value={tipo}
                  disabled={edicao}
                  onChange={(e) => {
                    setTipo(e.target.value);
                    setIdCategoria('');
                  }}
                >
                  <option value='Receita'>Receita</option>
                  <option value='Despesa'>Despesa</option>
                </select>
              </FormGroup>

              <FormGroup label='Nome: *' htmlFor='inputNome'>
                <input
                  type='text'
                  id='inputNome'
                  placeholder={tipo === 'Receita' ? 'Ex: Salário, Freelance...' : 'Ex: Mercado, Aluguel...'}
                  value={nome}
                  className='form-control'
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormGroup>

              <FormGroup label='Data: *' htmlFor='inputData'>
                <input
                  type='date'
                  id='inputData'
                  value={data}
                  className='form-control'
                  onChange={(e) => setData(e.target.value)}
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

              <FormGroup label='Categoria: *' htmlFor='selectCategoria'>
                <select
                  className='form-select'
                  id='selectCategoria'
                  value={idCategoria}
                  onChange={(e) => setIdCategoria(e.target.value)}
                >
                  <option value=''>Selecione...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                      {c.limiteGasto ? ` (limite mensal ${formatarMoeda(c.valorLimite)})` : ''}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup label='Volume:' htmlFor='checkVolume'>
                <div className='form-check'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    id='checkVolume'
                    checked={volume}
                    onChange={(e) => setVolume(e.target.checked)}
                  />
                  <label className='form-check-label' htmlFor='checkVolume'>
                    Fixa (se repete todo mês)
                  </label>
                </div>
              </FormGroup>

              {tipo === 'Despesa' && (
                <>
                  <FormGroup label='Forma de Pagamento: *' htmlFor='selectForma'>
                    <select
                      className='form-select'
                      id='selectForma'
                      value={idFormaPagamento}
                      onChange={(e) => setIdFormaPagamento(e.target.value)}
                    >
                      <option value=''>Selecione...</option>
                      {formasPagamento.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nome}
                        </option>
                      ))}
                    </select>
                  </FormGroup>

                  <FormGroup label='Parcelamento:' htmlFor='checkParcelada'>
                    <div className='form-check'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        id='checkParcelada'
                        checked={parcelada}
                        onChange={(e) => setParcelada(e.target.checked)}
                      />
                      <label className='form-check-label' htmlFor='checkParcelada'>
                        Despesa parcelada
                      </label>
                    </div>
                  </FormGroup>

                  {parcelada && (
                    <FormGroup label='Quantidade de parcelas: *' htmlFor='inputParcelas'>
                      <input
                        type='number'
                        min='2'
                        max='120'
                        step='1'
                        id='inputParcelas'
                        value={quantidadeParcelas}
                        className='form-control'
                        onChange={(e) => setQuantidadeParcelas(e.target.value)}
                      />
                      {qtd >= 2 && valorNumerico > 0 && (
                        <small className='text-muted'>
                          {qtd}x de aproximadamente {formatarMoeda(valorNumerico / qtd)}. As parcelas são geradas automaticamente.
                        </small>
                      )}
                    </FormGroup>
                  )}
                </>
              )}

              <Stack spacing={1} padding={1} direction='row' className='mt-3'>
                <button onClick={salvar} type='button' className='btn btn-success'>
                  Salvar
                </button>
                <button onClick={restaurarDados} type='button' className='btn btn-warning'>
                  Restaurar
                </button>
                <button onClick={() => navigate('/listagem-lancamentos')} type='button' className='btn btn-danger'>
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

export default CadastroLancamentos;
