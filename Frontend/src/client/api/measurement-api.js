import { HOST_MEASUREMENT } from "../../commons/hosts.js";
import RestApiClient from "../../commons/api/rest-client";

function getMeasurementsByDeviceIdInDate(deviceId, selectedDate, callback) {
    console.log(deviceId);
    let request = new Request(`${HOST_MEASUREMENT.backend_api}/measurement/${deviceId}/${selectedDate}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
    });

    RestApiClient.performRequest(request, callback);
}

export { getMeasurementsByDeviceIdInDate };
