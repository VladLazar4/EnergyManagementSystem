package org.example.devices.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Device Controller", description = "API for managing devices and users")
public class DeviceController {
    private final DeviceService deviceService;
    private final UserService userService;

    @Autowired
    public DeviceController(DeviceService deviceService, UserService userService) {
        this.deviceService = deviceService;
        this.userService = userService;
    }

    @Operation(summary = "Get all devices")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved devices",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = DeviceDTO.class)))
    @GetMapping()
    public ResponseEntity<List<DeviceDTO>> getDevices() {
        List<DeviceDTO> dtos = deviceService.findDevices();
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @Operation(summary = "Get devices by owner ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Devices found"),
            @ApiResponse(responseCode = "404", description = "Devices not found for given ownerId")
    })
    @GetMapping("/{ownerId}")
    public ResponseEntity<List<DeviceDTO>> getDevices(@PathVariable UUID ownerId) {
        List<DeviceDTO> dtos = deviceService.findDeviceByOwnerId(ownerId);
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @Operation(summary = "Create a new device")
    @ApiResponse(responseCode = "201", description = "Device created successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UUID.class)))
    @PostMapping()
    public ResponseEntity<UUID> createDevice(@Valid @RequestBody DeviceDTO deviceDTO) {
        UUID userId = deviceService.insert(deviceDTO);
        return new ResponseEntity<>(userId, HttpStatus.CREATED);
    }

    @Operation(summary = "Update a device")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Device updated successfully"),
            @ApiResponse(responseCode = "404", description = "Device not found")
    })
    @PutMapping(value = "/{id}")
    public ResponseEntity<JSONObject> updateDevice(@PathVariable("id") UUID id, @Valid @RequestBody DeviceDTO deviceDTO) {
        deviceService.update(id, deviceDTO);
        return ResponseEntity.ok(new JSONObject());
    }

    @Operation(summary = "Delete a device")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Device deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Device not found")
    })
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<JSONObject> deleteDevice(@PathVariable("id") UUID id) {
        deviceService.delete(id);
        return ResponseEntity.ok(new JSONObject());
    }

    @Operation(summary = "Get all users")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved users",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDTO.class)))
    @GetMapping("/getUsers")
    public ResponseEntity<List<UserDTO>> getUsers() {
        List<UserDTO> dtos = userService.findUsers();
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @Operation(summary = "Add a new user")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    @PostMapping("/addUser")
    public ResponseEntity<?> addUser(@RequestBody(required = false) UserDTO userDTO) {
        if (userDTO == null) {
            return ResponseEntity.badRequest().body("User data is required");
        }

        UUID userId = userService.insert(userDTO);
        return new ResponseEntity<>(userId, HttpStatus.CREATED);
    }

    @Operation(summary = "Update an existing user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping(value = "/updateUser/{id}")
    public ResponseEntity<JSONObject> updateUser(@PathVariable("id") UUID id, @Valid @RequestBody UserDTO userDTO) {
        userService.update(id, userDTO);
        return ResponseEntity.ok(new JSONObject());
    }

    @Operation(summary = "Delete a user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User deleted successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping(value = "/deleteUser/{id}")
    public ResponseEntity<JSONObject> deleteUser(@PathVariable("id") UUID id) {
        userService.delete(id);
        return ResponseEntity.ok(new JSONObject());
    }
}

