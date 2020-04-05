/**
 * Application root component.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactGA from 'react-ga';


import App from './components/app/App';
import * as serviceWorker from './serviceWorker';

import './index.css';

const gaTrackingId: string = process.env.REACT_APP_GA_TRACKING_ID as string;
ReactGA.initialize(gaTrackingId);
ReactGA.pageview(window.location.pathname + window.location.search);


ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
