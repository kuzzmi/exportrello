import React from 'react';

import {
    Header,
    Image,

    Dimmer,
    Loader,
} from 'semantic-ui-react';

const UserScreen = ({
    user,
}) => (
    <div>
        {
            ( user.data !== null ) &&
            <div>
                <Image shape="rounded" src={ `https://trello-avatars.s3.amazonaws.com/${ user.data.avatarHash }/170.png` }></Image>
                <Header as="h4" color="blue" textAlign="center">
                    { user.data.fullName }
                </Header>
            </div>
        }
        {
            user.loading === true &&
                <Dimmer inverted active>
                    <Loader inverted size="huge">Loading</Loader>
                </Dimmer>
        }
    </div>
);

export default UserScreen;
