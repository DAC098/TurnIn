import React, {Component} from 'react';
import {connect} from 'react-redux';

import {getSectionList} from '../actions/sections';

import Modal from './Modal';
import {IconButton} from '../components/Buttons';
import Icon from '../components/Icon';

class SectionListBase extends Component {
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
		this.props.getSectionList();
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

	renderSectionList() {
		let rtn = [];

		for(let section of this.props.list) {
			rtn.push(<tr key={section.id}>
				<td>{section.title}</td>
				<td>{section.num}</td>
				<td>{section.year}</td>
				<td>{section.semester}</td>
			</tr>)
		}

		if(rtn.length === 0) {
			rtn.push(<tr key={'empty'}>
				<td colSpan={4}>
					No sections to show
				</td>
			</tr>);
		}

		return rtn;
	}

	render() {
		return (
			<div>
				<h4>
					<span>Sections</span>
					<IconButton onClick={() => this.props.getSectionList()}>
						<Icon>refresh</Icon>
					</IconButton>
				</h4>
				{this.state.view_error_modal ?
					<Modal>
						<IconButton onClick={() => this.hideErrorModal()}>
							<Icon>close</Icon>
						</IconButton>
						<span>there was a problem getting the section list</span>
						<p>{this.props.req.message}</p>
					</Modal>
					:
					null
				}
				<table>
					<thead>
					<tr>
						<th>Title</th>
						<th>#</th>
						<th>Year</th>
						<th>Semester</th>
					</tr>
					</thead>
					<tbody>
					{this.renderSectionList()}
					</tbody>
				</table>
			</div>
		);
	}
}

const SectionList = connect(
	state => ({
		req: state.sections.req_section_list,
		list: state.sections.section_list
	}),
	dispatch => ({
		getSectionList: () => dispatch(getSectionList())
	})
)(SectionListBase);

export default SectionList;