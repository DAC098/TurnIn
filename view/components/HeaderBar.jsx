import React, {Fragment} from 'react';

import OptionsMenu from '../containers/OptionsMenu';

import HeaderStyle from './HeaderStyle';
import SideMenu from './SideMenu';
import {IconButton} from './Buttons';
import Icon from './Icon';
import NavMenu from './NavMenu';

export default class HeaderBar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			view_menu: false,
			view_options: false
		};
	}

	showMenu(display) {
		this.setState(() => ({
			view_menu: display
		}));
	}

	showOptions(display) {
		this.setState(() => ({
			view_options: display
		}));
	}

	render() {
		return <Fragment>
			<HeaderStyle style={{
				display: 'flex',
				alignItems: 'center'
			}}>
				<section>
					<IconButton onClick={() => this.showMenu(!this.state.view_menu)}>
						<Icon>menu</Icon>
					</IconButton>
				</section>
				<section style={{
					flexGrow: 1
				}}/>
				<section>
					<IconButton onClick={() => this.showOptions(!this.state.view_options)}>
						<Icon>more_vert</Icon>
					</IconButton>
				</section>
			</HeaderStyle>
			<SideMenu
				visible={this.state.view_menu}
				position={'left'}
				onClose={() => this.showMenu(false)}
			>
				<NavMenu/>
			</SideMenu>
			<SideMenu
				visible={this.state.view_options}
				position={'right'}
				onClose={() => this.showOptions(false)}
			>
				<OptionsMenu/>
			</SideMenu>
		</Fragment>;
	}
}