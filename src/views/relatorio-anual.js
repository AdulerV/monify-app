import React, { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import {
  Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title,
  BarController, LineController,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import Card from '../components/card';
import { mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import { MESES, formatarMoeda, anosDisponiveis, somarValores, anoDe, mesDe, hojeIso } from '../utils/formatacao';
import '../custom.css';

ChartJS.register(
  Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, BarController, LineController
);

function RelatorioAnual() {
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [aportes, setAportes] = useState([]);
  const [filtroAno, setFiltroAno] = useState(String(anoDe(hojeIso())));
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
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
        mensagemErroApi(error, 'Erro ao carregar os dados do relatório anual.');
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  if (carregando) {
    return (
      <div className='container mt-5 text-center'>
        <p>Processando dados e gerando gráficos...</p>
      </div>
    );
  }

  const ano = Number(filtroAno);
  const doAno = (lista, campo) => lista.filter((item) => anoDe(item[campo]) === ano);
  const porMes = (lista, campo) =>
    MESES.map((_, i) => somarValores(lista.filter((item) => mesDe(item[campo]) === i + 1)));

  const receitasMes = porMes(doAno(receitas, 'data'), 'data');
  const despesasMes = porMes(doAno(despesas, 'data'), 'data');
  const aportesMes = porMes(doAno(aportes, 'dataEnvio'), 'dataEnvio');
  const saldoMes = receitasMes.map((r, i) => r - despesasMes[i]);

  const totalReceitas = receitasMes.reduce((a, b) => a + b, 0);
  const totalDespesas = despesasMes.reduce((a, b) => a + b, 0);
  const totalAportes = aportesMes.reduce((a, b) => a + b, 0);

  const rotulosMeses = MESES.map((m) => m.substring(0, 3));
  const tooltipMoeda = { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatarMoeda(ctx.parsed.y)}` } };

  const dadosReceitasDespesas = {
    labels: rotulosMeses,
    datasets: [
      { type: 'line', label: 'Saldo', data: saldoMes, borderColor: '#760690', backgroundColor: '#760690', tension: 0.3 },
      { type: 'bar', label: 'Receitas', data: receitasMes, backgroundColor: '#50bbfa' },
      { type: 'bar', label: 'Despesas', data: despesasMes, backgroundColor: '#9329ed' },
    ],
  };

  const dadosAportes = {
    labels: rotulosMeses,
    datasets: [{ label: 'Aportes', data: aportesMes, backgroundColor: '#6089ec' }],
  };

  return (
    <div className='container mb-5'>
      <Card title='Relatório Anual' icon='bi bi-bank'>
        <p className='text-muted'>
          Evolução mês a mês das suas finanças em <strong>{filtroAno}</strong>
        </p>

        <Stack spacing={2} direction='row' alignItems='center' marginTop={2}>
          <label><strong>Ano:</strong></label>
          <select
            className='form-select'
            style={{ width: 130 }}
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
          >
            {anosDisponiveis([receitas, 'data'], [despesas, 'data'], [aportes, 'dataEnvio']).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Stack>

        <Stack spacing={3} direction='row' sx={{ mt: 3, mb: 4 }}>
          <div className='resumo-card receita col-md-3'>
            <span className='resumo-titulo'>Receitas no Ano</span>
            <span className='resumo-valor positivo'>{formatarMoeda(totalReceitas)}</span>
          </div>
          <div className='resumo-card despesa col-md-3'>
            <span className='resumo-titulo'>Despesas no Ano</span>
            <span className='resumo-valor negativo'>{formatarMoeda(totalDespesas)}</span>
          </div>
          <div className='resumo-card col-md-3'>
            <span className='resumo-titulo'>Saldo do Ano</span>
            <span className={`resumo-valor ${totalReceitas - totalDespesas >= 0 ? '' : 'negativo'}`}>
              {formatarMoeda(totalReceitas - totalDespesas)}
            </span>
          </div>
          <div className='resumo-card col-md-3'>
            <span className='resumo-titulo'>Aportes no Ano</span>
            <span className='resumo-valor'>{formatarMoeda(totalAportes)}</span>
          </div>
        </Stack>

        <Card title='Receitas x Despesas por Mês'>
          <div style={{ height: '320px', position: 'relative' }}>
            <Bar
              data={dadosReceitasDespesas}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { tooltip: tooltipMoeda } }}
            />
          </div>
        </Card>

        <div className='mt-4'>
          <Card title='Aportes por Mês'>
            <div style={{ height: '240px', position: 'relative' }}>
              <Bar
                data={dadosAportes}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: tooltipMoeda },
                }}
              />
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
}

export default RelatorioAnual;
