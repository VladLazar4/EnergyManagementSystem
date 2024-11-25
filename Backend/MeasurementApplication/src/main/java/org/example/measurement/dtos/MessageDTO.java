package org.example.measurement.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;

@Getter
@Setter
public class MessageDTO {
    @JsonProperty("operation")
    private String operation;
    @JsonProperty("message")
    private DeviceDTO device;

    public MessageDTO(String operation, DeviceDTO device) {
        this.operation = operation;
        this.device = device;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MessageDTO that = (MessageDTO) o;
        return Objects.equals(operation, that.operation) && Objects.equals(device, that.device);
    }

    @Override
    public int hashCode() {
        return Objects.hash(operation, device);
    }
}
