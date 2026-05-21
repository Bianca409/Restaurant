package org.example.restaurantbackend.controller;

import org.example.restaurantbackend.entity.*;
import org.example.restaurantbackend.repository.UtilizatorRepository;
import org.example.restaurantbackend.service.ProdusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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

    private boolean esteAngajat(Utilizator u) {
        if (u == null) return false;
        String name = u.getClass().getSimpleName();
        if (name.contains("$")) {
            name = name.substring(0, name.indexOf("$"));
        }
        return "Personal".equalsIgnoreCase(name) || "Chelner".equalsIgnoreCase(name);
    }

    @GetMapping("/angajati")
    public ResponseEntity<List<Utilizator>> vizualizareAngajati() {
        List<Utilizator> toti = utilizatorRepository.findAll();
        List<Utilizator> angajati = toti.stream()
                .filter(this::esteAngajat)
                .collect(Collectors.toList());
        return ResponseEntity.ok(angajati);
    }

    @GetMapping("/angajati/{id}")
    public ResponseEntity<?> vizualizareAngajat(@PathVariable Integer id) {
        return utilizatorRepository.findById(id)
                .filter(this::esteAngajat)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/angajati/{id}")
    public ResponseEntity<?> stergeAngajat(@PathVariable Integer id) {
        Optional<Utilizator> uOpt = utilizatorRepository.findById(id);
        if (uOpt.isPresent()) {
            Utilizator u = uOpt.get();
            if (esteAngajat(u)) {
                utilizatorRepository.delete(u);
                return ResponseEntity.ok("Angajatul a fost șters cu succes!");
            } else {
                return ResponseEntity.badRequest().body("Utilizatorul nu este un angajat!");
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/meniu/{id}")
    public ResponseEntity<?> modificaProdus(@PathVariable Integer id, @RequestBody Map<String, Object> date) {
        Produs produs = produsService.getProductById(id);
        if (produs == null) {
            return ResponseEntity.notFound().build();
        }

        if (date.containsKey("nume")) {
            produs.setNume((String) date.get("nume"));
        }
        if (date.containsKey("pret")) {
            produs.setPret(Double.parseDouble(date.get("pret").toString()));
        }
        if (date.containsKey("disponibil")) {
            produs.setDisponibil((Boolean) date.get("disponibil"));
        }

        if (produs instanceof Bautura && date.containsKey("spirtoasa")) {
            ((Bautura) produs).setEsteSpirtoasa((Boolean) date.get("spirtoasa"));
        }

        Detalii detalii = produs.getDetalii();
        if (detalii == null) {
            detalii = new Detalii();
        }

        if (date.containsKey("ingrediente")) {
            String ingredienteRaw = (String) date.get("ingrediente");
            if (ingredienteRaw != null) {
                if (ingredienteRaw.isEmpty()) {
                    detalii.setListaIngrediente(new ArrayList<>());
                } else {
                    List<String> lista = Arrays.asList(ingredienteRaw.split(",\\s*"));
                    detalii.setListaIngrediente(lista);
                }
            }
        }

        if (date.containsKey("vegetarian")) {
            detalii.setVegetarian((Boolean) date.get("vegetarian"));
        }
        if (date.containsKey("picant")) {
            detalii.setPicant((Boolean) date.get("picant"));
        }

        produs.setDetalii(detalii);
        Produs produsSalvat = produsService.salveazaProdus(produs);
        return ResponseEntity.ok(produsSalvat);
    }
}