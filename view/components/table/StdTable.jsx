import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import filter    from 'lodash/filter';
import clone     from 'lodash/clone';
import cloneDeep from 'lodash/cloneDeep';

import * as common from './common';

import StdTableHeadCell from './StdTableHeadCell';
import StdTableHeadRow from './StdTableHeadRow';
import StdTableDetailRow from './StdTableDetailRow';
import StdTableBodyRow from './StdTableBodyRow';

import * as sorter  from '../../sorter';

/**
 * allows for the consistent display of information in table. allows for local
 * sorting of tables as well as being able to sort by methods provided. also
 * allows for columns to be added and removed based on the default template
 * provided
 */
class StdTableBase extends React.Component {
	constructor(props) {
		super(props);

		let widths = new Map();

		if(this.props.columns instanceof Map) {
			let len = this.props.columns.size;
			for(let [key,col] of this.props.columns) {
				widths.set(key,{
					active: true,
					width: 1 / len * 100
				});
			}
		} else {
			let len = this.props.columns instanceof Set ? this.props.columns.size : this.props.columns.length;
			for(let col of this.props.columns) {
				widths.set(col.name, {
					active: true,
					width : 1 / len * 100
				});
			}
		}

		if(props.getWidth)
			widths = props.getWidth(widths);

		widths = this.getColumnWidths(widths,props.viewOverride,true);

		this.state = {
			index  : {},
			sorting: {
				index: {},
				order: []
			},
			sorted : [],
			list   : [],
			widths
		};

		this.ele = {};
		this.table_ref = React.createRef();
		this.tbody_ref = React.createRef();
	}

	componentDidMount() {
		this.sortList();
	}

	UNSAFE_componentWillReceiveProps(next_props) {
		this.sortList(next_props.list,next_props.sortOverride,next_props.viewOverride);
		this.getColumnWidths(this.state.widths,next_props.viewOverride);
	}

	forEachCol(cb) {
		if(this.props.columns instanceof Map) {
			for(let [key,col] of this.props.columns) {
				cb(key,col);
			}
		} else {
			for(let col of this.props.columns) {
				cb(col.name,col);
			}
		}
	}

	getCol(id) {
		if(this.props.columns instanceof Map) {
			return this.props.columns.get(id);
		} else {
			for(let col of this.props.columns) {
				if(col.name === id)
					return col;
			}
		}
	}

	/**
	 * wrapper for getSortedList, calls props.onSortStart
	 * @param [list]         {object[]}
	 * @param [sortOverride] {*[]}
	 * @param [viewOverride] {*[]}
	 */
	sortList(list,sortOverride,viewOverride) {
		this.getSortedList(list,sortOverride,viewOverride);
	}

	/**
	 * is used to recalculate each row width in the table based off of the
	 * information given. needs work, math creates inconsistent results for
	 * rows removed and added
	 * @param [widths]       {object[]} the widths to calculate
	 * @param [viewOverride] {*[]}      the list of columns that are not in
	 *                                  the view
	 * @param [rtn]          {boolean}  to return a value or set the state
	 * @returns {object[]|undefined} the recalculated widths
	 */
	getColumnWidths(widths,viewOverride,rtn = false) {
		if(!viewOverride)
			viewOverride = this.props.viewOverride;

		if(!widths)
			widths = cloneDeep(this.state.widths);

		// console.log('current widths',widths);
		// console.log('current viewOverride',viewOverride);

		// stores the index's of the columns that will be modified
		let total_active = [];
		// holds the active count
		let active_count = 0;
		let diff_a = 0;
		let diff_w = 0;
		// console.log('stepping thru widths');
		// begin to iterate over the current set of widths
		for(let [key,val] of widths) {
			let col_inactive = common.checkIndexIfViewOverridden(viewOverride,key);
			if(val.active && !col_inactive) {
				// console.log('index',key,'active and in view');
				++active_count;
				total_active.push(key);
			} else if(!val.active && !col_inactive) {
				// console.log('index',key,'inactive and in view');
				diff_w += val.width;
				++diff_a;
				total_active.push(key);
			} else if(val.active && col_inactive) {
				// console.log('index',key,'active and not in view');
				diff_w -= val.width;
				--diff_a;
				val.active = false;
			} else {
				// console.log('index',key,'inactive and not in view')
			}

			widths.set(key,val);
		}

		// console.log('widths',widths);
		// console.log('diff_a',diff_a);
		// console.log('diff_w',diff_w);

		// this holds the value that each row will be modified by
		// each active column will add this derived value
		let mod_width = diff_w / (active_count - diff_a);
		// console.log('mod_width',mod_width);

		for(let i = 0,len = total_active.length; i < len; ++i) {
			let col_index = total_active[i];
			let w = widths.get(col_index);
			// console.log('index',col_index,'was active',w.active,'width',w.width,'modded',w.width + mod_width);
			w.width = w.width + (w.active ? mod_width : 0);
			w.active = true;
			widths.set(col_index,w);
		}

		if(this.props.onRecalcWidth)
			widths = this.props.onRecalcWidth(widths);

		if(rtn) {
			// console.log('returning widths',widths);
			return widths;
		} else {
			// console.log('setting widths state',widths);
			this.setState({widths});
		}
	}

