import React, { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

import Card from '../components/card';
import FiltroPeriodo from '../components/filtroPeriodo';
import { mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import {
  MESES, PALETA_CORES, formatarMoeda, filtrarPorPeriodo, anosDisponiveis, somarValores, hojeIso, mesDe, anoDe,
} from '../utils/formatacao';
import '../custom.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const opcoesGraficoPizza = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'right', labels: { boxWidth: 15, boxHeight: 15 } },
    tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${formatarMoeda(ctx.parsed)}` } },
  },
};

function somarPorChave(lista, chaveId, chaveNome) {
  const mapa = new Map();
  lista.forEach((item) => {
    const atual = mapa.get(item[chaveId]) || { nome: item[chaveNome], total: 0 };
    atual.total += Number(item.valor || 0);
    mapa.set(item[chaveId], atual);
  });
  return [...mapa.values()].sort((a, b) => b.total - a.total);
}

function RelatorioMensal() {
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [aportes, setAportes] = useState([]);

  const [filtroMes, setFiltroMes] = useState(String(mesDe(hojeIso())));
  const [filtroAno, setFiltroAno] = useState(String(anoDe(hojeIso())));
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDadosRelatorio() {
      try {
        const [receitasRes, despesasRes, aportesRes] = await Promise.all([
          api.get('/receitas'),
          api.get('/despesas'),
          api.get('/aportes'),
        ]);
        setReceitas(receitasRes.data);
        setDespesas(despesasRes.data);
        setAportes(aportesRes.data);
      } catch (error) {
        mensagemErroApi(error, 'Erro ao carregar os dados dos gráficos financeiros.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDadosRelatorio();
  }, []);

  if (carregando) {
    return (
      <div className='container mt-5 text-center'>
        <p>Processando dados e gerando gráficos...</p>
      </div>
    );
  }

  const receitasFiltradas = filtrarPorPeriodo(receitas, 'data', filtroMes, filtroAno);
  const despesasFiltradas = filtrarPorPeriodo(despesas, 'data', filtroMes, filtroAno);
  const aportesFiltrados = filtrarPorPeriodo(aportes, 'dataEnvio', filtroMes, filtroAno);

  const totalReceitas = somarValores(receitasFiltradas);
  const totalDespesas = somarValores(despesasFiltradas);

  const receitasPorCategoria = somarPorChave(receitasFiltradas, 'idCategoriaReceita', 'nomeCategoriaReceita');
  const despesasPorCategoria = somarPorChave(despesasFiltradas, 'idCategoriaDespesa', 'nomeCategoriaDespesa');
  const despesasPorForma = somarPorChave(despesasFiltradas, 'idFormaPagamento', 'nomeFormaPagamento');
  const aportesPorMeta = somarPorChave(aportesFiltrados, 'idMetaFinanceira', 'nomeMetaFinanceira');

  const pizza = (grupos, rotulo) => ({
    labels: grupos.map((g) => g.nome),
    datasets: [{ label: rotulo, data: grupos.map((g) => g.total), backgroundColor: PALETA_CORES, borderWidth: 0 }],
  });

  const fixas = somarValores(despesasFiltradas.filter((d) => d.volume));
  const variaveis = somarValores(despesasFiltradas.filter((d) => !d.volume));

  const dadosGraficoBarrasVolume = {
    labels: ['Fixas', 'Variáveis'],
    datasets: [{ label: 'Despesas (R$)', data: [fixas, variaveis], backgroundColor: PALETA_CORES.slice(0, 2) }],
  };

  const dadosGraficoBarrasAportes = {
    labels: aportesPorMeta.map((g) => g.nome),
    datasets: [{ label: 'Aportes (R$)', data: aportesPorMeta.map((g) => g.total), backgroundColor: PALETA_CORES }],
  };

  const opcoesBarras = (horizontal) => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => formatarMoeda(horizontal ? ctx.parsed.x : ctx.parsed.y) } },
    },
  });

  const semDados = (lista) =>
    lista.length === 0 ? <p className='text-muted text-center mt-5'>Sem dados no período.</p> : null;

  const descricaoPeriodo = `${filtroMes === 'Todos' ? 'Todos os Meses' : MESES[Number(filtroMes) - 1]} / ${
    filtroAno === 'Todos' ? 'Todos os Anos' : filtroAno
  }`;

  return (
    <div className='container mb-5'>
      <Card title='Relatório Mensal' icon='bi bi-bank'>
        <p className='text-muted'>
          Análise financeira referente ao período de: <strong>{descricaoPeriodo}</strong>
        </p>

        <FiltroPeriodo
          filtroMes={filtroMes}
          setFiltroMes={setFiltroMes}
          filtroAno={filtroAno}
          setFiltroAno={setFiltroAno}
          anos={anosDisponiveis([receitas, 'data'], [despesas, 'data'], [aportes, 'dataEnvio'])}
        />

        <Stack spacing={3} direction='row' sx={{ mt: 3, mb: 4 }}>
          <div className='resumo-card receita col-md-4'>
            <span className='resumo-titulo'>Total Receitas</span>
            <span className='resumo-valor positivo'>{formatarMoeda(totalReceitas)}</span>
          </div>

          <div className='resumo-card despesa col-md-4'>
            <span className='resumo-titulo'>Total Despesas</span>
            <span className='resumo-valor negativo'>{formatarMoeda(totalDespesas)}</span>
          </div>

          <div className='resumo-card col-md-4'>
            <span className='resumo-titulo'>Saldo</span>
            <span className={`resumo-valor ${totalReceitas - totalDespesas >= 0 ? '' : 'negativo'}`}>
              {formatarMoeda(totalReceitas - totalDespesas)}
            </span>
          </div>
        </Stack>

        <div className='row g-4'>
          <div className='col-md-6'>
            <Card title='Distribuição de Receitas'>
              <div style={{ height: '280px', position: 'relative' }}>
                {semDados(receitasPorCategoria) || (
                  <Pie data={pizza(receitasPorCategoria, 'Receitas')} options={opcoesGraficoPizza} />
                )}
              </div>
            </Card>
          </div>
          <div className='col-md-6'>
            <Card title='Distribuição de Despesas'>
              <div style={{ height: '280px', position: 'relative' }}>
                {semDados(despesasPorCategoria) || (
                  <Pie data={pizza(despesasPorCategoria, 'Despesas')} options={opcoesGraficoPizza} />
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className='row g-4 mt-2'>
          <div className='col-md-4'>
            <Card title='Volume das Despesas'>
              <div style={{ height: '220px', position: 'relative' }}>
                {semDados(despesasFiltradas) || <Bar data={dadosGraficoBarrasVolume} options={opcoesBarras(true)} />}
              </div>
            </Card>
          </div>
          <div className='col-md-4'>
            <Card title='Despesas por Forma de Pagamento'>
              <div style={{ height: '220px', position: 'relative' }}>
                {semDados(despesasPorForma) || (
                  <Pie data={pizza(despesasPorForma, 'Formas de Pagamento')} options={opcoesGraficoPizza} />
                )}
              </div>
            </Card>
          </div>
          <div className='col-md-4'>
            <Card title='Aportes Realizados por Meta'>
              <div style={{ height: '220px', position: 'relative' }}>
                {semDados(aportesPorMeta) || <Bar data={dadosGraficoBarrasAportes} options={opcoesBarras(false)} />}
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RelatorioMensal;
