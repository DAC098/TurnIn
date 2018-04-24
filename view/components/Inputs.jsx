import React from 'react';
import styled from 'styled-components';
import ClassNames from 'classnames';
import {colors} from '../colors';

function StdInputBase(props) {
	let container_class = ClassNames(props.className,{
		'move-label': props.input_focused || props.has_value,
		'has-focus': props.input_focused,
		'has-error': props.error
	});

	let input_class = ClassNames({
		'input-focused': props.input_focused
	});

	let placeholder = props.input_focused ? props.placeholder : null;

	return <div className={container_class}>
		<label htmlFor={props.id}>{props.label}</label>
		<input
			id={props.id}
			type={props.type || 'text'}
			name={props.name || null}
			onChange={event => props.handleChange(event)}
			onFocus={() => props.onFocus()}
			onBlur={() => props.onBlur()}
			placeholder={placeholder}
			className={input_class || null}
			value={props.value}
		/>
		<span title={props.helper}>{props.helper || ''}</span>
	</div>
}

export const StdInputView = styled(StdInputBase)`
	position: relative;
	width: 100%;
	padding-top: 30px;
	padding-bottom: 14px;

	transition: 250ms;
	transition-timing-function: cubic-bezier(0.6,0,0.4,1);

	&.move-label {
		label {
			top: 0;

			font-size: 12px;
		}
	}

	&.has-focus {
		label {
			color: ${props => props.theme.primary_one};
		}

		input {
			border-color: ${props => props.theme.primary_one};

			&::-webkit-input-placeholder {
				color: ${colors.gray600};
			}

			&::-moz-placeholder {
				color: ${colors.gray600};
			}
		}
	}

	&.has-error {
		label, span {
			color: ${colors.red500};
		}

		input {
			border-color: ${colors.red500};
		}
	}

	label {
		position: absolute;
		top: 23px;
		left: 0;
		padding-top: 16px;

		font-size: 16px;

		transition: 200ms;
		transition-timing-function: cubic-bezier(0.6,0,0.4,1);

		color: ${props => props.theme.text.primary};
	}

	input {
		-webkit-appearance: none;
		-moz-appearance: none;

		position: relative;

		padding: 8px 0;
		margin: 2px 0;

		width: 100%;

		background: none;

		border: none;
		border-bottom: 1px solid ${colors.gray600};

		transition: border 200ms;
		transition-timing-function: cubic-bezier(0.6,0,0.4,1);

		outline: none;

		font-size: 16px;

		&.input-focused {
			border-color: ${props => props.theme.primary_one};
		}

		&:not(.input-focused):hover {
			border-color: ${colors.black};
		}

		::-webkit-input-placeholder{
			color: ${colors.alpha};
		}

		::-moz-placeholder {
			color: ${colors.alpha};
		}
	}

	span {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;

		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		
		min-height: 12px;

		font-size: 12px;

		color: ${props => props.theme.text.hint};
	}
`;

/**
 * the standard input option available to a page
 */
export class StdInput extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			input_focused: false,
			has_value: false,
		};
	}

	handleChange(event) {
		if(this.props.onChange)
			this.props.onChange(event);
	}

	render() {
		return <StdInputView
			error={this.props.error}
			input_focused={this.state.input_focused}
			has_value={this.props.has_value}
			onFocus={() => this.setState(prev_state => {
				return {input_focused: true};
			})}
			onBlur={() => this.setState(prev_state => {
				return {input_focused: false};
			})}
			handleChange={e => this.handleChange(e)}

			id={this.props.id}
			type={this.props.type}
			label={this.props.label}
			placeholder={this.props.placeholder}
			name={this.props.name}
			value={this.props.value}
			helper={this.props.helper}
		/>;
	}
}

function StdCheckBase(props) {
	return <div className={props.className}>
		<input
			id={props.id || props.name}
			name={props.name}
			type="checkbox"
			checked={props.checked}
		/>
		<label
			htmlFor={props.id || props.name}
			onClick={event => props.onChange(event)}
		>
			<i className="material-icons">{''}</i>
			{props.label}
		</label>
	</div>;
}

export const StdCheck = styled(StdCheckBase)`
	position: relative;
	padding: 1.5px 0;

	i {
		position: absolute;
		top: -1px;
		left: 0;

		&:after {
			position: absolute;
			top: 0;
			left: 0;
			content: 'check_box_outline_blank';
		}

		&:before {
			position: absolute;
			top: 0;
			left: 0;
			transition: color 150ms ease;
			content: 'check_box';
		}
	}

	input {
		display: none;
	}

	label {
		position: relative;
		padding: 2px 0 2px 24px;
		cursor: pointer;
	}

	input:checked {
		& + label i {
			&:before, &:after {
				color: ${colors.green400};
			}
		}
	}

	input:not(:checked) {
		& + label i:before {
			color: ${colors.alpha};
		}
	}
`;

/**
 * the standard switch available to a page
 */
function StdSwitchBase(props) {
	let id = props.id || props.name;

	return <div className={props.className}>
		<input type="checkbox" id={id} name={props.name} checked={props.checked} onChange={event => props.onChange(event)} />
		<label htmlFor={id}>{props.label}
			<span className="toggle--on">{props.on_state || ''}</span>
			<span className="toggle--off">{props.off_state || ''}</span>
		</label>
	</div>
}

export const StdSwitch = styled(StdSwitchBase)`
	input {
		display: none;

		&:checked + label:before {
			background-color: #A5D6A7;
		}

		&:checked + label:after {
			background-color: #4CAF50;
			-ms-transform: translate(80%, -50%);
			-webkit-transform: translate(80%, -50%);
			transform: translate(80%, -50%);
		}

		&:checked + label {
			.toggle--on {
				display: inline-block;
			}

			.toggle--off {
				display: none;
			}
		}
	}

	label {
		position: relative;
		display: inline-block;
		cursor: pointer;
		font-weight: 500;
		text-align: left;
		padding: 8px 0 8px 44px;

		&:before, &:after {
			content: "";
			position: absolute;
			margin: 0;
			outline: 0;
			top: 50%;
			-ms-transform: translate(0, -50%);
			-webkit-transform: translate(0, -50%);
			transform: translate(0, -50%);
			-webkit-transition: all 0.3s ease;
			transition: all 0.3s ease;
		}

		&:before {
			left: 1px;
			width: 34px;
			height: 14px;
			background-color: #9E9E9E;
			border-radius: 8px;
		}

		&:after {
			left: 0;
			width: 20px;
			height: 20px;
			background-color: #FAFAFA;
			border-radius: 50%;
			box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.14), 0 2px 2px 0 rgba(0, 0, 0, 0.098), 0 1px 5px 0 rgba(0, 0, 0, 0.084);
		}

		.toggle--on {
			display: none;
		}

		.toggle--off {
			display: inline-block;
		}
	}
`;