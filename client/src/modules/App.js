import React, { Component } from 'react';
import Box from 'react-layout-components';

import {
    Button,
    Form,
    Grid,
    Header,
    Image,
    Message,
    Segment,
} from 'semantic-ui-react';

// Routing
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';

const LoginScreen = ({ auth, login }) => (
    <Box justifyContent="center" style={{ backgroundColor: '#fafafa' }} alignItems="center" fit>
        <Segment.Group>
            <Segment size="huge">
                <Grid
                    textAlign="center"
                    style={{ height: '100%' }}
                    verticalAlign="middle">
                    <Grid.Column style={{ maxWidth: 450 }}>
                        <Header as="h1" color="blue" textAlign="center">
                            ExporTrello
                        </Header>
                        <p>
                            This application is made for exporting your
                            Trello boards as CSV, or as Markdown.
                        </p>
                        <Button
                            loading={ auth.loading }
                            color="blue"
                            size="large"
                            onClick={ login }>
                            Login in with Trello
                        </Button>
                    </Grid.Column>
                </Grid>
            </Segment>
            <Segment textAlign="center">
                Made by <a href="https://kuzzmi.com">kuzzmi</a>
            </Segment>
        </Segment.Group>
    </Box>
);

const UserScreen = ({ user }) => (
    <Box>
    </Box>
);

// API

const API = {
    get({ token, endpoint, version = 1 }) {
        return fetch(
            `http://localhost:3000/api/v${version}/${endpoint}`,
            {
                headers: {
                    'Authorization': token,
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
        };

        this._tokenPresent = () => {
            return !!this.state.auth.oauth_token;
        };

        this._loadData = () => {
            this.setState(state => ({
                ...state,
                user: {
                    data: null,
                    loading: true,
                    error: false,
                },
            }));
            API.get({
                token: oauth_token,
                endpoint: 'user',
            })
            .then(data => data.json())
            .then(data => {
                this.setState(state => ({
                    ...state,
                    user: {
                        data,
                        loading: false,
                        error: false,
                    },
                }));
            });
        };
    }

    componentDidMount() {
        if (this._tokenPresent()) {
            this._loadData();
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
                            this.authPopup.close();
                            this._loadData();
                        });
                    }
                },
                false
            );
        }
    }

    login() {
        if (this.state.auth.oauth_token) {
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
        const { auth } = this.state;

        return (
            <Router>
                <Box fit>
                    <Route path="/" exact render={ () => (
                        <UserScreen />
                    )} />
                    <Route path="/login" render={ () => (
                        <LoginScreen auth={ auth } login={ this.login.bind(this) } />
                    )} />
                </Box>
            </Router>
        );
    }
}

export default App;
