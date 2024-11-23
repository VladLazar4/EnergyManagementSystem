package org.example.measurement.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "measurements")
public class Measurement {
    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "timestamp", nullable = false)
    private Timestamp timestamp;

    @Column(name = "deviceId", nullable = false)
    private UUID deviceId;

    @Column(name = "measurementValue", nullable = false)
    private Float measurementValue;

    public Measurement (){

    }

    public Measurement(UUID id, Timestamp timestamp, UUID deviceId, Float measurementValue) {
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
}
