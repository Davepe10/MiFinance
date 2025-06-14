// src/components/Layout/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { UserContext } from '../../context/UserContext';

const NavbarComponent = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <Navbar bg="white" expand="lg" className="shadow-lg">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition">
          FinanzApp
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/perfil" className="py-2 px-3 text-gray-700 hover:text-indigo-500 transition">
              Perfil
            </Nav.Link>
            <Nav.Link onClick={() => navigate('/configuracion')} className="py-2 px-3 text-gray-700 hover:text-indigo-500 transition">
              Configuración
            </Nav.Link>
            <Nav.Link onClick={logout} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
              Cerrar sesión
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;