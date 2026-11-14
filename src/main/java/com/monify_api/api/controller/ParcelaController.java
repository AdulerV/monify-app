package com.monify_api.api.controller;

import com.monify_api.api.dto.ParcelaDTO;
import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.Despesa;
import com.monify_api.model.entity.Parcela;
import com.monify_api.service.DespesaService;
import com.monify_api.service.ParcelaService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/parcelas")
@RequiredArgsConstructor
@CrossOrigin
public class ParcelaController {

    private final ParcelaService service;
    private final DespesaService despesaService;

    @GetMapping()
    public ResponseEntity get() {
        List<Parcela> parcelas = service.getParcelas();
        return ResponseEntity.ok(parcelas.stream().map(ParcelaDTO::create).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity get(@PathVariable("id") Long id) {
        Optional<Parcela> parcela = service.getParcelaById(id);
        if (!parcela.isPresent()) {
            return new ResponseEntity("Parcela não encontrada", HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(parcela.map(ParcelaDTO::create));
    }

    @PostMapping()
    public ResponseEntity post(@RequestBody ParcelaDTO dto) {
        try {
            Parcela parcela = converter(dto);
            parcela = service.salvar(parcela);
            return new ResponseEntity(ParcelaDTO.create(parcela), HttpStatus.CREATED);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity atualizar(@PathVariable("id") Long id, @RequestBody ParcelaDTO dto) {
        if (!service.getParcelaById(id).isPresent()) {
            return new ResponseEntity("Parcela não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            Parcela parcela = converter(dto);
            parcela.setId(id);
            parcela = service.salvar(parcela);
            return ResponseEntity.ok(ParcelaDTO.create(parcela));
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity excluir(@PathVariable("id") Long id) {
        Optional<Parcela> parcela = service.getParcelaById(id);
        if (!parcela.isPresent()) {
            return new ResponseEntity("Parcela não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            service.excluir(parcela.get());
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public Parcela converter(ParcelaDTO dto) {
        ModelMapper modelMapper = new ModelMapper();
        Parcela parcela = modelMapper.map(dto, Parcela.class);
        if (dto.getIdDespesa() != null) {
            Optional<Despesa> despesa = despesaService.getDespesaById(dto.getIdDespesa());
            if (!despesa.isPresent()) {
                parcela.setDespesa(null);
            } else {
                parcela.setDespesa(despesa.get());
            }
        } else {
            parcela.setDespesa(null);
        }
        return parcela;
    }
}
