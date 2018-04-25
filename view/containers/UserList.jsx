import React, {Component} from 'react';
import {connect} from 'react-redux';

import {getUserList} from '../actions/users';

import Modal from './Modal';
import {IconButton} from '../components/Buttons';
import Icon from '../components/Icon';

class UserList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			view_error_modal: false
		};
	}

	getSnapshotBeforeUpdate(prev_props,prev_state) {
		if(prev_props.req.fetching !== this.props.req.fetching) {
			if(this.props.req.error) {
				return {
					show_error_modal: true
				}
			}
		}

		return null;
	}

	componentDidMount() {
		this.props.getUserList();
	}

	componentDidUpdate(prev_props,prev_state,snapshot) {
		if(snapshot) {
			if(snapshot.show_error_modal) {
				this.setState(() => ({
					view_error_modal: true
				}));
			}
		}
	}

	hideErrorModal() {
		this.setState(() => ({
			view_error_modal: false
		}));
	}

	renderUserList() {
		let rtn = [];

		for(let user of this.props.user_list) {
			rtn.push(<tr key={user.id}>
				<td>{user.username}</td>
				<td>{user.email === null ? 'no email' : user.email}</td>
				<td>{user.type}</td>
			</tr>);
		}

		if(rtn.length === 0) {
			rtn.push(<tr key={'empty'}>
				<td colSpan={3}>
					No users to show
				</td>
			</tr>);
		}

		return rtn;
	}

	render() {
		return (
			<div>
				<h4>
					<span>Users</span>
					<IconButton onClick={() => this.props.getUserList()}>
						<Icon>refresh</Icon>
					</IconButton>
				</h4>
				{this.state.view_error_modal ?
					<Modal>
						<IconButton onClick={() => this.hideErrorModal()}>
							<Icon>close</Icon>
						</IconButton>
						<span>there was a problem getting the user list</span>
						<p>{this.props.req.message}</p>
					</Modal>
					:
					null
				}
				<table>
					<thead>
					<tr>
						<th>Username</th>
						<th>Email</th>
						<th>Type</th>
					</tr>
					</thead>
					<tbody>
					{this.renderUserList()}
					</tbody>
				</table>
			</div>
		);
	}
}

export default connect(
	state => ({
		req: state.users.req_user_list,
		user_list: state.users.user_list
	}),
	dispatch => ({
		getUserList: () => dispatch(getUserList())
	})
)(UserList);
