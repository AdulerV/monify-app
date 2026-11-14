package com.monify_api.model.repository;

import com.monify_api.model.entity.CategoriaReceita;
import com.monify_api.model.entity.Receita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReceitaRepository extends JpaRepository<Receita, Long> {
    List<Receita> findByCategoriaReceita(CategoriaReceita categoriaReceita);

    boolean existsByCategoriaReceita(CategoriaReceita categoriaReceita);
}
