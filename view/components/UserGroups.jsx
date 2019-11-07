import React from 'react';
import {StdCheck} from './Inputs';

const UserGroups = (props) => {
	let list = [];

	for(let i = 0; i < props.list.length; ++i) {
		let group = props.list[i];

		list.push(<tr key={group.name}>
			<td>
				<StdCheck
					name={group.name}
					checked={props.selected.includes(i)}
					onChange={() => props.onChange(i)}
					label={group.name}
				/>
			</td>
			<td>
				{group.name}
			</td>
		</tr>);
	}

	if(list.length === 0) {
		list.push(<tr key={'empty'}>
			<td colSpan={2}>
				No groups assigned
			</td>
		</tr>);
	}

	return <div>
		<h4>Groups</h4>
		<table>
			<thead>
			<tr>
				<th/>
				<th>Name</th>
			</tr>
			</thead>
			<tbody>
			{list}
			</tbody>
		</table>
	</div>;
};

UserGroups.defaultProps = {
	list: [],
	selected: [],
	onChange: () => {}
};

export default UserGroups;