package com.mateus.dev.supermercado.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;


import com.mateus.dev.supermercado.entities.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    
    Optional<Produto> findByEan(String ean);
    Optional<Produto> findByName(String name);

	

}
