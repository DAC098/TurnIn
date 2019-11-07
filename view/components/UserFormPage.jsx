import React from 'react';

import UserForm from './UserForm';

export default function UserFormPage(props) {
	let creating_user = props.match.params.id === 'new';
	let UserForm_props = {
		mode: creating_user ? 'create' : 'edit',
		id: creating_user ? null : parseInt(props.match.params.id,10)
	};

	return <div>
		<UserForm {...UserForm_props}/>
	</div>;
}