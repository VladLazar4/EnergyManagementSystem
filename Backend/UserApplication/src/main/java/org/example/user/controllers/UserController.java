package org.example.user.controllers;

import org.example.user.dtos.UserDTO;
import org.example.user.entities.User;
import org.example.user.services.UserService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.hateoas.Link;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//import reactor.core.publisher.Mono;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import javax.validation.Valid;
import java.util.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@CrossOrigin
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping()
    public ResponseEntity<List<UserDTO>> getUsers() {
        List<UserDTO> dtos = userService.findUsers();
        for (UserDTO dto : dtos) {
            Link userLink = linkTo(methodOn(UserController.class)
                    .getUser(dto.getId())).withRel("userDetails");
            dto.add(userLink);
        }
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable("id") UUID id) {
        UserDTO dto = userService.findUserById(id);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @PostMapping("/add")
    public UUID addUser(@Valid @RequestBody UserDTO userDTO) {
        System.out.println(userDTO.toString());
        UUID id = userService.insert(userDTO);
//        return new ResponseEntity<>(userId, HttpStatus.CREATED);
//        return userService.insert(userDTO);
        return id;
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<JSONObject> updateUser(@PathVariable("id") UUID id, @Valid @RequestBody UserDTO userDTO) {
        userService.update(id, userDTO);
        return ResponseEntity.ok(new JSONObject());
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<JSONObject> deleteUser(@PathVariable("id") UUID id) {
        userService.delete(id);
        return ResponseEntity.ok(new JSONObject());
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> loginUser(@Valid @RequestBody UserDTO userDTO) {
        String username = userDTO.getUsername();
        String hashedPassword = userDTO.getPassword();

        UserDTO authenticatedUser;
        try {
            authenticatedUser = userService.loginUser(username, hashedPassword);
        } catch (ResourceNotFoundException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // 401 status
        }

        if (authenticatedUser != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", authenticatedUser.getUsername());
            response.put("userRole", authenticatedUser.getRole());
            response.put("id", authenticatedUser.getId());
            return new ResponseEntity<>(authenticatedUser, HttpStatus.OK);
        } else {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

//    public String decryptPassword(String encryptedPassword, String secretKey) throws Exception {
//        SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(), "AES");
//        Cipher cipher = Cipher.getInstance("AES");
//        cipher.init(Cipher.DECRYPT_MODE, keySpec);
//        byte[] decodedBytes = Base64.getDecoder().decode(encryptedPassword);
//        return new String(cipher.doFinal(decodedBytes));
//    }
}

