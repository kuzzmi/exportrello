import React, { Component } from 'react';
import Box, { Container } from 'react-layout-components';

import {
    Button,
    Header,
    Image,
    Segment,
    Grid,

    Item,

    Dimmer,
    Loader,
} from 'semantic-ui-react';

// Routing
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
} from 'react-router-dom';

const LoginScreen = ({ auth, login }) => (
    <Box center fit>
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

const BoardItem = board => (
    <Item key={ board.id }>
        {
            board.prefs.backgroundImageScaled &&
            <Item.Image src={ board.prefs.backgroundImageScaled[0].url } />
        }
    </Item>
);

const UserScreen = ({
    user,
    boards,
}) => (
    <Box fit>
        <Container padding={ 20 } fit>
            {
                ( user.data !== null ) &&
                <Box fit>
                    <Box column>
                        <Segment>
                            <Image shape="rounded" src={ `https://trello-avatars.s3.amazonaws.com/${ user.data.avatarHash }/170.png` }></Image>
                            <Header as="h4" color="blue" textAlign="center">
                                { user.data.fullName }
                            </Header>
                        </Segment>
                    </Box>
                    <Box column fit style={{ marginLeft: 20 }}>
                        <Segment.Group style={{
                            height: '100%',
                            overflow: 'hidden',
                            display: 'flex',
                        }}>
                            <Segment>
                                <Header as="h2" color="blue" textAlign="center">
                                    Your boards
                                </Header>
                            </Segment>
                            <Segment style={{
                                height: '100%',
                                display: 'flex',
                                flex: 1,
                            }}>
                                {
                                    boards.loading === true &&
                                        <Dimmer inverted active>
                                            <Loader inverted>Loading boards</Loader>
                                        </Dimmer>
                                }
                                {
                                    boards.data !== null &&
                                        <Item.Group style={{
                                            overflow: 'auto',
                                            flex: 1,
                                        }}>
                                        { boards.data.map(BoardItem) }
                                        </Item.Group>
                                }
                            </Segment>
                        </Segment.Group>
                    </Box>
                </Box>
            }
            {
                user.loading === true &&
                    <Dimmer inverted active>
                        <Loader inverted size="huge">Loading</Loader>
                    </Dimmer>
            }
        </Container>
    </Box>
);

const PrivateRoute = ({ component: Component, isAuthenticated, ...rest }) => (
    <Route { ...rest } render={ props => (
        isAuthenticated ?
            <Component { ...props } /> :
            <Redirect to={{
                pathname: '/login',
                state: { from: props.location }
            }}/>
    )} />
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
                token: oauth_token,
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
        const { auth, user, boards } = this.state;

        const isAuthenticated = !!auth.oauth_token;

        return (
            <Router>
                <Box style={{ backgroundColor: '#fafafa' }} fit>
                    <PrivateRoute
                        path="/"
                        exact
                        isAuthenticated={ isAuthenticated }
                        component={ () => (
                            <UserScreen user={ user } boards={ boards } />
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
