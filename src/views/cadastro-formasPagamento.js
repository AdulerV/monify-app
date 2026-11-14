import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Card from '../components/card';
import FormGroup from '../components/form-group';

import { mensagemSucesso, mensagemErro, mensagemErroApi } from '../components/toastr';
import api from '../config/axios';
import '../custom.css';

function CadastroFormasPagamento() {
  const { idParam } = useParams();
  const navigate = useNavigate();

  const edicao = idParam != null;
  const [nome, setNome] = useState('');
  const [dadosOriginais, setDadosOriginais] = useState(null);
  const [carregando, setCarregando] = useState(edicao);

  async function salvar() {
    if (!nome || nome.trim() === '') {
      mensagemErro('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }
    const payload = { nome: nome.trim() };
    try {
      if (!edicao) {
        await api.post('/formaspagamento', payload);
        mensagemSucesso(`Forma de pagamento "${nome}" cadastrada com sucesso!`);
      } else {
        await api.put(`/formaspagamento/${idParam}`, payload);
        mensagemSucesso(`Forma de pagamento "${nome}" alterada com sucesso!`);
      }
      navigate('/listagem-formasPagamento');
    } catch (error) {
      mensagemErroApi(error, 'Erro ao salvar a forma de pagamento');
    }
  }

  useEffect(() => {
    async function buscar() {
      if (!edicao) return;
      try {
        const response = await api.get(`/formaspagamento/${idParam}`);
        setDadosOriginais(response.data);
        setNome(response.data.nome ?? '');
      } catch (error) {
        mensagemErroApi(error, 'Erro ao buscar dados da forma de pagamento.');
      } finally {
        setCarregando(false);
      }
    }

    buscar(); // eslint-disable-next-line
  }, [idParam]);

  if (carregando) {
    return (
      <div className='container mt-5 text-center'>
        <p>Carregando informações da forma de pagamento...</p>
      </div>
    );
  }

  return (
    <div className='container mb-5'>
      <Card
        title={edicao ? 'Editar Forma de Pagamento' : 'Cadastro de Forma de Pagamento'}
        icon='bi bi-credit-card-2-front'
      >
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <FormGroup label='Nome: *' htmlFor='inputNome'>
                <input
                  type='text'
                  id='inputNome'
                  placeholder='Ex: Pix, Cartão de Crédito, Dinheiro...'
                  value={nome}
                  className='form-control'
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormGroup>

              <Stack spacing={1} padding={1} direction='row' className='mt-3'>
                <button onClick={salvar} type='button' className='btn btn-success'>
                  Salvar
                </button>
                <button onClick={() => setNome(dadosOriginais?.nome ?? '')} type='button' className='btn btn-warning'>
                  Restaurar
                </button>
                <button onClick={() => navigate('/listagem-formasPagamento')} type='button' className='btn btn-danger'>
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

export default CadastroFormasPagamento;
