import React, {Fragment} from 'react';
import {connect} from 'react-redux';

import {getUserData} from '../actions/users';
import {default_permissions} from 'modules/variables';

import {StdInput} from './Inputs';
import UserPermissionGroup from './UserPermissionGroup';
import UserGroups from './UserGroups';

class UserForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			username: '',
			email: '',
			fname: '',
			lname: '',
			permissions_modified: [],
			group_list: [],
			group_list_selected: [],
			last_group_list_selected: 0,
			fetching: false,
			view_error_message: false
		};
	}

	static getDerivedStateFromProps(props, state) {
		if(props.req.fetching !== state.fetching) {
			let input_updates = {};

			if(!props.req.fetching && !props.req.error) {
				let group_list = [];

				for(let group of props.user_data.groups) {
					group_list.push({
						name: group,
						action: null
					});
				}

				input_updates = {
					username: props.user_data.username,
					email: props.user_data.email || '',
					fname: props.user_data.name.first || '',
					lname: props.user_data.name.last || '',
					group_list,
				}
			}

			return {
				...input_updates,
				fetching: props.req.fetching,
				view_error_message: props.req.error
			}
		}

		return null;
	}

	componentDidMount() {
		if(this.props.mode === 'edit' && !this.props.no_fetch) {
			this.props.getUserData(this.props.id)
		}
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

	updatePermission(name) {
		let {permissions_modified} = this.state;
		let list = [];
		let index = permissions_modified.indexOf(name);
		let len = permissions_modified.length;

		if(index >= 0) {
			for(let i = 0; i < len; ++i) {
				if(i !== index)
					list.push(permissions_modified[i]);
			}
		} else {
			list = [...permissions_modified,name];
		}

		this.setState(() => ({
			permissions_modified: list
		}));
	}

	updateGroupListSelected(i) {
		let {group_list_selected} = this.state;
		let list = [];
		let index = group_list_selected.indexOf(i);
		let len = group_list_selected.length;

		if(index >= 0) {
			for(let i = 0; i < len; ++i) {
				if(i !== index)
					list.push(group_list_selected[i]);
			}
		} else {
			list = [...group_list_selected,i];
		}

		this.setState(() => ({
			group_list_selected: list
		}));
	}

	renderUserPermissions() {
		let rtn = [];

		for(let key in default_permissions) {
			rtn.push(<UserPermissionGroup
				key={`permission/${key}`}
				title={key}
				group={key}
				permissions={default_permissions[key]}
				users={this.props.user_data ? this.props.user_data.permissions[key] : {}}
				modified={this.state.permissions_modified}
				onChange={(name) => this.updatePermission(name)}
			/>);
		}

		return rtn;
	}

	render() {
		let {req} = this.props;

		return <section
			style={{
				width: 'fit-content',
				marginLeft: 'auto',
				marginRight: 'auto'
			}}
		>
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
				<h4 style={{marginBottom: 0}}>Permissions</h4>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						flexWrap: 'wrap'
					}}
				>
					{this.renderUserPermissions()}
				</div>
				<span style={{whiteSpace:'pre-line'}}>{!req.fetching && req.error ? req.message : ' '}</span>
			</div>
			<div>
				<UserGroups
					list={this.state.group_list}
					selected={this.state.group_list_selected}
					onChange={(i) => this.updateGroupListSelected(i)}
				/>
			</div>
		</section>;
	}
}

UserForm.defaultProps = {
	mode: 'create',
	id: null,
	no_fetch: false
};

export default connect(
	state => ({
		req: state.users.req_user_data,
		user_data: state.users.user_data
	}),
	dispatch => ({
		getUserData: (id) => dispatch(getUserData(id))
	})
)(UserForm);