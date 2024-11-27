package org.example.measurement.repositories;

import org.example.measurement.entities.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {
    Device findDeviceById(UUID ownerId);
}
