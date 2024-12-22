import React from 'react';
import * as API_USER from "./api/user-api";
import * as API_DEVICES from "./api/device-api";
import * as API_CHAT from "./api/chat-api";
import * as API_MEASUREMENTS from "./api/measurement-api";
import DeviceTable from "../client/components/device-table";
import NavigationBar from "../navigation-bar";
import MeasurementChart from "./components/measurement-chart";
import { Card, CardHeader, CardBody, Col, Row, Button, Input, ModalBody, ModalHeader, Modal } from 'reactstrap';
import SockJS from 'sockjs-client';
import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";
import * as StompJS from "@stomp/stompjs";
import {HOST_CHAT, HOST_MEASUREMENT} from "../commons/hosts";
import CalendarComponent from "./components/calendar";
import ChatTable from "../client/components/chat-table";
import * as API_USERS from "../admin/api/user-api";
import selectedChat from "sockjs-client/lib/transport/receiver/jsonp";

class ClientContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deviceTableData: [],
            chartData: { labels: [], data: [] },
            deviceName: "",
            isLoaded: false,
            wsMessage: "",
            isMeasurementWsConnected: false,
            isChatWsConnected: false,
            stompClientMeasurement: null,
            stompClientChat: null,
            selectedDate: null,
            errorStatus: 0,
            error: null,
            userAuxTableData: [],
            chatTableData: [],
            selectedChat: null,
            messageInput: "",
            messages: [],
            isChatOpen: false,
            clientIdForNewChat: "",
            isCreateNewChatModalOpen: false,
            lastTypingSent: 0,
            typingUsers : [],
            seenStatus: {},
            clientId: JSON.parse(sessionStorage.getItem("person")).userId,
            clientUser: JSON.parse(sessionStorage.getItem("person")).username,

        };
        this.typingTimeouts = {};

        // Ensure the user is a client, otherwise redirect
        window.onload = () => {
            const personData = sessionStorage.getItem("person");
            if (personData) {
                const person = JSON.parse(personData);
                const userRole = person.role;
                if (userRole !== "client") {
                    window.location.href = "/";
                }
            } else {
                window.location.href = "/";
            }
        };
    }

    componentDidMount() {
        this.fetchClientDevices();
        this.setupWebSockets();
        this.fetchUsers();
        // this.fetchClientChats();
    }

    setupWebSockets() {
        this.setupWebSocketMeasurement();
        this.setupWebSocketChat();
    }

    setupWebSocketMeasurement() {
        const socket = new SockJS(HOST_MEASUREMENT.backend_api + '/ws');
        const stompClientMeasurement = new StompJS.Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (str) => console.log("[Measurement WebSocket]:", str),
        });

        stompClientMeasurement.onConnect = (frame) => {
            console.log("[Measurement WebSocket] Connected:", frame);
            stompClientMeasurement.subscribe("/topic/alerts", (notification) => {
                const notificationJson = JSON.parse(notification.body);
                const { deviceId, ownerId, value } = notificationJson;

                const personData = sessionStorage.getItem("person");
                const person = JSON.parse(personData);
                const clientId = person.userId;

                if (clientId === ownerId) {
                    const device = this.state.deviceTableData.find(device => device.id === deviceId);
                    const deviceName = device.name;
                    const message = `Device: ${deviceName} exceeded its max value, recorded ${value}`;
                    this.setState({ wsMessage: message });
                    alert(message);
                }
            });

            this.setState({ stompClientMeasurement, isMeasurementWsConnected: true });
        };

        stompClientMeasurement.onStompError = (frame) => {
            console.error("[Measurement WebSocket] Broker error:", frame.headers['message']);
            console.error("Details:", frame.body);
        };

        stompClientMeasurement.onDisconnect = () => {
            console.log("[Measurement WebSocket] Disconnected");
            this.setState({ isMeasurementWsConnected: false });
        };

        stompClientMeasurement.activate();
    }

    setupWebSocketChat() {
        const socket = new SockJS(HOST_CHAT.backend_api + '/ws');
        const stompClientChat = new StompJS.Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (str) => console.log("[Chat WebSocket]:", str),
        });

        stompClientChat.onConnect = () => {
            console.log("[Chat WebSocket] Connected to WebSocket server");

            const topic = `/topic/chat/${this.state.clientId}`;
            stompClientChat.subscribe(topic, (message) => {
                const newMessage = JSON.parse(message.body);
                this.setState(prevState => ({
                    messages: [...prevState.messages, newMessage]
                }));

                // anulam notificarea de typing
                this.setState((prevState) => {
                    const isUserAlreadyTyping = prevState.typingUsers.some(
                        (user) => user.senderId === newMessage.senderId
                    );

                    if (isUserAlreadyTyping) {
                        return null;
                    }

                    return {
                        typingUsers: [...prevState.typingUsers, newMessage],
                    };
                });

                if (this.typingTimeouts[newMessage.senderId]) {
                    clearTimeout(this.typingTimeouts[newMessage.senderId]);
                }

                this.typingTimeouts[newMessage.senderId] = setTimeout(() => {
                    this.setState((prevState) => ({
                        typingUsers: prevState.typingUsers.filter(
                            (user) => user.senderId !== newMessage.senderId
                        ),
                    }));
                }, 0);
                //marcam seen-ul la mesaj
                if(this.state.isChatOpen)
                    this.handleSeenMessage(newMessage.senderId);
            });

            const topicTyping = `/topic/typing/${this.state.clientId}`;
            stompClientChat.subscribe(topicTyping, (message) => {
                const newTypingUser = JSON.parse(message.body);

                if (newTypingUser.senderId !== this.state.clientId) {
                    this.setState((prevState) => {
                        const isUserAlreadyTyping = prevState.typingUsers.some(
                            (user) => user.senderId === newTypingUser.senderId
                        );

                        if (isUserAlreadyTyping) {
                            return null;
                        }

                        return {
                            typingUsers: [...prevState.typingUsers, newTypingUser],
                        };
                    });

                    if (this.typingTimeouts[newTypingUser.senderId]) {
                        clearTimeout(this.typingTimeouts[newTypingUser.senderId]);
                    }

                    this.typingTimeouts[newTypingUser.senderId] = setTimeout(() => {
                        this.setState((prevState) => ({
                            typingUsers: prevState.typingUsers.filter(
                                (user) => user.senderId !== newTypingUser.senderId
                            ),
                        }));
                    }, 5000);
                }
            });

            const topicSeen = `/topic/seen/${this.state.clientId}`;
            stompClientChat.subscribe(topicSeen, (message) => {
                const msg = JSON.parse(message.body);
                console.log(`${msg.senderId} has seen the message.`);

                this.setState(prevState => ({
                    messages: [
                        ...prevState.messages.filter(
                            message => !(message.senderUser === msg.senderUser && message.content === msg.content)
                        ),
                        msg
                    ]
                }));
            });

            this.setState({ stompClientChat, isChatWsConnected: true });
        };

        stompClientChat.onStompError = (frame) => {
            console.error("[Chat WebSocket] Error:", frame.headers['message']);
        };

        stompClientChat.onDisconnect = () => {
            console.log("[Chat WebSocket] Disconnected");
            this.setState({ isChatWsConnected: false });
        };

        stompClientChat.activate();
    }


    fetchClientDevices() {
        const personData = sessionStorage.getItem("person");
        const person = JSON.parse(personData);
        const ownerId = person.userId;

        API_DEVICES.getDeviceById({ ownerId }, (result, status, err) => {
            if (result !== null && status === 200) {
                this.setState({ deviceTableData: result, isLoaded: true });
            } else {
                this.setState({ errorStatus: status, error: err });
            }
        });
    }

    fetchDeviceMeasurements(deviceId) {
        if (this.state.selectedDate === null) {
            alert("Select a date first");
        } else {
            API_MEASUREMENTS.getMeasurementsByDeviceIdInDate(deviceId, this.state.selectedDate, (result, status, err) => {
                if (result !== null && status === 200) {
                    const timestamps = result.map(measurement => new Date(measurement.timestamp).toLocaleString());
                    const values = result.map(measurement => measurement.measurementValue);

                    this.setState({ chartData: { labels: timestamps, data: values } });
                } else {
                    this.setState({ errorStatus: status, error: err });
                }
            });
        }
    }

    fetchUsers() {
        API_USER.getUsers((result, status, err) => {
            if (result && status === 200) {
                this.setState({ userAuxTableData: result });
            } else {
                this.setState({ errorStatus: status, error: err });
            }
        });
    }

    // fetchClientChats() {
    //     API_CHAT.getOpenChats(this.state.clientId, (result, status, err) => {
    //         if (result !== null && status === 200) {
    //             const chatTableData = result;
    //             console.log(chatTableData);
    //
    //             chatTableData.forEach(chat => {
    //
    //                 API_USERS.getUserById(chat.adminId, (adminResult, adminStatus) => {
    //                     if (adminResult !== null && adminStatus === 200) {
    //                         chat.adminUser = adminResult.username;
    //                     } else {
    //                         chat.adminUser = "Unknown";
    //                     }
    //                     this.setState({ chatTableData });
    //                 });
    //
    //                 API_USERS.getUserById(chat.clientId, (clientResult, clientStatus) => {
    //                     if (clientResult !== null && clientStatus === 200) {
    //                         chat.clientUser = clientResult.username;
    //                     } else {
    //                         chat.clientUser = "Unknown";
    //                     }
    //                     this.setState({ chatTableData });
    //                 });
    //             });
    //
    //             this.setState({ isLoaded: true });
    //         } else {
    //             this.setState({ errorStatus: status, error: err });
    //         }
    //     });
    // }

    handleDeviceClick = (device) => {
        this.setState({ deviceName: device.name });
        this.fetchDeviceMeasurements(device.id);
    };

    handleDateSelect = (date) => {
        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        this.setState({ selectedDate: formatDate(date) });
    };

    handleRowClickChats = (user) => {
        this.setState({ selectedChat: user, isChatOpen: true });
        const { stompClientChat } = this.state;

        if (stompClientChat && stompClientChat.connected) {
            const topic = `/app/topic/chat/${user.id}`;
            stompClientChat.subscribe(topic, (message) => {
                const newMessage = JSON.parse(message.body);
                this.setState(prevState => ({
                    messages: [...prevState.messages, newMessage]
                }));
                console.log("MESSAGE: " + message.body);
            });

            const topicTyping = `/app/topic/typing/${user.id}`;
            stompClientChat.subscribe(topicTyping, (message) => {
                const newTypingUser = JSON.parse(message.body);
                this.setState(prevState => ({
                    typingUsers: [...prevState.typingUsers, newTypingUser]
                }));
                console.log("TYPING: " + newTypingUser);
            });

            const topicSeen = `/app/topic/seen/${user.id}`;
            stompClientChat.subscribe(topicSeen, (message) => {
                const newSeenUser = JSON.parse(message.body);
                this.setState(prevState => ({
                    messages: [...prevState.messages, newSeenUser]
                }));
                console.log("SEEN: " + newSeenUser);
            });

            this.setState({ selectedChat: user, isChatOpen: true});
        } else {
            console.error("WebSocket is not connected");
        }
        this.handleSeenMessage(user.id);
    };

    handleSeenMessage(receiverId){
        const { stompClientChat, clientId, clientUser, messages } = this.state;

        if(messages && messages.length > 0){
            console.log("DAU SEEN")

            const seenMessage = {
                senderId: clientId,
                senderUser: clientUser,
                receiverId: receiverId,
                timestamp: new Date().toISOString(),
            };
            stompClientChat.publish({
                destination: '/app/topic/seen',
                body: JSON.stringify(seenMessage),
            });
            console.log("AM TRIMIS SEEN")
            console.log()
        }
    };

    handleMessageInputChange = (event) => {
        this.setState({ messageInput: event.target.value });
    };

    handleSendMessage = () => {
        const { stompClientChat, messageInput, clientId, clientUser, selectedChat } = this.state;

        if (!messageInput.trim()) {
            return;
        }

        const message = {
            senderId: clientId,
            senderUser: clientUser,
            receiverId: selectedChat.id,
            content: messageInput,
            timestamp: new Date().toISOString()
        };

        if (stompClientChat && stompClientChat.connected) {
            stompClientChat.publish({
                destination: `/app/topic/chat`,
                body: JSON.stringify(message),
            });

            this.setState(prevState => ({
                messages: [...prevState.messages, message],
                messageInput: '',
            }));
        } else {
            console.error("WebSocket is not connected");
        }
    };

    handleTyping(){
        const { stompClientChat, selectedChat, clientId, clientUser} = this.state;

        const now = Date.now();
        if (
            this.state.stompClientChat && stompClientChat.connected &&
            now - this.state.lastTypingSent >= 5000
        ) {
            this.state.lastTypingSent = now;

            const typingMessage = {
                senderId: clientId,
                senderUser: clientUser,
                receiverId: selectedChat.id,
                timestamp: new Date().toISOString(),
            };
            stompClientChat.publish({
                destination: '/app/topic/typing',
                body:JSON.stringify(typingMessage),
            });
        }
    };

    toggleChatForm = () => {
        this.setState({ isChatOpen: !this.state.isChatOpen });
    };


    render() {
        return (
            <div>
                <NavigationBar/>
                <CardHeader className="text-center my-4">
                    <h3>Client - Device Management</h3>
                </CardHeader>

                <Modal isOpen={this.state.isChatOpen} toggle={this.toggleChatForm} size="lg">
                    <ModalHeader toggle={this.toggleChatForm}>
                        Chat with {this.state.selectedChat ? this.state.selectedChat.username : "Loading..."}
                    </ModalHeader>
                    <ModalBody>
                        <div className="chat-box">
                            {this.state.messages.map((message, index) => (
                                <div key={index} className="message">
                                    {message.content === null ? (
                                        <strong>SEEN by {message.senderUser}</strong>
                                    ) : (
                                        <>
                                            <strong>
                                                {message.senderId === this.state.clientId ? 'You' : message.senderUser}:
                                            </strong> {message.content}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        {this.state.typingUsers.map((user) => (
                            <div key={user.senderId}>
                                <em>{user.senderUser} is typing...</em>
                            </div>
                        ))}

                        {/* Message Input Box */}
                        <Input
                            type="text"
                            value={this.state.messageInput}
                            onChange={(e) => {
                                this.handleMessageInputChange(e);
                                this.handleTyping();
                            }}
                            placeholder="Type a message..."
                        />
                        <div className="d-flex justify-content-center">
                            <Button color="primary" onClick={this.handleSendMessage} className="mt-3">
                                Send Message
                            </Button>
                        </div>
                    </ModalBody>
                </Modal>

                <Card className="my-4">
                <CardBody>
                        <Row>
                            <Col sm="12">
                                {this.state.isLoaded ? (
                                    <DeviceTable tableData={this.state.deviceTableData}
                                                 onRowClick={this.handleDeviceClick}/>
                                ) : (
                                    <p>Loading devices...</p>
                                )}

                                {this.state.errorStatus > 0 && (
                                    <APIResponseErrorMessage errorStatus={this.state.errorStatus}
                                                             error={this.state.error}/>
                                )}
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <MeasurementChart chartData={this.state.chartData} deviceName={this.state.deviceName}/>

                <CalendarComponent onDateSelect={this.handleDateSelect}/>
                {this.state.selectedDate && <p>Selected Date: {this.state.selectedDate}</p>}

                <CardHeader className="text-center my-4">
                    <h2>Chat - select an admin from the list</h2>
                </CardHeader>
                <ChatTable
                    tableData={this.state.userAuxTableData}
                    onRowClick={this.handleRowClickChats}
                />
            </div>
        );
    }
}

export default ClientContainer;
