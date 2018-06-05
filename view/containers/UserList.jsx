import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import {getUserList} from '../actions/users';

import {IconButton} from '../components/Buttons';
import Icon from '../components/Icon';
import ReqResultModal from '../components/ReqResultModal';

class UserList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			view_error_modal: false,
			fetching: false
		};
	}

	static getDerivedStateFromProps(props,state) {
		if(props.req.fetching !== state.fetching) {
			return {
				fetching: props.req.fetching,
				view_error_modal: props.req.error
			}
		}

		return null;
	}

	componentDidMount() {
		this.props.getUserList();
	}

	hideErrorModal() {
		this.setState(() => ({
			view_error_modal: false
		}));
	}

	renderUserList() {
		let rtn = [];

		for(let user of this.props.user_list) {
			let user_name = 'no name set';
			let name_set = false;

			if(typeof user.name.first === 'string' && user.name.first.length !== 0) {
				user_name = user.name.first;
			}

			if(typeof user.name.last === 'string' && user.name.last.length !== 0) {
				if(name_set)
					user_name += ' ' + user.name.last;
				else
					user_name = user.name.last;
			}

			rtn.push(<tr key={user.id}>
				<td>
					<Link to={`/users/${user.id}`}>{user.username}</Link>
				</td>
				<td>{user.email === null ? 'no email' : user.email}</td>
				<td>{user_name}</td>
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
					<IconButton disabled={this.state.fetching} onClick={() => this.props.getUserList()}>
						<Icon>refresh</Icon>
					</IconButton>
				</h4>
				{this.state.view_error_modal ?
					<ReqResultModal
						title={'there was a problem getting the user list'}
						error={this.props.req.error}
						stack={this.props.req.stack}
						message={this.props.req.message}
						onClose={() => this.hideErrorModal()}
					/>
					:
					null
				}
				<table>
					<thead>
					<tr>
						<th>Username</th>
						<th>Email</th>
						<th>Name</th>
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
