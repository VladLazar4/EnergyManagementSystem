package org.example.measurement.dtos;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
public class DeviceDTO extends RepresentationModel<DeviceDTO> {
    private UUID id;
    private String name;
    private String description;
    private String address;
    private Float maxHourlyConsumption;
    private UUID ownerId;

    public DeviceDTO() {
    }

    @JsonCreator
    public DeviceDTO(@JsonProperty("id") UUID id,
                     @JsonProperty("name") String name,
                     @JsonProperty("description") String description,
                     @JsonProperty("address") String address,
                     @JsonProperty("maxHourlyConsumption") float maxHourlyConsumption,
                     @JsonProperty("ownerId") UUID ownerId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.maxHourlyConsumption = maxHourlyConsumption;
        this.ownerId = ownerId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        DeviceDTO deviceDTO = (DeviceDTO) o;
        return Objects.equals(id, deviceDTO.id) && Objects.equals(name, deviceDTO.name) && Objects.equals(description, deviceDTO.description) && Objects.equals(address, deviceDTO.address) && Objects.equals(maxHourlyConsumption, deviceDTO.maxHourlyConsumption) && Objects.equals(ownerId, deviceDTO.ownerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), id, name, description, address, maxHourlyConsumption, ownerId);
    }
}
