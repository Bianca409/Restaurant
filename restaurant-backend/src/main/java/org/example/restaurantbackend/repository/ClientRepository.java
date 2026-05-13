package org.example.restaurantbackend.repository;

import org.example.restaurantbackend.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface ClientRepository extends JpaRepository<Client, Integer> {
}
