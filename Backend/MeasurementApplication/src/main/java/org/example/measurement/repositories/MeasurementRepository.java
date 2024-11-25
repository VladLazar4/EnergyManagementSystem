package org.example.measurement.repositories;

import org.example.measurement.entities.Measurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MeasurementRepository extends JpaRepository<Measurement, UUID> {

    List<Measurement> findAllMeasurementByDeviceId(UUID deviceId);
}
