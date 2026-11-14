package com.monify_api.service;

import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.FormaPagamento;
import com.monify_api.model.repository.DespesaRepository;
import com.monify_api.model.repository.FormaPagamentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class FormaPagamentoService {

    private FormaPagamentoRepository repository;
    private DespesaRepository despesaRepository;

    public FormaPagamentoService(FormaPagamentoRepository repository, DespesaRepository despesaRepository) {
        this.repository = repository;
        this.despesaRepository = despesaRepository;
    }

    public List<FormaPagamento> getFormasPagamento() {
        return repository.findAll();
    }

    public Optional<FormaPagamento> getFormaPagamentoById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public FormaPagamento salvar(FormaPagamento formaPagamento) {
        validar(formaPagamento);
        return repository.save(formaPagamento);
    }

    @Transactional
    public void excluir(FormaPagamento formaPagamento) {
        Objects.requireNonNull(formaPagamento.getId());
        if (despesaRepository.existsByFormaPagamento(formaPagamento)) {
            throw new RegraNegocioException("Forma de pagamento possui despesas vinculadas");
        }
        repository.delete(formaPagamento);
    }

    public void validar(FormaPagamento formaPagamento) {
        if (formaPagamento.getNome() == null || formaPagamento.getNome().trim().equals("")) {
            throw new RegraNegocioException("Nome inválido");
        }
    }
}
