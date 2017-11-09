import React from 'react';
import { Route, Link } from 'react-router-dom';
import {
    Menu,
    Icon,
} from 'semantic-ui-react';

const NavbarLink = ({ icon, label, to, ...rest }) => (
    <Route path={ to } children={({ match }) => (
        <Link to={ to } { ...rest }>
            <Menu.Item name={ icon } active={ !!match }>
                <Icon name={ icon }/>
                { label }
            </Menu.Item>
        </Link>
    )} />
);

export default () => (
    <Menu icon="labeled" style={{ flexShrink: 0, overflow: 'hidden' }}>
        <NavbarLink to="/boards" icon="grid layout" label="Boards" />
        {/*<NavbarLink to="/user" icon="user circle outline" label="Account" />*/}
        <Menu.Menu position="right">
            <Menu.Item style={{ backgroundColor: '#fbbd08' }}>
                <Icon name="idea" />
                Idea?
            </Menu.Item>
            <Menu.Item style={{ backgroundColor: '#db2828', color: 'white' }}>
                <Icon name="heart" />
                Donate
            </Menu.Item>
        </Menu.Menu>
    </Menu>
);
