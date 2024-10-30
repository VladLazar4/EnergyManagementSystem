package org.example.devices.controllers;

import org.example.devices.dtos.DeviceDTO;
import org.example.devices.dtos.UserDTO;
import org.example.devices.services.DeviceService;
import org.example.devices.services.UserService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping("/device")
public class DeviceController {
    private final DeviceService deviceService;
    private final UserService userService;

    @Autowired
    public DeviceController(DeviceService deviceService, UserService userService) {
        this.deviceService = deviceService;
        this.userService = userService;
    }

    @GetMapping()
    public ResponseEntity<List<DeviceDTO>> getDevices() {
        List<DeviceDTO> dtos = deviceService.findDevices();
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @GetMapping("/{ownerId}")
    public ResponseEntity<List<DeviceDTO>> getDevices(@PathVariable UUID ownerId) {
        List<DeviceDTO> dtos = deviceService.findDeviceByOwnerId(ownerId);
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<UUID> createDevice(@Valid @RequestBody DeviceDTO deviceDTO) {
        UUID userId = deviceService.insert(deviceDTO);
        return new ResponseEntity<>(userId, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<JSONObject> updateDevice(@PathVariable("id") UUID id, @Valid @RequestBody DeviceDTO deviceDTO) {
        deviceService.update(id, deviceDTO);
        return ResponseEntity.ok(new JSONObject());
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<JSONObject> deleteDevice(@PathVariable("id") UUID id) {
        deviceService.delete(id);
        return ResponseEntity.ok(new JSONObject());
    }

    @GetMapping("/getUsers")
    public ResponseEntity<List<UserDTO>> getUsers() {
        List<UserDTO> dtos = userService.findUsers();
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @PostMapping("/addUser")
    public ResponseEntity<?> addUser(@RequestBody(required = false) UserDTO userDTO) {
        if (userDTO == null) {
            return ResponseEntity.badRequest().body("User data is required");
        }

        UUID userId = userService.insert(userDTO);
        return new ResponseEntity<>(userId, HttpStatus.CREATED);
    }

    @PutMapping(value = "/updateUser/{id}")
    public ResponseEntity<JSONObject> updateUser(@PathVariable("id") UUID id, @Valid @RequestBody UserDTO userDTO) {
        userService.update(id, userDTO);
        return ResponseEntity.ok(new JSONObject());
    }

    @DeleteMapping(value = "/deleteUser/{id}")
    public ResponseEntity<JSONObject> deleteUser(@PathVariable("id") UUID id) {
        userService.delete(id);
        return ResponseEntity.ok(new JSONObject());
    }
}

