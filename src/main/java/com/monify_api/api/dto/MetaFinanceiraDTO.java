package com.monify_api.api.dto;

import com.monify_api.model.entity.MetaFinanceira;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetaFinanceiraDTO {

    private Long id;
    private String nome;
    private Float valor;
    private LocalDate dataEnvio;
    private LocalDate dataAlvo;
    private Float investimentoInicial;
    private Boolean status;

    public static MetaFinanceiraDTO create(MetaFinanceira meta) {
        ModelMapper modelMapper = new ModelMapper();
        return modelMapper.map(meta, MetaFinanceiraDTO.class);
    }
}
