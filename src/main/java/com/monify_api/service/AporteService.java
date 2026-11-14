package com.monify_api.service;

import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.Aporte;
import com.monify_api.model.entity.MetaFinanceira;
import com.monify_api.model.repository.AporteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class AporteService {

    private AporteRepository repository;
    private MetaFinanceiraService metaFinanceiraService;

    public AporteService(AporteRepository repository, MetaFinanceiraService metaFinanceiraService) {
        this.repository = repository;
        this.metaFinanceiraService = metaFinanceiraService;
    }

    public List<Aporte> getAportes() {
        return repository.findAll();
    }

    public Optional<Aporte> getAporteById(Long id) {
        return repository.findById(id);
    }

    @Transactional
    public Aporte salvar(Aporte aporte) {
        validar(aporte);
        // Se o aporte mudou de meta, a meta anterior tambem precisa ter o status recalculado
        MetaFinanceira metaAnterior = aporte.getId() == null ? null
                : repository.findById(aporte.getId()).map(Aporte::getMetaFinanceira).orElse(null);
        Long idMetaAnterior = metaAnterior == null ? null : metaAnterior.getId();

        Aporte salvo = repository.save(aporte);
        metaFinanceiraService.atualizarStatus(salvo.getMetaFinanceira());
        if (idMetaAnterior != null && !idMetaAnterior.equals(salvo.getMetaFinanceira().getId())) {
            metaFinanceiraService.getMetaFinanceiraById(idMetaAnterior)
                    .ifPresent(metaFinanceiraService::atualizarStatus);
        }
        return salvo;
    }

    @Transactional
    public void excluir(Aporte aporte) {
        Objects.requireNonNull(aporte.getId());
        MetaFinanceira meta = aporte.getMetaFinanceira();
        repository.delete(aporte);
        repository.flush();
        metaFinanceiraService.atualizarStatus(meta);
    }

    public void validar(Aporte aporte) {
        if (aporte.getMetaFinanceira() == null || aporte.getMetaFinanceira().getId() == null
                || aporte.getMetaFinanceira().getId() == 0) {
            throw new RegraNegocioException("Meta financeira inválida");
        }
        if (aporte.getValor() == null || aporte.getValor() <= 0) {
            throw new RegraNegocioException("Valor inválido");
        }
        if (aporte.getDataEnvio() == null) {
            throw new RegraNegocioException("Data de envio inválida");
        }
    }
}
