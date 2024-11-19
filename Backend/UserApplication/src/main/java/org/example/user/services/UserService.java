package org.example.user.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Table;
import jakarta.transaction.Transactional;
import org.example.user.dtos.UserDTO;
import org.example.user.dtos.builders.UserBuilder;
import org.example.user.entities.User;
import org.example.user.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.*;
import org.springframework.http.client.ClientHttpRequest;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RequestCallback;
import org.springframework.web.client.ResponseExtractor;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;


import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.stream.Collectors;

//import org.springframework.web.reactive.function.client.ClientResponse;
//import org.springframework.web.reactive.function.client.WebClient;
//import org.springframework.web.server.ResponseStatusException;
//import reactor.core.publisher.Mono;

//@RestController
@Service
@Table(name = "users")
public class UserService {
    private static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;

    @Autowired
    @Lazy
    private RestTemplate restTemplate;

    private WebClient webClient;

//    @Autowired
//    private ModelMapper mapper;



//    @Value("${DEVICE_URL}")
//    private String clientURL;
//
//    @Value("${CLIENT_PATH}")
//    private String clientPath;


    @Autowired
    public UserService(UserRepository userRepository, RestTemplate restTemplate, WebClient.Builder webClientBuilder) {
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
        this.webClient = webClientBuilder.baseUrl("http://device_application:8082").build();
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

//    public UUID insert(UserDTO userDTO) {
//        User user = UserBuilder.toEntity(userDTO);
//        user = userRepository.save(user);
//        return user.getId();
//    }

////    @Transactional
//    public UUID insert(UserDTO userDTO) {
//        User user = UserBuilder.toEntity(userDTO);
//        user = userRepository.save(user);
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("Content-Type", "application/json");
//
////        String url = String.format("%s/%s/%s/%s/%s/%s/%s", clientURL, clientPath, user.getId(), user.getName(), user.getUsername(), user.getPassword(), user.getRole());
//        String url = "http://device_application/device/addUser";
//        String requestBody = String.format(
//                "{\"id\":\"%s\", \"username\": \"%s\", \"password\": \"%s\", \"name\": \"%s\", \"role\": \"%s\"}",
//                user.getId().toString(),
//                user.getUsername(),
//                user.getPassword(),
//                user.getName(),
//                user.getRole() != null ? user.getRole().toString() : null
//        );
//
//        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
//
//        ResponseEntity<UUID> responseEntity = restTemplate.exchange(url, HttpMethod.POST, requestEntity, UUID.class);
//
//        if (responseEntity.getStatusCode() != HttpStatus.OK) {
//            throw new RuntimeException("Failed to insert user in device service: " + responseEntity.getStatusCode());
//        }
//
//        LOGGER.debug("Person with id {} was inserted in db", user.getId());
//        return user.getId();
//    }

//    public UUID insert(UserDTO simplePersonDTO) {
//        WebClient.RequestHeadersSpec<?> requestHeadersSpec = webClient.post()
//                .uri("/device/addUser")
//                .bodyValue(simplePersonDTO);
//        System.out.println(requestHeadersSpec);
//
//        ClientResponse response = requestHeadersSpec.exchange().block();
//
//        if (response != null && response.statusCode().equals(HttpStatus.CREATED)) {
//            return response.bodyToMono(UUID.class).block();
//        } else {
//            throw new RuntimeException("Failed to insert person in Device service. Status: " + response.statusCode());
//        }
//   }

    @Transactional
    public UUID insert(UserDTO userDTO) {
        User user = UserBuilder.toEntity(userDTO);
        user = userRepository.save(user);

        userDTO.setId(user.getId());

        String url = "http://deviceapplication:8080/device/addUser";

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

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

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

        String url = String.format("http://deviceapplication:8080/device/updateUser/%s",id);

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

        String url = String.format("http://deviceapplication:8080/device/deleteUser/%s",userId);

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


//    public UUID insert(UserDTO userDTO) {
//        String url = "http://device_application:8080/device/addUser";
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        HttpEntity<UserDTO> requestEntity = new HttpEntity<>(userDTO, headers);
//
//        ResponseEntity<String> responseEntity = restTemplate.exchange(
//                url,
//                HttpMethod.POST,
//                requestEntity,
//                String.class
//        );
//
//        if (responseEntity.getStatusCode().is2xxSuccessful()) {
//            System.out.println("User sent to device backend successfully.");
//        } else {
//            System.out.println("Failed to send user to device backend: " + responseEntity.getStatusCode());
//        }
//        return null;
//    }

//    public UUID insert(UserDTO userDTO) {
//        String url = "http://device_application:8080/device/addUser";
//
//        ResponseEntity<String> responseEntity = restTemplate.execute(
//                url,
//                HttpMethod.POST,
//                new RequestCallback() {
//                    @Override
//                    public void doWithRequest(ClientHttpRequest request) throws IOException {
//                        request.getHeaders().setContentType(MediaType.APPLICATION_JSON);
//                        ObjectMapper objectMapper = new ObjectMapper(); // Assuming you're using Jackson
//                        String requestBody = objectMapper.writeValueAsString(userDTO);
//                        request.getBody().write(requestBody.getBytes());
//                    }
//                },
//                new ResponseExtractor<ResponseEntity<String>>() {
//                    @Override
//                    public ResponseEntity<String> extractData(ClientHttpResponse response) throws IOException {
//                        HttpStatusCode statusCode = response.getStatusCode();
//                        String responseBody = StreamUtils.copyToString(response.getBody(), StandardCharsets.UTF_8);
//                        return new ResponseEntity<>(responseBody, statusCode);
//                    }
//                }
//        );
//
//        if (responseEntity.getStatusCode().is2xxSuccessful()) {
//            System.out.println("User sent to device backend successfully.");
//            return null;
//        } else {
//            System.out.println("Failed to send user to device backend: " + responseEntity.getStatusCode());
//            return null;
//        }
//    }



//    public Mono<String> insert(UserDTO user) {
//        return webClient.post()
//                .uri("/device/addUser/") // The endpoint you want to post to
//                .bodyValue(user) // Set the request body
//                .retrieve() // Retrieve the response
//                .bodyToMono(String.class); // Expecting a response body of type String (customize as needed)
//    }


////    @Transactional
//    public UUID insert(UserDTO userDTO) {
//        User user = UserBuilder.toEntity(userDTO);
//        user = userRepository.save(user);
//
//        try {
//            String url = "http://assignment1-device_application:8080/device/addUser";
//
//            String authorizationHeader = "Basic " + DatatypeConverter.printBase64Binary((user.getId() + ":" + user.getName() +":" + user.getPassword() + ":" + user.getRole()).getBytes());
//
//            restTemplate = new RestTemplate();
//
//            HttpHeaders requestHeaders = new HttpHeaders();
//            requestHeaders.setContentType(MediaType.APPLICATION_JSON);
//            requestHeaders.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
//            requestHeaders.add("Authorization", authorizationHeader);
//
//            HttpEntity<User> requestEntity = new HttpEntity<>(user, requestHeaders);
//
//            ResponseEntity<User> responseEntity = restTemplate.exchange(
//                    url,
//                    HttpMethod.POST,
//                    requestEntity,
//                    User.class
//            );
//
//            if(responseEntity.getStatusCode() == HttpStatus.OK){
//    //            UserDTO user = responseEntity.getBody();
//                System.out.println("user response retrieved ");
//            }
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//        return null;
//    }

//    public void update(UUID id, UserDTO userDTO) {
//        Optional<User> userOptional = userRepository.findById(id);
//        if (!userOptional.isPresent()) {
//            LOGGER.error("User with id {} was not found in db", id);
//            throw new ResourceNotFoundException(User.class.getSimpleName() + " with id: " + id);
//        }
//
//        User user = userOptional.get();
//
//        user.setUsername(userDTO.getUsername());
//        user.setPassword(userDTO.getPassword());
//        user.setName(userDTO.getName());
//        user.setRole(userDTO.getRole());
//
//        userRepository.save(user);
//    }
//
//    public void delete(UUID id) {
//        Optional<User> userOptional = userRepository.findById(id);
//        if (!userOptional.isPresent()) {
//            LOGGER.error("User with id {} was not found in db", id);
//            throw new ResourceNotFoundException(User.class.getSimpleName() + " with id: " + id);
//        }
//
//        User user = userOptional.get();
//
//        userRepository.delete(user);
//    }

    public UserDTO loginUser(String username, String hashedPassword) {
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
