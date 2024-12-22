import {HOST_DEVICE} from "../../commons/hosts.js";
import RestApiClient from "../../commons/api/rest-client";

const endpoint = {
    device: '/device'
};

const token = sessionStorage.getItem('jwtToken');

function getDeviceById(params, callback){
    const ownerId = params.ownerId;
    let request = new Request(`${HOST_DEVICE.backend_api}${endpoint.device}/${ownerId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function postDevice(user, callback){
    let request = new Request(HOST_DEVICE.backend_api + endpoint.device , {
        method: 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(user)
    });

    console.log("URL: " + request.url);

    RestApiClient.performRequest(request, callback);
}

export {
    getDeviceById,
    postDevice
};
