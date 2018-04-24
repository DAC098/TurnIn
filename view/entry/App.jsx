import React, {Fragment} from 'react';
import {Switch,Route,Link} from 'react-router-dom';

import renderEntry from '../renderEntry';

import Body from '../components/Body';
import Header from '../components/Header';
import {IconButton} from '../components/Buttons';
import Icon from '../components/Icon';
import {lazyLoad} from '../components/Bundle';

const App = () => <Fragment>
	<Header style={{
		display: 'flex',
		alignItems: 'center'
	}}>
		<section>
			<IconButton>
				<Icon>menu</Icon>
			</IconButton>
		</section>
		<section style={{
			flexGrow: 1
		}}/>
		<section/>
	</Header>
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

renderEntry(App);