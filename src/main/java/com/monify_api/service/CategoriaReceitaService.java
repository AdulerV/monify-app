package com.monify_api.service;

import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.CategoriaReceita;
import com.monify_api.model.repository.CategoriaReceitaRepository;
import com.monify_api.model.repository.ReceitaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class CategoriaReceitaService {

    private CategoriaReceitaRepository repository;
    private ReceitaRepository receitaRepository;

    public CategoriaReceitaService(CategoriaReceitaRepository repository, ReceitaRepository receitaRepository) {
        this.repository = repository;
        this.receitaRepository = receitaRepository;
    }

    public List<CategoriaReceita> getCategoriasReceita() {
        return repository.findAll();
    }

    public Optional<CategoriaReceita> getCategoriaReceitaById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public CategoriaReceita salvar(CategoriaReceita categoria) {
        validar(categoria);
        return repository.save(categoria);
    }

    @Transactional
    public void excluir(CategoriaReceita categoria) {
        Objects.requireNonNull(categoria.getId());
        if (receitaRepository.existsByCategoriaReceita(categoria)) {
            throw new RegraNegocioException("Categoria possui receitas vinculadas");
        }
        repository.delete(categoria);
    }

    public void validar(CategoriaReceita categoria) {
        if (categoria.getNome() == null || categoria.getNome().trim().equals("")) {
            throw new RegraNegocioException("Nome inválido");
        }
    }
}
