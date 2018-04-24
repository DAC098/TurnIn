import { combineReducers } from 'redux';

export default class ReducerRegistry {
	constructor() {
		this.reducers = {};
		this.listener = null;
	}

	getReducers() {
		return {...this.reducers};
	}

	addReducer(name,reducer) {
		this.reducers = {...this.reducers,[name]: reducer};

		if(this.listener)
			this.listener(this.getReducers())
	}

	setListener(listener) {
		this.listener = listener;
	}

	combine(initial_state = {}) {
		let reducers = this.getReducers();
		let reducer_names = Object.keys(reducers);
		let state_keys = Object.keys(initial_state);

		for(let key of state_keys) {
			if(!reducer_names.includes(key))
				reducers[key] = (state = null) => state;
		}

		if(reducer_names.length === 0)
			reducers['emtpy'] = (state = null) => state;

		return combineReducers(reducers);
	}
}