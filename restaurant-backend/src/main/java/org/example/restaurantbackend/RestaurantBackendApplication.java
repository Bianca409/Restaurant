package org.example.restaurantbackend;

import org.example.restaurantbackend.entity.Aperitiv;
import org.example.restaurantbackend.entity.Bautura;
import org.example.restaurantbackend.repository.ProdusRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class RestaurantBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(RestaurantBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(ProdusRepository produsRepository) {
        return args -> {

            Aperitiv aperitiv = new Aperitiv();
            aperitiv.setNume("Bruschete cu rosii si busuioc");
            aperitiv.setPret(25.50);
            aperitiv.setDisponibil(true);
            aperitiv.setTip("Rece");

            Bautura bautura = new Bautura();
            bautura.setNume("Limonada proaspata cu menta");
            bautura.setPret(18.00);
            bautura.setDisponibil(true);
            bautura.setEsteSpirtoasa(false);

            produsRepository.save(aperitiv);
            produsRepository.save(bautura);

            System.out.println("✅ Baza de date a fost populata cu succes cu produse de test!");
        };
    }
}