import React from 'react';
import * as API_DEVICES from "./api/device-api";
import * as API_MEASUREMENTS from "./api/measurement-api";
import DeviceTable from "../client/components/device-table";
import NavigationBar from "../navigation-bar";
import MeasurementChart from "./components/measurement-chart";
import { Card, CardHeader, CardBody, Col, Row } from 'reactstrap';
import SockJS from 'sockjs-client';
import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";
import * as StompJS from "@stomp/stompjs";
import {HOST_MEASUREMENT} from "../commons/hosts";
import CalendarComponent from "./components/calendar";

class ClientContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deviceTableData: [],
            chartData: { labels: [], data: [] },
            deviceName: "",
            isLoaded: false,
            wsMessage: "",
            isWsConnected: false,
            selectedDate: null,
            errorStatus: 0,
            error: null
        };

        window.onload = function () {
            const personData = sessionStorage.getItem("person");
            if (personData) {
                let person = JSON.parse(personData);
                let userRole = person.role;
                if (userRole !== "client") {
                    window.location.href = "/";
                }
            } else {
                window.location.href = "/";
            }
        }
    }

    componentDidMount() {
        this.fetchClientDevices();
        this.setupWebSocket();
    }

    setupWebSocket() {
        const socket = new SockJS(HOST_MEASUREMENT.backend_api+'/ws');
        const stompClient = new StompJS.Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (str) => console.log(str),
        });

        stompClient.onConnect = (frame) => {
            console.log("Connected: " + frame);

            stompClient.subscribe("/topic/alerts", (notification) => {
                const notificationJson = JSON.parse(notification.body);
                const deviceId = notificationJson.deviceId;
                const ownerId = notificationJson.ownerId;
                const value = notificationJson.value;

                const personData = sessionStorage.getItem("person");
                const person = JSON.parse(personData);
                const clientId = person.id;

                if(clientId === ownerId){
                    const device = this.state.deviceTableData.find(device => device.id === deviceId);
                    const deviceName = device.name;
                    const message = `Device: ${deviceName} exceeded its max value, recorded ${value}`;
                    this.setState({ wsMessage: message });
                    alert(message);
                }
            });

            this.setState({ isWsConnected: true });
        };

        stompClient.onStompError = (frame) => {
            console.error("Broker error: ", frame.headers['message']);
            console.error("Details: ", frame.body);
        };

        stompClient.onDisconnect = () => {
            console.log("Disconnected from WebSocket");
            this.setState({ isWsConnected: false });
        };

        stompClient.activate();
    }

    fetchClientDevices() {
        let personData = sessionStorage.getItem("person");
        let person = JSON.parse(personData);
        let ownerId = person.id;

        API_DEVICES.getDeviceById({ ownerId }, (result, status, err) => {
            if (result !== null && status === 200) {
                this.setState({
                    deviceTableData: result,
                    isLoaded: true
                });
            } else {
                this.setState({
                    errorStatus: status,
                    error: err
                });
            }
        });
    }

    fetchDeviceMeasurements(deviceId) {
        if(this.state.selectedDate === null){
            alert("Select a date first");
        } else{
            API_MEASUREMENTS.getMeasurementsByDeviceIdInDate(deviceId, this.state.selectedDate, (result, status, err) => {
                if (result !== null && status === 200) {
                    const timestamps = result.map(measurement => new Date(measurement.timestamp).toLocaleString());
                    const values = result.map(measurement => measurement.measurementValue);

                    this.setState({
                        chartData: { labels: timestamps, data: values }
                    });
                } else {
                    this.setState({
                        errorStatus: status,
                        error: err
                    });
                }
            });
        }
    }

    handleDeviceClick = (device) => {
        this.setState({deviceName : device.name});
        this.fetchDeviceMeasurements(device.id);
    }

    handleDateSelect = (date) => {
        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        this.setState({ selectedDate: formatDate(date) });
    };


    render() {
        return (
            <div>
                <NavigationBar />
                <CardHeader className="text-center my-4">
                    <h3>Client - Device Management</h3>
                </CardHeader>

                <Card className="my-4">
                    <CardBody>
                        <Row>
                            <Col sm="12">
                                {this.state.isLoaded &&
                                    <DeviceTable
                                        tableData={this.state.deviceTableData}
                                        onRowClick={this.handleDeviceClick}
                                    />
                                }
                                {this.state.errorStatus > 0 &&
                                    <APIResponseErrorMessage
                                        errorStatus={this.state.errorStatus}
                                        error={this.state.error}
                                    />
                                }
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <MeasurementChart chartData={this.state.chartData} deviceName={this.state.deviceName} />


                <CalendarComponent onDateSelect={this.handleDateSelect} />
                {this.state.selectedDate && (
                    <p>Selected Date: {this.state.selectedDate}</p>
                )}
            </div>
        );
    }
}

export default ClientContainer;