	/**
	 * updates the sorting set by adding or removing the specified id from the
	 * given event
	 * @param event
	 * @param id {number} the id of the sort column, should represent the index
	 *                    of the column it was triggered for
	 */
	handleSort(event, id) {
		let index = clone(this.state.sorting.index);
		let order = clone(this.state.sorting.order);

		if(event.ctrlKey && event.altKey) {
			// alt + ctrl + left click
			// remove from sort list if exists

			// check if the id is in the index
			if(id in index) {
				// delete the id from the index
				delete index[id];
				// filter out the id from the order list
				order = filter(order, sort => {
					return sort.id !== id;
				});
			} else {
				return;
			}
		} else if(event.ctrlKey) {
			// ctrl + left click
			// add to sort list or modify if already sorting

			// if the id is in the index
			if(id in index) {
				// swap the value of asc
				order[index[id]].asc = !order[index[id]].asc;
			} else {
				// else add the id to the index
				index[id] = order.length;
				// set the asc to false
				order.push({
					id : id,
					asc: false
				});
			}
		} else {
			// left click
			// sort by one item or modify if already sorting,

			// reset the index to only have the id given
			index     = {};
			index[id] = 0;

			// if the id existed in the index
			if(id in this.state.sorting.index) {
				// reset the order with the swapped value of asc from the one that is stored
				order = [
					{
						id : id,
						asc: !this.state.sorting.order[this.state.sorting.index[id]].asc
					}
				];
			} else {
				// else reset the order to the new id
				order = [
					{
						id : id,
						asc: false
					}
				];
			}
		}

		// set the new state
		this.setState({
			sorting: {
				index: index,
				order: order
			}
		},() => {
			this.sortList();
		});
	}

	/**
	 * creates a new sorted list from the list provided, updates the state
	 * from the default sort method or the one generated from
	 * props.sortMethodOverride
	 * @param [new_list]     {object[]} the new list to sort, defaults to the
	 *                                  current list
	 * @param [sortOverride] {*[]}      the sort overrides that will be used,
	 *                                  defaults to the current overrides
	 * @param [viewOverride] {*[]}      the new list of columns not active in
	 *                                  view, defaults to the current list
	 */
	getSortedList(new_list, sortOverride, viewOverride) {
		if(!new_list)
			new_list = this.props.list;

		if(!sortOverride)
			sortOverride = this.props.sortOverride;

		if(!viewOverride)
			viewOverride = this.props.viewOverride;

		if(!Array.isArray(new_list))
			return;

		let list             = new_list.slice(); // make a copy of the list given
		let sort_list        = []; // stores the list of sorts performed
		let sorted           = {}; // will store the columns already sorted
		let sorting_override = [];
		let sorting          = []; // stores a list of sorting references that will be run

		// console.log('checking sortOverride');
		// get a list of all the sorting methods that will be run from the override
		for(let sort of sortOverride) {
			// check to see if there should be a sort
			let col = this.getCol(sort.id);
			if(col) {
				if((col.sorting ||
				   typeof col.sorting === 'undefined') &&
				   (sort.active || typeof sort.active === 'undefined') &&
				   !common.checkIndexIfViewOverridden(viewOverride,sort.id)
				) {
					let push = {
						id: sort.id,
						asc: sort.asc,
						override: true,
						is_func: typeof col.sorting === 'function'
					};

					sorted[sort.id] = 1;
					sorting_override.push(push);
					sort_list.push(push);
				}
			}
		}

		// console.log('checking sortLocal');
		for(let sort of this.state.sorting.order) {
			let col = this.getCol(sort.id);
			if(col) {
				if(!(sort.id in sorted) &&
				   (col.sorting || typeof col.sorting === 'undefined') &&
				   !common.checkIndexIfViewOverridden(viewOverride,sort.id)
				) {
					let push = {
						id: sort.id,
						asc: sort.asc,
						override: false,
						is_func: typeof col.sorting === 'function'
					};

					sorting.push(push);
					sort_list.push(push);
				}
			}
		}

		// console.log('sorting',sorting);
		// console.log('sort_list',sort_list);

		if(!sort_list.length) {
			// console.log('no values to sort, setting list');
			this.setState({
				list: list,
				sorted: sort_list
			});
			return;
		}

		if(this.props.sortMethodOverride) {
			// console.log('running sortMethodOverride');
			let res = this.props.sortMethodOverride(list, sort_list);

			if(typeof res.then === 'function') {
				// console.log('result is promise, waiting');
				res.then((result) => {
					// console.log('promise finished, setting result',result);
					this.setState({
						list: result.list,
						sorted: result.sorted
					});
				}).catch((err) => {
					// console.log('promise failed');
					console.error(err);
				});
			} else {
				// console.log('setting result');
				this.setState({
					list: res.list,
					sorted: res.sorted
				});
			}

			return;
		}

		// console.log('running default sort method');
		// if there are any values in sorting, run the sort with values stored, else continue with the list unaffected
		list = sorting_override.length ? list.sort((a, b) => {
			for(let sort of sorting_override) {
				// if sorting value is a function then get that result else run the defualt sort with a and b along with the name of the variable to check
				let col = this.getCol(sort.id);
				let res = sort.is_func ?
					col.sorting(a, b) :
					sorter.sortByStr(a, b, col.name);
				if(res !== 0) // if the result from the compare is not 0 then return that value
					return sort.asc ? res * -1 : res; // if the sort is asc then mult by -1 to flip result
			}

			return 0; // in case no sort was run
		}) : list;

		// if the local sort list has any values then run the remaining sorts on the list
		// else continue with the operation
		list = sorting.length ? list.sort((a, b) => {
			for(let sort of sorting) {
				// if sorting value is a function then get that result else run the defualt sort with a and b along with the name of the variable to check
				let col = this.getCol(sort.id);
				let res = sort.is_func ?
					col.sorting(a, b) :
					sorter.sortByStr(a, b, col.name);
				if(res !== 0) // if the result from the compare is not 0 then return that value
					return sort.asc ? res * -1 : res; // if the sort is asc then mult by -1 to flip result
			}

			return 0; // in case no sort was run
		}) : list;

		sorted  = null;
		sorting = null;

		// console.log('setting result');
		// return object containing sort results and the list of sort methods used
		this.setState({list,sorted: sort_list,e_sorting: false});
	}

