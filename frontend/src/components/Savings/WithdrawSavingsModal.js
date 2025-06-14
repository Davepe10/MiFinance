// src/components/Savings/WithdrawSavingsModal.js
import React, { useState, useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserContext } from '../../context/UserContext';

const WithdrawSavingsModal = ({ show, handleClose, montoAhorro, onSaveSavings, onRetirar }) => {
  const { user } = useContext(UserContext);
  const [montoRetiro, setMontoRetiro] = useState('');
  const [confirmarRetiro, setConfirmarRetiro] = useState(false);

  const handleChange = (e) => {
    setMontoRetiro(e.target.value);
  };

  const handleConfirmar = () => {
    setConfirmarRetiro(true);
  };

  const handleRetirar = async () => {
    if (!montoRetiro || parseFloat(montoRetiro) <= 0) {
      toast.warn('Por favor, ingrese un monto válido para retirar.');
      return;
    }
    if (parseFloat(montoRetiro) > parseFloat(montoAhorro)) {
      toast.warn('El monto a retirar no puede ser mayor al monto ahorrado.');
      return;
    }
    try {
      // Crear una nueva transacción de gasto
      await axios.post('https://mifinance.onrender.com/add_transaction',  {
        tipo: 'gasto',
        categoria: 'Retiro de Ahorro',
        monto: montoRetiro,
        descripcion: 'Retiro de ahorro',
        email: user.email,
        fecha: new Date().toISOString(),
      });

      // Actualizar el monto de ahorro en el backend
      await axios.put('https://mifinance.onrender.com/editar_ahorro',  {
        monto: (parseFloat(montoAhorro) - parseFloat(montoRetiro)).toFixed(2),
        email: user.email,
      });

      handleClose();
      onSaveSavings();
      toast.success('Monto retirado correctamente.');
    } catch (err) {
      toast.error('Error al retirar monto.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Retirar Monto de Ahorro</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Ingrese el monto que desea retirar:</p>
        <input
          type="number"
          step="0.01"
          placeholder="Monto a Retirar"
          value={montoRetiro}
          onChange={handleChange}
          className="w-full mb-2 p-2 rounded border"
          required
        />
        {!confirmarRetiro ? (
          <Button variant="danger" onClick={handleConfirmar}>
            Confirmar Retiro
          </Button>
        ) : (
          <>
            <p className="text-red-500 mt-2">¿Está seguro de retirar ${parseFloat(montoRetiro).toFixed(2)}?</p>
            <div className="flex justify-end mt-2">
              <Button variant="secondary" onClick={handleClose} className="mr-2">
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleRetirar}>
                Retirar
              </Button>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default WithdrawSavingsModal;