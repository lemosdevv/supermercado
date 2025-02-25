package com.mateus.dev.supermercado.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.mateus.dev.supermercado.entities.Relatorio;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RelatorioRepository extends JpaRepository<Relatorio, Long> {
    List<Relatorio> findByData(LocalDate data);
}