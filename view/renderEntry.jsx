import React from 'react';
import {render} from 'react-dom';

import {BrowserRouter as Router} from 'react-router-dom';
import {Provider} from 'react-redux';

import themeReducer from './reducers/theme';

import reducer_registry from './reducer_registry';

import store from './store';

import ThemeProvider from './containers/ThemeProvider';

reducer_registry.addReducer('theme',themeReducer);

const renderEntry = (Component) => {
	document.addEventListener('DOMContentLoaded',() => {
		const ren_tar = document.getElementById('ren-tar');

		render(
			<Provider store={store}>
				<Router>
					<ThemeProvider>
						<Component/>
					</ThemeProvider>
				</Router>
			</Provider>,
			ren_tar,
			() => {
				console.log('rendered entry');
			}
			);
	});
};

export default renderEntry;