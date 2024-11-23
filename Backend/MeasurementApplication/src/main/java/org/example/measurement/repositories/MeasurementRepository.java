package org.example.measurement.repositories;

import org.example.measurement.entities.Measurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MeasurementRepository extends JpaRepository<Measurement, UUID> {

//    List<Measurement> findByName(String name);
//    Optional<Measurement> findById(UUID id);
//    Optional<Measurement> findByUsername(String username);

//    Optional<User> findByUsernameAndPassword(@Param("username") String username, @Param("password") String password);
}
