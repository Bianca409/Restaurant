package org.example.restaurantbackend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ItemCos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    private Produs produs;

    private int cantitate;
}
