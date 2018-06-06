import React from 'react';

import {StdCheck} from './Inputs';

const UserPermissionGroup = (props) => {
	let permission_list = [];

	for(let key in props.permissions) {
		let name = `${props.group}/${key}`;
		let use_users = key in props.users && props.users[key] !== props.permissions[key];
		let value = use_users ? props.users[key] : props.permissions[key];

		permission_list.push(<StdCheck
			key={name}
			name={name}
			checked={props.modified.includes(name) ? !value : value}
			onChange={() => props.onChange(name)}
			label={key}
		/>);
	}

	return <div style={{
		margin: '1rem 0 1rem 1rem'
	}}>
		<h5 style={{marginTop: 0}}>{props.title}</h5>
		{permission_list}
	</div>;
};

UserPermissionGroup.defaultProps = {
	title: '',
	group: '',
	permissions: {},
	users: {},
	modified: [],
	onChange: () => {}
};

export default UserPermissionGroup;