// src/components/Savings/EditSavingsModal.js
import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserContext } from '../../context/UserContext';

const EditSavingsModal = ({ show, handleClose, montoAhorro, onSaveSavings }) => {
  const { user } = useContext(UserContext);
  const [editedMontoAhorro, setEditedMontoAhorro] = useState('');

  useEffect(() => {
    if (montoAhorro) {
      setEditedMontoAhorro(montoAhorro);
    }
  }, [montoAhorro]);

  const handleChange = (e) => {
    setEditedMontoAhorro(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editedMontoAhorro) {
      toast.warn('Por favor, ingrese un monto de ahorro.');
      return;
    }
    try {
      await axios.put('https://mifinance.onrender.com/editar_ahorro',  {
        monto: editedMontoAhorro,
        email: user.email,
      });
      handleClose();
      onSaveSavings();
      toast.success('Monto de ahorro editado correctamente.');
    } catch (err) {
      toast.error('Error al editar monto de ahorro.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Monto de Ahorro</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            step="0.01"
            placeholder="Monto a Ahorrar"
            value={editedMontoAhorro}
            onChange={handleChange}
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <Button variant="primary" type="submit">
            Guardar Cambios
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditSavingsModal;