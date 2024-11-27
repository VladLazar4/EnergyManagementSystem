package org.example.user.services;

import jakarta.persistence.Table;
import jakarta.transaction.Transactional;
import org.example.user.dtos.UserDTO;
import org.example.user.dtos.builders.UserBuilder;
import org.example.user.entities.User;
import org.example.user.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;


import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Table(name = "users")
public class UserService {
    private static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final String deviceUrl = "http://reverse-proxy/deviceapplication/user";

    @Autowired
    @Lazy
    private RestTemplate restTemplate;

    private WebClient webClient;


    @Autowired
    public UserService(UserRepository userRepository, RestTemplate restTemplate, WebClient.Builder webClientBuilder) {
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
        this.webClient = webClientBuilder.baseUrl("http://userapplication.localhost").build();
    }

    public List<UserDTO> findUsers() {
        List<User> userList = userRepository.findAll();
        return userList.stream()
                .map(UserBuilder::toUserDTO)
                .collect(Collectors.toList());
    }

    public UserDTO findUserById(UUID id) {
        Optional<User> prosumerOptional = userRepository.findById(id);
        if (!prosumerOptional.isPresent()) {
            LOGGER.error("User with id {} was not found in db", id);
            throw new ResourceNotFoundException(User.class.getSimpleName() + " with id: " + id);
        }
        return UserBuilder.toUserDTO(prosumerOptional.get());
    }

    @Transactional
    public UUID insert(UserDTO userDTO) {
        User user = UserBuilder.toEntity(userDTO);
        user = userRepository.save(user);

        userDTO.setId(user.getId());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        String requestBody = String.format(
                "{\"id\":\"%s\", \"username\": \"%s\", \"password\": \"%s\", \"name\": \"%s\", \"role\": \"%s\"}",
                userDTO.getId().toString(),
                userDTO.getUsername(),
                userDTO.getPassword(),
                userDTO.getName(),
                userDTO.getRole() != null ? userDTO.getRole().toString() : null
        );
        System.out.println(requestBody);

        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
        System.out.println(deviceUrl+"/addUser");

        try {
            ResponseEntity<String> response = restTemplate.exchange(deviceUrl+"/addUser", HttpMethod.POST, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("User created successfully in device for user with ID: ");
            } else {
                System.out.println("Failed to create user in device for user. Status code: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error while creating user in device for user", e);
        }
        return user.getId();
    }

    @Transactional
    public UUID update(UUID id, UserDTO userDTO) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        existingUser.setUsername(userDTO.getUsername());
        existingUser.setPassword(userDTO.getPassword());
        existingUser.setName(userDTO.getName());
        existingUser.setRole(userDTO.getRole());

        userRepository.save(existingUser);

        String url = String.format(deviceUrl+"/updateUser/%s",id);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        String requestBody = String.format(
                "{\"id\":\"%s\", \"username\": \"%s\", \"password\": \"%s\", \"name\": \"%s\", \"role\": \"%s\"}",
                existingUser.getId().toString(),
                existingUser.getUsername(),
                existingUser.getPassword(),
                existingUser.getName(),
                existingUser.getRole() != null ? existingUser.getRole().toString() : null
        );
        System.out.println(requestBody);

        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.PUT, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("User updated successfully in device for user with ID: " + existingUser.getId());
            } else {
                System.out.println("Failed to update user in device for user. Status code: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error while updating user in device for user", e);
        }
        return existingUser.getId();
    }

    @Transactional
    public void delete(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        userRepository.deleteById(userId);

        String url = String.format(deviceUrl+"/deleteUser/%s",userId);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        String requestBody = String.format("{\"id\":\"%s\"}", userId);
        System.out.println(requestBody);

        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("User deleted successfully in device for user with ID: " + userId);
            } else {
                System.out.println("Failed to delete user in device for user. Status code: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error while deleting user in device for user", e);
        }
    }

    public UserDTO loginUser(String username, String hashedPassword) {
        System.out.println(username);
        System.out.println(hashedPassword);
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (!userOptional.isPresent()) {
            LOGGER.error("User with name {} was not found in db", username);
            throw new ResourceNotFoundException(User.class.getSimpleName() + " with username: " + username);
        }

        String userPassword = userOptional.get().getPassword();
        String hashedUserPassword = hashPassword(userPassword);

        if (!hashedPassword.equals(hashedUserPassword)) {
            LOGGER.error("User with name {} and password {} was not found in db", username, userPassword);
            throw new ResourceNotFoundException(User.class.getSimpleName() + " with username: " + username);

        }
        return UserBuilder.toUserDTO(userOptional.get());
    }

    private static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
