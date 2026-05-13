package org.example.restaurantbackend.repository;

import org.example.restaurantbackend.entity.Comanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface ComandaRepository extends JpaRepository<Comanda, Integer> {
}
