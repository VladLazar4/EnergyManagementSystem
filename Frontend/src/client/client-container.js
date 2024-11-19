import React from 'react';
import APIResponseErrorMessage from "../commons/errorhandling/api-response-error-message";
import { Button, Card, CardHeader, CardBody, Col, Row, Modal, ModalBody, ModalHeader } from 'reactstrap';
import * as API_DEVICES from "./api/device-api";
import DeviceTable from "../client/components/device-table";
import NavigationBar from "../navigation-bar";

class ClientContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deviceTableData: [],
            isLoaded: false,
            errorStatus: 0,
            error: null
        };

        window.onload = function (){
            const personData = sessionStorage.getItem("person");
            if(personData){
                let person = JSON.parse(personData);
                let userRole = person.role;
                if(userRole !== "client"){
                    window.location.href="/";
                }
            } else{
                window.location.href="/";
            }
        }
    }

    componentDidMount() {
        this.fetchClientDevices();
    }

    fetchClientDevices() {
        let personData = sessionStorage.getItem("person");
        let person = JSON.parse(personData);
        let ownerId = person.id;

        return API_DEVICES.getDeviceById({ownerId}, (result, status, err) => {
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
                                {this.state.isLoaded && <DeviceTable tableData={this.state.deviceTableData} />}
                                {this.state.errorStatus > 0 && <APIResponseErrorMessage
                                    errorStatus={this.state.errorStatus}
                                    error={this.state.error}
                                />}
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default ClientContainer;
