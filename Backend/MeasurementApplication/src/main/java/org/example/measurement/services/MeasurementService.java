package org.example.measurement.services;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import com.rabbitmq.client.MessageProperties;
import jakarta.persistence.Table;
import org.apache.logging.log4j.message.Message;
import org.example.measurement.confuguration.RabbitMQConfig;
import org.example.measurement.dtos.DeviceDTO;
import org.example.measurement.dtos.MeasurementDTO;
import org.example.measurement.dtos.MessageDTO;
import org.example.measurement.dtos.builders.MeasurementBuilder;
import org.example.measurement.entities.Measurement;
import org.example.measurement.repositories.MeasurementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@Service
@Table(name = "measurements")
public class MeasurementService {
    private static final Logger LOGGER = LoggerFactory.getLogger(MeasurementService.class);
    private final MeasurementRepository measurementRepository;
    private int noReadings;
    private float measurementValueCurrentHour;

    @Autowired
    public MeasurementService(MeasurementRepository measurementRepository) {
        this.measurementRepository = measurementRepository;
        this.noReadings = 0;
        this.measurementValueCurrentHour = 0;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME_MEASUREMENT)
    public void receiveMessage(Map<String, Object> payload) {

        System.out.println(payload);

        ObjectMapper objectMapper = new ObjectMapper();
        Timestamp timestamp = objectMapper.convertValue(payload.get("timestamp"), Timestamp.class);
        UUID deviceId = objectMapper.convertValue(payload.get("deviceId"), UUID.class);
        Double measurementValue = (Double) payload.get("measurementValue");

        noReadings++;
        measurementValueCurrentHour += measurementValue;

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
        } catch (Exception e) {
            System.out.println("Error processing message: " + e.getMessage());
            e.printStackTrace();
        }
    }


    public UUID insert(MeasurementDTO measurementDTO) {
        Measurement measurement = MeasurementBuilder.toEntity(measurementDTO);

        measurement = measurementRepository.save(measurement);
        LOGGER.debug("Measurement with id {} was inserted in db", measurement.getId());
        return measurement.getId();
    }

    public List<MeasurementDTO> findMeasurementsByDeviceId(UUID deviceId) {
        System.out.println(deviceId);
        List<Measurement> measurementList = measurementRepository.findAllMeasurementByDeviceId(deviceId);
        System.out.println(measurementList);
        return measurementList.stream()
                .map(MeasurementBuilder::toMeasurementDTO)
                .collect(Collectors.toList());
    }
}
