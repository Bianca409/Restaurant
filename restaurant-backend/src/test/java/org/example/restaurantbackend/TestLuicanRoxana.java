package org.example.restaurantbackend;

import org.example.restaurantbackend.controller.ManagerController;
import org.example.restaurantbackend.entity.Aperitiv;
import org.example.restaurantbackend.entity.Chelner;
import org.example.restaurantbackend.entity.Personal;
import org.example.restaurantbackend.entity.Produs;
import org.example.restaurantbackend.entity.Utilizator;
import org.example.restaurantbackend.repository.UtilizatorRepository;
import org.example.restaurantbackend.service.ProdusService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TestLuicanRoxana {

    @Mock
    private ProdusService produsService;

    @Mock
    private UtilizatorRepository utilizatorRepository;

    @InjectMocks
    private ManagerController managerController;

    // Test 1: Vizualizare meniu - returneaza lista de produse (ManagerController)
    @Test
    public void testVizualizareProduse() {
        Produs p1 = new Aperitiv();
        p1.setId(1);
        p1.setNume("Bruschete cu rosii");
        p1.setPret(15.0);
        p1.setDisponibil(true);

        Produs p2 = new Aperitiv();
        p2.setId(2);
        p2.setNume("Bruschete cu somon");
        p2.setPret(20.0);
        p2.setDisponibil(true);

        when(produsService.getAllProducts()).thenReturn(Arrays.asList(p1, p2));

        ResponseEntity<List<Map<String, Object>>> response = managerController.vizualizareProduse();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody().get(0).get("nume")).isEqualTo("Bruschete cu rosii");
        assertThat(response.getBody().get(1).get("nume")).isEqualTo("Bruschete cu somon");
    }

    // Test 2: Vizualizare angajati - returneaza doar Personal si Chelner (ManagerController)
    @Test
    public void testVizualizareAngajati() {
        Personal personal = new Personal();
        personal.setId(1);
        personal.setUsername("personal1");
        personal.setEmail("personal1@restaurant.null");

        Chelner chelner = new Chelner();
        chelner.setId(2);
        chelner.setUsername("chelner1");
        chelner.setEmail("chelner1@restaurant.null");

        when(utilizatorRepository.findAll()).thenReturn(Arrays.asList(personal, chelner));

        ResponseEntity<List<Map<String, Object>>> response = managerController.vizualizareAngajati();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody().get(0).get("username")).isEqualTo("personal1");
        assertThat(response.getBody().get(1).get("username")).isEqualTo("chelner1");
    }

    // Test 3: Vizualizare angajat dupa ID - gasit cu succes (ManagerController)
    @Test
    public void testVizualizareAngajatReusit() {
        Chelner chelner = new Chelner();
        chelner.setId(1);
        chelner.setUsername("chelner1");
        chelner.setEmail("chelner1@restaurant.null");

        when(utilizatorRepository.findById(1)).thenReturn(Optional.of(chelner));

        ResponseEntity<?> response = managerController.vizualizareAngajat(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertThat(body.get("username")).isEqualTo("chelner1");
    }

    // Test 4: Vizualizare angajat dupa ID - inexistent (ManagerController)
    @Test
    public void testVizualizareAngajatInexistent() {
        when(utilizatorRepository.findById(99)).thenReturn(Optional.empty());

        ResponseEntity<?> response = managerController.vizualizareAngajat(99);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    // Test 5: Stergere produs - reusita (ManagerController + ProdusService)
    @Test
    public void testStergeProdusReusit() {
        when(produsService.stergeProdus(1)).thenReturn(true);

        ResponseEntity<?> response = managerController.stergeProdus(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Produsul a fost sters cu succes!");
        verify(produsService).stergeProdus(1);
    }

    // Test 6: Stergere produs - inexistent (ManagerController)
    @Test
    public void testStergeProdusInexistent() {
        when(produsService.stergeProdus(99)).thenReturn(false);

        ResponseEntity<?> response = managerController.stergeProdus(99);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
