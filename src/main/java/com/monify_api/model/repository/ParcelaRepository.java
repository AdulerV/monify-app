package com.monify_api.model.repository;

import com.monify_api.model.entity.Despesa;
import com.monify_api.model.entity.Parcela;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParcelaRepository extends JpaRepository<Parcela, Long> {
    List<Parcela> findByDespesaOrderByIdAsc(Despesa despesa);
}
