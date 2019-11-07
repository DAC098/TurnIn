import React, {Fragment} from 'react';
import {Link,NavLink} from 'react-router-dom';

import MenuOption from './MenuOption';

export default function NavMenu(props) {
	return <Fragment>
		<Link to={'/'}>
			<MenuOption>
				Home
			</MenuOption>
		</Link>
		<Link to={'/users'}>
			<MenuOption>
				Users
			</MenuOption>
		</Link>
		<Link to={'/sections'}>
			<MenuOption>
				Sections
			</MenuOption>
		</Link>
		<Link to={'/images'}>
			<MenuOption>
				Images
			</MenuOption>
		</Link>
		<Link to={'/lorem'}>
			<MenuOption>
				Lorem Ipsum
			</MenuOption>
		</Link>
	</Fragment>;
}