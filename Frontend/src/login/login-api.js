import CryptoJS, { SHA256 } from "crypto-js";
import RestApiClient from "../commons/api/rest-client";
import {HOST_USER} from "../commons/hosts.js";

const endpoint = {
    login: '/user/login'
};

function loginUser(params, callback){
    const url = `${HOST_USER.backend_api}${endpoint.login}`;

    const hashedPassword = CryptoJS.SHA256(params.password).toString();

    const requestBody = JSON.stringify({
        username: params.username,
        password: hashedPassword
    });

    let request = new Request(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: requestBody,
        credentials: 'include'
    });
    console.log("URL: " + request.url);
    console.log("hashedPassword: " + hashedPassword);
    console.log("requestBody: " + JSON.stringify(requestBody));

    RestApiClient.performRequest(request, callback);

}

export {
    loginUser
}