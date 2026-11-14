package com.monify_api.api.controller;

import com.monify_api.api.dto.DespesaDTO;
import com.monify_api.api.dto.ParcelaDTO;
import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.CategoriaDespesa;
import com.monify_api.model.entity.Despesa;
import com.monify_api.model.entity.FormaPagamento;
import com.monify_api.model.entity.Parcela;
import com.monify_api.service.CategoriaDespesaService;
import com.monify_api.service.DespesaService;
import com.monify_api.service.FormaPagamentoService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/despesas")
@RequiredArgsConstructor
@CrossOrigin
public class DespesaController {

    private final DespesaService service;
    private final FormaPagamentoService formaPagamentoService;
    private final CategoriaDespesaService categoriaDespesaService;

    @GetMapping()
    public ResponseEntity get() {
        List<Despesa> despesas = service.getDespesas();
        return ResponseEntity.ok(despesas.stream().map(DespesaDTO::create).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity get(@PathVariable("id") Long id) {
        Optional<Despesa> despesa = service.getDespesaById(id);
        if (!despesa.isPresent()) {
            return new ResponseEntity("Despesa não encontrada", HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(despesa.map(DespesaDTO::create));
    }

    @GetMapping("/{id}/parcelas")
    public ResponseEntity getParcelas(@PathVariable("id") Long id) {
        Optional<Despesa> despesa = service.getDespesaById(id);
        if (!despesa.isPresent()) {
            return new ResponseEntity("Despesa não encontrada", HttpStatus.NOT_FOUND);
        }
        List<Parcela> parcelas = service.getParcelas(despesa.get());
        return ResponseEntity.ok(parcelas.stream().map(ParcelaDTO::create).collect(Collectors.toList()));
    }

    @PostMapping()
    public ResponseEntity post(@RequestBody DespesaDTO dto) {
        try {
            Despesa despesa = converter(dto);
            despesa = service.salvar(despesa);
            return new ResponseEntity(DespesaDTO.create(despesa), HttpStatus.CREATED);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity atualizar(@PathVariable("id") Long id, @RequestBody DespesaDTO dto) {
        if (!service.getDespesaById(id).isPresent()) {
            return new ResponseEntity("Despesa não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            Despesa despesa = converter(dto);
            despesa.setId(id);
            despesa = service.salvar(despesa);
            return ResponseEntity.ok(DespesaDTO.create(despesa));
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity excluir(@PathVariable("id") Long id) {
        Optional<Despesa> despesa = service.getDespesaById(id);
        if (!despesa.isPresent()) {
            return new ResponseEntity("Despesa não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            service.excluir(despesa.get());
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public Despesa converter(DespesaDTO dto) {
        ModelMapper modelMapper = new ModelMapper();
        // as parcelas sao geradas pelo DespesaService (composicao), nunca vindas do DTO
        modelMapper.typeMap(DespesaDTO.class, Despesa.class)
                .addMappings(mapper -> mapper.skip(Despesa::setParcelas));
        Despesa despesa = modelMapper.map(dto, Despesa.class);
        if (dto.getIdFormaPagamento() != null) {
            Optional<FormaPagamento> forma = formaPagamentoService.getFormaPagamentoById(dto.getIdFormaPagamento());
            if (!forma.isPresent()) {
                despesa.setFormaPagamento(null);
            } else {
                despesa.setFormaPagamento(forma.get());
            }
        } else {
            despesa.setFormaPagamento(null);
        }
        if (dto.getIdCategoriaDespesa() != null) {
            Optional<CategoriaDespesa> categoria = categoriaDespesaService.getCategoriaDespesaById(dto.getIdCategoriaDespesa());
            if (!categoria.isPresent()) {
                despesa.setCategoriaDespesa(null);
            } else {
                despesa.setCategoriaDespesa(categoria.get());
            }
        } else {
            despesa.setCategoriaDespesa(null);
        }
        return despesa;
    }
}
