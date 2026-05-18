package org.example.restaurantbackend.service;

import org.example.restaurantbackend.entity.Aperitiv;
import org.example.restaurantbackend.entity.Bautura;
import org.example.restaurantbackend.entity.FelPrincipal;
import org.example.restaurantbackend.entity.Produs;
import org.example.restaurantbackend.repository.ProdusRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProdusService {

    private final ProdusRepository produsRepository;

    public ProdusService(ProdusRepository produsRepository) {
        this.produsRepository = produsRepository;
    }

    public List<Produs> getAllProducts() {
        return produsRepository.findAll();
    }

    public Map<String, List<Produs>> getMeniuGrupat() {
        List<Produs> toateProdusele = produsRepository.findAll();
        Map<String, List<Produs>> meniuGrupat = new HashMap<>();

        meniuGrupat.put("Aperitive", new ArrayList<>());
        meniuGrupat.put("Feluri Principale", new ArrayList<>());
        meniuGrupat.put("Bauturi Spirtoase", new ArrayList<>());
        meniuGrupat.put("Bauturi Nespirtoase", new ArrayList<>());

        for (Produs p : toateProdusele) {
            if (!p.isDisponibil()) {
                continue;
            }

            if (p instanceof Aperitiv) {
                meniuGrupat.get("Aperitive").add(p);
            } else if (p instanceof FelPrincipal) {
                meniuGrupat.get("Feluri Principale").add(p);
            } else if (p instanceof Bautura) {
                Bautura b = (Bautura) p;
                if (b.isEsteSpirtoasa()) {
                    meniuGrupat.get("Bauturi Spirtoase").add(b);
                } else {
                    meniuGrupat.get("Bauturi Nespirtoase").add(b);
                }
            }
        }
        return meniuGrupat;
    }

    public Produs getProductById(Integer id) {
        return produsRepository.findById(id).orElse(null);
    }

    public Produs salveazaProdus(Produs produs) {
        return produsRepository.save(produs);
    }
}