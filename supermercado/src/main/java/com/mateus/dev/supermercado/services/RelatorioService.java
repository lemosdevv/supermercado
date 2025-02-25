package com.mateus.dev.supermercado.services;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.mateus.dev.supermercado.entities.Relatorio;
import com.mateus.dev.supermercado.repositories.RelatorioRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class RelatorioService {

    @Autowired
    private RelatorioRepository relatorioRepository;

    public Relatorio salvarRelatorio(Relatorio relatorio) {
        return relatorioRepository.save(relatorio);
    }

    public List<Relatorio> buscarRelatoriosPorData(LocalDate data) {
        return relatorioRepository.findByData(data);
    }
}
