import React from 'react';
import * as API_DEVICES from "./api/device-api";
import * as API_MEASUREMENTS from "./api/measurement-api";
import DeviceTable from "../client/components/device-table";
import NavigationBar from "../navigation-bar";
import MeasurementChart from "./components/measurement-chart";
import { Button, Card, CardHeader, CardBody, Col, Row } from 'reactstrap';
import { Client } from '@stomp/stompjs';  // Import STOMP client
import SockJS from 'sockjs-client';
import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";  // Import SockJS for WebSocket support

class ClientContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deviceTableData: [],
            chartData: { labels: [], data: [] },
            isLoaded: false,
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

        // const socket = new WebSocket('ws://localhost:8080/ws');
        // socket.onopen = function(event) {
        //     console.log("Websocket connection open");
        // };
        //
        // socket.onmessage = function(event) {
        //     console.log("Websocket connection message");
        // };

        // Create a new WebSocket connection
        const ws = new WebSocket("wss://measurementapplication.localhost/ws");


// Event listener for when the connection is successfully established
        ws.onopen = () => {
            console.log('Connected to WebSocket server');

            // Send a message to the server
            ws.send('Hello Server!');
        };

// Event listener for when a message is received from the server
        ws.onmessage = (event) => {
            console.log('Received message from server:', event.data);
        };

// Event listener for when the connection is closed
        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

// Event listener for handling errors
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
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
        API_MEASUREMENTS.getMeasurementsByDeviceId(deviceId, (result, status, err) => {
            if (result !== null && status === 200) {
                const timestamps = result.map(measurement => new Date(measurement.timestamp).toLocaleString());
                const values = result.map(measurement => measurement.measurementValue);
                console.log(timestamps);
                console.log(values);

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

    handleDeviceClick = (device) => {
        this.fetchDeviceMeasurements(device.id);
    }

    render() {
        return (
            <div>
                <NavigationBar />
                <CardHeader className="text-center my-4">
                    <strong>Client - Device Management</strong>
                </CardHeader>

                <Card className="my-4">
                    <CardHeader>
                        <strong>Your Devices</strong>
                    </CardHeader>
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

                {/* Pass chartData state to MeasurementChart component */}
                <MeasurementChart chartData={this.state.chartData} />
            </div>
        );
    }
}

export default ClientContainer;
