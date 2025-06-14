// src/components/FixedExpenses/PayFixedExpensesModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const PayFixedExpensesModal = ({ show, handleClose, gastosFijos, onPayFixedExpenses }) => {
  const handlePay = async () => {
    const totalGastosFijos = gastosFijos.reduce((total, gf) => total + parseFloat(gf.monto), 0);
    if (totalGastosFijos <= 0) {
      toast.warn('No hay gastos fijos para pagar.');
      handleClose();
      return;
    }
    try {
      // Crear una nueva transacción de gasto
      await axios.post('https://mifinance.onrender.com/add_transaction',  {
        tipo: 'gasto',
        categoria: 'Gastos Fijos',
        monto: totalGastosFijos.toFixed(2),
        descripcion: 'Pago de gastos fijos',
        email: gastosFijos[0].email,
        fecha: new Date().toISOString(),
      });

      // Refetch transacciones para actualizar el total de gastos
      onPayFixedExpenses();
      handleClose();
      toast.success('Gastos fijos pagados correctamente.');
    } catch (err) {
      toast.error('Error al pagar gastos fijos.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Pagar Gastos Fijos</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>¿Desea pagar los gastos fijos?</p>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleClose} className="mr-2">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handlePay}>
            Pagar
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PayFixedExpensesModal;