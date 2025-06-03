import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-80">
        <p>{message}</p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 mr-2">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white">Eliminar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;