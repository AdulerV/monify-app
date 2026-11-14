package com.monify_api.api.dto;

import com.monify_api.model.entity.Receita;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceitaDTO {

    private Long id;
    private String nome;
    private LocalDate data;
    private Boolean volume;
    private Float valor;
    private Long idCategoriaReceita;
    private String nomeCategoriaReceita;

    public static ReceitaDTO create(Receita receita) {
        ModelMapper modelMapper = new ModelMapper();
        ReceitaDTO dto = modelMapper.map(receita, ReceitaDTO.class);
        if (receita.getCategoriaReceita() != null) {
            dto.idCategoriaReceita = receita.getCategoriaReceita().getId();
            dto.nomeCategoriaReceita = receita.getCategoriaReceita().getNome();
        }
        return dto;
    }
}
