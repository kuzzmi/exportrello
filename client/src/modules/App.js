import React, { Component } from 'react';
import Box, { Container } from 'react-layout-components';

// Routing
import {
    BrowserRouter as Router,
    Route,
    // Redirect,
    Switch,
} from 'react-router-dom';

import {
    Segment,
} from 'semantic-ui-react';

import Navbar from './Navbar.js';
import BoardsScreen from './BoardScreen.js';
import UserScreen from './UserScreen.js';

const DefaultLayout = ({ component: Component, ...rest }) => (
    <Route { ...rest } render={ matchProps => (
        <Box fit>
            <Container padding={ 20 } fit>
                <Box column fit>
                    <Navbar />
                    <Box fit>
                        <Segment style={{ overflow: 'auto', flex: 1 }}>
                            <Component { ...matchProps } />
                        </Segment>
                    </Box>
                </Box>
            </Container>
        </Box>
    )} />
);

// const PrivateRoute = ({ component: Component, isAuthenticated, ...rest }) => (
//     <Route { ...rest } render={ props => (
//         isAuthenticated ?
//             <Component { ...props } /> :
//             <Redirect to={{
//                 pathname: '/login',
//                 state: { from: props.location }
//             }}/>
//     )} />
// );

// -------------------------
// Trello API
const API = {
    get({ oauth_token, endpoint, version = 1 }) {
        return fetch(
            `http://localhost:3000/api/v${version}/${endpoint}`,
            {
                headers: {
                    Authorization: oauth_token,
                },
            }
        );
    },
};

class App extends Component {
    constructor(props) {
        super(props);

        const oauth_token = localStorage.getItem('oauth_token');

        this.state = {
            auth: {
                oauth_token,
                loading: false,
            },
            user: {
                data: null,
                loading: false,
                error: false,
            },
            boards: {
                data: null,
                loading: false,
                error: false,
            },
        };

        this._tokenPresent = () => {
            return !!this.state.auth.oauth_token;
        };

        const load = ({ entity, endpoint }) => () => {
            this.setState(state => ({
                ...state,
                [entity]: {
                    data: null,
                    loading: true,
                    error: false,
                },
            }));
            return API.get({
                oauth_token,
                endpoint,
            })
                .then(data => data.json())
                .then(data => {
                    this.setState(state => ({
                        ...state,
                        [entity]: {
                            data,
                            loading: false,
                            error: false,
                        },
                    }));
                });
        };

        this._loadUser = load({
            entity: 'user',
            endpoint: 'user',
        });

        this._loadBoards = load({
            entity: 'boards',
            endpoint: 'boards',
        });

        this.initLoad = () => {
            this._loadUser().then(this._loadBoards);
        };

        this._exportBoard = (boardId, format) => {
            API.get({
                oauth_token,
                endpoint: `boards/${boardId}/export/${format}`,
            });
        };
    }

    componentDidMount() {
        if (this._tokenPresent()) {
            this.initLoad();
        } else {
            window.addEventListener(
                'message',
                ({ data }) => {
                    const { oauth_token } = data;
                    if (oauth_token) {
                        this.setState(state => ({
                            ...state,
                            auth: {
                                oauth_token: data.oauth_token,
                                loading: false,
                            },
                        }), () => {
                            window.localStorage.setItem('oauth_token', oauth_token);
                            window.location.href = '/';
                            this.authPopup.close();
                            this.initLoad();
                        });
                    }
                },
                false
            );
        }
    }

    login() {
        if (this.state.auth.oauth_token) {
            window.location.href = '/';
            return;
        }
        this.setState(state => ({
            ...state,
            auth: {
                ...state.auth,
                loading: true,
            },
        }));

        this.authPopup = window.open(
            'http://localhost:3000/auth/trello',
            '_blank',
            'location=yes,height=570,width=520,scrollbars=yes,status=yes'
        );
    }

    render() {
        const { /* auth, */ user, boards } = this.state;

        // const isAuthenticated = !!auth.oauth_token;

        return (
            <Router>
                <div style={{
                    backgroundColor: '#fafafa',
                    height: '100%',
                }}>
                    <Switch>
                        <DefaultLayout path="/user" component={() => (
                            <UserScreen user={ user } />
                        )}/>
                        <DefaultLayout path="/boards" component={() => (
                            <BoardsScreen boards={ boards } onExportClick={ this._exportBoard.bind(this) } />
                        )}/>
                    </Switch>
                </div>
            </Router>
        );
    }
}

// <Route path="/login" render={ () => (
//     <LoginScreen auth={ auth } login={ this.login.bind(this) } />
// )} />
// <PrivateRoute
//     path="/"
//     exact
//     isAuthenticated={ isAuthenticated }
//     component={ () => (
//         <UserScreen user={ user } boards={ boards } />
//     )} />

export default App;
