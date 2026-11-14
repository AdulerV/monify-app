package com.monify_api.service;

import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.Parcela;
import com.monify_api.model.repository.ParcelaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ParcelaService {

    private ParcelaRepository repository;

    public ParcelaService(ParcelaRepository repository) {
        this.repository = repository;
    }

    public List<Parcela> getParcelas() {
        return repository.findAll();
    }

    public Optional<Parcela> getParcelaById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Parcela salvar(Parcela parcela) {
        validar(parcela);
        if (parcela.getPago() == null) {
            parcela.setPago(false);
        }
        return repository.save(parcela);
    }

    @Transactional
    public void excluir(Parcela parcela) {
        Objects.requireNonNull(parcela.getId());
        repository.delete(parcela);
    }

    public void validar(Parcela parcela) {
        if (parcela.getDespesa() == null || parcela.getDespesa().getId() == null || parcela.getDespesa().getId() == 0) {
            throw new RegraNegocioException("Despesa inválida");
        }
        if (parcela.getValorParcela() == null || parcela.getValorParcela() <= 0) {
            throw new RegraNegocioException("Valor da parcela inválido");
        }
    }
}
