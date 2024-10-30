import React from 'react';
import validate from "../validators/person-validators";
import Button from "react-bootstrap/Button";
import * as API_USERS from "../api/user-api";
import APIResponseErrorMessage from "../../commons/errorhandling/api-response-error-message";
import { Col, Row } from "reactstrap";
import { FormGroup, Input, Label } from 'reactstrap';
import {deleteUser} from "../api/user-api";

class UserForm extends React.Component {

    constructor(props) {
        super(props);
        this.toggleForm = this.toggleForm.bind(this);
        this.reloadHandler = this.props.reloadHandler;

        this.state = {
            errorStatus: 0,
            error: null,
            formIsValid: false,
            formControls: {
                username: {
                    value: props.user ? props.user.username : '',  // Prefill if editing
                    placeholder: 'username',
                    valid: props.user ? true : false,  // Assume valid if pre-filled
                    touched: false,
                    validationRules: {
                        minLength: 3,
                        isRequired: true
                    }
                },
                password: {
                    value: props.user ? props.user.password : '',  // Password should be re-entered
                    placeholder: 'password',
                    valid: props.user ? true : false,
                    touched: false,
                    validationRules: {
                        minLength: 3,
                        isRequired: true
                    }
                },
                name: {
                    value: props.user ? props.user.name : '',
                    placeholder: 'name',
                    valid: props.user ? true : false,
                    touched: false,
                },
                role: {
                    value: props.user ? props.user.role : '',
                    placeholder: 'role',
                    valid: props.user ? true : false,
                    touched: false,
                },
            }
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDeleteUser = this.handleDeleteUser.bind(this);
    }

    toggleForm() {
        this.setState({ collapseForm: !this.state.collapseForm });
    }

    handleChange = event => {
        const name = event.target.name;
        const value = event.target.value;

        const updatedControls = this.state.formControls;
        const updatedFormElement = updatedControls[name];

        updatedFormElement.value = value;
        updatedFormElement.touched = true;
        updatedFormElement.valid = validate(value, updatedFormElement.validationRules);
        updatedControls[name] = updatedFormElement;

        let formIsValid = true;
        for (let updatedFormElementName in updatedControls) {
            formIsValid = updatedControls[updatedFormElementName].valid && formIsValid;
        }

        this.setState({
            formControls: updatedControls,
            formIsValid: formIsValid
        });
    };


    handleSubmit() {
        let user = {
            username: this.state.formControls.username.value,
            password: this.state.formControls.password.value,
            name: this.state.formControls.name.value,
            role: this.state.formControls.role.value,
        };

        API_USERS.postUser(user, (result, status, error) => {
            if (result !== null && (status === 200 || status === 201)) {
                this.reloadHandler();
            } else {
                this.setState({
                    errorStatus: status,
                    error: error
                });
            }
        });
    }

    handleEdit() {
        const { userId } = this.props;
        let user = {
            username: this.state.formControls.username.value,
            password: this.state.formControls.password.value,
            name: this.state.formControls.name.value,
            role: this.state.formControls.role.value,
        };

        console.log(user);

        return API_USERS.updateUser(userId, user, (result, status, error) => {
            if (result !== null && (status === 200 || status === 204)) {
                console.log("Successfully updated user with id: " + userId);
                this.reloadHandler();
            } else {
                this.setState({
                    errorStatus: status,
                    error: error
                });
            }
        });
    }


    handleDeleteUser = () => {
        const {userId} = this.props;

        return API_USERS.deleteUser(userId, (result, status, error) =>{
             if (result !== null && (status === 200 || status === 201)) {
                 console.log("Successfully deleted user with id: " + result);
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
        const isEditMode = this.props.userId !== null;
        return (
            <div>
                <FormGroup id='username'>
                    <Label for='usernameField'> Username: </Label>
                    <Input name='username' id='usernameField' placeholder={this.state.formControls.username.placeholder}
                           onChange={this.handleChange}
                           value={this.state.formControls.username.value}
                           touched={this.state.formControls.username.touched ? 1 : 0}
                           valid={this.state.formControls.username.valid}
                           required
                    />
                    {this.state.formControls.username.touched && !this.state.formControls.username.valid &&
                        <div className={"error-message row"}> * Username must have at least 3 characters</div>}
                </FormGroup>

                <FormGroup id='password'>
                    <Label for='passwordField'> Password: </Label>
                    <Input name='password' id='passwordField' placeholder={this.state.formControls.password.placeholder}
                           onChange={this.handleChange}
                           value={this.state.formControls.password.value}
                           touched={this.state.formControls.password.touched ? 1 : 0}
                           valid={this.state.formControls.password.valid}
                           type="password"
                           required
                    />
                    {this.state.formControls.password.touched && !this.state.formControls.password.valid &&
                        <div className={"error-message"}> * Password must be at least 6 characters</div>}
                </FormGroup>

                <FormGroup id='name'>
                    <Label for='nameField'> Name: </Label>
                    <Input name='name' id='nameField' placeholder={this.state.formControls.name.placeholder}
                           onChange={this.handleChange}
                           value={this.state.formControls.name.value}
                           touched={this.state.formControls.name.touched ? 1 : 0}
                           valid={this.state.formControls.name.valid}
                           required
                    />
                </FormGroup>

                <FormGroup>
                    <Label for="role">Role: </Label>
                    <Input name='role' id='roleField'
                           onChange={this.handleChange}
                           value={this.state.formControls.role.value}
                           touched={this.state.formControls.role.touched ? 1 : 0}
                           valid={this.state.formControls.role.valid}
                           required
                           type="select"
                    >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="client">Client</option>
                    </Input>
                </FormGroup>

                <Row className="justify-content-center">
                    {isEditMode ? (
                        <>
                            <Button type={"button"} onClick={this.handleEdit} disabled={!this.state.formIsValid}>
                                Edit
                            </Button>
                            <Button className="ml-2" onClick={this.handleDeleteUser}>
                                Delete
                            </Button>
                        </>
                    ) : (
                        <Button type={"submit"} disabled={!this.state.formIsValid} onClick={this.handleSubmit}>
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

export default UserForm;
