package com.mateus.dev.supermercado.services;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mateus.dev.supermercado.entities.CaixaRegister;
import com.mateus.dev.supermercado.repositories.CaixaRepository;

import java.time.LocalDateTime;

@Service
public class CaixaService {

    @Autowired
    private CaixaRepository repository;

    public CaixaRegister openCashRegister() {
        CaixaRegister caixaRegister = new CaixaRegister();
        caixaRegister.setStatus(CaixaRegister.Status.OPEN);
        caixaRegister.setOpenedAt(LocalDateTime.now());
        return repository.save(caixaRegister);
    }

    public CaixaRegister closeCaixaRegister() {
        CaixaRegister caixaRegister = repository.findTopByOrderByOpenedAtDesc();
        if (caixaRegister != null && caixaRegister.getStatus() == CaixaRegister.Status.OPEN) {
            caixaRegister.setStatus(CaixaRegister.Status.CLOSED);
            caixaRegister.setClosedAt(LocalDateTime.now());
            return repository.save(caixaRegister);
        }
        return null;
    }

    public CaixaRegister getCaixaRegisterStatus() {
        return repository.findTopByOrderByOpenedAtDesc();
    }
}