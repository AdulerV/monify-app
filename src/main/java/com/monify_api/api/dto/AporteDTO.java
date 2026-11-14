package com.monify_api.api.dto;

import com.monify_api.model.entity.Aporte;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AporteDTO {

    private Long id;
    private Float valor;
    private LocalDate dataEnvio;
    private Long idMetaFinanceira;
    private String nomeMetaFinanceira;

    public static AporteDTO create(Aporte aporte) {
        ModelMapper modelMapper = new ModelMapper();
        AporteDTO dto = modelMapper.map(aporte, AporteDTO.class);
        if (aporte.getMetaFinanceira() != null) {
            dto.idMetaFinanceira = aporte.getMetaFinanceira().getId();
            dto.nomeMetaFinanceira = aporte.getMetaFinanceira().getNome();
        }
        return dto;
    }
}
