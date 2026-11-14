package com.monify_api.api.dto;

import com.monify_api.model.entity.Despesa;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DespesaDTO {

    private Long id;
    private String nome;
    private LocalDate data;
    private Boolean volume;
    private Float valor;
    private Integer quantidadeParcelas;
    private Boolean parcelada;
    private Long idFormaPagamento;
    private String nomeFormaPagamento;
    private Long idCategoriaDespesa;
    private String nomeCategoriaDespesa;

    public static DespesaDTO create(Despesa despesa) {
        ModelMapper modelMapper = new ModelMapper();
        DespesaDTO dto = modelMapper.map(despesa, DespesaDTO.class);
        if (despesa.getFormaPagamento() != null) {
            dto.idFormaPagamento = despesa.getFormaPagamento().getId();
            dto.nomeFormaPagamento = despesa.getFormaPagamento().getNome();
        }
        if (despesa.getCategoriaDespesa() != null) {
            dto.idCategoriaDespesa = despesa.getCategoriaDespesa().getId();
            dto.nomeCategoriaDespesa = despesa.getCategoriaDespesa().getNome();
        }
        return dto;
    }
}
