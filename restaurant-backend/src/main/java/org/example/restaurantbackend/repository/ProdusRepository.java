package org.example.restaurantbackend.repository;

import org.example.restaurantbackend.entity.Produs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface ProdusRepository extends JpaRepository<Produs, Integer> {
}

