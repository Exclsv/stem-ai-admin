import { FC } from 'react';
import Modal, { ModalProps } from 'react-bootstrap/Modal';
import { useIntl } from 'react-intl';
import './confirmation-modal.css';

export interface SDConfirmationModalProps extends ModalProps {
	image?: string;
	onHide: () => void;
	onConfirmHide: () => void;
}

const SDConfirmationModal: FC<SDConfirmationModalProps> = ({
	show,
	onHide,
	onConfirmHide,
}) => {
	const intl = useIntl();

	return (
		<Modal
			show={show}
			animation={false}
			onHide={onHide}
			className="modal show"
			aria-labelledby="contained-modal-title-vcenter"
			centered>
			<Modal.Header className="modal-header-confirm pb-0">
				<Modal.Title className="fs-2">
					{intl.formatMessage({ id: 'COMMON.ATTENTION' })}!
				</Modal.Title>
			</Modal.Header>

			<Modal.Body className="modal-body-confirm pt-3">
				<p className="fs-4">
					{intl.formatMessage({ id: 'COMMON.CONFIRM_MESSAGE' })}
				</p>
			</Modal.Body>

			<Modal.Footer>
				<button type="button" className="btn btn-light btn-sm" onClick={onHide}>
					{intl.formatMessage({ id: 'COMMON.CANCEL' })}
				</button>
				<button
					type="button"
					className="btn btn-primary btn-sm"
					onClick={onConfirmHide}>
					{intl.formatMessage({ id: 'COMMON.CONFIRM' })}
				</button>
			</Modal.Footer>
		</Modal>
	);
};

export { SDConfirmationModal };
