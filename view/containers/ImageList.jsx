import React, {Component} from 'react';
import {connect} from 'react-redux';

import {getImageList} from '../actions/images';

import {IconButton} from '../components/Buttons';
import Icon from '../components/Icon';
import Modal from './Modal';

class ImageList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			view_error_modal: false
		};
	}

	getSnapshotBeforeUpdate(prev_props,prev_state) {
		if(prev_props.req.fetching !== this.props.req.fetching) {
			if(this.props.req.error) {
				return {
					show_error_modal: true
				}
			}
		}

		return null;
	}

	componentDidMount() {
		this.props.getImageList();
	}

	componentDidUpdate(prev_props,prev_state,snapshot) {
		if(snapshot) {
			if(snapshot.show_error_modal) {
				this.setState(() => ({
					view_error_modal: true
				}));
			}
		}
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
				<IconButton onClick={() => this.props.getImageList()}>
					<Icon>refresh</Icon>
				</IconButton>
			</h4>
			{this.state.view_error_modal ?
				<Modal>
					<IconButton onClick={() => this.hideErrorModal()}>
						<Icon>close</Icon>
					</IconButton>
					<span>there was a problem getting the image list</span>
					<p>{this.props.req.message}</p>
				</Modal>
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