package com.mateus.dev.supermercado.controllers;

import com.mateus.dev.supermercado.entities.CaixaRegister;
import com.mateus.dev.supermercado.services.CaixaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/caixa-register")
public class CaixaController {

    @Autowired
    private CaixaService caixaService;

    @PostMapping("/open")
    public ResponseEntity<String> openCashRegister() {
        CaixaRegister caixaRegister = caixaService.openCashRegister();
        if (caixaRegister != null) {
            return ResponseEntity.ok("Caixa aberto com sucesso");
        }
        return ResponseEntity.status(400).body("Erro ao abrir o caixa");
    }

    @PostMapping("/close")
    public ResponseEntity<String> closeCaixaRegister() {
        CaixaRegister caixaRegister = caixaService.closeCaixaRegister();
        if (caixaRegister != null) {
            return ResponseEntity.ok("Caixa fechado com sucesso");
        }
        return ResponseEntity.status(400).body("Erro ao fechar o caixa");
    }

    @GetMapping("/status")
    public ResponseEntity<CaixaRegister.Status> getCaixaRegisterStatus() {
        CaixaRegister caixaRegister = caixaService.getCaixaRegisterStatus();
        if (caixaRegister != null) {
            return ResponseEntity.ok(caixaRegister.getStatus());
        }
        return ResponseEntity.ok(CaixaRegister.Status.CLOSED);
    }
}