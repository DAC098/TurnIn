import React, {Fragment,Component} from 'react';
import {Switch,Route,Link} from 'react-router-dom';

import usersReducer from '../reducers/users';
import sectionsReducer from '../reducers/sections';
import imagesReducer from '../reducers/images';

import reducer_registry from '../reducer_registry';
import renderEntry from '../renderEntry';

import Body from '../components/Body';

import {lazyLoad} from '../components/Bundle';

import UserList from '../containers/UserList';
import SectionList from '../containers/SectionList';
import ImageList from '../containers/ImageList';
import HeaderCont from '../containers/HeaderCont';

reducer_registry.addReducer('users',usersReducer);
reducer_registry.addReducer('sections',sectionsReducer);
reducer_registry.addReducer('images',imagesReducer);

const App = (props) => <Fragment>
	<HeaderCont/>
	<Body>
	<Switch>
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
		<Route path={'/lorem'} component={lazyLoad(
			import(/* webpackChunkName: "lorem" */'../components/LoremIpsum')
		)}/>
	</Switch>
	</Body>
</Fragment>;

renderEntry(App);