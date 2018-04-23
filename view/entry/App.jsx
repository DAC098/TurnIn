import React, {Fragment} from 'react';

// import socket from '../socket';

import renderEntry from '../renderEntry';

import Body from '../components/Body';
import Header from '../components/Header';

const App = () => <Fragment>
	<Header/>
	<Body>App</Body>
</Fragment>;

renderEntry(App);