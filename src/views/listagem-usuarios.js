import React from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import Card from '../components/card';
import { mensagemSucesso, mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import '../custom.css';

function ListagemUsuarios() {
  const navigate = useNavigate();

  const cadastrar = () => {
    navigate(`/cadastro-usuarios`);
  };

  const editar = (id) => {
    navigate(`/cadastro-usuarios/${id}`);
  };

  const [dados, setDados] = React.useState(null);

  async function excluir(id) {
    try {
      await api.delete(`/usuarios/${id}`);
      mensagemSucesso(`Usuário excluído com sucesso!`);
      setDados(dados.filter((dado) => dado.id !== id));
    } catch (error) {
      mensagemErroApi(error, 'Erro ao excluir o usuário');
    }
  }

  React.useEffect(() => {
    api
      .get('/usuarios')
      .then((response) => setDados(response.data))
      .catch((error) => {
        setDados([]);
        mensagemErroApi(error, 'Erro ao carregar os usuários.');
      });
  }, []);

  if (!dados) {
    return (
      <div className='container mt-5 text-center'>
        <p>Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className='container'>
      <Card title='Listagem de Usuários' icon='bi bi-people'>
        <p className='text-muted'>Contas com acesso ao Monify</p>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <Stack spacing={1} direction='row' marginBottom={3}>
                <button type='button' className='btn btn-primary' onClick={() => cadastrar()}>
                  Novo Usuário
                </button>
                <button onClick={() => navigate(-1)} type='button' className='btn btn-danger'>
                  Cancelar
                </button>
              </Stack>
              <table className='table table-hover'>
                <thead>
                  <tr>
                    <th scope='col'>Login</th>
                    <th scope='col'>CPF</th>
                    <th scope='col'>Administrador</th>
                    <th scope='col' style={{ width: '100px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((dado) => (
                    <tr key={dado.id}>
                      <td>{dado.login}</td>
                      <td>{dado.cpf}</td>
                      <td>
                        <span className={`badge ${dado.admin ? 'bg-primary' : 'bg-secondary'}`}>
                          {dado.admin ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td>
                        <Stack spacing={1} padding={0} direction='row'>
                          <IconButton aria-label='edit' onClick={() => editar(dado.id)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label='delete'
                            onClick={() => window.confirm('Tem certeza de que deseja excluir?') && excluir(dado.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ListagemUsuarios;
