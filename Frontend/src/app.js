import React from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import AdministratorContainer from './admin/administrator-container'
import ClientContainer from './client/client-container'

import ErrorPage from './commons/errorhandling/error-page';
import styles from './commons/styles/project-style.css';
import LoginContainer from "./login/login-container";

class App extends React.Component {

    render() {

        return (
            <div className={styles.back}>
            <Router>
                <div>
                    <Switch>
                        <Route
                            exact
                            path='/'
                            render={() => <LoginContainer/>}
                        />

                        <Route
                            exact
                            path='/user/admin'
                            render={() => <AdministratorContainer/>}
                        />

                        <Route
                            exact
                            path='/user/client'
                            render={() => <ClientContainer/>}
                        />

                        <Route
                            exact
                            path='/error'
                            render={() => <ErrorPage/>}
                        />

                        <Route render={() =><ErrorPage/>} />
                    </Switch>
                </div>
            </Router>
            </div>
        )
    };
}

export default App
