package org.example.measurement.repositories;

import org.example.measurement.entities.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {
    List<Device> findAllDeviceByOwnerId(UUID ownerId);

//    @Modifying
//    @Query("UPDATE Device d SET d.ownerId = null WHERE d.ownerId = :ownerId")
    void deleteAllByOwnerId(UUID ownerId);
}
