// src/components/Modals/ConfirmationModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({ show, handleClose, onConfirm, message }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleClose} className="mr-2">
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Confirmar
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmationModal;