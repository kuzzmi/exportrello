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
    <Menu icon="labeled" style={{ flexShrink: 0 }}>
        <NavbarLink to="/boards" icon="list layout" label="Boards" />
        <NavbarLink to="/user" icon="user circle outline" label="Account" />
    </Menu>
);
