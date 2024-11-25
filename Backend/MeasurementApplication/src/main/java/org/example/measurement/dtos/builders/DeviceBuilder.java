package org.example.measurement.dtos.builders;


import org.example.measurement.dtos.DeviceDTO;
import org.example.measurement.entities.Device;

public class DeviceBuilder {
    private DeviceBuilder(){

    }

    public static DeviceDTO toDeviceDTO(Device device) {
        return new DeviceDTO(device.getId(), device.getName(), device.getDescription(), device.getAddress(), device.getMaxHourlyConsumption(), device.getOwnerId());
    }


    public static Device toEntity(DeviceDTO deviceDTO) {
        return new Device(deviceDTO.getId(), deviceDTO.getName(), deviceDTO.getDescription(), deviceDTO.getAddress(), deviceDTO.getMaxHourlyConsumption(), deviceDTO.getOwnerId());
    }
}
