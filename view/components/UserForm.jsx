import React, {Fragment} from 'react';
import {connect} from 'react-redux';

import {StdInput} from './Inputs';

class UserForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			username: '',
			email: '',
			fname: '',
			lname: ''
		};
	}

	updateUsername(value) {
		this.setState(() => ({
			username: value
		}));
	}

	updateEmail(value) {
		this.setState(() => ({
			email: value
		}));
	}

	updateFName(value) {
		this.setState(() => ({
			fname: value
		}));
	}

	updateLName(value) {
		this.setState(() => ({
			lname: value
		}));
	}

	render() {
		return <Fragment>
			<div
				style={{
					width: '30rem'
				}}
			>
				<StdInput
					has_value={this.state.username.length !== 0}
					value={this.state.username}
					type={'text'}
					label={'Username'}
					onValueChange={value => this.updateUsername(value)}
				/>
				<StdInput
					has_value={this.state.email.length !== 0}
					value={this.state.email}
					type={'text'}
					label={'Email'}
					onValueChange={value => this.updateEmail(value)}
				/>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						flexWrap: 'nowrap'
					}}
				>
					<StdInput
						has_value={this.state.fname.length !== 0}
						value={this.state.fname}
						type={'text'}
						label={'First Name'}
						onValueChange={value => this.updateFName(value)}
					/>
					<StdInput
						has_value={this.state.lname.length !== 0}
						value={this.state.lname}
						type={'text'}
						label={'Last Name'}
						onValueChange={value => this.updateLName(value)}
					/>
				</div>
			</div>
		</Fragment>;
	}
}

UserForm.defaultProps = {
	fetch_user: null
};

export default connect(
	state => ({}),
	dispatch => ({})
)(UserForm);