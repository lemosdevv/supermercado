package com.mateus.dev.supermercado.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mateus.dev.supermercado.entities.CaixaRegister;

public interface CaixaRepository extends JpaRepository<CaixaRegister, Long> {
    CaixaRegister findTopByOrderByOpenedAtDesc();

}
