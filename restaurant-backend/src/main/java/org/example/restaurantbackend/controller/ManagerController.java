package org.example.restaurantbackend.controller;

import org.example.restaurantbackend.entity.*;
import org.example.restaurantbackend.repository.UtilizatorRepository;
import org.example.restaurantbackend.service.ProdusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager")
@CrossOrigin
public class ManagerController {

    @Autowired
    private ProdusService produsService;

    @Autowired
    private UtilizatorRepository utilizatorRepository;

    @PostMapping("/meniu")
    public ResponseEntity<Produs> adaugaProdus(@RequestBody Map<String, Object> date) {
        String categorie = (String) date.get("categorie");
        Produs produs;

        switch (categorie.toUpperCase()) {
            case "APERITIV":
                produs = new Aperitiv();
                break;
            case "PRINCIPAL":
                produs = new FelPrincipal();
                break;
            case "BAUTURA":
                produs = new Bautura();
                ((Bautura) produs).setEsteSpirtoasa((Boolean) date.get("spirtoasa"));
                break;
            default:
                return ResponseEntity.badRequest().build();
        }

        produs.setNume((String) date.get("nume"));
        produs.setPret(Double.parseDouble(date.get("pret").toString()));
        produs.setDisponibil(true);

        Detalii detalii = new Detalii();

        String ingredienteRaw = (String) date.get("ingrediente");
        if (ingredienteRaw != null && !ingredienteRaw.isEmpty()) {
            List<String> lista = Arrays.asList(ingredienteRaw.split(",\\s*"));
            detalii.setListaIngrediente(lista);
        }

        detalii.setVegetarian((Boolean) date.get("vegetarian"));
        detalii.setPicant((Boolean) date.get("picant"));

        produs.setDetalii(detalii);

        return ResponseEntity.ok(produsService.salveazaProdus(produs));
    }

    @PostMapping("/angajati")
    public ResponseEntity<?> adaugaAngajat(@RequestBody Map<String, String> date) {
        String tip = date.get("tip");
        Utilizator angajat;

        if ("PERSONAL".equalsIgnoreCase(tip)) {
            angajat = new Personal();
        } else if ("CHELNER".equalsIgnoreCase(tip)) {
            angajat = new Chelner();
        } else {
            return ResponseEntity.badRequest().body("Tip invalid! Folosiți PERSONAL sau CHELNER.");
        }

        angajat.setUsername(date.get("username"));
        angajat.setEmail(date.get("email"));

        angajat.setParola(date.get("parola"));

        utilizatorRepository.save(angajat);
        return ResponseEntity.ok("Angajatul a fost creat cu succes!");
    }
}