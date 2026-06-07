package org.example.restaurantbackend;

import org.example.restaurantbackend.controller.MeniuController;
import org.example.restaurantbackend.entity.*;
import org.example.restaurantbackend.repository.ProdusRepository;
import org.example.restaurantbackend.service.ProdusService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TestDaljaSara {

    @Mock
    private ProdusRepository produsRepository;

    @InjectMocks
    private ProdusService produsService; // Mockito va injecta produsRepository aici

    private MeniuController meniuController;

    @BeforeEach
    void setUp() {
        // Inițializăm manual controller-ul, pasându-i serviciul deja "mock-uit"
        meniuController = new MeniuController(produsService);
    }

    @Test
    void getMeniuGrupatExcludeProduseIndisponibile() {
        Aperitiv a = new Aperitiv();
        a.setNume("Bruschete");
        a.setDisponibil(false);
        when(produsRepository.findAll()).thenReturn(List.of(a));

        Map<String, List<Produs>> meniu = produsService.getMeniuGrupat();
        assertThat(meniu.get("Aperitive")).isEmpty();
    }

    @Test
    void getMeniuGrupatSeparaBauturileCorect() {
        Bautura b1 = new Bautura(); b1.setEsteSpirtoasa(true); b1.setDisponibil(true);
        Bautura b2 = new Bautura(); b2.setEsteSpirtoasa(false); b2.setDisponibil(true);
        when(produsRepository.findAll()).thenReturn(List.of(b1, b2));

        Map<String, List<Produs>> meniu = produsService.getMeniuGrupat();
        assertThat(meniu.get("Bauturi Spirtoase")).hasSize(1);
        assertThat(meniu.get("Bauturi Nespirtoase")).hasSize(1);
    }

    @Test
    void getToateProduseleReturneazaLista() {
        when(produsRepository.findAll()).thenReturn(List.of(new Aperitiv()));
        assertThat(meniuController.getToateProdusele()).hasSize(1);
    }

    @Test
    void getProdusGasit() {
        Aperitiv a = new Aperitiv();
        when(produsRepository.findById(1)).thenReturn(Optional.of(a));
        assertThat(meniuController.getProdus(1)).isEqualTo(a);
    }

    @Test
    void actualizeazaDisponibilitateEroareBody() {
        ResponseEntity<?> resp = meniuController.actualizeazaDisponibilitate(1, null);
        assertThat(resp.getStatusCodeValue()).isEqualTo(400);
    }

    @Test
    void actualizeazaDisponibilitateNotFound() {
        when(produsRepository.findById(1)).thenReturn(Optional.empty());
        ResponseEntity<?> resp = meniuController.actualizeazaDisponibilitate(1, Map.of("disponibil", true));
        assertThat(resp.getStatusCodeValue()).isEqualTo(404);
    }

    @Test
    void actualizeazaDisponibilitateSucces() {
        Aperitiv a = new Aperitiv();
        when(produsRepository.findById(1)).thenReturn(Optional.of(a));
        when(produsRepository.save(a)).thenReturn(a);

        ResponseEntity<?> resp = meniuController.actualizeazaDisponibilitate(1, Map.of("disponibil", true));
        assertThat(resp.getStatusCodeValue()).isEqualTo(200);
        assertThat(a.isDisponibil()).isTrue();
    }
}
