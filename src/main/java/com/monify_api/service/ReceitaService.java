package com.monify_api.service;

import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.CategoriaReceita;
import com.monify_api.model.entity.Receita;
import com.monify_api.model.repository.ReceitaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ReceitaService {

    private ReceitaRepository repository;

    public ReceitaService(ReceitaRepository repository) {
        this.repository = repository;
    }

    public List<Receita> getReceitas() {
        return repository.findAll();
    }

    public Optional<Receita> getReceitaById(Long id) {
        return repository.findById(id);
    }

    public List<Receita> getReceitasByCategoria(CategoriaReceita categoria) {
        return repository.findByCategoriaReceita(categoria);
    }

    @Transactional
    public Receita salvar(Receita receita) {
        validar(receita);
        return repository.save(receita);
    }

    @Transactional
    public void excluir(Receita receita) {
        Objects.requireNonNull(receita.getId());
        repository.delete(receita);
    }

    public void validar(Receita receita) {
        if (receita.getNome() == null || receita.getNome().trim().equals("")) {
            throw new RegraNegocioException("Nome inválido");
        }
        if (receita.getData() == null) {
            throw new RegraNegocioException("Data inválida");
        }
        if (receita.getValor() == null || receita.getValor() <= 0) {
            throw new RegraNegocioException("Valor inválido");
        }
        if (receita.getCategoriaReceita() == null || receita.getCategoriaReceita().getId() == null
                || receita.getCategoriaReceita().getId() == 0) {
            throw new RegraNegocioException("Categoria de receita inválida");
        }
    }
}
