package org.example.restaurantbackend.repository;

import org.example.restaurantbackend.entity.Cos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CosRepository extends JpaRepository<Cos, Integer> {
}

