import React from 'react';
import { Navigate } from 'react-router-dom';
import { obterUsuarioLogado } from './usuarioLogado';

export function RotaAdmin({ element }) {
  const usuarioLogado = obterUsuarioLogado();

  if (!usuarioLogado) {
    return <Navigate to='/login' replace />;
  }

  if (usuarioLogado.admin !== true) {
    return <Navigate to='/acesso-negado' replace />;
  }

  return element;
}
