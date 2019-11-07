import React  from 'react';
import PropTypes  from 'prop-types';
import ClassNames  from 'classnames';
import styled from 'styled-components';

import parseName from '../../parseName';

import {colors} from '../../colors';

/**
 * creates the header row for the table, if a column is sortable then it
 * will display the column as being sortable. when a column is being
 * sorted it will give a visual queue as well as providing the sort number
 * that it is and if it's ascending or descending
 */
function StdTableHeadCellBase(props) {
	let span_container_class = ClassNames('sort-col',{
		'global': props.overridden,
		'active': props.sorting,
		'asc': props.asc
	});

	let style = {};

	if(props.width)
		style['width'] = props.width + '%';

	return <div className={props.className} style={style}>
		{props.should_sort ?
			<span
				className={span_container_class}
				onClick={(event) => props.handleSort(event,props.id)}
			>
					{parseName(props.item)}
				<div>
						{props.multi_sort ?
							<span className="sort-col_index">{props.sort_index}</span>
							:
							null
						}
					<i className="material-icons md-18 icon-angle-down" />
					</div>
				</span>
			:
			parseName(props.item)
		}
	</div>
}

StdTableHeadCellBase.propTypes = {
	id: PropTypes.any.isRequired,
	item: PropTypes.object.isRequired,
	handleSort: PropTypes.func
};

StdTableHeadCellBase.defaultProps = {
	should_sort: false,
	multi_sort: true,
	sorting: false,
	overridden: false,
	asc: false
};

export const StdTableHeadCell = styled(StdTableHeadCellBase)`
	text-align: left;
	padding: 10px 0 2px;
	position: relative;
	vertical-align: bottom;

	&:first-child {
		padding-left: 8px;
	}

	.sort-col {
		position: relative;
		cursor: pointer;
		transition: 200ms;
		white-space: nowrap;
		vertical-align: bottom;

		i {
			position: relative;
			cursor: pointer;
			padding: 0;
			transition: 200ms;
			transition-timing-function: cubic-bezier(0.6,0,0.4,1);
		}

		div {
			position: relative;
			display: inline-block;

			.sort-col_index {
				position: absolute;
				bottom: 60%;
				left: 25%;
			}
		}

		&.asc i {
			transform: rotate(180deg);
		}

		&.global {
			& {
				color: ${colors.m.blueA400};
			}
		}

		&.active {
			& {
				color: ${colors.m.blueA100};
			}
		}
	}
`;

export default StdTableHeadCell;