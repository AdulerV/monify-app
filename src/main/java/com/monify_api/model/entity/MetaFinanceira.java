package com.monify_api.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetaFinanceira {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private Float valor;
    private LocalDate dataEnvio;
    private LocalDate dataAlvo;
    private Float investimentoInicial;
    private Boolean status;

    // Composicao (MetaFinanceira 1 <>-- 0..* Aporte): ciclo de vida controlado pelo MetaFinanceiraService
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "metaFinanceira")
    private List<Aporte> aportes;
}
