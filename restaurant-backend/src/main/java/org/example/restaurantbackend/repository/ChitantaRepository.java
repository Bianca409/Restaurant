package org.example.restaurantbackend.repository;

import org.example.restaurantbackend.entity.Chitanta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChitantaRepository extends JpaRepository<Chitanta, Integer> {
}