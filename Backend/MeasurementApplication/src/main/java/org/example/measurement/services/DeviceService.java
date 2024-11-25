package org.example.measurement.services;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Table;
import org.example.measurement.dtos.DeviceDTO;
import org.example.measurement.dtos.MeasurementDTO;
import org.example.measurement.dtos.MessageDTO;
import org.example.measurement.dtos.builders.DeviceBuilder;
import org.example.measurement.entities.Device;
import org.example.measurement.repositories.DeviceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Table(name = "devices")
public class DeviceService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceService.class);
    private final DeviceRepository deviceRepository;

    @Autowired
    public DeviceService(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    @RabbitListener(queues = "devices")
    public void receiveMessage(Map<String, Object> payload) {
        ObjectMapper objectMapper = new ObjectMapper(); // Use Jackson ObjectMapper

        try {
            String operation = payload.get("operation").toString();
            // Convert "message" field to DeviceDTO
            DeviceDTO deviceDTO = objectMapper.convertValue(payload.get("message"), DeviceDTO.class);

            switch (operation) {
                case "insert":
                    insert(deviceDTO);
                    break;
                case "update":
                    update(deviceDTO.getId(), deviceDTO);
                    break;
                case "delete":
                    delete(deviceDTO.getId());
                    break;
            }
        } catch (Exception e) {
            System.out.println("Error processing message: " + e.getMessage());
            e.printStackTrace();
        }
    }


    public UUID insert(DeviceDTO deviceDTO) {
        Device device = DeviceBuilder.toEntity(deviceDTO);

        device = deviceRepository.save(device);
        LOGGER.debug("Device with id {} was inserted in db", device.getName());

        return device.getId();
    }

    public void update(UUID id, DeviceDTO deviceDTO) {
        Optional<Device> userOptional = deviceRepository.findById(id);
        if (!userOptional.isPresent()) {
            LOGGER.error("Device with id {} was not found in db", id);
            throw new ResourceNotFoundException(Device.class.getSimpleName() + " with name: " + id);
        }

        Device device = userOptional.get();

        device.setName(deviceDTO.getName());
        device.setDescription(deviceDTO.getDescription());
        device.setAddress(deviceDTO.getAddress());
        device.setMaxHourlyConsumption(deviceDTO.getMaxHourlyConsumption());
        device.setOwnerId(deviceDTO.getOwnerId());

        deviceRepository.save(device);
    }

    public void delete(UUID id) {
        Optional<Device> deviceOptional = deviceRepository.findById(id);
        if (!deviceOptional.isPresent()) {
            LOGGER.error("Device with id {} was not found in db", id);
            throw new ResourceNotFoundException(Device.class.getSimpleName() + " with name: " + id);
        }

        Device device = deviceOptional.get();

        deviceRepository.delete(device);
    }
}
