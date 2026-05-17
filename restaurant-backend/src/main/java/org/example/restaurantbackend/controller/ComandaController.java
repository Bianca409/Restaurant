package org.example.restaurantbackend.controller;

import org.example.restaurantbackend.entity.Comanda;
import org.example.restaurantbackend.entity.Chitanta;
import org.example.restaurantbackend.entity.enums.MetodaPlata;
import org.example.restaurantbackend.entity.enums.Status;
import org.example.restaurantbackend.repository.ComandaRepository;
import org.example.restaurantbackend.repository.ChitantaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/comenzi")
@CrossOrigin
public class ComandaController {

    @Autowired
    private ComandaRepository comandaRepository;

    @Autowired
    private ChitantaRepository chitantaRepository;

    @PutMapping("/{id}/status")
    public ResponseEntity<?> actualizeazaStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        return comandaRepository.findById(id).map(comanda -> {
            try {
                Status noulStatus = Status.valueOf(body.get("status").toUpperCase());
                comanda.setStatus(noulStatus);
                comandaRepository.save(comanda);
                return ResponseEntity.ok("Status actualizat cu succes");
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Status invalid");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/timp")
    public ResponseEntity<?> seteazaTimp(@PathVariable Integer id, @RequestBody Map<String, Integer> body) {
        return comandaRepository.findById(id).map(comanda -> {
            comanda.setTimpEstimat(body.get("timp"));
            comandaRepository.save(comanda);
            return ResponseEntity.ok("Timp estimat salvat");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/plata")
    public ResponseEntity<?> incaseazaPlata(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        return comandaRepository.findById(id).map(comanda -> {
            try {
                String metodaStr = body.get("metodaPlata");
                MetodaPlata metodaPlata = MetodaPlata.valueOf(metodaStr.toUpperCase());

                Chitanta chitanta = new Chitanta();
                chitanta.setData(new Date());
                chitanta.setMetodaPlata(metodaPlata);
                chitanta.setSuma(comanda.getTotal());

                Chitanta chitantaSalvata = chitantaRepository.save(chitanta);

                return ResponseEntity.ok("Plata confirmata! A fost emisa chitanta nr. " + chitantaSalvata.getNrChitanta());

            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Metodă de plata invalida! Folosiți CASH sau CARD.");
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("A aparut o eroare la salvarea chitantei.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}