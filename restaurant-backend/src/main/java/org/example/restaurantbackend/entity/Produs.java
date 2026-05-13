package org.example.restaurantbackend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Data
public abstract class Produs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nume;

    private double pret;

    private boolean disponibil;

    @OneToOne(cascade = CascadeType.ALL)
    private Detalii detalii;
}
