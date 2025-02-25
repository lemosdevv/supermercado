package com.mateus.dev.supermercado.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.mateus.dev.supermercado.entities.Relatorio;
import com.mateus.dev.supermercado.services.RelatorioService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    @Autowired
    private RelatorioService relatorioService;

    @PostMapping
    public Relatorio salvarRelatorio(@RequestBody Relatorio relatorio) {
        return relatorioService.salvarRelatorio(relatorio);
    }

    @GetMapping
    public List<Relatorio> buscarRelatoriosPorData(@RequestParam("data") LocalDate data) {
        return relatorioService.buscarRelatoriosPorData(data);
    }
}
