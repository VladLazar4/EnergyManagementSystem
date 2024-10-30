package org.example.devices.repositories;

import org.example.devices.entities.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {
    List<Device> findAllDeviceByOwnerId(UUID ownerId);

//    @Modifying
//    @Query("UPDATE Device d SET d.ownerId = null WHERE d.ownerId = :ownerId")
    void deleteAllByOwnerId(UUID ownerId);
}
