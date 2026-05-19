package org.example.restaurantbackend.controller;

import org.example.restaurantbackend.entity.Cos;
import org.example.restaurantbackend.entity.ItemCos;
import org.example.restaurantbackend.entity.Produs;
import org.example.restaurantbackend.repository.CosRepository;
import org.example.restaurantbackend.repository.ProdusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cos")
@CrossOrigin
public class CosController {

    @Autowired
    private CosRepository cosRepository;

    @Autowired
    private ProdusRepository produsRepository;

    @GetMapping("/{id}")
    public ResponseEntity<Cos> vizualizareCos(@PathVariable Integer id) {
        return cosRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/adauga")
    public ResponseEntity<?> adaugaInCos(@RequestBody Map<String, Object> body) {
        Integer cosId = body.get("cosId") != null ? Integer.parseInt(body.get("cosId").toString()) : null;
        Integer produsId = Integer.parseInt(body.get("produsId").toString());
        int cantitate = Integer.parseInt(body.get("cantitate").toString());

        Optional<Produs> produsOpt = produsRepository.findById(produsId);
        if (!produsOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Eroare: Produsul nu există!");
        }
        Produs produs = produsOpt.get();

        Cos cos;
        if (cosId == null || cosId == 0) {
            cos = new Cos();
            cos.setProduse(new ArrayList<>());
        } else {
            cos = cosRepository.findById(cosId).orElseGet(() -> {
                Cos c = new Cos();
                c.setProduse(new ArrayList<>());
                return c;
            });
        }

        boolean produsGasit = false;
        for (ItemCos item : cos.getProduse()) {
            if (item.getProdus().getId().equals(produsId)) {
                item.setCantitate(item.getCantitate() + cantitate);
                produsGasit = true;
                break;
            }
        }

        if (!produsGasit) {
            ItemCos nouItem = new ItemCos();
            nouItem.setProdus(produs);
            nouItem.setCantitate(cantitate);
            cos.getProduse().add(nouItem);
        }

        Cos cosSalvat = cosRepository.save(cos);
        return ResponseEntity.ok(cosSalvat);
    }
}