import React, {Fragment} from 'react';
import Loadable from 'react-loadable';
import {Switch,Route,Redirect} from 'react-router-dom';

import usersReducer from '../reducers/users';
import sectionsReducer from '../reducers/sections';
import imagesReducer from '../reducers/images';

import reducer_registry from '../reducer_registry';
import renderEntry from '../renderEntry';

import Body from '../components/Body';
import HeaderCont from '../components/HeaderBar';
import Loading from '../components/Loading';

reducer_registry.addReducer('users',usersReducer);
reducer_registry.addReducer('sections',sectionsReducer);
reducer_registry.addReducer('images',imagesReducer);

const App = (props) => <Fragment>
	<HeaderCont/>
	<Body>
	<Switch>
		<Route path={'/'} exact component={() => <Redirect to={'/dashboard'}/>}/>
		<Route path={'/dashboard'} exact component={() => <Fragment>
			dashboard
		</Fragment>}/>
		<Route path={'/users/:id([0-9]{1,}|new)'} component={Loadable({
			loader: () => import(/* webpackChunkName: "user_form" */'../components/UserFormPage'),
			loading: Loading
		})}/>
		<Route path={'/users'} component={Loadable({
			loader: () => import(/* webpackChunkName: "list_users" */'../containers/ListUsers'),
			loading: Loading
		})}/>
		<Route path={'/sections'} component={Loadable({
			loader: () => import(/* webpackChunkName: "list_sections" */'../containers/ListSections'),
			loading: Loading
		})}/>
		<Route path={'/images'} component={Loadable({
			loader: () => import(/* webpackChunkName: "list_images" */'../containers/ListImages'),
			loading: Loading
		})}/>
		<Route path={'/lorem'} component={Loadable({
			loader: () => import(/* webpackChunkName: "lorem" */'../components/LoremIpsum'),
			loading: Loading
		})}/>
	</Switch>
	</Body>
</Fragment>;

renderEntry(App);