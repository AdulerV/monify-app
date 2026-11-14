import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../components/card';
import FiltroPeriodo from '../components/filtroPeriodo';
import { mensagemSucesso, mensagemErro, mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import { formatarMoeda, formatarData, filtrarPorPeriodo, anosDisponiveis, somarValores } from '../utils/formatacao';
import '../custom.css';

function ListagemPagamentos() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const idDespesaFiltro = searchParams.get('despesa');

  const [parcelas, setParcelas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);

  const [filtroMes, setFiltroMes] = useState('Todos');
  const [filtroAno, setFiltroAno] = useState('Todos');
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState('Todas');
  const [filtroStatus, setFiltroStatus] = useState('Pendentes');

  useEffect(() => {
    async function carregarDadosPagamentos() {
      try {
        const [parcelasRes, despesasRes, formasRes] = await Promise.all([
          api.get('/parcelas'),
          api.get('/despesas'),
          api.get('/formaspagamento'),
        ]);
        setParcelas(parcelasRes.data);
        setDespesas(despesasRes.data);
        setFormasPagamento(formasRes.data);
      } catch (error) {
        mensagemErroApi(error, 'Erro ao carregar as parcelas.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosPagamentos();
  }, []);

  async function alterarPagamento(listaParcelas, pago) {
    setProcessando(true);
    try {
      const atualizadas = await Promise.all(
        listaParcelas.map((p) =>
          api
            .put(`/parcelas/${p.id}`, { valorParcela: p.valorParcela, pago, idDespesa: p.idDespesa })
            .then((response) => response.data)
        )
      );
      const porId = new Map(atualizadas.map((p) => [p.id, p]));
      setParcelas((atuais) => atuais.map((p) => (porId.has(p.id) ? { ...p, ...porId.get(p.id) } : p)));
      mensagemSucesso(
        pago
          ? `${atualizadas.length} parcela(s) marcada(s) como paga(s)!`
          : 'Pagamento desfeito com sucesso!'
      );
    } catch (error) {
      mensagemErroApi(error, 'Erro ao registrar o pagamento.');
    } finally {
      setProcessando(false);
    }
  }

  if (carregando) {
    return (
      <div className='container mt-5 text-center'>
        <p>Carregando pagamentos...</p>
      </div>
    );
  }

  // junta cada parcela com a despesa de origem e numera (1/N, 2/N...)
  const despesasPorId = new Map(despesas.map((d) => [d.id, d]));
  const contagem = {};
  const parcelasDetalhadas = [...parcelas]
    .sort((a, b) => a.id - b.id)
    .map((p) => {
      const despesa = despesasPorId.get(p.idDespesa) || {};
      contagem[p.idDespesa] = (contagem[p.idDespesa] || 0) + 1;
      const total = parcelas.filter((x) => x.idDespesa === p.idDespesa).length;
      return {
        ...p,
        data: despesa.data,
        nomeFormaPagamento: despesa.nomeFormaPagamento,
        nomeCategoriaDespesa: despesa.nomeCategoriaDespesa,
        numero: `${contagem[p.idDespesa]}/${total}`,
      };
    });

  const filtradas = filtrarPorPeriodo(parcelasDetalhadas, 'data', filtroMes, filtroAno).filter((p) => {
    const filtraDespesa = !idDespesaFiltro || String(p.idDespesa) === idDespesaFiltro;
    const filtraForma = filtroFormaPagamento === 'Todas' || p.nomeFormaPagamento === filtroFormaPagamento;
    const filtraStatus =
      filtroStatus === 'Todas' || (filtroStatus === 'Pagas' ? p.pago : !p.pago);
    return filtraDespesa && filtraForma && filtraStatus;
  });

  const pendentesFiltradas = filtradas.filter((p) => !p.pago);
  const totalPendente = somarValores(pendentesFiltradas, 'valorParcela');
  const totalPago = somarValores(filtradas.filter((p) => p.pago), 'valorParcela');

  function pagarFatura() {
    if (pendentesFiltradas.length === 0) {
      mensagemErro('Não há parcelas pendentes para pagar no filtro atual.');
      return;
    }
    if (window.confirm(`Confirmar o pagamento de ${pendentesFiltradas.length} parcela(s), total de ${formatarMoeda(totalPendente)}?`)) {
      alterarPagamento(pendentesFiltradas, true);
    }
  }

  return (
    <div className='container'>
      <Card title='Pagamentos' icon='bi bi-credit-card'>
        <p className='text-muted'>Parcelas das suas despesas parceladas</p>

        {idDespesaFiltro && (
          <div className='alert alert-info d-flex justify-content-between align-items-center'>
            <span>
              Exibindo as parcelas de <strong>{despesasPorId.get(Number(idDespesaFiltro))?.nome ?? 'despesa'}</strong>
            </span>
            <button className='btn btn-sm btn-primary' onClick={() => setSearchParams({})}>
              Ver todas
            </button>
          </div>
        )}

        <Stack spacing={2} direction='row' alignItems='center' marginBottom={2}>
          <label className='label-filtro'><strong>Situação:</strong></label>
          <select
            className='form-select'
            style={{ width: 160 }}
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value='Pendentes'>Pendentes</option>
            <option value='Pagas'>Pagas</option>
            <option value='Todas'>Todas</option>
          </select>

          <label className='label-filtro'><strong>Forma de pagamento:</strong></label>
          <select
            className='form-select'
            style={{ width: 220 }}
            value={filtroFormaPagamento}
            onChange={(e) => setFiltroFormaPagamento(e.target.value)}
          >
            <option value='Todas'>Todas</option>
            {formasPagamento.map((f) => (
              <option key={f.id} value={f.nome}>
                {f.nome}
              </option>
            ))}
          </select>
        </Stack>

        <strong className='label-filtro'>Período da despesa:</strong>
        <FiltroPeriodo
          filtroMes={filtroMes}
          setFiltroMes={setFiltroMes}
          filtroAno={filtroAno}
          setFiltroAno={setFiltroAno}
          anos={anosDisponiveis([parcelasDetalhadas, 'data'])}
        />

        <Stack spacing={2} direction='row' sx={{ mt: 2, mb: 2 }}>
          <div className='resumo-card despesa'>
            <span className='resumo-titulo'>A Pagar</span>
            <span className='resumo-valor negativo'>{formatarMoeda(totalPendente)}</span>
          </div>
          <div className='resumo-card receita'>
            <span className='resumo-titulo'>Pago</span>
            <span className='resumo-valor positivo'>{formatarMoeda(totalPago)}</span>
          </div>
        </Stack>

        <Stack spacing={1} direction='row' marginBottom={3}>
          <button type='button' className='btn btn-success' onClick={pagarFatura} disabled={processando}>
            Pagar Fatura
          </button>
          <button onClick={() => navigate(-1)} type='button' className='btn btn-danger'>
            Cancelar
          </button>
        </Stack>

        <table className='table table-hover'>
          <thead>
            <tr>
              <th scope='col'>Despesa</th>
              <th scope='col'>Data</th>
              <th scope='col'>Parcela</th>
              <th scope='col'>Categoria</th>
              <th scope='col'>Forma de Pagamento</th>
              <th scope='col'>Valor</th>
              <th scope='col'>Situação</th>
              <th scope='col' style={{ width: '140px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={8} className='text-center text-muted'>
                  Nenhuma parcela encontrada para os filtros selecionados.
                </td>
              </tr>
            ) : (
              filtradas.map((p) => (
                <tr key={p.id}>
                  <td>{p.nomeDespesa}</td>
                  <td>{formatarData(p.data)}</td>
                  <td>{p.numero}</td>
                  <td>{p.nomeCategoriaDespesa}</td>
                  <td>{p.nomeFormaPagamento}</td>
                  <td>{formatarMoeda(p.valorParcela)}</td>
                  <td>
                    <span className={`badge ${p.pago ? 'bg-success' : 'bg-warning'}`}>
                      {p.pago ? 'Paga' : 'Pendente'}
                    </span>
                  </td>
                  <td>
                    {p.pago ? (
                      <button
                        className='btn btn-sm btn-outline-danger'
                        disabled={processando}
                        onClick={() => alterarPagamento([p], false)}
                      >
                        Desfazer
                      </button>
                    ) : (
                      <button
                        className='btn btn-sm btn-success'
                        disabled={processando}
                        onClick={() => alterarPagamento([p], true)}
                      >
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default ListagemPagamentos;
