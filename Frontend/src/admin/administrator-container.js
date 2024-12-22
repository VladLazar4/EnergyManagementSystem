import React from 'react';
import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    Col,
    Modal,
    ModalBody,
    ModalHeader,
    Row, Input
} from 'reactstrap';
import UserForm from "./components/user-form";
import DeviceForm from "./components/device-form";
import * as API_USERS from "./api/user-api";
import * as API_DEVICES from "./api/device-api";
import * as API_CHATS from "./api/chat-api";
import UserTable from "./components/user-table";
import DeviceTable from "./components/device-table";
import ChatTable from "./components/chat-table";
import NavigationBar from "../navigation-bar";
import SockJS from "sockjs-client";
import {HOST_CHAT} from "../commons/hosts";
import * as StompJS from "@stomp/stompjs";
import {forEach} from "react-bootstrap/ElementChildren";

class AdministratorContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedUser: false,
            selectedDevice: false,
            selectedChat: false,
            tableType: 'chat',
            userTableData: [],
            deviceTableData: [],
            userAuxTableData: [],
            chatTableData: [],
            isChatOpen: false,
            selectedUsers: [],
            stompClientChat: [],
            lastTypingSent: 0,
            typingUsers : [],
            seenStatus : {},
            isLoaded: false,
            errorStatus: 0,
            error: null,
            selectedRow: null,
            confirmDelete: false,
            clientIdForNewChat: '',
            adminId: JSON.parse(sessionStorage.getItem("person")).userId,
            adminUser: JSON.parse(sessionStorage.getItem("person")).username,
            messages: [],
            isTyping: false,
            messageInput: ''
        };
        this.typingTimeouts = {};


        this.toggleUserForm = this.toggleUserForm.bind(this);
        this.toggleDeviceForm = this.toggleDeviceForm.bind(this);
        this.toggleChatForm = this.toggleChatForm.bind(this);
        this.setTableType = this.setTableType.bind(this);
        this.handleRowClickDevices = this.handleRowClickDevices.bind(this);
        this.handleRowClickUsers = this.handleRowClickUsers.bind(this);
        this.reload = this.reload.bind(this);
        this.onChange = this.onChange.bind(this);
        this.openSockets = this.openSockets.bind(this);
        this.handleOpenChat = this.handleOpenChat.bind(this);
        this.handleCloseConversation = this.handleCloseConversation.bind(this);

        window.onload = function (){
            const personData = sessionStorage.getItem("person");
            if(personData){
                let person = JSON.parse(personData);
                let userRole = person.role;
                if(userRole !== "admin"){
                    window.location.href="/";
                }
            } else{
                window.location.href="/";
            }
        }

    }

    componentDidMount() {
        this.fetchUsers();
        this.fetchDevices();
        this.setupWebSocketChat();
    }

    fetchUsers() {
        return API_USERS.getUsers((result, status, err) => {
            if (result !== null && status === 200) {
                this.setState({
                    userTableData: result,
                    isLoaded: true
                });
            } else {
                this.setState({ errorStatus: status, error: err });
            }
        });
    }


    fetchDevices() {
        return API_DEVICES.getDevices((result, status, err) => {
            if (result !== null && status === 200) {
                this.setState({
                    deviceTableData: result,
                    isLoaded: true
                });

                API_DEVICES.getUsers((result2, status2, err2) => {
                    if (result !== null && status === 200) {
                        this.setState({
                            userAuxTableData: result2,
                            isLoaded: true
                        });
                    }
                });
            } else {
                this.setState({ errorStatus: status, error: err });
            }
        });
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

            const topic = `/topic/chat/${this.state.adminId}`;
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

                this.handleSeenOneMessage(newMessage.senderId);
            });

            const topicTyping = `/topic/typing/${this.state.adminId}`;
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

                console.log(newTypingUser);
            });

            const topicSeen = `/topic/seen/${this.state.adminId}`;
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

    setTableType(tableType) {
        this.setState({ tableType });
    }

    toggleUserForm() {
        this.setState({ selectedUser: !this.state.selectedUser, selectedRow: null });
    }

    toggleDeviceForm() {
        this.setState({ selectedDevice: !this.state.selectedDevice, selectedRow: null });
    }

    toggleChatForm() {
        this.setState({ isChatOpen: !this.state.isChatOpen });
    };

    handleOpenChat(){
        if (this.state.selectedUsers.length === 0) {
            alert("You have to select at least one user to start a chat with");
        } else {
            console.log(this.state.selectedUsers);

            this.state.selectedUsers.forEach(user => {
                this.openSockets(user);
            });
            console.log(this.state.isChatOpen);
            this.handleSeenAllMessages();
        }
    }

    handleRowClickUsers(row) {
        this.setState({ selectedRow: row, selectedUser: true });
    }

    handleRowClickDevices(row) {
        this.setState({ selectedRow: row, selectedDevice: true });
    }

    openSockets(user){
        const { stompClientChat } = this.state;

        if (stompClientChat && stompClientChat.connected) {
            const topic = `/app/topic/chat/${user.id}`;

            stompClientChat.subscribe(topic, (message) => {
                const newMessage = JSON.parse(message.body);
                this.setState(prevState => ({
                    messages: [...prevState.messages, newMessage]
                }));
            });

            const topicTyping = `/app/topic/typing/${user.id}`;
            stompClientChat.subscribe(topicTyping, (message) => {
                const newTypingUser = JSON.parse(message.body);
                this.setState(prevState => ({
                    typingUsers: [...prevState.typingUsers, newTypingUser]
                }));
            });

            const topicSeen = `/app/topic/seen/${user.id}`;
            stompClientChat.subscribe(topicSeen, (message) => {
                const newSeenUser = JSON.parse(message.body);
                    this.setState(prevState => ({
                        messages: [...prevState.messages, newSeenUser]
                    }));
            });

            this.setState({ selectedChat: user, isChatOpen: true }, () => {
                console.log(this.state.isChatOpen);
            });

        } else {
            console.error("WebSocket is not connected");
        }
    }

    handleSeenAllMessages(){
        const { selectedUsers, stompClientChat, adminId, adminUser, messages } = this.state;
        selectedUsers.forEach(user => {
            console.log(user)
            console.log(messages)
            const hasMessageFromUser = messages.some(message => message.senderId === user.id);

            if (hasMessageFromUser) {
                const seenMessage = {
                    senderId: adminId,
                    senderUser: adminUser,
                    receiverId: user.id,
                    timestamp: new Date().toISOString(),
                };
                stompClientChat.publish({
                    destination: '/app/topic/seen',
                    body: JSON.stringify(seenMessage),
                });
            }
        });
    };

    handleSeenOneMessage(receiverId){
        const { stompClientChat, adminId, adminUser, messages, isChatOpen } = this.state;

        if(messages && messages.length > 0 && isChatOpen){
            console.log("DAU SEEN")

            const seenMessage = {
                senderId: adminId,
                senderUser: adminUser,
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
    }

    onChange(user) {
        this.setState((prevState) => {
            const userExists = prevState.selectedUsers.some(u => u.id === user.id);
            if (userExists) {
                return {
                    selectedUsers: prevState.selectedUsers.filter(u => u.id !== user.id)
                };
            } else {
                return {
                    selectedUsers: [...prevState.selectedUsers, { id: user.id, username: user.username }]
                };
            }
        });
    }


    handleMessageInputChange = (event) => {
        this.setState({ messageInput: event.target.value });
    };

    handleSendMessage = (receiver) => {
        const { stompClientChat, messageInput, adminId, adminUser } = this.state;

        if (!messageInput.trim()) {
            return;
        }

        const message = {
            senderId: adminId,
            senderUser: adminUser,
            receiverId: null,
            content: messageInput,
            timestamp: new Date().toISOString()
        };

        this.state.selectedUsers.forEach(user => {
            message.receiverId = user.id;

            if (stompClientChat && stompClientChat.connected) {
                stompClientChat.publish({
                    destination: `/app/topic/chat`,
                    body: JSON.stringify(message),
                });
            } else {
                console.error("WebSocket is not connected");
            }
        });
        this.setState(prevState => ({
            messages: [...prevState.messages, message],
            messageInput: '',
        }));
    };

    handleTyping(){
        const { stompClientChat, adminId, adminUser} = this.state;

        const now = Date.now();
        if (
            this.state.stompClientChat && stompClientChat.connected &&
            now - this.state.lastTypingSent >= 5000
        ) {
            this.state.lastTypingSent = now;

            this.state.selectedUsers.forEach(user => {

                const typingMessage = {
                    senderId: adminId,
                    senderUser: adminUser,
                    receiverId: user.id,
                    receiverUsername: user.username,
                    timestamp: new Date().toISOString(),
                };
                stompClientChat.publish({
                    destination: '/app/topic/typing',
                    body:JSON.stringify(typingMessage),
                });
            });
        }
    };

    handleCloseConversation(){
        this.setState({isChatOpen: false});
        this.state.stompClientChat.onDisconnect();
    }

    reload() {
        this.setState({ isLoaded: false });
        this.fetchUsers();
        this.fetchDevices();
    }

    render() {
        const { tableType, userTableData, userAuxTableData, deviceTableData, isLoaded, errorStatus, error, selectedRow } = this.state;

        return (
            <div>
                <NavigationBar />
                <CardHeader className="text-center my-4">
                    <h3><strong>Administrator - User, Device, and Chat Management</strong></h3>
                </CardHeader>

                <CardBody>
                    <Row>
                        <Col sm="8">
                            <div className="d-flex justify-content-start">
                                <Button
                                    color={tableType === 'users' ? 'primary' : 'secondary'}
                                    onClick={() => this.setTableType('users')}
                                    className="mr-2"
                                >
                                    Users
                                </Button>
                                <Button
                                    color={tableType === 'devices' ? 'primary' : 'secondary'}
                                    onClick={() => this.setTableType('devices')}
                                    className="mr-2"
                                >
                                    Devices
                                </Button>
                                <Button
                                    color={tableType === 'chat' ? 'primary' : 'secondary'}
                                    onClick={() => this.setTableType('chat')}
                                >
                                    Chat
                                </Button>
                            </div>
                        </Col>
                        <Col sm="4" className="text-center mb-2">
                            {tableType === 'users' && (
                                <Button color="primary" onClick={this.toggleUserForm}>
                                    Add User
                                </Button>
                            )}
                            {tableType === 'devices' && (
                                <Button color="primary" onClick={this.toggleDeviceForm}>
                                    Add Device
                                </Button>
                            )}
                            {tableType === 'chat' && (
                                <Button color="primary" onClick={this.handleOpenChat}>
                                    Open Chat
                                </Button>
                            )}
                        </Col>
                    </Row>
                </CardBody>

                <Card className="my-4">
                    <CardBody>
                        <Row>
                            <Col sm="12">
                                {isLoaded && tableType === 'users' && (
                                    <UserTable tableData={userTableData} onRowClick={this.handleRowClickUsers} />
                                )}
                                {isLoaded && tableType === 'devices' && (
                                    <DeviceTable tableData={deviceTableData} users={userAuxTableData} onRowClick={this.handleRowClickDevices} />
                                )}
                                {isLoaded && tableType === 'chat' && (
                                    <ChatTable tableData={userTableData}
                                               onCheckboxChange={this.onChange}
                                    />
                                )}
                                {errorStatus > 0 && (
                                    <APIResponseErrorMessage errorStatus={errorStatus} error={error} />
                                )}
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <Modal isOpen={this.state.selectedUser} toggle={this.toggleUserForm} size="lg">
                    <ModalHeader toggle={this.toggleUserForm}> {selectedRow ? 'Edit User' : 'Add User'} </ModalHeader>
                    <ModalBody>
                        <UserForm
                            reloadHandler={this.reload}
                            user={selectedRow}
                            userId={selectedRow ? selectedRow.id : null}
                            deleteUser={() => this.setState({ confirmDelete: true, userToDelete: selectedRow.id })}
                        />
                    </ModalBody>
                </Modal>

                <Modal isOpen={this.state.selectedDevice} toggle={this.toggleDeviceForm} size="lg">
                    <ModalHeader toggle={this.toggleDeviceForm}> {selectedRow ? 'Edit Device' : 'Add Device'} </ModalHeader>
                    <ModalBody>
                        <DeviceForm
                            reloadHandler={this.reload}
                            device={selectedRow}
                            deviceId={selectedRow ? selectedRow.id : null}
                            users={this.state.userAuxTableData}
                            deleteDevice={() => this.setState({ confirmDeleteDevice: true, deviceToDelete: selectedRow.id })}
                        />
                    </ModalBody>
                </Modal>

                <Modal isOpen={this.state.isChatOpen} toggle={this.toggleChatForm} size="lg">
                    <ModalHeader toggle={this.toggleChatForm}>
                        Chat with selected users
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
                                                {message.senderId === this.state.adminId ? 'You' : message.senderUser}:
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
                        {/*{Object.entries(this.state.seenStatus).map(([senderId, timestamp]) => {*/}
                        {/*    const user = userAuxTableData.find(user => user.id === senderId);*/}
                        {/*    const username = user ? user.username : 'Unknown User';*/}

                        {/*    return (*/}
                        {/*        <li key={senderId}>*/}
                        {/*            <em>{username}</em> has seen the message at <strong>{new Date(timestamp).toLocaleString()}</strong>*/}
                        {/*        </li>*/}
                        {/*    );*/}
                        {/*})}*/}

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
            </div>
    );
    }
}

export default AdministratorContainer;
