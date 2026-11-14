package com.monify_api.api.controller;

import com.monify_api.api.dto.AporteDTO;
import com.monify_api.exception.RegraNegocioException;
import com.monify_api.model.entity.Aporte;
import com.monify_api.model.entity.MetaFinanceira;
import com.monify_api.service.AporteService;
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
@RequestMapping("/api/v1/aportes")
@RequiredArgsConstructor
@CrossOrigin
public class AporteController {

    private final AporteService service;
    private final MetaFinanceiraService metaFinanceiraService;

    @GetMapping()
    public ResponseEntity get() {
        List<Aporte> aportes = service.getAportes();
        return ResponseEntity.ok(aportes.stream().map(AporteDTO::create).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity get(@PathVariable("id") Long id) {
        Optional<Aporte> aporte = service.getAporteById(id);
        if (!aporte.isPresent()) {
            return new ResponseEntity("Aporte não encontrado", HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(aporte.map(AporteDTO::create));
    }

    @PostMapping()
    public ResponseEntity post(@RequestBody AporteDTO dto) {
        try {
            Aporte aporte = converter(dto);
            aporte = service.salvar(aporte);
            return new ResponseEntity(AporteDTO.create(aporte), HttpStatus.CREATED);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity atualizar(@PathVariable("id") Long id, @RequestBody AporteDTO dto) {
        if (!service.getAporteById(id).isPresent()) {
            return new ResponseEntity("Aporte não encontrado", HttpStatus.NOT_FOUND);
        }
        try {
            Aporte aporte = converter(dto);
            aporte.setId(id);
            aporte = service.salvar(aporte);
            return ResponseEntity.ok(AporteDTO.create(aporte));
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity excluir(@PathVariable("id") Long id) {
        Optional<Aporte> aporte = service.getAporteById(id);
        if (!aporte.isPresent()) {
            return new ResponseEntity("Aporte não encontrado", HttpStatus.NOT_FOUND);
        }
        try {
            service.excluir(aporte.get());
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        } catch (RegraNegocioException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public Aporte converter(AporteDTO dto) {
        ModelMapper modelMapper = new ModelMapper();
        Aporte aporte = modelMapper.map(dto, Aporte.class);
        if (dto.getIdMetaFinanceira() != null) {
            Optional<MetaFinanceira> meta = metaFinanceiraService.getMetaFinanceiraById(dto.getIdMetaFinanceira());
            if (!meta.isPresent()) {
                aporte.setMetaFinanceira(null);
            } else {
                aporte.setMetaFinanceira(meta.get());
            }
        } else {
            aporte.setMetaFinanceira(null);
        }
        return aporte;
    }
}
