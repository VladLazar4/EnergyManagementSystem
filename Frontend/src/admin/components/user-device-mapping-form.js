import React from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import * as API_USERS from "../api/user-api";
import * as API_DEVICES from "../api/device-api";

class UserDeviceMappingForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: '',
            deviceId: '',
            users: [],
            devices: []
        };
    }

    componentDidMount() {
        this.fetchUsers();
        this.fetchDevices();
    }

    fetchUsers() {
        API_USERS.getUsers((result) => {
            this.setState({ users: result });
        });
    }

    fetchDevices() {
        API_DEVICES.getDevices((result) => {
            this.setState({ devices: result });
        });
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        // Call your API to create mapping
        // API_MAPPING.createMapping({ userId: this.state.userId, deviceId: this.state.deviceId }, (result) => {
        //     this.props.reloadHandler();
        // });
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <FormGroup>
                    <Label for="userId">User</Label>
                    <Input type="select" name="userId" id="userId" value={this.state.userId} onChange={this.handleChange} required>
                        <option value="">Select User</option>
                        {this.state.users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label for="deviceId">Device</Label>
                    <Input type="select" name="deviceId" id="deviceId" value={this.state.deviceId} onChange={this.handleChange} required>
                        <option value="">Select Device</option>
                        {this.state.devices.map(device => (
                            <option key={device.id} value={device.id}>{device.deviceName}</option>
                        ))}
                    </Input>
                </FormGroup>
                <Button color="primary" type="submit">Map User to Device</Button>
            </Form>
        );
    }
}

export default UserDeviceMappingForm;
