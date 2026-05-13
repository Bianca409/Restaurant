package org.example.restaurantbackend.service;

import org.example.restaurantbackend.entity.Client;
import org.example.restaurantbackend.entity.Utilizator;
import org.example.restaurantbackend.repository.ClientRepository;
import org.example.restaurantbackend.repository.UtilizatorRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UtilizatorRepository utilizatorRepository;
    private final ClientRepository clientRepository;

    public AuthService(UtilizatorRepository utilizatorRepository, ClientRepository clientRepository) {
        this.utilizatorRepository = utilizatorRepository;
        this.clientRepository = clientRepository;
    }

    public String registerClient(Client client) {

        if (utilizatorRepository.findByUsername(client.getUsername()).isPresent()) {
            return "Eroare: Username-ul există deja!";
        }

        clientRepository.save(client);
        return "Contul de client a fost creat cu succes!";
    }

    public Map<String, Object> login(String username, String parola) {
        Map<String, Object> response = new HashMap<>();

        if (username.equals("admin@restaurant.null") && parola.equals("adminRestaurantMagic12")) {
            response.put("mesaj", "Login reușit ca Manager");
            response.put("rol", "MANAGER");
            response.put("username", username);
            response.put("id", 0);
            return response;
        }

        Optional<Utilizator> userOptional = utilizatorRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            Utilizator utilizator = userOptional.get();

            if (utilizator.getParola().equals(parola)) {
                response.put("mesaj", "Login reușit");
                response.put("username", utilizator.getUsername());
                response.put("id", utilizator.getId());

                response.put("rol", utilizator.getClass().getSimpleName().toUpperCase());
                return response;
            } else {
                response.put("eroare", "Parola este incorectă!");
                return response;
            }
        }

        response.put("eroare", "Utilizatorul nu a fost găsit!");
        return response;
    }
}