package com.monify_api.api.controller;

import com.monify_api.api.dto.CategoriaReceitaDTO;
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
@RequestMapping("/api/v1/categoriasreceita")
@RequiredArgsConstructor
@CrossOrigin
public class CategoriaReceitaController {

    private final CategoriaReceitaService service;
    private final ReceitaService receitaService;

    @GetMapping()
    public ResponseEntity get() {
        List<CategoriaReceita> categorias = service.getCategoriasReceita();
        return ResponseEntity.ok(categorias.stream().map(CategoriaReceitaDTO::create).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity get(@PathVariable("id") Long id) {
        Optional<CategoriaReceita> categoria = service.getCategoriaReceitaById(id);
        if (!categoria.isPresent()) {
            return new ResponseEntity("Categoria de receita não encontrada", HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(categoria.map(CategoriaReceitaDTO::create));
    }

    @GetMapping("/{id}/receitas")
    public ResponseEntity getReceitas(@PathVariable("id") Long id) {
        Optional<CategoriaReceita> categoria = service.getCategoriaReceitaById(id);
        if (!categoria.isPresent()) {
            return new ResponseEntity("Categoria de receita não encontrada", HttpStatus.NOT_FOUND);
        }
        List<Receita> receitas = receitaService.getReceitasByCategoria(categoria.get());
        return ResponseEntity.ok(receitas.stream().map(ReceitaDTO::create).collect(Collectors.toList()));
    }

    @PostMapping()
    public ResponseEntity post(@RequestBody CategoriaReceitaDTO dto) {
        try {
            CategoriaReceita categoria = converter(dto);
            categoria = service.salvar(categoria);
            return new ResponseEntity(CategoriaReceitaDTO.create(categoria), HttpStatus.CREATED);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity atualizar(@PathVariable("id") Long id, @RequestBody CategoriaReceitaDTO dto) {
        if (!service.getCategoriaReceitaById(id).isPresent()) {
            return new ResponseEntity("Categoria de receita não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            CategoriaReceita categoria = converter(dto);
            categoria.setId(id);
            categoria = service.salvar(categoria);
            return ResponseEntity.ok(CategoriaReceitaDTO.create(categoria));
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity excluir(@PathVariable("id") Long id) {
        Optional<CategoriaReceita> categoria = service.getCategoriaReceitaById(id);
        if (!categoria.isPresent()) {
            return new ResponseEntity("Categoria de receita não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            service.excluir(categoria.get());
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public CategoriaReceita converter(CategoriaReceitaDTO dto) {
        ModelMapper modelMapper = new ModelMapper();
        return modelMapper.map(dto, CategoriaReceita.class);
    }
}
