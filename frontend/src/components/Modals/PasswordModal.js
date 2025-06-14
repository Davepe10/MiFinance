// src/components/Modals/PasswordModal.js
import React, { useState, useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserContext } from '../../context/UserContext';

const PasswordModal = ({ show, handleClose, password, onChange, onVerify }) => {
  const { user } = useContext(UserContext);

  const handleVerify = async () => {
    try {
      const res = await axios.post('https://mifinance.onrender.com/verificar_contraseña',  {
        email: user.email,
        password: password,
      });
      if (res.data.valid) {
        onVerify();
      } else {
        toast.error('Contraseña incorrecta.');
      }
    } catch (err) {
      toast.error('Error al verificar contraseña.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Verificar Contraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Por favor, ingrese su contraseña para verificar:</p>
        <input
          type="password"
          value={password}
          onChange={onChange}
          className="w-full mb-2 p-2 rounded border"
          required
        />
        <Button variant="primary" onClick={handleVerify}>
          Verificar
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default PasswordModal;