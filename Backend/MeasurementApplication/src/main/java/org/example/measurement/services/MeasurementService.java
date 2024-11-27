package org.example.measurement.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Table;
import org.example.measurement.confugurations.RabbitMQConfig;
import org.example.measurement.controllers.WebSocketController;
import org.example.measurement.dtos.MeasurementDTO;
import org.example.measurement.dtos.builders.MeasurementBuilder;
import org.example.measurement.entities.Device;
import org.example.measurement.entities.Measurement;
import org.example.measurement.repositories.DeviceRepository;
import org.example.measurement.repositories.MeasurementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Service
@Table(name = "measurements")
public class MeasurementService {
    private static final Logger LOGGER = LoggerFactory.getLogger(MeasurementService.class);
    private final MeasurementRepository measurementRepository;
    private final DeviceRepository deviceRepository;
    private final Map<String, List<Float>> deviceMeasurementList;
    private final WebSocketController webSocketController;

    @Autowired
    public MeasurementService(MeasurementRepository measurementRepository, DeviceRepository deviceRepository, WebSocketController webSocketController) {
        this.measurementRepository = measurementRepository;
        this.deviceRepository = deviceRepository;
        this.deviceMeasurementList = new ConcurrentHashMap<>();
        this.webSocketController = webSocketController;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME_MEASUREMENT)
    public void receiveMessage(Map<String, Object> payload) {

        ObjectMapper objectMapper = new ObjectMapper();
        Timestamp timestamp = objectMapper.convertValue(payload.get("timestamp"), Timestamp.class);
        UUID deviceId = objectMapper.convertValue(payload.get("deviceId"), UUID.class);
        Float measurementValue = objectMapper.convertValue(payload.get("measurementValue"), Float.class);

        deviceMeasurementList.putIfAbsent(deviceId.toString(), new ArrayList<>());
        List<Float> list = deviceMeasurementList.get(deviceId.toString());
        synchronized (list){
            list.add(measurementValue);

            if(list.size() == 6){
                float measurementValueCurrentHour = list.stream().reduce(0.0f, Float::sum);

                MeasurementDTO measurementDTO = new MeasurementDTO();
                measurementDTO.setDeviceId(deviceId);
                measurementDTO.setMeasurementValue(measurementValueCurrentHour);
                measurementDTO.setTimestamp(timestamp);
                insert(measurementDTO);

                Device device = deviceRepository.findDeviceById(deviceId);

                Float maxValuePerHour = device.getMaxHourlyConsumption();
                UUID ownerId = device.getOwnerId();
                if(measurementValueCurrentHour > maxValuePerHour){
                    webSocketController.sendNotification(deviceId, ownerId, measurementValueCurrentHour);
                }

                list.clear();
            }
        }
    }


    public UUID insert(MeasurementDTO measurementDTO) {
        Measurement measurement = MeasurementBuilder.toEntity(measurementDTO);

        measurement = measurementRepository.save(measurement);
        LOGGER.debug("Measurement with id {} was inserted in db", measurement.getId());
        return measurement.getId();
    }

    public List<MeasurementDTO> findMeasurementsByDeviceIdInDate(UUID deviceId, String selectedDateString) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        LocalDate localDate = LocalDate.parse(selectedDateString, formatter);
        ZoneId zoneId = ZoneId.systemDefault();
        ZonedDateTime startOfDay = localDate.atStartOfDay(zoneId);
        ZonedDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);

        long startTimestamp = startOfDay.toInstant().toEpochMilli();
        long endTimestamp = endOfDay.toInstant().toEpochMilli();

        List<Measurement> measurementList = measurementRepository.findMeasurementsByDeviceIdAndTimestampBetween(deviceId, startTimestamp, endTimestamp);
        return measurementList.stream()
                .sorted(Comparator.comparing(Measurement::getTimestamp))
                .map(MeasurementBuilder::toMeasurementDTO)
                .collect(Collectors.toList());
    }
}
