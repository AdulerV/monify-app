package com.monify_api.api.controller;

import com.monify_api.api.dto.ReceitaDTO;
import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.CategoriaReceita;
import com.monify_api.model.entity.Receita;
import com.monify_api.service.CategoriaReceitaService;
import com.monify_api.service.ReceitaService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/receitas")
@RequiredArgsConstructor
@CrossOrigin
public class ReceitaController {

    private final ReceitaService service;
    private final CategoriaReceitaService categoriaReceitaService;

    @GetMapping()
    public ResponseEntity get() {
        List<Receita> receitas = service.getReceitas();
        return ResponseEntity.ok(receitas.stream().map(ReceitaDTO::create).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity get(@PathVariable("id") Long id) {
        Optional<Receita> receita = service.getReceitaById(id);
        if (!receita.isPresent()) {
            return new ResponseEntity("Receita não encontrada", HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(receita.map(ReceitaDTO::create));
    }

    @PostMapping()
    public ResponseEntity post(@RequestBody ReceitaDTO dto) {
        try {
            Receita receita = converter(dto);
            receita = service.salvar(receita);
            return new ResponseEntity(ReceitaDTO.create(receita), HttpStatus.CREATED);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity atualizar(@PathVariable("id") Long id, @RequestBody ReceitaDTO dto) {
        if (!service.getReceitaById(id).isPresent()) {
            return new ResponseEntity("Receita não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            Receita receita = converter(dto);
            receita.setId(id);
            receita = service.salvar(receita);
            return ResponseEntity.ok(ReceitaDTO.create(receita));
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity excluir(@PathVariable("id") Long id) {
        Optional<Receita> receita = service.getReceitaById(id);
        if (!receita.isPresent()) {
            return new ResponseEntity("Receita não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            service.excluir(receita.get());
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public Receita converter(ReceitaDTO dto) {
        ModelMapper modelMapper = new ModelMapper();
        Receita receita = modelMapper.map(dto, Receita.class);
        if (dto.getIdCategoriaReceita() != null) {
            Optional<CategoriaReceita> categoria = categoriaReceitaService.getCategoriaReceitaById(dto.getIdCategoriaReceita());
            if (!categoria.isPresent()) {
                receita.setCategoriaReceita(null);
            } else {
                receita.setCategoriaReceita(categoria.get());
            }
        } else {
            receita.setCategoriaReceita(null);
        }
        return receita;
    }
}
