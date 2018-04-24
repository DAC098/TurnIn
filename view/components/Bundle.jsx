import React, {Component} from 'react';

export default class Bundle extends Component {
	constructor(props) {
		super(props);
		console.log('constructing bundle');
		this.state = {
			mod: null
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.load !== this.props.load) {
			this.load(nextProps);
		}
	}

	componentDidMount() {
		this.load(this.props);
	}

	/**
	 *
	 * @param props
	 * @returns {Promise<void>}
	 */
	async load(props) {
		this.setState(() => ({mod: null}));

		try {
			console.log('waiting on load');
			let mod = await props.load;
			console.log('finished load',mod);

			this.setState(() => ({
				mod: mod.default ? mod.default : mod
			}));
		} catch(err) {
			console.error('Bundle load Error:',err);
		}
	}

	render() {
		console.log('rendering mod',this.state.mod);
		return this.props.children(this.state.mod);
	}
}

export function lazyLoad(req,loading) {
	let load_comp = loading || (() => {
		console.log('rendering load comp');
		return <div>...loading</div>;
	});

	console.log('returning bundle',req,load_comp);

	return props => <Bundle
			load={req}
		>
			{Comp => Comp ? <Comp {...props}/> : load_comp}
		</Bundle>;
}
