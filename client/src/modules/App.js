import React, { Component } from 'react';
import Box from 'react-layout-components';

import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            auth: {
                oauth_token: localStorage.getItem('oauth_token'),
                loading: false,
            },
        };
    }

    login() {
        this.setState(state => ({
            ...state,
            auth: {
                ...state.auth,
                loading: true,
            },
        }));

        window.open('http://localhost:3000/auth/trello', '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    }

    render() {
        const { auth } = this.state;

        return (
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
                                    onClick={ this.login.bind(this) }>
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
    }
}

export default App;
