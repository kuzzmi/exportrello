import React from 'react';
import moment from 'moment';
import Box from 'react-layout-components';

import {
    Dropdown,
    Label,

    Icon,
    Item,

    Dimmer,
    Loader,
} from 'semantic-ui-react';

const BoardsScreen = ({ boards, onExportClick }) => (
    <div>
        {
            boards.loading === true &&
                <Dimmer inverted active>
                    <Loader inverted>Loading boards...</Loader>
                </Dimmer>
        }
        {
            boards.data !== null &&
                <Item.Group divided>
                    { boards.data.map(board => BoardItem(board, onExportClick)) }
                </Item.Group>
        }
    </div>
);

const BoardItem = ( board, onExportClick ) => (
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
                    Last active { moment(board.dateLastActivity).fromNow() }
                </Label>
            </Item.Meta>
            <Item.Description>
                { board.desc }
            </Item.Description>
            <Item.Extra>
                <Dropdown text="Export as..." button={ true } color="blue" options={[
                    <Dropdown.Item key="1" onClick={ () => onExportClick(board.id, 'json') }>
                        JSON
                    </Dropdown.Item>,
                    <Dropdown.Item key="2" onClick={ () => onExportClick(board.id, 'csv') }>
                        CSV
                    </Dropdown.Item>,
                    <Dropdown.Item key="3" onClick={ () => onExportClick(board.id, 'markdown') }>
                        Markdown
                    </Dropdown.Item>,
                ]}></Dropdown>
            </Item.Extra>
        </Item.Content>
    </Item>
);

export default BoardsScreen;
