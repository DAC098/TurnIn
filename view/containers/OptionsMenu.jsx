import React, {Fragment} from 'react';
import {connect} from 'react-redux';

import {
	setTheme
} from '../actions/theme';
import {
	closeServer
} from '../actions/system';


import ReqResultModal from '../components/ReqResultModal';
import MenuOption from '../components/MenuOption';

class OptionsMenu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			view_close_res: false,
			fetching: false
		};
	}

	static getDerivedStateFromProps(props, state) {
		if(props.close_status.fetching !== state.fetching) {
			return {
				view_close_res: !props.close_status.fetching ,
				fetching: props.close_status.fetching
			}
		}

		return null;
	}

	hideCloseModal() {
		this.setState(() => ({
			view_close_res: false
		}));
	}

	render() {
		let {close_status} = this.props;

		return <Fragment>
			{this.state.view_close_res ?
				<ReqResultModal
					title={close_status.error ?
						'there was a problem closing the server' :
						'closed the server successfully'
					}
					error={close_status.error}
					message={close_status.message}
					onClose={() => this.hideCloseModal()}
				/>
				:
				null
			}
			<MenuOption onClick={() => this.props.setTheme(this.props.theme === 'dark' ? 'light' : 'dark')}>
				Change Theme
			</MenuOption>
			<MenuOption onClick={() => this.props.closeServer()}>
				Close Server
			</MenuOption>
		</Fragment>
	}
}

export default connect(
	state => ({
		theme: state.theme.style,
		close_status: state.system.req_close
	}),
	dispatch => ({
		setTheme: type => dispatch(setTheme(type)),
		closeServer: () => dispatch(closeServer())
	})
)(OptionsMenu);