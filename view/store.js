import {createStore,applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import reducer_registry from './reducer_registry';

const logger = () => next => action => {
	if(typeof action !== 'function')
		console.log('dispatch',action);

	return next(action);
};

const reducers = reducer_registry.combine();

const store = createStore(
	reducers,
	applyMiddleware(logger,thunk)
);

reducer_registry.setListener(() => {
	store.replaceReducer(reducer_registry.combine())
});

window.store = store;

export default store;