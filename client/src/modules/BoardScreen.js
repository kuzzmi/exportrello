import React from 'react';
import moment from 'moment';
import Box from 'react-layout-components';

import {
    Label,

    Icon,
    Item,

    Dimmer,
    Loader,
} from 'semantic-ui-react';

const BoardsScreen = ({ boards }) => (
    <div>
        {
            boards.loading === true &&
                <Dimmer inverted active>
                    <Loader inverted>Loading boards...</Loader>
                </Dimmer>
        }
        {
            boards.data !== null &&
                <Item.Group>
                    { boards.data.map(BoardItem) }
                </Item.Group>
        }
    </div>
);

const BoardItem = board => (
    !board.closed &&
    <Item key={ board.id }>
        {
            board.prefs.backgroundImageScaled ?
                <Item.Image shape="rounded" src={ board.prefs.backgroundImageScaled[0].url } /> :
                <Item.Image shape="rounded">
                    <Box style={{
                        backgroundColor: board.prefs.backgroundColor,
                        borderRadius: '.125rem',
                    }} fit />
                </Item.Image>
        }
        <Item.Content>
            <Item.Header as="a">
                <Icon
                    color={ board.starred ? 'yellow': 'grey' }
                    name={ board.starred ? 'star': 'empty star' }
                />
                { board.name }
            </Item.Header>
            <Item.Meta>
                <Label>
                    Last active
                    <Label.Detail>{ moment(board.dateLastActivity).fromNow() }</Label.Detail>
                </Label>
            </Item.Meta>
            <Item.Description>
                { board.desc || 'No Description' }
            </Item.Description>
            <Item.Extra>
                Additional Details
            </Item.Extra>
        </Item.Content>
    </Item>
);

export default BoardsScreen;
