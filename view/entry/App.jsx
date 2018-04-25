import React, {Fragment,Component} from 'react';
import {Switch,Route,Link} from 'react-router-dom';

import renderEntry from '../renderEntry';

import Body from '../components/Body';
import Header from '../components/Header';
import {IconButton} from '../components/Buttons';
import Icon from '../components/Icon';
import {lazyLoad} from '../components/Bundle';
import SideMenu from '../components/SideMenu';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			view_menu: false
		}
	}

	showMenu(display) {
		this.setState(() => ({
			view_menu: display
		}));
	}

	render() {
		return <Fragment>
			<Header style={{
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
				<section/>
			</Header>
			<SideMenu
				visible={this.state.view_menu}
				position={'left'}
				onClose={() => this.showMenu(false)}
			/>
			<Body>
			<Switch>
				<Route path={'/lorem'} exact component={lazyLoad(
					import(/* webpackChunkName: "lorem" */'../components/LoremIpsum')
				)}/>
				<Route path={'/'} exact component={() => <Fragment>
					<p>home page</p>
					<Link to={'/lorem'}>Lorem Ipsum</Link>
				</Fragment>}/>
			</Switch>
			</Body>
		</Fragment>;
	}
}

renderEntry(App);