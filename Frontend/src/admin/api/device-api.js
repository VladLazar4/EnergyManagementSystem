import {HOST_DEVICE} from "../../commons/hosts.js";
import RestApiClient from "../../commons/api/rest-client";



const endpoint = {
    device: '/device',
    user: '/user'
};

function getDevices(callback) {
    let request = new Request(HOST_DEVICE.backend_api + endpoint.device, {
        method: 'GET',
    });

    RestApiClient.performRequest(request, callback);
}

function getDeviceById(params, callback){
    let request = new Request(HOST_DEVICE.backend_api + endpoint.device + params.id, {
        method: 'GET'
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function postDevice(device, callback){
    console.log(device);
    let request = new Request(HOST_DEVICE.backend_api + endpoint.device, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(device)
    });

    RestApiClient.performRequest(request, callback);
}

function updateDevice(deviceId, deviceData, callback){
    let request = new Request(HOST_DEVICE.backend_api + endpoint.device + '/' + deviceId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceData),
    });

    return RestApiClient.performRequest(request,callback);
}

function deleteDevice(deviceId, callback){
    const endpointUrl = `${HOST_DEVICE.backend_api}${endpoint.device}/${deviceId}`;

    let request = new Request(endpointUrl, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    return RestApiClient.performRequest(request, callback);
}

function getUsers(callback) {
    let request = new Request(HOST_DEVICE.backend_api + endpoint.user + "/getUsers", {
        method: 'GET',
    });
    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

export {
    getDevices,
    getDeviceById,
    postDevice,
    updateDevice,
    deleteDevice,
    getUsers
};