	getHeadRow(key,col) {
		if(common.checkIndexIfViewOverridden(this.props.viewOverride,key))
			return null;

		let w = this.state.widths.get(key);
		let should_sort = 'sorting' in col  ?
			(typeof col.sorting === 'boolean' ?
				col.sorting :
				true) :
			false;

		if(should_sort) {
			let index = this.state.sorted.findIndex(item => {
				return item.id === key;
			});
			let sorting = index !== -1;

			return <StdTableHeadCell
				key={key}
				id={key}
				width={w.width}
				should_sort={true}
				sort_index={sorting ? index + 1 : null}
				multi_sort={this.state.sorted.length > 1}
				sorting={sorting}
				overridden={sorting ? this.state.sorted[index].override : false}
				asc={sorting ? this.state.sorted[index].asc : false}
				item={col}
				handleSort={(event, id) => this.handleSort(event, id)}
			/>;
		} else {
			return <StdTableHeadCell
				key={key}
				id={key}
				item={col}
				width={w.width}
			/>;
		}
	}

	/**
	 * generates the table header row
	 * @returns {Array}
	 */
	genHead() {
		let rtn = [];

		this.forEachCol((key,col) => {
			let h = this.getHeadRow(key,col);

			if(h)
				rtn.push(h);
		});

		return rtn;
	}

	/**
	 * generates the table body rows
	 * @returns {Array}
	 */
	genRows() {
		return this.state.list.map((item, index) => {
			return this.props.rowDetail ?
				<StdTableDetailRow
					odd_row={index % 2 === 0}
					key={item.id || index}
					widths={this.state.widths}
					columns={this.props.columns}
					viewOverride={this.props.viewOverride}
					record={item}
					rowDetail={this.props.rowDetail}
					noAnimate={this.props.noAnimate}
				>
					<StdTableBodyRow
						widths={this.state.widths}
						columns={this.props.columns}
						viewOverride={this.props.viewOverride}
						record={item}
					/>
				</StdTableDetailRow>
				:
				<StdTableBodyRow
					key={item.id || index}
					odd_row={index % 2 === 0}
					widths={this.state.widths}
					columns={this.props.columns}
					viewOverride={this.props.viewOverride}
					record={item}
				/>;
		});
	}

	render() {
		return <section
				className={this.props.className}
				ref={this.table_ref}
			>
			<StdTableHeadRow top={this.props.top}>
				{this.genHead()}
			</StdTableHeadRow>
			<section ref={this.tbody_ref}>
			{this.genRows()}
			</section>
		</section>;
	}
}

StdTableBase.propTypes = {
	sortOverride      : PropTypes.arrayOf(PropTypes.shape({
		id    : PropTypes.string.isRequired,
		asc   : PropTypes.bool.isRequired,
		active: PropTypes.bool
	})),
	sortMethodOverride: PropTypes.func,
	viewOverride      : PropTypes.arrayOf(PropTypes.oneOfType([
		PropTypes.shape({
			index : PropTypes.string.isRequired,
			active: PropTypes.bool
		}),
		PropTypes.number,
		PropTypes.string
	])),
	getWidth          : PropTypes.func,
	onRecalcWidth     : PropTypes.func,
	rowDetail         : PropTypes.func,
	list              : PropTypes.array.isRequired,
	noAnimate         : PropTypes.bool,
	onSortStart       : PropTypes.func,
	onSortEnd         : PropTypes.func,
	top               : PropTypes.oneOfType([PropTypes.number,PropTypes.string])
};

StdTableBase.defaultProps = {
	sortOverride: [],
	viewOverride: new Set()
};

export const StdTable = styled(StdTableBase)`
	width: 100%;
`;

export default StdTable;