package org.example.restaurantbackend.controller;

import org.example.restaurantbackend.entity.Client;
import org.example.restaurantbackend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Client client) {
        String mesaj = authService.registerClient(client);
        if (mesaj.startsWith("Eroare")) {
            return ResponseEntity.badRequest().body(mesaj);
        }
        return ResponseEntity.ok(mesaj);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String parola = credentials.get("parola");

        Map<String, Object> result = authService.login(username, parola);

        if (result.containsKey("eroare")) {
            return ResponseEntity.status(401).body(result);
        }

        return ResponseEntity.ok(result);
    }
}