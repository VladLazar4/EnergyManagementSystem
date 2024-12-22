package org.example.chat.repositories;

import org.example.chat.entities.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public interface ChatRepository extends JpaRepository<org.example.chat.entities.Chat, UUID> {

    List<Chat> findAllByAdminId(UUID adminId);
    List<Chat> findAllByClientId(UUID clientId);
//    @Query("SELECT m FROM Measurement m WHERE m.deviceId = :deviceId AND m.timestamp BETWEEN :startOfDay AND :endOfDay")
//    List<Measurement> findMeasurementsByDeviceIdAndTimestampBetween(
//            @Param("deviceId") UUID deviceId,
//            @Param("startOfDay") long startOfDay,
//            @Param("endOfDay") long endOfDay
//    );
}
