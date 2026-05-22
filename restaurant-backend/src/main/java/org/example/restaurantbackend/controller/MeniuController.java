package org.example.restaurantbackend.controller;

import org.example.restaurantbackend.entity.Aperitiv;
import org.example.restaurantbackend.entity.Produs;
import org.example.restaurantbackend.service.ProdusService;
import org.springframework.http.ResponseEntity;
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

    @PutMapping("/{id}/disponibilitate")
    public ResponseEntity<?> actualizeazaDisponibilitate(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        if (body == null || !body.containsKey("disponibil") || body.get("disponibil") == null) {
            return ResponseEntity.badRequest().body("Eroare: Câmpul 'disponibil' lipsește sau este nul!");
        }
        Object dispObj = body.get("disponibil");
        if (!(dispObj instanceof Boolean)) {
            return ResponseEntity.badRequest().body("Eroare: Câmpul 'disponibil' trebuie să fie boolean!");
        }
        Boolean disponibil = (Boolean) dispObj;
        Produs produs = produsService.getProductById(id);
        if (produs == null) {
            return ResponseEntity.notFound().build();
        }
        produs.setDisponibil(disponibil);
        Produs salvat = produsService.salveazaProdus(produs);
        return ResponseEntity.ok(salvat);
    }
}