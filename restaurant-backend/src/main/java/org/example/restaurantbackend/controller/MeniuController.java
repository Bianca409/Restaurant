package org.example.restaurantbackend.controller;

import org.example.restaurantbackend.entity.Aperitiv;
import org.example.restaurantbackend.entity.Produs;
import org.example.restaurantbackend.service.ProdusService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meniu")
@CrossOrigin
public class MeniuController {

    private final ProdusService produsService;

    public MeniuController(ProdusService produsService) {
        this.produsService = produsService;
    }

    @GetMapping
    public Map<String, List<Produs>> getMeniu() {
        return produsService.getMeniuGrupat();
    }

    @GetMapping("/{id}")
    public Produs getProdus(@PathVariable Integer id) {
        return produsService.getProductById(id);
    }

    @PostMapping("/aperitiv")
    public Produs adaugaAperitiv(@RequestBody Aperitiv aperitiv) {
        return produsService.salveazaProdus(aperitiv);
    }
}