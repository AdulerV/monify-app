package com.monify_api.api.dto;

import com.monify_api.model.entity.Parcela;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParcelaDTO {

    private Long id;
    private Float valorParcela;
    private Boolean pago;
    private Long idDespesa;
    private String nomeDespesa;

    public static ParcelaDTO create(Parcela parcela) {
        ModelMapper modelMapper = new ModelMapper();
        ParcelaDTO dto = modelMapper.map(parcela, ParcelaDTO.class);
        if (parcela.getDespesa() != null) {
            dto.idDespesa = parcela.getDespesa().getId();
            dto.nomeDespesa = parcela.getDespesa().getNome();
        }
        return dto;
    }
}
