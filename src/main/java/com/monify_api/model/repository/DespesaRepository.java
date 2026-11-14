package com.monify_api.model.repository;

import com.monify_api.model.entity.CategoriaDespesa;
import com.monify_api.model.entity.Despesa;
import com.monify_api.model.entity.FormaPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DespesaRepository extends JpaRepository<Despesa, Long> {
    List<Despesa> findByCategoriaDespesa(CategoriaDespesa categoriaDespesa);

    boolean existsByCategoriaDespesa(CategoriaDespesa categoriaDespesa);

    boolean existsByFormaPagamento(FormaPagamento formaPagamento);

    @Query("select coalesce(sum(d.valor), 0) from Despesa d " +
            "where d.categoriaDespesa = :categoria and d.data between :inicio and :fim and d.id <> :idIgnorado")
    Double somarValorPorCategoriaNoPeriodo(@Param("categoria") CategoriaDespesa categoria,
                                           @Param("inicio") LocalDate inicio,
                                           @Param("fim") LocalDate fim,
                                           @Param("idIgnorado") Long idIgnorado);
}
