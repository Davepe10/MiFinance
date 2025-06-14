// src/components/Modals/ExportModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ExportModal = ({ show, handleClose, onExport, message }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Exportar Datos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleClose} className="mr-2">
            Cancelar
          </Button>
          <Button variant="primary" onClick={onExport}>
            Exportar
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ExportModal;