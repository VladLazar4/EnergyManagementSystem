package org.example.measurement.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
//import lombok.Builder;
//import lombok.Data;
import org.springframework.hateoas.RepresentationModel;

import java.sql.Timestamp;
import java.util.Objects;
import java.util.UUID;

public class MeasurementDTO extends RepresentationModel<MeasurementDTO> {
    @JsonProperty("id")
    private UUID id;
    @JsonProperty("timestamp")
    private Timestamp timestamp;
    @JsonProperty("deviceId")
    private UUID deviceId;
    @JsonProperty("measurementValue")
    private Float measurementValue;

    public MeasurementDTO(){

    }
    public MeasurementDTO(UUID id, Timestamp timestamp, UUID deviceId, Float measurementValue) {
        this.id = id;
        this.timestamp = timestamp;
        this.deviceId = deviceId;
        this.measurementValue = measurementValue;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Timestamp getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
    }

    public UUID getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(UUID deviceId) {
        this.deviceId = deviceId;
    }

    public Float getMeasurementValue() {
        return measurementValue;
    }

    public void setMeasurementValue(Float measurementValue) {
        this.measurementValue = measurementValue;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        MeasurementDTO that = (MeasurementDTO) o;
        return Objects.equals(id, that.id) && Objects.equals(timestamp, that.timestamp) && Objects.equals(deviceId, that.deviceId) && Objects.equals(measurementValue, that.measurementValue);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), id, timestamp, deviceId, measurementValue);
    }
}
