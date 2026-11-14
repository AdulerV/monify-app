import React from 'react';
import Stack from '@mui/material/Stack';
import { MESES } from '../utils/formatacao';

// Seletor de Mes/Ano no mesmo layout das telas do FinanceTrack
function FiltroPeriodo({ filtroMes, setFiltroMes, filtroAno, setFiltroAno, anos }) {
  return (
    <Stack spacing={2} direction='row' alignItems='center' marginTop={2}>
      <label><strong>Mês:</strong></label>
      <select
        className='form-select'
        style={{ width: 150 }}
        value={filtroMes}
        onChange={(e) => setFiltroMes(e.target.value)}
      >
        <option value='Todos'>Todos</option>
        {MESES.map((nome, indice) => (
          <option key={nome} value={indice + 1}>
            {nome}
          </option>
        ))}
      </select>

      <label><strong>Ano:</strong></label>
      <select
        className='form-select'
        style={{ width: 120 }}
        value={filtroAno}
        onChange={(e) => setFiltroAno(e.target.value)}
      >
        <option value='Todos'>Todos</option>
        {anos.map((ano) => (
          <option key={ano} value={ano}>
            {ano}
          </option>
        ))}
      </select>
    </Stack>
  );
}

export default FiltroPeriodo;
