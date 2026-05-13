package org.example.restaurantbackend.service;

import org.example.restaurantbackend.entity.Produs;
import org.example.restaurantbackend.repository.ProdusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdusService {

    private final ProdusRepository produsRepository;

    public ProdusService(ProdusRepository produsRepository) {
        this.produsRepository = produsRepository;
    }

    public List<Produs> getAllProducts() {
        return produsRepository.findAll();
    }

    public Produs getProductById(Integer id) {
        return produsRepository.findById(id).orElse(null);
    }

    public Produs adaugaProdus(Produs produs) {
        return produsRepository.save(produs);
    }
}