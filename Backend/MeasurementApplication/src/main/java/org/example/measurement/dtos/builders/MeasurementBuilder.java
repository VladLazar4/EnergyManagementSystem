package org.example.measurement.dtos.builders;


import org.example.measurement.dtos.MeasurementDTO;

public class MeasurementBuilder {
    private MeasurementBuilder(){

    }

    public static MeasurementDTO toMeasurementDTO(org.example.measurement.entities.Measurement measurement) {
        return new MeasurementDTO(measurement.getId(), measurement.getTimestamp(), measurement.getDeviceId(), measurement.getMeasurementValue());
    }


    public static org.example.measurement.entities.Measurement toEntity(MeasurementDTO measurementDTO) {
        return new org.example.measurement.entities.Measurement(measurementDTO.getId(), measurementDTO.getTimestamp(), measurementDTO.getDeviceId(), measurementDTO.getMeasurementValue());
    }
}
