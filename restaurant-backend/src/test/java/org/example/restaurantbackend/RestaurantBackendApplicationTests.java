package org.example.restaurantbackend;

import org.example.restaurantbackend.controller.ManagerController;
import org.example.restaurantbackend.entity.Aperitiv;
import org.example.restaurantbackend.entity.Chelner;
import org.example.restaurantbackend.entity.Client;
import org.example.restaurantbackend.entity.Detalii;
import org.example.restaurantbackend.entity.Personal;
import org.example.restaurantbackend.entity.Produs;
import org.example.restaurantbackend.repository.UtilizatorRepository;
import org.example.restaurantbackend.service.ProdusService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RestaurantBackendApplicationTests {

    @Mock
    private ProdusService produsService;

    @Mock
    private UtilizatorRepository utilizatorRepository;

    @InjectMocks
    private ManagerController managerController;

    @Test
    void vizualizareAngajatiReturneazaDoarPersonalSiChelner() {
        Personal personal = new Personal();
        personal.setId(1);
        personal.setUsername("personal_test");
        personal.setEmail("personal@test.ro");
        personal.setParola("secret");

        Chelner chelner = new Chelner();
        chelner.setId(2);
        chelner.setUsername("chelner_test");
        chelner.setEmail("chelner@test.ro");
        chelner.setParola("secret");

        Client client = new Client();
        client.setId(3);
        client.setUsername("client_test");

        when(utilizatorRepository.findAll()).thenReturn(List.of(personal, chelner, client));

        ResponseEntity<List<Map<String, Object>>> response = managerController.vizualizareAngajati();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
        assertThat(response.getBody()).extracting(item -> item.get("rol")).containsExactly("PERSONAL", "CHELNER");
        assertThat(response.getBody().get(0)).doesNotContainKey("parola");
    }

    @Test
    void vizualizareAngajatReturneazaNotFoundPentruClient() {
        Client client = new Client();
        client.setId(7);

        when(utilizatorRepository.findById(7)).thenReturn(Optional.of(client));

        ResponseEntity<?> response = managerController.vizualizareAngajat(7);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void stergeAngajatStergeChelnerExistent() {
        Chelner chelner = new Chelner();
        chelner.setId(4);
        chelner.setUsername("chelner_de_sters");

        when(utilizatorRepository.findById(4)).thenReturn(Optional.of(chelner));

        ResponseEntity<?> response = managerController.stergeAngajat(4);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(String.valueOf(response.getBody())).contains("succes");
        verify(utilizatorRepository).delete(chelner);
    }

    @Test
    void modificaProdusActualizeazaDateleSiDetaliile() {
        Aperitiv produs = new Aperitiv();
        produs.setId(11);
        produs.setNume("Produs vechi");
        produs.setPret(12.0);
        produs.setDisponibil(true);
        produs.setDetalii(new Detalii());

        Map<String, Object> date = new HashMap<>();
        date.put("nume", "Bruschete");
        date.put("pret", 24.5);
        date.put("disponibil", false);
        date.put("ingrediente", "rosii, busuioc");
        date.put("vegetarian", true);
        date.put("picant", false);

        when(produsService.getProductById(11)).thenReturn(produs);
        when(produsService.salveazaProdus(any(Produs.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = managerController.modificaProdus(11, date);
        Produs produsActualizat = (Produs) response.getBody();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(produsActualizat.getNume()).isEqualTo("Bruschete");
        assertThat(produsActualizat.getPret()).isEqualTo(24.5);
        assertThat(produsActualizat.isDisponibil()).isFalse();
        assertThat(produsActualizat.getDetalii().getListaIngrediente()).containsExactly("rosii", "busuioc");
        assertThat(produsActualizat.getDetalii().isVegetarian()).isTrue();
        assertThat(produsActualizat.getDetalii().isPicant()).isFalse();
    }

    @Test
    void stergeProdusReturneazaOkCandProdusulExista() {
        when(produsService.stergeProdus(5)).thenReturn(true);

        ResponseEntity<?> response = managerController.stergeProdus(5);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Produsul a fost sters cu succes!");
        verify(produsService).stergeProdus(5);
    }
}
