package com.monify_api.model.repository;

import com.monify_api.model.entity.Aporte;
import com.monify_api.model.entity.MetaFinanceira;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AporteRepository extends JpaRepository<Aporte, Long> {
    List<Aporte> findByMetaFinanceiraOrderByDataEnvioAsc(MetaFinanceira metaFinanceira);

    @Query("select coalesce(sum(a.valor), 0) from Aporte a where a.metaFinanceira = :meta")
    Double somarValorPorMeta(@Param("meta") MetaFinanceira meta);
}
