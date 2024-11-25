package org.example.measurement.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.measurement.dtos.MeasurementDTO;
import org.example.measurement.services.MeasurementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

@RestController
@CrossOrigin
@RequestMapping()
@Tag(name = "Measurement Controller", description = "API for managing measurements")
public class MeasurementController {
    private final MeasurementService measurementService;

    @Autowired
    public MeasurementController(MeasurementService measurementService) {
        this.measurementService = measurementService;
    }

    @GetMapping()
    public void getAllMeasurements() {
        System.out.println("All measurements");
    }

    @Operation(summary = "Get measurement by device ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Measurements found"),
            @ApiResponse(responseCode = "404", description = "Measurements not found for given deviceId")
    })
    @GetMapping("/{deviceId}")
    public ResponseEntity<List<MeasurementDTO>> getMeasurementsByDeviceId(@PathVariable UUID deviceId) {
        List<MeasurementDTO> dtos = measurementService.findMeasurementsByDeviceId(deviceId);
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }
}

