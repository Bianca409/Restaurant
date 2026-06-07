package org.example.restaurantbackend;

import org.example.restaurantbackend.controller.ComandaController;
import org.example.restaurantbackend.entity.Comanda;
import org.example.restaurantbackend.entity.Chitanta;
import org.example.restaurantbackend.entity.enums.MetodaPlata;
import org.example.restaurantbackend.entity.enums.Status;
import org.example.restaurantbackend.repository.ComandaRepository;
import org.example.restaurantbackend.repository.ChitantaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TestLincaBianca {

    @Mock
    private ComandaRepository comandaRepository;

    @Mock
    private ChitantaRepository chitantaRepository;

    @InjectMocks
    private ComandaController comandaController;

    // Test 1: Actualizare status cu succes (ComandaController)
    @Test
    public void testActualizeazaStatusReusit() {
        Comanda comanda = new Comanda();
        comanda.setId(1);
        comanda.setStatus(Status.IN_ASTEPTARE);

        when(comandaRepository.findById(1)).thenReturn(Optional.of(comanda));

        Map<String, String> body = new HashMap<>();
        body.put("status", "PREPARARE");

        ResponseEntity<?> response = comandaController.actualizeazaStatus(1, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Status actualizat cu succes");
        assertThat(comanda.getStatus()).isEqualTo(Status.PREPARARE);
        verify(comandaRepository).save(comanda);
    }

    // Test 2: Actualizare status cu valoare invalida (ComandaController)
    @Test
    public void testActualizeazaStatusInvalid() {
        Comanda comanda = new Comanda();
        comanda.setId(1);
        comanda.setStatus(Status.IN_ASTEPTARE);

        when(comandaRepository.findById(1)).thenReturn(Optional.of(comanda));

        Map<String, String> body = new HashMap<>();
        body.put("status", "INVALID_STATUS");

        ResponseEntity<?> response = comandaController.actualizeazaStatus(1, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("Status invalid");
    }

    // Test 3: Seteaza timp estimat (ComandaController)
    @Test
    public void testSeteazaTimpReusit() {
        Comanda comanda = new Comanda();
        comanda.setId(1);
        comanda.setTimpEstimat(0);

        when(comandaRepository.findById(1)).thenReturn(Optional.of(comanda));

        Map<String, Object> body = new HashMap<>();
        body.put("timp", 25);

        ResponseEntity<?> response = comandaController.seteazaTimp(1, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Timp estimat salvat");
        assertThat(comanda.getTimpEstimat()).isEqualTo(25);
        verify(comandaRepository).save(comanda);
    }

    // Test 4: Incasare plata cu succes - CASH (ComandaController)
    @Test
    public void testIncaseazaPlataCashReusit() {
        Comanda comanda = new Comanda();
        comanda.setId(1);
        comanda.setTotal(50.0);

        Chitanta chitantaSalvata = new Chitanta();
        chitantaSalvata.setNrChitanta(1001);
        chitantaSalvata.setSuma(50.0);
        chitantaSalvata.setMetodaPlata(MetodaPlata.CASH);

        when(comandaRepository.findById(1)).thenReturn(Optional.of(comanda));
        when(chitantaRepository.save(any(Chitanta.class))).thenReturn(chitantaSalvata);

        Map<String, String> body = new HashMap<>();
        body.put("metodaPlata", "CASH");

        ResponseEntity<?> response = comandaController.incaseazaPlata(1, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Plata confirmata! A fost emisa chitanta nr. 1001");
    }

    // Test 5: Incasare plata cu succes - CARD (ComandaController)
    @Test
    public void testIncaseazaPlataCardReusit() {
        Comanda comanda = new Comanda();
        comanda.setId(2);
        comanda.setTotal(120.5);

        Chitanta chitantaSalvata = new Chitanta();
        chitantaSalvata.setNrChitanta(1002);
        chitantaSalvata.setSuma(120.5);
        chitantaSalvata.setMetodaPlata(MetodaPlata.CARD);

        when(comandaRepository.findById(2)).thenReturn(Optional.of(comanda));
        when(chitantaRepository.save(any(Chitanta.class))).thenReturn(chitantaSalvata);

        Map<String, String> body = new HashMap<>();
        body.put("metodaPlata", "CARD");

        ResponseEntity<?> response = comandaController.incaseazaPlata(2, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Plata confirmata! A fost emisa chitanta nr. 1002");
    }

    // Test 6: Incasare plata - comanda inexistenta (ComandaController)
    @Test
    public void testIncaseazaPlataComandaInexistenta() {
        when(comandaRepository.findById(99)).thenReturn(Optional.empty());

        Map<String, String> body = new HashMap<>();
        body.put("metodaPlata", "CASH");

        ResponseEntity<?> response = comandaController.incaseazaPlata(99, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    // Test 7: Incasare plata cu metoda invalida (ComandaController)
    @Test
    public void testIncaseazaPlataInvalida() {
        Comanda comanda = new Comanda();
        comanda.setId(1);

        when(comandaRepository.findById(1)).thenReturn(Optional.of(comanda));

        Map<String, String> body = new HashMap<>();
        body.put("metodaPlata", "PAYPAL");

        ResponseEntity<?> response = comandaController.incaseazaPlata(1, body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("Metodă de plata invalida! Folosiți CASH sau CARD.");
    }

}
