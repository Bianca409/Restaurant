package org.example.restaurantbackend;

import org.example.restaurantbackend.entity.Aperitiv;
import org.example.restaurantbackend.entity.Bautura;
import org.example.restaurantbackend.entity.FelPrincipal;
import org.example.restaurantbackend.entity.Detalii;
import org.example.restaurantbackend.repository.ProdusRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Arrays;

@SpringBootApplication
public class RestaurantBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(RestaurantBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(ProdusRepository produsRepository) {
        return args -> {
            if(produsRepository.count() == 0) {
                Aperitiv a1 = new Aperitiv();
                a1.setNume("Bruschete cu roșii"); a1.setPret(15.0); a1.setDisponibil(true);
                Detalii d1 = new Detalii(); d1.setVegetarian(true); d1.setListaIngrediente(Arrays.asList("paine", "rosii", "usturoi")); a1.setDetalii(d1);

                Aperitiv a2 = new Aperitiv();
                a2.setNume("Pesto"); a2.setPret(18.0); a2.setDisponibil(true);
                Detalii d2 = new Detalii(); d2.setVegetarian(true); d2.setListaIngrediente(Arrays.asList("busuioc", "parmezan", "nuci")); a2.setDetalii(d2);

                Aperitiv a3 = new Aperitiv();
                a3.setNume("Bruschete cu somon"); a3.setPret(25.0); a3.setDisponibil(true);
                Detalii d3 = new Detalii(); d3.setVegetarian(false); d3.setListaIngrediente(Arrays.asList("paine", "somon afumat", "crema de branza")); a3.setDetalii(d3);


                Bautura b1 = new Bautura();
                b1.setNume("Apă plată"); b1.setPret(8.0); b1.setDisponibil(true); b1.setEsteSpirtoasa(false);

                Bautura b2 = new Bautura();
                b2.setNume("Apă minerală"); b2.setPret(8.0); b2.setDisponibil(true); b2.setEsteSpirtoasa(false);

                Bautura b3 = new Bautura();
                b3.setNume("Limonadă"); b3.setPret(16.0); b3.setDisponibil(true); b3.setEsteSpirtoasa(false);


                FelPrincipal f1 = new FelPrincipal();
                f1.setNume("Supă cremă de ciuperci"); f1.setPret(20.0); f1.setDisponibil(true);
                Detalii d4 = new Detalii(); d4.setVegetarian(true); d4.setListaIngrediente(Arrays.asList("ciuperci", "smantana", "crutoane")); f1.setDetalii(d4);


                produsRepository.saveAll(Arrays.asList(a1, a2, a3, b1, b2, b3, f1));

                System.out.println("Baza de date a fost populata cu succes cu produsele obligatorii!");
            }
        };
    }
}