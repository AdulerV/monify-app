package com.monify_api.service;

import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.Aporte;
import com.monify_api.model.entity.MetaFinanceira;
import com.monify_api.model.repository.AporteRepository;
import com.monify_api.model.repository.MetaFinanceiraRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class MetaFinanceiraService {

    private MetaFinanceiraRepository repository;
    private AporteRepository aporteRepository;

    public MetaFinanceiraService(MetaFinanceiraRepository repository, AporteRepository aporteRepository) {
        this.repository = repository;
        this.aporteRepository = aporteRepository;
    }

    public List<MetaFinanceira> getMetasFinanceiras() {
        return repository.findAll();
    }

    public Optional<MetaFinanceira> getMetaFinanceiraById(Long id) {
        return repository.findById(id);
    }

    public List<Aporte> getAportes(MetaFinanceira meta) {
        return aporteRepository.findByMetaFinanceiraOrderByDataEnvioAsc(meta);
    }

    @Transactional
    public MetaFinanceira salvar(MetaFinanceira meta) {
        validar(meta);
        if (meta.getInvestimentoInicial() == null) {
            meta.setInvestimentoInicial(0f);
        }
        meta.setStatus(calcularStatus(meta));
        return repository.save(meta);
    }

    // status = true quando investimento inicial + aportes atingem o valor da meta
    @Transactional
    public void atualizarStatus(MetaFinanceira meta) {
        meta.setStatus(calcularStatus(meta));
        repository.save(meta);
    }

    @Transactional
    public void excluir(MetaFinanceira meta) {
        Objects.requireNonNull(meta.getId());
        // Composicao: os aportes nao existem sem a meta
        aporteRepository.deleteAll(aporteRepository.findByMetaFinanceiraOrderByDataEnvioAsc(meta));
        repository.delete(meta);
    }

    private boolean calcularStatus(MetaFinanceira meta) {
        double aportado = meta.getId() == null ? 0 : aporteRepository.somarValorPorMeta(meta);
        double inicial = meta.getInvestimentoInicial() == null ? 0 : meta.getInvestimentoInicial();
        return inicial + aportado >= meta.getValor();
    }

    public void validar(MetaFinanceira meta) {
        if (meta.getNome() == null || meta.getNome().trim().equals("")) {
            throw new RegraNegocioException("Nome inválido");
        }
        if (meta.getValor() == null || meta.getValor() <= 0) {
            throw new RegraNegocioException("Valor inválido");
        }
        if (meta.getDataEnvio() == null) {
            throw new RegraNegocioException("Data de envio inválida");
        }
        if (meta.getDataAlvo() == null || meta.getDataAlvo().isBefore(meta.getDataEnvio())) {
            throw new RegraNegocioException("Data alvo inválida");
        }
        if (meta.getInvestimentoInicial() != null && meta.getInvestimentoInicial() < 0) {
            throw new RegraNegocioException("Investimento inicial inválido");
        }
    }
}
