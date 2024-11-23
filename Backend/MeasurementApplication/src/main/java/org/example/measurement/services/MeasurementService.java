package org.example.measurement.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Table;
import org.example.measurement.dtos.MeasurementDTO;
import org.example.measurement.dtos.builders.MeasurementBuilder;
import org.example.measurement.entities.Measurement;
import org.example.measurement.repositories.MeasurementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.UUID;

@Component
@Service
@Table(name = "measurements")
public class MeasurementService {
    private static final Logger LOGGER = LoggerFactory.getLogger(MeasurementService.class);
    private final MeasurementRepository measurementRepository;
    private int noReadings;
    private UUID deviceId;
    private float measurementValueCurrentHour;
    private Timestamp timestamp;

    @Autowired
    public MeasurementService(MeasurementRepository measurementRepository) {
        this.measurementRepository = measurementRepository;
        this.noReadings = 0;
        this.measurementValueCurrentHour = 0;
    }

    @RabbitListener(queues = "measurement")
    public void receiveMessage(String message) throws JsonProcessingException {
        System.out.println(" [x] Received '" + message + "'");

        noReadings++;

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            MeasurementDTO measurementDTO = objectMapper.readValue(message, MeasurementDTO.class);

            deviceId = measurementDTO.getDeviceId();
            measurementValueCurrentHour += measurementDTO.getMeasurementValue();
            timestamp = measurementDTO.getTimestamp();

            Thread.sleep(3000);
        } catch (Exception e) {
            System.out.println("Error processing message: " + e.getMessage());
            e.printStackTrace();
        }

        try {
            if (noReadings == 6) {
                MeasurementDTO measurementDTO = new MeasurementDTO();
                measurementDTO.setDeviceId(deviceId);
                measurementDTO.setMeasurementValue(measurementValueCurrentHour);
                measurementDTO.setTimestamp(timestamp);
                UUID insertedId = insert(measurementDTO);
                System.out.println("Inserted ID: " + insertedId);

                measurementValueCurrentHour = 0;
                noReadings = 0;
            }
        }
        catch(Exception e){
            System.out.println("Error processing message: " + e.getMessage());
            e.printStackTrace();
        }
    }


    public UUID insert(MeasurementDTO measurementDTO) throws JsonProcessingException {
        Measurement measurement = MeasurementBuilder.toEntity(measurementDTO);

        measurement = measurementRepository.save(measurement);
        LOGGER.debug("Measurement with id {} was inserted in db", measurement.getId());
        return measurement.getId();
    }
}
