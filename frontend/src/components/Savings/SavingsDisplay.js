// src/components/Savings/SavingsDisplay.js
import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';
import { UserContext } from '../../context/UserContext';
import PasswordModal from '../Modals/PasswordModal';

const SavingsDisplay = ({ montoAhorro }) => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showMontoAhorro, setShowMontoAhorro] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPassword('');
    setIsValidPassword(false);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleVerifyPassword = async () => {
    try {
      const res = await axios.post('https://mifinance.onrender.com/verificar_contraseña',  {
        email: user.email,
        password: password,
      });
      if (res.data.valid) {
        setIsValidPassword(true);
        setShowMontoAhorro(true);
      } else {
        toast.error('Contraseña incorrecta.');
      }
    } catch (err) {
      toast.error('Error al verificar contraseña.');
    }
  };

  return (
    <>
      <div className="max-w-lg mx-auto mb-8 bg-gray-100 p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Monto Ahorrado</h3>
        <button
          onClick={handleOpenModal}
          className="mb-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          {showMontoAhorro ? 'Ocultar Monto Ahorrado' : 'Mostrar Monto Ahorrado'}
        </button>
        {showMontoAhorro && (
          <div className="mt-4">
            <p className="text-xl font-semibold">Monto Ahorrado: ${parseFloat(montoAhorro).toFixed(2)}</p>
          </div>
        )}
      </div>
      <PasswordModal
        show={isModalOpen}
        handleClose={handleCloseModal}
        password={password}
        onChange={handlePasswordChange}
        onVerify={handleVerifyPassword}
      />
    </>
  );
};

export default SavingsDisplay;