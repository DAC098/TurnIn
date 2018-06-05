import React, {Component} from 'react';
import {connect} from 'react-redux';

import {getImageList} from '../actions/images';

import {IconButton} from '../components/Buttons';
import Icon from '../components/Icon';
import Modal from './Modal';
import ReqResultModal from '../components/ReqResultModal';

class ImageList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			view_error_modal: false,
			fetching: false
		};
	}

	static getDerivedStateFromProps(props, state) {
		if(props.req.fetching !== state.fetching) {
			return {
				fetching: props.req.fetching,
				view_error_modal: props.req.error
			}
		}

		return null;
	}

	componentDidMount() {
		this.props.getImageList();
	}

	hideErrorModal() {
		this.setState(() => ({
			view_error_modal: false
		}));
	}

	renderImageList() {
		let rtn = [];

		for(let image of this.props.list) {
			rtn.push(<tr key={image.id}>
				<td>{image.image_name}</td>
				<td>{image.docker_id}</td>
				<td>{image.image_type}</td>
				<td>{image.image_status}</td>
				<td>{image.image_exists}</td>
				<td>{image.image_url}</td>
				<td>{image.username}</td>
			</tr>)
		}

		if(rtn.length === 0) {
			rtn.push(<tr key={'empty'}>
				<td colSpan={7}>
					No images to show
				</td>
			</tr>)
		}

		return rtn;
	}

	render() {
		return <div>
			<h4>
				<span>Images</span>
				<IconButton disabled={this.state.fetching} onClick={() => this.props.getImageList()}>
					<Icon>refresh</Icon>
				</IconButton>
			</h4>
			{this.state.view_error_modal ?
				<ReqResultModal
					title={'there was a problem getting the image list'}
					error={this.props.req.error}
					error_stack={this.props.req.stack}
					message={this.props.req.message}
					onClose={() => this.hideErrorModal()}
				/>
				:
				null
			}
			<table>
				<thead>
				<tr>
					<th>Name</th>
					<th>Docker Id</th>
					<th>Type</th>
					<th>Status</th>
					<th>Exists</th>
					<th>URL</th>
					<th>Owner</th>
				</tr>
				</thead>
				<tbody>
				{this.renderImageList()}
				</tbody>
			</table>
		</div>;
	}
}

export default connect(
	state => ({
		req: state.images.req_image_list,
		list: state.images.image_list
	}),
	dispatch => ({
		getImageList: () => dispatch(getImageList())
	})
)(ImageList);