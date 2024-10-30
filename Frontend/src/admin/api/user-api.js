import {HOST} from "../../commons/hosts.js";
import RestApiClient from "../../commons/api/rest-client";

const endpoint = {
    user: '/user',
    device: '/device'
};

function getUsers(callback) {
    let request = new Request(HOST.backend_api_users + endpoint.user, {
        method: 'GET',
    });
    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function getUserById(params, callback){
    let request = new Request(HOST.backend_api_users + endpoint.user + params.id, {
       method: 'GET'
    });

    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function postUser(user, callback){
    let userRequest = new Request(HOST.backend_api_users + endpoint.user +'/add' , {
        method: 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
    });


    RestApiClient.performRequest(userRequest, (response) => {
        if (response) {
            user.id = response;
            let deviceRequest = new Request(HOST.backend_api_devices + endpoint.device + '/addUser', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user)
            });

            RestApiClient.performRequest(deviceRequest, (deviceResponse) => {
                if (deviceResponse) {
                    if (callback) callback(null, response);
                } else {
                    let deleteRequest = new Request(HOST.backend_api_users + endpoint.user + '/' + user.id, {
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        }
                    });

                    RestApiClient.performRequest(deleteRequest, (deleteResponse) => {
                        if (callback) callback(new Error('Failed to add user to devices, rolled back user addition'), deleteResponse);
                    });
                }
            });
        } else {
            if (callback) callback(new Error('Failed to add user'), response);
        }
    });
}

function updateUser(userId, userData, callback) {
    let userUpdateRequest = new Request(HOST.backend_api_users + endpoint.user + '/' + userId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    RestApiClient.performRequest(userUpdateRequest, (response) => {
        if (response) {
            let deviceUpdateRequest = new Request(HOST.backend_api_devices + endpoint.device + '/updateUser/' + userId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            RestApiClient.performRequest(deviceUpdateRequest, (deviceResponse) => {
                if (deviceResponse) {
                    if (callback) callback(null, response);
                } else {
                    let rollbackRequest = new Request(HOST.backend_api_users + endpoint.user + '/' + userId, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userData),
                    });

                    RestApiClient.performRequest(rollbackRequest, (rollbackResponse) => {
                        if (callback) callback(new Error('Failed to update user in devices, rolled back user update'), rollbackResponse);
                    });
                }
            });
        } else {
            if (callback) callback(new Error('Failed to update user'), response);
        }
    });
}



function deleteUser(userId, callback) {
    const userEndpointUrl = `${HOST.backend_api_users}${endpoint.user}/${userId}`;
    const deviceEndpointUrl = `${HOST.backend_api_devices}${endpoint.device}/deleteUser/${userId}`;

    let userDeleteRequest = new Request(userEndpointUrl, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    let deviceDeleteRequest = new Request(deviceEndpointUrl, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    RestApiClient.performRequest(userDeleteRequest, callback);
    RestApiClient.performRequest(deviceDeleteRequest, callback);
}


export {
    getUsers,
    getUserById,
    postUser,
    updateUser,
    deleteUser
};
