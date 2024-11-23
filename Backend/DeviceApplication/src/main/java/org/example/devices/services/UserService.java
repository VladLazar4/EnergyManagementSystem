package org.example.devices.services;

import jakarta.persistence.Table;
import org.example.devices.dtos.UserDTO;
import org.example.devices.dtos.builders.UserBuilder;
import org.example.devices.entities.Device;
import org.example.devices.entities.User;
import org.example.devices.repositories.DeviceRepository;
import org.example.devices.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Table(name = "users")
public class UserService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceService.class);
    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;

    @Autowired
    public UserService(UserRepository userRepository, DeviceRepository deviceRepository) {
        this.userRepository = userRepository;
        this.deviceRepository = deviceRepository;
    }

    public List<UserDTO> findUsers() {
        List<User> userList = userRepository.findAll();
        return userList.stream()
                .map(UserBuilder::toUserDTO)
                .collect(Collectors.toList());
    }

    public UUID insert(UserDTO userDTO) {
        User user = UserBuilder.toEntity(userDTO);
        user = userRepository.save(user);
        LOGGER.debug("User with id {} was inserted in db", userDTO.getName());
        return user.getId();
    }

    public void update(UUID id, UserDTO userDTO) {
        Optional<User> userOptional = userRepository.findById(id);
        if (!userOptional.isPresent()) {
            LOGGER.error("User with id {} was not found in db", id);
            throw new ResourceNotFoundException(Device.class.getSimpleName() + " with name: " + id);
        }

        User user = userOptional.get();

        user.setName(userDTO.getName());
        user.setPassword(userDTO.getPassword());
        user.setUsername(userDTO.getUsername());
        user.setRole(userDTO.getRole());

        userRepository.save(user);
    }

    public void delete(UUID id) {
        userRepository.deleteById(id);
        List<Device> devicesToDelete = new ArrayList<>();
        devicesToDelete = deviceRepository.findAllDeviceByOwnerId(id);

        deviceRepository.deleteAll(devicesToDelete);
    }

}
