package com.monify_api.api.dto;

import com.monify_api.model.entity.CategoriaDespesa;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaDespesaDTO {

    private Long id;
    private String nome;
    private Boolean limiteGasto;
    private Float valorLimite;

    public static CategoriaDespesaDTO create(CategoriaDespesa categoria) {
        ModelMapper modelMapper = new ModelMapper();
        return modelMapper.map(categoria, CategoriaDespesaDTO.class);
    }
}
