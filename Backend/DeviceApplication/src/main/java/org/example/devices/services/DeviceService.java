package org.example.devices.services;

import jakarta.persistence.Table;
import org.example.devices.dtos.DeviceDTO;
import org.example.devices.dtos.builders.DeviceBuilder;
import org.example.devices.entities.Device;
import org.example.devices.repositories.DeviceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Table(name = "users")
public class DeviceService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceService.class);
    private final DeviceRepository deviceRepository;

    @Autowired
    public DeviceService(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    public List<DeviceDTO> findDevices() {
        List<Device> deviceList = deviceRepository.findAll();
        return deviceList.stream()
                .map(DeviceBuilder::toDeviceDTO)
                .collect(Collectors.toList());
    }

    public List<DeviceDTO> findDeviceByOwnerId(UUID id) {
        List<Device> deviceList = deviceRepository.findAllDeviceByOwnerId(id);
        return deviceList.stream()
                .map(DeviceBuilder::toDeviceDTO)
                .collect(Collectors.toList());
    }


    public UUID insert(DeviceDTO deviceDTO) {
        Device device = DeviceBuilder.toEntity(deviceDTO);
        System.out.println(device.getOwnerId());
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
