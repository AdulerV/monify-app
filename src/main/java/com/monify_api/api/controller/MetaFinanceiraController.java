package com.monify_api.api.controller;

import com.monify_api.api.dto.AporteDTO;
import com.monify_api.api.dto.MetaFinanceiraDTO;
import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.Aporte;
import com.monify_api.model.entity.MetaFinanceira;
import com.monify_api.service.MetaFinanceiraService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/metasfinanceiras")
@RequiredArgsConstructor
@CrossOrigin
public class MetaFinanceiraController {

    private final MetaFinanceiraService service;

    @GetMapping()
    public ResponseEntity get() {
        List<MetaFinanceira> metas = service.getMetasFinanceiras();
        return ResponseEntity.ok(metas.stream().map(MetaFinanceiraDTO::create).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity get(@PathVariable("id") Long id) {
        Optional<MetaFinanceira> meta = service.getMetaFinanceiraById(id);
        if (!meta.isPresent()) {
            return new ResponseEntity("Meta financeira não encontrada", HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(meta.map(MetaFinanceiraDTO::create));
    }

    @GetMapping("/{id}/aportes")
    public ResponseEntity getAportes(@PathVariable("id") Long id) {
        Optional<MetaFinanceira> meta = service.getMetaFinanceiraById(id);
        if (!meta.isPresent()) {
            return new ResponseEntity("Meta financeira não encontrada", HttpStatus.NOT_FOUND);
        }
        List<Aporte> aportes = service.getAportes(meta.get());
        return ResponseEntity.ok(aportes.stream().map(AporteDTO::create).collect(Collectors.toList()));
    }

    @PostMapping()
    public ResponseEntity post(@RequestBody MetaFinanceiraDTO dto) {
        try {
            MetaFinanceira meta = converter(dto);
            meta = service.salvar(meta);
            return new ResponseEntity(MetaFinanceiraDTO.create(meta), HttpStatus.CREATED);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity atualizar(@PathVariable("id") Long id, @RequestBody MetaFinanceiraDTO dto) {
        if (!service.getMetaFinanceiraById(id).isPresent()) {
            return new ResponseEntity("Meta financeira não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            MetaFinanceira meta = converter(dto);
            meta.setId(id);
            meta = service.salvar(meta);
            return ResponseEntity.ok(MetaFinanceiraDTO.create(meta));
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity excluir(@PathVariable("id") Long id) {
        Optional<MetaFinanceira> meta = service.getMetaFinanceiraById(id);
        if (!meta.isPresent()) {
            return new ResponseEntity("Meta financeira não encontrada", HttpStatus.NOT_FOUND);
        }
        try {
            service.excluir(meta.get());
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public MetaFinanceira converter(MetaFinanceiraDTO dto) {
        ModelMapper modelMapper = new ModelMapper();
        return modelMapper.map(dto, MetaFinanceira.class);
    }
}
