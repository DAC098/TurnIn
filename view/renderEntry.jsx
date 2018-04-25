import React from 'react';
import {render} from 'react-dom';

import {BrowserRouter as Router} from 'react-router-dom';
import {Provider} from 'react-redux';

import themeReducer from './reducers/theme';
import systemReducer from './reducers/system';

import reducer_registry from './reducer_registry';
import req from './lib/request';

import store from './store';

import ThemeProvider from './containers/ThemeProvider';
import CatchError from './containers/CatchError';

reducer_registry.addReducer('theme',themeReducer);
reducer_registry.addReducer('system',systemReducer);

req.setUser('master','password');

const renderEntry = (Comp) => {
	document.addEventListener('DOMContentLoaded',() => {
		const ren_tar = document.getElementById('ren-tar');

		render(
			<Provider store={store}>
				<CatchError>
					<Router>
						<ThemeProvider>
							<Comp/>
						</ThemeProvider>
					</Router>
				</CatchError>
			</Provider>,
			ren_tar,
			() => {
				console.log('rendered entry');
			}
			);
	});
};

export default renderEntry;