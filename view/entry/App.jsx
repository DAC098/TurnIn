import React, {Fragment,Component} from 'react';
import {Switch,Route,Link} from 'react-router-dom';
import {connect} from 'react-redux';

import {
	setTheme
} from '../actions/theme';
import {
	closeServer
} from '../actions/system';

import usersReducer from '../reducers/users';
import sectionsReducer from '../reducers/sections';
import imagesReducer from '../reducers/images';

import reducer_registry from '../reducer_registry';
import renderEntry from '../renderEntry';

import Body from '../components/Body';
import Header from '../components/Header';
import {IconButton} from '../components/Buttons';
import Icon from '../components/Icon';
import {lazyLoad} from '../components/Bundle';
import SideMenu from '../components/SideMenu';
import MenuOption from '../components/MenuOption';
import Modal from '../containers/Modal';
import UserList from '../containers/UserList';
import SectionList from '../containers/SectionList';
import ImageList from '../containers/ImageList';

reducer_registry.addReducer('users',usersReducer);
reducer_registry.addReducer('sections',sectionsReducer);
reducer_registry.addReducer('images',imagesReducer);

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			view_menu: false,
			view_options: false,
			view_close_res: false
		};
		this.timers = {
			/**
			 * @type {null|number}
			 */
			view_close_res: null
		};
	}

	getSnapshotBeforeUpdate(prev_props,prev_state) {
		if(prev_props.close_status.fetching !== this.props.close_status.fetching) {
			return {
				show_close_req_modal: true
			};
		}

		return null;
	}

	componentDidUpdate(prev_props, prev_state, snapshot) {
		if(snapshot) {
			if(snapshot.show_close_req_modal) {
				if(this.timers.view_close_res)
					clearTimeout(this.timers.view_close_res);

				if(!this.props.close_status.error)
					this.timers.view_close_res = setTimeout(() => {
						this.setState(() => ({
							view_close_res: false
						}));
					},2500);

				this.setState(() => ({
					view_close_res: true
				}));
			}
		}
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

	hideCloseModal() {
		if(this.timers.view_close_res)
			clearTimeout(this.timers.view_close_res);

		this.setState(() => ({
			view_close_res: false
		}));
	}

	render() {
		return <Fragment>
			{this.state.view_close_res ?
				<Modal>
					<IconButton
						style={{
							position: 'absolute',
							top: 0,
							right: 0
						}}
						onClick={() => this.hideCloseModal()}
					>
						<Icon>close</Icon>
					</IconButton>
					{this.props.close_status.error ?
						<span>there was an error</span>
						:
						null
					}
					<p>{this.props.close_status.message}</p>
				</Modal>
				:
				null
			}
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
				<section>
					<IconButton onClick={() => this.showOptions(!this.state.view_options)}>
						<Icon>more_vert</Icon>
					</IconButton>
				</section>
			</Header>
			<SideMenu
				visible={this.state.view_menu}
				position={'left'}
				onClose={() => this.showMenu(false)}
			>
				<Link to={'/'}>
					<MenuOption>
						Home
					</MenuOption>
				</Link>
				<Link to={'/lorem'}>
					<MenuOption>
						Lorem Ipsum
					</MenuOption>
				</Link>
			</SideMenu>
			<SideMenu
				visible={this.state.view_options}
				position={'right'}
				onClose={() => this.showOptions(false)}
			>
				<MenuOption onClick={() => this.props.setTheme(this.props.theme === 'dark' ? 'light' : 'dark')}>
					Change Theme
				</MenuOption>
				<MenuOption onClick={() => this.props.closeServer()}>
					Close Server
				</MenuOption>
			</SideMenu>
			<Body>
			<Switch>
				<Route path={'/lorem'} exact component={lazyLoad(
					import(/* webpackChunkName: "lorem" */'../components/LoremIpsum')
				)}/>
				<Route path={'/'} exact component={() => <Fragment>
					<section style={{
						display: 'flex',
						flexDirection: 'row',
						flexWrap: 'wrap'
					}}>
						<UserList/>
						<SectionList/>
						<ImageList/>
					</section>
				</Fragment>}/>
			</Switch>
			</Body>
		</Fragment>;
	}
}

renderEntry(
	connect(
		state => ({
			theme: state.theme.style,
			close_status: state.system.req_close
		}),
		dispatch => ({
			setTheme: type => dispatch(setTheme(type)),
			closeServer: () => dispatch(closeServer())
		})
	)(App)
);