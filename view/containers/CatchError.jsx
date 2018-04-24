import React from 'react';

/**
 * basic implementation for React's error handling, will display the error and
 * component stack in place of the children that it holds, the default error
 * message can be replaced with function that can return a valid React Child
 */
export default class CatchError extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			failed: false,
			error: null,
			info: null
		};
	}

	componentDidCatch(error,info) {
		this.setState(() => {
			console.error('Caught UI error\n',error.stack,'\n\ncomponent stack:',info.componentStack);
			return {error,info,failed: true}
		});
	}

	formatError() {
		return {__html: 'Caught UI error\n' + this.state.error.stack}
	}

	formatInfo() {
		return {__html: 'Component Stack' + this.state.info.componentStack}
	}

	render() {
		return this.state.failed ?
			this.props.error_component ?
				this.props.error_component(this.state.error,this.state.info) :
				[
					<pre key={0} dangerouslySetInnerHTML={this.formatError()}/>,
					<pre key={1} dangerouslySetInnerHTML={this.formatInfo()}/>
				]
			:
			this.props.children;
	}
}

CatchError.defaultProps = {
	error_component: false
};