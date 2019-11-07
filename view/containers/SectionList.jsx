import React, {Component} from 'react';
import {connect} from 'react-redux';

import {getSectionList} from '../actions/sections';

import {IconButton} from '../components/Buttons';
import Icon from '../components/Icon';
import ReqResultModal from '../components/ReqResultModal';

class SectionList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			view_error_modal: false,
			fetching: false
		};
	}

	static getDerivedStateFromProps(props,state) {
		if(props.req.fetching !== state.fetching) {
			return {
				fetching: props.req.fetching,
				view_error_modal: props.req.error
			}
		}

		return null;
	}

	componentDidMount() {
		this.props.getSectionList();
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
					<IconButton disabled={this.state.fetching} onClick={() => this.props.getSectionList()}>
						<Icon>refresh</Icon>
					</IconButton>
				</h4>
				{this.state.view_error_modal ?
					<ReqResultModal
						title={'there was a problem getting the section list'}
						error={this.props.req.error}
						stack={this.props.req.stack}
						message={this.props.req.message}
						onClose={() => this.hideErrorModal()}
					/>
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

export default connect(
	state => ({
		req: state.sections.req_section_list,
		list: state.sections.section_list
	}),
	dispatch => ({
		getSectionList: () => dispatch(getSectionList())
	})
)(SectionList);