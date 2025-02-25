package com.mateus.dev.supermercado.entities;


import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Relatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate data;
    private double debito;
    private double credito;
    private double pix;
    private double dinheiro;
    
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public LocalDate getData() {
        return data;
    }
    public void setData(LocalDate data) {
        this.data = data;
    }
    public double getDebito() {
        return debito;
    }
    public void setDebito(double debito) {
        this.debito = debito;
    }
    public double getCredito() {
        return credito;
    }
    public void setCredito(double credito) {
        this.credito = credito;
    }
    public double getPix() {
        return pix;
    }
    public void setPix(double pix) {
        this.pix = pix;
    }
    public double getDinheiro() {
        return dinheiro;
    }
    public void setDinheiro(double dinheiro) {
        this.dinheiro = dinheiro;
    }

    
}
