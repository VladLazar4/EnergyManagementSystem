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
    Row,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap';
import UserForm from "./components/user-form";
import DeviceForm from "./components/device-form";
import * as API_USERS from "./api/user-api";
import * as API_DEVICES from "./api/device-api";
import UserTable from "./components/user-table";
import DeviceTable from "./components/device-table";
import NavigationBar from "../navigation-bar";

class AdministratorContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedUser: false,
            selectedDevice: false,
            tableType: 'devices',
            userTableData: [],
            userAuxTableData: [],
            deviceTableData: [],
            isLoaded: false,
            errorStatus: 0,
            error: null,
            dropdownOpen: false,
            selectedRow: null,
            confirmDelete: false,
            userToDelete: null,
        };

        this.toggleUserForm = this.toggleUserForm.bind(this);
        this.toggleDeviceForm = this.toggleDeviceForm.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.setTableType = this.setTableType.bind(this);
        this.handleRowClickDevices = this.handleRowClickDevices.bind(this);
        this.handleRowClickUsers = this.handleRowClickUsers.bind(this);
        this.reload = this.reload.bind(this);

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

    toggleUserForm() {
        this.setState({ selectedUser: !this.state.selectedUser, selectedRow: null });
    }

    toggleDeviceForm() {
        this.setState({ selectedDevice: !this.state.selectedDevice, selectedRow: null });
    }

    toggleDropdown() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    setTableType(tableType) {
        this.setState({ tableType });
    }

    handleRowClickUsers(row) {
        this.setState({ selectedRow: row, selectedUser: true });
    }

    handleRowClickDevices(row) {
        this.setState({ selectedRow: row, selectedDevice: true });
    }

    reload() {
        this.setState({ isLoaded: false });
        this.fetchUsers();
        this.fetchDevices();
    }

    render() {
        const { tableType, userTableData, userAuxTableData, deviceTableData, isLoaded, errorStatus, error, selectedRow, confirmDelete } = this.state;

        return (
            <div>
                <NavigationBar />
                <CardHeader className="text-center my-4">
                    <h3><strong>Administrator - User and Device Management</strong></h3>
                </CardHeader>

                <Card>
                    <CardBody>
                        <Row>
                            <Col sm="8">
                                <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
                                    <DropdownToggle caret>
                                        {tableType === 'users' ? 'Users' : 'Devices'}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={() => this.setTableType('users')}>Users</DropdownItem>
                                        <DropdownItem onClick={() => this.setTableType('devices')}>Devices</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </Col>
                            <Col sm="4" className="text-center mb-2">
                                <Button color="primary" onClick={tableType === 'users' ? this.toggleUserForm : this.toggleDeviceForm}>
                                    Add {tableType === 'users' ? 'User' : 'Device'}
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

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
            </div>
        );
    }
}

export default AdministratorContainer;
