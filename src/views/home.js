import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import BtnEdicao from '../components/btnEdicao';
import Card from '../components/card';
import '../styles/home.css';
import { obterUsuarioLogado } from '../utils/usuarioLogado';
import { mensagemErroApi } from '../components/toastr';
import { formatarMoeda, filtrarPorPeriodo, somarValores, MESES, hojeIso, mesDe, anoDe, SITUACOES_META } from '../utils/formatacao';
import slogan from '../assets/monify-slogan.svg';

function Home() {
  const usuarioLogado = obterUsuarioLogado();
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [categoriasDespesa, setCategoriasDespesa] = useState([]);
  const [metas, setMetas] = useState([]);
  const [aportes, setAportes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [receitasRes, despesasRes, parcelasRes, categoriasRes, metasRes, aportesRes] = await Promise.all([
          api.get('/receitas'),
          api.get('/despesas'),
          api.get('/parcelas'),
          api.get('/categoriasdespesa'),
          api.get('/metasfinanceiras'),
          api.get('/aportes'),
        ]);
        setReceitas(receitasRes.data);
        setDespesas(despesasRes.data);
        setParcelas(parcelasRes.data);
        setCategoriasDespesa(categoriasRes.data);
        setMetas(metasRes.data);
        setAportes(aportesRes.data);
      } catch (error) {
        mensagemErroApi(error, 'Erro ao carregar dados do painel.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  if (carregando) {
    return (
      <div className='container text-center mt-5'>
        <p>Carregando painel financeiro...</p>
      </div>
    );
  }

  const hoje = hojeIso();
  const mesAtual = mesDe(hoje);
  const anoAtual = anoDe(hoje);

  const totalReceitas = somarValores(receitas);
  const totalDespesas = somarValores(despesas);

  const despesasDoMes = filtrarPorPeriodo(despesas, 'data', mesAtual, anoAtual);
  const parcelasPendentes = parcelas.filter((p) => !p.pago);

  const categoriasComLimite = categoriasDespesa
    .filter((c) => c.limiteGasto && c.valorLimite > 0)
    .map((categoria) => {
      const gasto = somarValores(despesasDoMes.filter((d) => d.idCategoriaDespesa === categoria.id));
      return { ...categoria, gasto, percentual: Math.min(100, (gasto / categoria.valorLimite) * 100) };
    });

  const metasEmAndamento = metas
    .filter((m) => !m.status)
    .map((meta) => {
      const aportado = somarValores(aportes.filter((a) => a.idMetaFinanceira === meta.id));
      const investido = aportado + Number(meta.investimentoInicial || 0);
      return { ...meta, investido, percentual: Math.min(100, (investido / meta.valor) * 100) };
    });

  return (
    <div className='container text-center'>
      <img src={slogan} alt='Monify' style={{ maxWidth: '50%' }} />

      <div id='dados-pessoais'>
        <div className='perfil' style={{ padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <i className='bi bi-person-circle' style={{ fontSize: 70, marginBottom: -10 }}></i>
          <span className='nome-usuario' style={{ margin: 0 }}>
            {usuarioLogado?.login}
          </span>
        </div>

        <div className='conteudo'>
          <h3>Seja bem-vindo(a), {usuarioLogado?.login}!</h3>
          <p>
            Na página inicial você encontra o seu saldo total, os limites de gasto do mês e o andamento
            das suas metas. Você também pode editar suas categorias, formas de pagamento e metas! 🎉
          </p>
          <div className='botoes'>
            <BtnEdicao render='true' href='/listagem-categorias' label='Editar Categorias ' />
            <BtnEdicao render='true' href='/listagem-formasPagamento' label='Editar Formas de Pagamento ' />
            <BtnEdicao render='true' href='/listagem-metas' label='Editar Metas ' />
          </div>
        </div>
      </div>

      <div className='row mt-4 justify-content-center'>
        <div className='col-md-3'>
          <div className='resumo-box'>
            <h6>Saldo Total</h6>
            <h4 className='saldo'>{formatarMoeda(totalReceitas - totalDespesas)}</h4>
          </div>
        </div>

        <div className='col-md-3'>
          <div className='resumo-box'>
            <h6>Entradas</h6>
            <h4 className='entrada'>
              {formatarMoeda(totalReceitas)}
              <i className='bi bi-caret-up-fill ms-1'></i>
            </h4>
          </div>
        </div>

        <div className='col-md-3'>
          <div className='resumo-box'>
            <h6>Saídas</h6>
            <h4 className='saida'>
              {formatarMoeda(totalDespesas)}
              <i className='bi bi-caret-down-fill ms-1'></i>
            </h4>
          </div>
        </div>

        <div className='col-md-3'>
          <div className='resumo-box'>
            <h6>Parcelas a Pagar</h6>
            <h4 className='saida'>
              {formatarMoeda(somarValores(parcelasPendentes, 'valorParcela'))}
            </h4>
            <small className='text-muted'>{parcelasPendentes.length} parcela(s) pendente(s)</small>
          </div>
        </div>
      </div>

      <div className='row mt-4 g-4 text-start'>
        <div className='col-md-6'>
          <Card title={`Limites de Gasto · ${MESES[mesAtual - 1]}`} icon='bi bi-speedometer2'>
            {categoriasComLimite.length === 0 ? (
              <p className='text-muted mb-0'>Nenhuma categoria de despesa com limite de gasto.</p>
            ) : (
              categoriasComLimite.map((c) => (
                <div key={c.id} className='mb-3'>
                  <div className='d-flex justify-content-between'>
                    <strong>{c.nome}</strong>
                    <span>{formatarMoeda(c.gasto)} de {formatarMoeda(c.valorLimite)}</span>
                  </div>
                  <div className='progress'>
                    <div
                      className={`progress-bar ${c.percentual >= 100 ? 'bg-danger' : c.percentual >= 80 ? 'bg-warning' : 'bg-success'}`}
                      role='progressbar'
                      style={{ width: `${c.percentual}%` }}
                      aria-valuenow={c.percentual}
                      aria-valuemin='0'
                      aria-valuemax='100'
                    ></div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        <div className='col-md-6'>
          <Card title='Metas em Andamento' icon='bi bi-cash-coin'>
            {metasEmAndamento.length === 0 ? (
              <p className='text-muted mb-0'>Nenhuma meta em andamento.</p>
            ) : (
              metasEmAndamento.map((m) => (
                <div key={m.id} className='mb-3'>
                  <div className='d-flex justify-content-between'>
                    <strong>
                      {m.nome}{' '}
                      <span className={`badge ${SITUACOES_META[m.situacao]?.classe ?? 'bg-secondary'}`}>
                        {SITUACOES_META[m.situacao]?.rotulo}
                      </span>
                    </strong>
                    <span>{formatarMoeda(m.investido)} de {formatarMoeda(m.valor)}</span>
                  </div>
                  <div className='progress'>
                    <div
                      className='progress-bar'
                      role='progressbar'
                      style={{ width: `${m.percentual}%` }}
                      aria-valuenow={m.percentual}
                      aria-valuemin='0'
                      aria-valuemax='100'
                    >
                      {Math.round(m.percentual)}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Home;
