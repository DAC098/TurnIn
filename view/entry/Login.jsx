import React from 'react';

import renderEntry from '../renderEntry';
import req from '../lib/request';

import Card from '../components/Card';
import {StdInput} from '../components/Inputs';
import {Button} from '../components/Buttons';

class Login extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			username: '',
			password: ''
		}
	}

	updateUsername(value) {
		this.setState(() => ({username:value}));
	}

	updatePassword(value) {
		this.setState(() => ({password:value}));
	}

	async loginRequest() {
		try {
			let res = await req.post('/auth',{
				username: this.state.username,
				password: this.state.password
			});

			if(res.status === 200) {
				window.location = '/';
			} else {

			}
		} catch(err) {
			console.error(err);
		}
	}

	render() {
		return (
			<div>
				<Card style={{
					position: 'relative',
					marginLeft: 'auto',
					marginRight: 'auto'
				}}>
					<form onSubmit={(e) => {
						e.preventDefault();
						this.loginRequest();
					}}>
						<StdInput
							label={'Username'}
							type={'text'}
							value={this.state.username}
							has_value={this.state.username.length !== 0}
							onChange={e => this.updateUsername(e.target.value)}
						/>
						<StdInput
							label={'Password'}
							type={'password'}
							value={this.state.password}
							has_value={this.state.password.length !== 0}
							onChange={e => this.updatePassword(e.target.value)}
						/>
						<Button
							primary
							type={'submit'}
						>
							Login
						</Button>
					</form>
				</Card>
			</div>
		)
	}
}

renderEntry(Login);