import { HOST_MEASUREMENT } from "../../commons/hosts.js";
import RestApiClient from "../../commons/api/rest-client";

const token = sessionStorage.getItem('jwtToken');

function getMeasurementsByDeviceIdInDate(deviceId, selectedDate, callback) {
    console.log(deviceId);
    let request = new Request(`${HOST_MEASUREMENT.backend_api}/measurement/${deviceId}/${selectedDate}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token
        },
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

export { getMeasurementsByDeviceIdInDate };
