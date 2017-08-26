import React from 'react';
import moment from 'moment';
import Box from 'react-layout-components';

import {
    Dropdown,
    Menu,

    Icon,
    Image,
    Label,
    Card,

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
                <Card.Group itemsPerRow={ 4 } stackable={ true }>
                    { boards.data.map(board => BoardItem(board, onExportClick)) }
                </Card.Group>
        }
    </div>
);

const BoardItem = ( board, onExportClick ) => (
    !board.closed &&
    <Card key={ board.id }>
        {
            board.prefs.backgroundImageScaled ?
                <Image src={ board.prefs.backgroundImageScaled[1].url } /> :
                <Image>
                    <Box style={{
                        height: 192,
                        backgroundColor: board.prefs.backgroundColor,
                        borderRadius: '.125rem',
                    }} fit />
                </Image>
        }
        <Card.Content>
            <Card.Header as="a">
                <Icon
                    color={ board.starred ? 'yellow': 'grey' }
                    name={ board.starred ? 'star': 'empty star' }
                />
                { board.name }
            </Card.Header>
            <Card.Meta>
                Last active { moment(board.dateLastActivity).fromNow() }
            </Card.Meta>
            <Card.Description>
                {
                    board.pluginData['56d5e249a98895a9797bebb9'] &&
                    <Label color="green">
                        Custom Fields Enabled
                    </Label>
                }
                { board.desc }
            </Card.Description>
        </Card.Content>
        <Menu attached="bottom">
            <Dropdown text="Export as..." item upward
                options={[
                    <Dropdown.Item key="1" onClick={ () => onExportClick(board.id, 'json') }>
                        JSON
                    </Dropdown.Item>,
                    <Dropdown.Item key="2" onClick={ () => onExportClick(board.id, 'csv') }>
                        CSV
                    </Dropdown.Item>,
                    <Dropdown.Item key="3" onClick={ () => onExportClick(board.id, 'markdown') }>
                        Markdown
                    </Dropdown.Item>,
                ]} />
        </Menu>
    </Card>
);

export default BoardsScreen;
