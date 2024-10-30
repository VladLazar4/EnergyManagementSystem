import React from 'react';
import CryptoJS from "crypto-js";
import BackgroundImg from '../commons/images/background.jpg';
import { Button, Container, Jumbotron, Form, FormGroup, Label, Input } from 'reactstrap';
import * as API_LOGIN from './login-api';
import WrongUsernamePasswordPopup from './popup-wrong-user-or-pass';

const backgroundStyle = {
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    width: "100%",
    height: "100vh",
    backgroundImage: `url(${BackgroundImg})`
};

const textStyle = { color: 'black' };

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            showPopup: false
        };
        window.onload = function () {
            sessionStorage.clear();
        }
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const { username, password } = this.state;

        sessionStorage.clear();

        API_LOGIN.loginUser({ username, password }, (result, status, err) => {
            if (result && status===200) {
                sessionStorage.setItem("person", JSON.stringify(result));
                if (result.role === "admin") {
                    window.location.href = "/user/admin";
                } else if (result.role === "client") {
                    window.location.href = "/user/client";
                }
            } else {
                this.setState({ showPopup: true });
            }
        });
    };


    closePopup = () => {
        this.setState({ showPopup: false });
    }

    render() {
        return (
            <div>
                <Jumbotron fluid style={backgroundStyle}>
                    <Container fluid style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h1 className="display-3" style={textStyle}>Login</h1>
                        <Form onSubmit={this.handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
                            <FormGroup>
                                <Label for="username" style={textStyle}>Username</Label>
                                <Input
                                    type="text"
                                    name="username"
                                    id="username"
                                    placeholder="Enter your username"
                                    value={this.state.username}
                                    onChange={this.handleChange}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="password" style={textStyle}>Password</Label>
                                <Input
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="Enter your password"
                                    value={this.state.password}
                                    onChange={this.handleChange}
                                    required
                                />
                            </FormGroup>
                            <div style={{ textAlign: 'center' }}>
                                <Button color="primary" type="submit">Login</Button>
                            </div>
                        </Form>
                    </Container>
                </Jumbotron>

                {this.state.showPopup && (
                    <WrongUsernamePasswordPopup onClose={this.closePopup} />
                )}
            </div>
        );
    }
}

export default Login;
