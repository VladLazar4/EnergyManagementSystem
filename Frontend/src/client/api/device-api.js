import {HOST} from "../../commons/hosts.js";
import RestApiClient from "../../commons/api/rest-client";



const endpoint = {
    device: '/device'
};

function getDeviceById(params, callback){
    const ownerId = params.ownerId;
    let request = new Request(`${HOST.backend_api_devices}${endpoint.device}/${ownerId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function postDevice(user, callback){
    let request = new Request(HOST.backend_api_devices + endpoint.device , {
        method: 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
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
