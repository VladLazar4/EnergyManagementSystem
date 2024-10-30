import React from 'react';
import { FormGroup, Label, Input, Row } from 'reactstrap';
import Button from "react-bootstrap/Button";
import * as API_DEVICES from "../api/device-api";
import validate from "../validators/person-validators";
import APIResponseErrorMessage from "../../commons/errorhandling/api-response-error-message";

class DeviceForm extends React.Component {
    constructor(props) {
        super(props);
        this.reloadHandler = this.props.reloadHandler;

        const isEditMode = !!props.device;

        this.state = {
            errorStatus: 0,
            error: null,
            formIsValid: false,
            formControls: {
                deviceName: {
                    value: isEditMode ? props.device.name : '',
                    placeholder: 'Device name',
                    valid: isEditMode ? true : false,
                    touched: false,
                },
                deviceDescription: {
                    value: isEditMode ? props.device.description : '',
                    placeholder: 'Device description',
                    valid: isEditMode ? true : false,
                    touched: false,
                },
                deviceAddress: {
                    value: isEditMode ? props.device.address : '',
                    placeholder: 'Device address',
                    valid: isEditMode ? true : false,
                    touched: false,
                },
                deviceMaxHourlyConsumption: {
                    value: isEditMode ? props.device.maxHourlyConsumption : '',
                    placeholder: 'Device Max Hourly Consumption',
                    valid: isEditMode ? true : false,
                    touched: false,
                },
                ownerUsername: {
                    value: isEditMode && props.device.ownerId ?
                        (props.users.find(user => user.id === props.device.ownerId) ?
                            props.users.find(user => user.id === props.device.ownerId).username :
                            '') :
                        '',
                    placeholder: 'Owner username',
                    valid: true,
                },
                ownerId: {
                    value: isEditMode ? props.device.ownerId : '',
                }
            }
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEditDevice = this.handleEditDevice.bind(this);
        this.handleDeleteDevice = this.handleDeleteDevice.bind(this);
    }

    handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        const updatedControls = { ...this.state.formControls };
        const updatedFormElement = updatedControls[name];

        updatedFormElement.value = value;
        updatedFormElement.touched = true;

        if (name === 'ownerUsername') {
            const selectedUser = this.props.users.find(user => user.username === value);
            updatedControls.ownerId.value = selectedUser ? selectedUser.id : '';
            updatedFormElement.valid = true;
        } else {
            updatedFormElement.valid = validate(value, updatedFormElement.validationRules || {});
        }

        updatedControls[name] = updatedFormElement;

        let formIsValid = Object.values(updatedControls).every(control =>
            control.name === 'ownerUsername' ? true : control.valid
        );

        this.setState({
            formControls: updatedControls,
            formIsValid: formIsValid
        });
    }

    handleSubmit() {
        let device = {
            name: this.state.formControls.deviceName.value,
            description: this.state.formControls.deviceDescription.value,
            address: this.state.formControls.deviceAddress.value,
            maxHourlyConsumption: this.state.formControls.deviceMaxHourlyConsumption.value,
            ownerId: this.state.formControls.ownerId.value
        };

        API_DEVICES.postDevice(device, (result, status, error) => {
            if (result !== null && (status === 200 || status === 201)) {
                this.reloadHandler();
                this.state.selectedRow = false;
            } else {
                this.setState({
                    errorStatus: status,
                    error: error
                });
            }

        });
    }

    handleEditDevice() {
        const { deviceId } = this.props;
        let device = {
            name: this.state.formControls.deviceName.value,
            description: this.state.formControls.deviceDescription.value,
            address: this.state.formControls.deviceAddress.value,
            maxHourlyConsumption: this.state.formControls.deviceMaxHourlyConsumption.value,
            ownerId: this.state.formControls.ownerId.value
        };

        return API_DEVICES.updateDevice(deviceId, device, (result, status, error) => {
            if (result !== null && (status === 200 || status === 204)) {
                this.reloadHandler();
            } else {
                this.setState({
                    errorStatus: status,
                    error: error
                });
            }
        });
    }

    handleDeleteDevice = () => {
        const { deviceId } = this.props;

        return API_DEVICES.deleteDevice(deviceId, (result, status, error) => {
            if (result !== null && (status === 200 || status === 201)) {
                this.reloadHandler();
            } else {
                this.setState({
                    errorStatus: status,
                    error: error
                });
            }
        });
    };

    render() {
        const isEditMode = !!this.props.device;

        return (
            <div>
                <FormGroup>
                    <Label for="name">Device Name</Label>
                    <Input type="text" name="deviceName" id="deviceName"
                           placeholder={this.state.formControls.deviceName.placeholder}
                           value={this.state.formControls.deviceName.value}
                           onChange={this.handleChange}
                           valid={this.state.formControls.deviceName.valid}
                           required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="deviceDescription">Device Description</Label>
                    <Input type="text" name="deviceDescription" id="deviceDescription"
                           placeholder={this.state.formControls.deviceDescription.placeholder}
                           value={this.state.formControls.deviceDescription.value}
                           onChange={this.handleChange}
                           valid={this.state.formControls.deviceDescription.valid}
                           required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="deviceAddress">Device Address</Label>
                    <Input type="text" name="deviceAddress" id="deviceAddress"
                           placeholder={this.state.formControls.deviceAddress.placeholder}
                           value={this.state.formControls.deviceAddress.value}
                           onChange={this.handleChange}
                           valid={this.state.formControls.deviceAddress.valid}
                           required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="deviceMaxHourlyConsumption">Device Max Hourly Consumption</Label>
                    <Input type="text" name="deviceMaxHourlyConsumption" id="deviceMaxHourlyConsumption"
                           placeholder={this.state.formControls.deviceMaxHourlyConsumption.placeholder}
                           value={this.state.formControls.deviceMaxHourlyConsumption.value}
                           onChange={this.handleChange}
                           valid={this.state.formControls.deviceMaxHourlyConsumption.valid}
                           required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="ownerUsername">Owner Username</Label>
                    <Input
                        type="select"
                        name="ownerUsername"
                        id="ownerUsername"
                        value={this.state.formControls.ownerUsername.value}
                        onChange={this.handleChange}
                        valid={this.state.formControls.ownerUsername.valid}
                        required
                    >
                        <option value="">Select an Owner</option>
                        {this.props.users && this.props.users.map(user => (
                            <option key={user.id} value={user.username}>
                                {user.username}
                            </option>
                        ))}
                    </Input>
                </FormGroup>

                <Row className="justify-content-center">
                    {isEditMode ? (
                        <>
                            <Button type={"button"} onClick={this.handleEditDevice}>
                                Edit
                            </Button>
                            <Button className="ml-2" onClick={this.handleDeleteDevice}>
                                Delete
                            </Button>
                        </>
                    ) : (
                        <Button type={"submit"} onClick={this.handleSubmit}>
                            Submit
                        </Button>
                    )}
                </Row>
                {
                    this.state.errorStatus > 0 &&
                    <APIResponseErrorMessage errorStatus={this.state.errorStatus} error={this.state.error} />
                }
            </div>
        );
    }
}

export default DeviceForm;
