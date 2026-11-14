package com.monify_api.api.controller;

import com.monify_api.api.dto.CategoriaDespesaDTO;
import com.monify_api.api.dto.DespesaDTO;
import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.CategoriaDespesa;
import com.monify_api.model.entity.Despesa;
import com.monify_api.service.CategoriaDespesaService;
import com.monify_api.service.DespesaService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/categoriasdespesa")
@RequiredArgsConstructor
@CrossOrigin
public class CategoriaDespesaController {

    private final CategoriaDespesaService service;
    private final DespesaService despesaService;

    @GetMapping()
    public ResponseEntity get() {
        List<CategoriaDespesa> categorias = service.getCategoriasDespesa();
        return ResponseEntity.ok(categorias.stream().map(CategoriaDespesaDTO::create).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity get(@PathVariable("id") Long id) {
        Optional<CategoriaDespesa> categoria = service.getCategoriaDespesaById(id);
        if (!categoria.isPresent()) {
            return new ResponseEntity("Categoria de despesa não encontrada", HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(categoria.map(CategoriaDespesaDTO::create));
    }

    @GetMapping("/{id}/despesas")
    public ResponseEntity getDespesas(@PathVariable("id") Long id) {
        Optional<CategoriaDespesa> categoria = service.getCategoriaDespesaById(id);
        if (!categoria.isPresent()) {
            return new ResponseEntity("Categoria de despesa não encontrada", HttpStatus.NOT_FOUND);
        }
        List<Despesa> despesas = despesaService.getDespesasByCategoria(categoria.get());
        return ResponseEntity.ok(despesas.stream().map(DespesaDTO::create).collect(Collectors.toList()));
    }

    @PostMapping()
    public ResponseEntity post(@RequestBody CategoriaDespesaDTO dto) {
        try {
            CategoriaDespesa categoria = converter(dto);
            categoria = service.salvar(categoria);
            return new ResponseEntity(CategoriaDespesaDTO.create(categoria), HttpStatus.CREATED);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity atualizar(@PathVariable("id") Long id, @RequestBody CategoriaDespesaDTO dto) {
        if (!service.getCategoriaDespesaById(id).isPresent()) {
            return new ResponseEntity("Categoria de despesa não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            CategoriaDespesa categoria = converter(dto);
            categoria.setId(id);
            categoria = service.salvar(categoria);
            return ResponseEntity.ok(CategoriaDespesaDTO.create(categoria));
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity excluir(@PathVariable("id") Long id) {
        Optional<CategoriaDespesa> categoria = service.getCategoriaDespesaById(id);
        if (!categoria.isPresent()) {
            return new ResponseEntity("Categoria de despesa não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            service.excluir(categoria.get());
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public CategoriaDespesa converter(CategoriaDespesaDTO dto) {
        ModelMapper modelMapper = new ModelMapper();
        return modelMapper.map(dto, CategoriaDespesa.class);
    }
}
