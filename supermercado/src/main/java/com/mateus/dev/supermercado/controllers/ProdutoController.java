package com.mateus.dev.supermercado.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mateus.dev.supermercado.entities.Produto;
import com.mateus.dev.supermercado.repositories.ProdutoRepository;

@RestController
@RequestMapping(value = "/produto")
public class ProdutoController {
    
    @Autowired
    private ProdutoRepository repository;
    
    @GetMapping
    public List<Produto> findAll(){
        List<Produto> result = repository.findAll();
        return result;    
    }

    @GetMapping(value = "/{id}")
    public Produto findById(@PathVariable Long id){
        Produto result = repository.findById(id).get();
        return result;
    }
    
    @PostMapping
    public ResponseEntity<String> insert(@RequestBody Produto produto) {
        if (repository.findByEan(produto.getEan()).isPresent() || repository.findByName(produto.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Esse Ean ou nome ja foi cadastrado");
        }
        repository.save(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body("produto cadastrado com sucesso");

    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> editarProduto(@PathVariable Long id, @RequestBody Produto produtoAtualizado) {
        Optional<Produto> produtoOptional = repository.findById(id);
        
        if (!produtoOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Produto produto = produtoOptional.get();
        produto.setName(produtoAtualizado.getName());
        produto.setValor(produtoAtualizado.getValor());
        produto.setCategoria(produtoAtualizado.getCategoria());
        produto.setEan(produtoAtualizado.getEan());
        
        Produto produtoGuardado = repository.save(produto);
        return ResponseEntity.ok(produtoGuardado);
    }
    
    @DeleteMapping(value = "/{id}")
    public void delete(@PathVariable Long id){
        repository.deleteById(id);
    }
}
