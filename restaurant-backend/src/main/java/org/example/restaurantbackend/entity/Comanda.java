package org.example.restaurantbackend.entity;

import org.example.restaurantbackend.entity.enums.Status;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class Comanda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "comanda_id")
    private List<ItemCos> produse;

    @Enumerated(EnumType.STRING)
    private Status status;

    private int timpEstimat;

    private double total;
}
