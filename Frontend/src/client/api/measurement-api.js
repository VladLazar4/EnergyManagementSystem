import { HOST_MEASUREMENT } from "../../commons/hosts.js";
import RestApiClient from "../../commons/api/rest-client";

function getMeasurementsByDeviceId(deviceId, callback) {
    console.log(deviceId);
    let request = new Request(`${HOST_MEASUREMENT.backend_api}/${deviceId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
    });

    RestApiClient.performRequest(request, callback);
}

export { getMeasurementsByDeviceId };
