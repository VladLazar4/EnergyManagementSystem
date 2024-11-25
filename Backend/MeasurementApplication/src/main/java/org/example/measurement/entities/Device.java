package org.example.measurement.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "devices",
        uniqueConstraints = {
        @UniqueConstraint(columnNames = "name")
        })
public class Device {
    @Id
//    @GeneratedValue(generator = "uuid2")
//    @GenericGenerator(name = "uuid2", strategy = "uuid2")
//    @Type(type = "uuid-binary")
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "maxHourlyConsumption", nullable = false)
    private Float maxHourlyConsumption;

    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
//    @Type(type = "uuid-binary")
    @Column(name = "ownerId", nullable = false)
    private UUID ownerId;

    public Device(UUID id, String name, String description, String address, Float maxHourlyConsumption, UUID ownerId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.maxHourlyConsumption = maxHourlyConsumption;
        this.ownerId = ownerId;
    }

    public Device() {

    }
}
