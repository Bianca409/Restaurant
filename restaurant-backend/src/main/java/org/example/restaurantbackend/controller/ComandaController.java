package org.example.restaurantbackend.controller;

import org.example.restaurantbackend.entity.Comanda;
import org.example.restaurantbackend.entity.Chitanta;
import org.example.restaurantbackend.entity.Cos;
import org.example.restaurantbackend.entity.ItemCos;
import org.example.restaurantbackend.entity.enums.MetodaPlata;
import org.example.restaurantbackend.entity.enums.Status;
import org.example.restaurantbackend.repository.ComandaRepository;
import org.example.restaurantbackend.repository.ChitantaRepository;
import org.example.restaurantbackend.repository.CosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comenzi")
@CrossOrigin
public class ComandaController {

    @Autowired
    private ComandaRepository comandaRepository;

    @Autowired
    private ChitantaRepository chitantaRepository;

    @Autowired
    private CosRepository cosRepository;

    @PostMapping("/plaseaza")
    public ResponseEntity<?> plaseazaComanda(@RequestBody Map<String, Integer> body) {
        Integer cosId = body.get("cosId");
        if (cosId == null) {
            return ResponseEntity.badRequest().body("Eroare: ID-ul coșului lipsește!");
        }

        Optional<Cos> cosOpt = cosRepository.findById(cosId);
        if (!cosOpt.isPresent() || cosOpt.get().getProduse().isEmpty()) {
            return ResponseEntity.badRequest().body("Eroare: Coșul nu există sau este gol!");
        }

        Cos cos = cosOpt.get();
        Comanda comanda = new Comanda();
        comanda.setStatus(Status.IN_ASTEPTARE);
        comanda.setTimpEstimat(0);

        List<ItemCos> produseComanda = new ArrayList<>();
        double pretTotal = 0;

        for (ItemCos itemCos : cos.getProduse()) {
            ItemCos itemNou = new ItemCos();
            itemNou.setProdus(itemCos.getProdus());
            itemNou.setCantitate(itemCos.getCantitate());
            produseComanda.add(itemNou);

            pretTotal += itemCos.getProdus().getPret() * itemCos.getCantitate();
        }

        comanda.setProduse(produseComanda);
        comanda.setTotal(pretTotal);

        Comanda comandaPlasata = comandaRepository.save(comanda);

        cos.getProduse().clear();
        cosRepository.save(cos);

        return ResponseEntity.ok(comandaPlasata);
    }

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

    @GetMapping("/nefinalizate")
    public ResponseEntity<List<Comanda>> getComenziNefinalizate() {
        List<Comanda> toate = comandaRepository.findAll();
        List<Comanda> nefinalizate = toate.stream()
                .filter(c -> c.getStatus() != Status.SERVITA)
                .collect(Collectors.toList());
        return ResponseEntity.ok(nefinalizate);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comanda> getComanda(@PathVariable Integer id) {
        return comandaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/timp")
    public ResponseEntity<?> seteazaTimp(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        if (body == null || !body.containsKey("timp") || body.get("timp") == null) {
            return ResponseEntity.badRequest().body("Eroare: Câmpul 'timp' lipsește sau este nul!");
        }
        Object timpObj = body.get("timp");
        if (!(timpObj instanceof Number)) {
            return ResponseEntity.badRequest().body("Eroare: Câmpul 'timp' trebuie să fie un număr!");
        }
        int timp = ((Number) timpObj).intValue();
        return comandaRepository.findById(id).map(comanda -> {
            comanda.setTimpEstimat(timp);
            comandaRepository.save(comanda);
            return ResponseEntity.ok("Timp estimat salvat");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/plata")
    public ResponseEntity<?> incaseazaPlata(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        if (body == null || !body.containsKey("metodaPlata") || body.get("metodaPlata") == null) {
            return ResponseEntity.badRequest().body("Eroare: Metoda de plată lipsește!");
        }
        return comandaRepository.findById(id).map(comanda -> {
            try {
                String metodaStr = body.get("metodaPlata");
                MetodaPlata metodaPlata = MetodaPlata.valueOf(metodaStr.trim().toUpperCase());

                Chitanta chitanta = new Chitanta();
                chitanta.setData(new Date());
                chitanta.setMetodaPlata(metodaPlata);
                chitanta.setSuma(comanda.getTotal());

                Chitanta chitantaSalvata = chitantaRepository.save(chitanta);

                comanda.setNrChitanta(chitantaSalvata.getNrChitanta());
                comandaRepository.save(comanda);

                return ResponseEntity.ok("Plata confirmata! A fost emisa chitanta nr. " + chitantaSalvata.getNrChitanta());

            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Metodă de plata invalida! Folosiți CASH sau CARD.");
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("A aparut o eroare la salvarea chitantei.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}