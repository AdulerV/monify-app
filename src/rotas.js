import React from 'react';
import { Route, Routes, BrowserRouter, useLocation, Navigate } from 'react-router-dom';

import Home from './views/home';
import Login from './views/login';
import CadastroConta from './views/cadastro-conta';

import ListagemLancamentos from './views/listagem-lancamentos';
import CadastroLancamentos from './views/cadastro-lancamentos';
import ListagemCategorias from './views/listagem-categorias';
import CadastroCategorias from './views/cadastro-categorias';
import ListagemFormasPagamento from './views/listagem-formasPagamento';
import CadastroFormasPagamento from './views/cadastro-formasPagamento';
import ListagemPagamentos from './views/listagem-pagamentos';

import ListagemMetas from './views/listagem-metas';
import CadastroMetas from './views/cadastro-metas';
import ListagemAportes from './views/listagem-aportes';
import CadastroAportes from './views/cadastro-aportes';

import RelatorioMensal from './views/relatorio-mensal';
import RelatorioAnual from './views/relatorio-anual';

import ListagemUsuarios from './views/listagem-usuarios';
import CadastroUsuario from './views/cadastro-usuario';

import AcessoNegado from './views/acesso-negado';
import NaoEncontrado from './views/nao-encontrado';

import { RotaProtegida } from './utils/RotaProtegida';
import { RotaAdmin } from './utils/RotaAdmin';
import Navbar from './components/navbar';

function RotasInternas() {
  const location = useLocation();

  const rotasSemNavbar = ['/', '/login', '/cadastro-conta'];
  const mostrarNavbar = !rotasSemNavbar.includes(location.pathname);

  const protegida = (elemento) => <RotaProtegida element={elemento} />;

  return (
    <>
      <Routes>
        <Route path='/' element={<Navigate to='/login' replace />} />
        <Route path='/login' element={<Login />} />
        <Route path='/cadastro-conta' element={<CadastroConta />} />

        <Route path='/home' element={protegida(<Home />)} />
        <Route path='/acesso-negado' element={protegida(<AcessoNegado />)} />

        <Route path='/listagem-lancamentos' element={protegida(<ListagemLancamentos />)} />
        <Route path='/cadastro-lancamentos/:idParam?' element={protegida(<CadastroLancamentos />)} />
        <Route path='/listagem-categorias' element={protegida(<ListagemCategorias />)} />
        <Route path='/cadastro-categorias/:idParam?' element={protegida(<CadastroCategorias />)} />
        <Route path='/listagem-formasPagamento' element={protegida(<ListagemFormasPagamento />)} />
        <Route path='/cadastro-formasPagamento/:idParam?' element={protegida(<CadastroFormasPagamento />)} />
        <Route path='/listagem-pagamentos' element={protegida(<ListagemPagamentos />)} />

        <Route path='/listagem-metas' element={protegida(<ListagemMetas />)} />
        <Route path='/cadastro-metas/:idParam?' element={protegida(<CadastroMetas />)} />
        <Route path='/listagem-aportes' element={protegida(<ListagemAportes />)} />
        <Route path='/cadastro-aportes/:idParam?' element={protegida(<CadastroAportes />)} />

        <Route path='/relatorio-mensal' element={protegida(<RelatorioMensal />)} />
        <Route path='/relatorio-anual' element={protegida(<RelatorioAnual />)} />

        <Route path='/listagem-usuarios' element={<RotaAdmin element={<ListagemUsuarios />} />} />
        <Route path='/cadastro-usuarios/:idParam?' element={<RotaAdmin element={<CadastroUsuario />} />} />

        <Route path='*' element={protegida(<NaoEncontrado />)} />
      </Routes>

      {mostrarNavbar && <Navbar />}
    </>
  );
}

function Rotas() {
  return (
    <BrowserRouter>
      <RotasInternas />
    </BrowserRouter>
  );
}

export default Rotas;
