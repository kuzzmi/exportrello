import React from 'react';
import { render } from 'react-dom';
import App from './modules/App.js';

// Importing all the styles
import 'semantic-ui-css/semantic.min.css';
import './main.scss';

// Rendering of the application
const root = document.getElementById('root');

render(
    <App />,
    root
);
