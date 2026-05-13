package org.example.restaurantbackend.entity;

import org.example.restaurantbackend.entity.enums.MetodaPlata;
import jakarta.persistence.*;
        import lombok.Data;

import java.util.Date;

@Entity
@Data
public class Chitanta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer nrChitanta;

    private Date data;

    @Enumerated(EnumType.STRING)
    private MetodaPlata metodaPlata;

    private double suma;
}
