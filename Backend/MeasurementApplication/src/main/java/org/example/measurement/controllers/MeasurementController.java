package org.example.measurement.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.measurement.services.MeasurementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
//import reactor.core.publisher.Mono;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

@RestController
@CrossOrigin
@RequestMapping("/measurement")
@Tag(name = "Measurement Controller", description = "API for managing measurements")
public class MeasurementController {
    private final MeasurementService measurementService;

    @Autowired
    public MeasurementController(MeasurementService measurementService) {
        this.measurementService = measurementService;
    }
}

