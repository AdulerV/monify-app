package com.monify_api.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Despesa extends Lancamento {

    private Integer quantidadeParcelas;
    private Boolean parcelada;

    @ManyToOne
    private FormaPagamento formaPagamento;

    @ManyToOne
    private CategoriaDespesa categoriaDespesa;

    // Composicao (Despesa 1 <>-- 0..* Parcela): ciclo de vida controlado pelo DespesaService
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "despesa")
    private List<Parcela> parcelas;
}
