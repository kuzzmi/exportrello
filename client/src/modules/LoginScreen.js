import React from 'react';

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

export default LoginScreen;
