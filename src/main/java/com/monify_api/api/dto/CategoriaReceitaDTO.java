package com.monify_api.api.dto;

import com.monify_api.model.entity.CategoriaReceita;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaReceitaDTO {

    private Long id;
    private String nome;

    public static CategoriaReceitaDTO create(CategoriaReceita categoria) {
        ModelMapper modelMapper = new ModelMapper();
        return modelMapper.map(categoria, CategoriaReceitaDTO.class);
    }
}
