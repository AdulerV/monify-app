package com.monify_api.api.controller;

import com.monify_api.api.dto.FormaPagamentoDTO;
import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.FormaPagamento;
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
@RequestMapping("/api/v1/formaspagamento")
@RequiredArgsConstructor
@CrossOrigin
public class FormaPagamentoController {

    private final FormaPagamentoService service;

    @GetMapping()
    public ResponseEntity get() {
        List<FormaPagamento> formas = service.getFormasPagamento();
        return ResponseEntity.ok(formas.stream().map(FormaPagamentoDTO::create).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity get(@PathVariable("id") Long id) {
        Optional<FormaPagamento> forma = service.getFormaPagamentoById(id);
        if (!forma.isPresent()) {
            return new ResponseEntity("Forma de pagamento não encontrada", HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(forma.map(FormaPagamentoDTO::create));
    }

    @PostMapping()
    public ResponseEntity post(@RequestBody FormaPagamentoDTO dto) {
        try {
            FormaPagamento forma = converter(dto);
            forma = service.salvar(forma);
            return new ResponseEntity(FormaPagamentoDTO.create(forma), HttpStatus.CREATED);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity atualizar(@PathVariable("id") Long id, @RequestBody FormaPagamentoDTO dto) {
        if (!service.getFormaPagamentoById(id).isPresent()) {
            return new ResponseEntity("Forma de pagamento não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            FormaPagamento forma = converter(dto);
            forma.setId(id);
            forma = service.salvar(forma);
            return ResponseEntity.ok(FormaPagamentoDTO.create(forma));
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity excluir(@PathVariable("id") Long id) {
        Optional<FormaPagamento> forma = service.getFormaPagamentoById(id);
        if (!forma.isPresent()) {
            return new ResponseEntity("Forma de pagamento não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            service.excluir(forma.get());
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public FormaPagamento converter(FormaPagamentoDTO dto) {
        ModelMapper modelMapper = new ModelMapper();
        return modelMapper.map(dto, FormaPagamento.class);
    }
}
