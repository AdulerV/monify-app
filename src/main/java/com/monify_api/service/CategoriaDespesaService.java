package com.monify_api.service;

import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.CategoriaDespesa;
import com.monify_api.model.repository.CategoriaDespesaRepository;
import com.monify_api.model.repository.DespesaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class CategoriaDespesaService {

    private CategoriaDespesaRepository repository;
    private DespesaRepository despesaRepository;

    public CategoriaDespesaService(CategoriaDespesaRepository repository, DespesaRepository despesaRepository) {
        this.repository = repository;
        this.despesaRepository = despesaRepository;
    }

    public List<CategoriaDespesa> getCategoriasDespesa() {
        return repository.findAll();
    }

    public Optional<CategoriaDespesa> getCategoriaDespesaById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public CategoriaDespesa salvar(CategoriaDespesa categoria) {
        validar(categoria);
        if (!Boolean.TRUE.equals(categoria.getLimiteGasto())) {
            categoria.setLimiteGasto(false);
        }
        return repository.save(categoria);
    }

    @Transactional
    public void excluir(CategoriaDespesa categoria) {
        Objects.requireNonNull(categoria.getId());
        if (despesaRepository.existsByCategoriaDespesa(categoria)) {
            throw new RegraNegocioException("Categoria possui despesas vinculadas");
        }
        repository.delete(categoria);
    }

    public void validar(CategoriaDespesa categoria) {
        if (categoria.getNome() == null || categoria.getNome().trim().equals("")) {
            throw new RegraNegocioException("Nome inválido");
        }
        if (Boolean.TRUE.equals(categoria.getLimiteGasto())
                && (categoria.getValorLimite() == null || categoria.getValorLimite() <= 0)) {
            throw new RegraNegocioException("Valor limite inválido");
        }
    }
}
