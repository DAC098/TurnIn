import React, {Fragment} from 'react';

import Modal from '../containers/Modal';
import {IconButton} from './Buttons';
import Icon from './Icon';

const ReqResultModal = (props) => <Modal>
	<IconButton
		style={{
			position: 'absolute',
			top: 0,
			right: 0
		}}
		onClick={() => props.onClose()}
	>
		<Icon>close</Icon>
	</IconButton>
	{props.override_default ?
		props.children
		:
		<Fragment>
			<h4>{props.title}</h4>
			<p>{props.message}</p>
			{props.error &&
			typeof props.stack === 'string' &&
			props.stack.length !== 0 ?
				<pre>{props.stack}</pre>
				:
				null
			}
		</Fragment>
	}
</Modal>;

ReqResultModal.defaultProps = {
	onClose: () => {},
	title: '',
	message: '',
	error: false,
	stack: '',
	override_default: false
};

export default ReqResultModal;