import {HOST_CHAT} from "../../commons/hosts.js";
import RestApiClient from "../../commons/api/rest-client";

const endpoint = {
    chat: '/chat',
    message: '/message',
    newChat: '/newChat',
};

const token = sessionStorage.getItem('jwtToken');

function getOpenChats(adminId, callback) {
    let request = new Request(HOST_CHAT.backend_api + endpoint.chat + "/client/" + adminId, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function createNewChat(adminId, clientId, callback) {
    let request = new Request(HOST_CHAT.backend_api + endpoint.chat + endpoint.newChat, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ adminId, clientId })
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

export {
    getOpenChats,
    createNewChat,
};
