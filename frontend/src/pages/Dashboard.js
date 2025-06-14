// src/pages/Dashboard.js
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container } from 'react-bootstrap';
import { UserContext } from '../context/UserContext';
import TransactionForm from '../components/Transactions/TransactionForm';
import TransactionsTable from '../components/Transactions/TransactionsTable';
import FilterTransactions from '../components/Transactions/FilterTransactions';
import TransactionsGraph from '../components/Transactions/TransactionsGraph';
import ObjectiveForm from '../components/Objectives/ObjectiveForm';
import ObjectiveCard from '../components/Objectives/ObjectiveCard';
import ObjectivesGraph from '../components/Objectives/ObjectivesGraph';
import ObjectivesHistory from '../components/Objectives/ObjectivesHistory';
import FixedExpenseForm from '../components/FixedExpenses/FixedExpenseForm';
import FixedExpenseTable from '../components/FixedExpenses/FixedExpenseTable';
import PayFixedExpensesModal from '../components/FixedExpenses/PayFixedExpensesModal';
import SavingsForm from '../components/Savings/SavingsForm';
import SavingsDisplay from '../components/Savings/SavingsDisplay';
import EditSavingsModal from '../components/Savings/EditSavingsModal';
import WithdrawSavingsModal from '../components/Savings/WithdrawSavingsModal';
import ConfirmationModal from '../components/Modals/ConfirmationModal';
import ExportModal from '../components/Modals/ExportModal';
import TotalSummary from '../components/Shared/TotalsSummary';
import HistoricalModal from '../components/Shared/HistoricalModal';
import NavbarComponent from '../components/Layout/Navbar';
import BarChartComponent from '../components/Charts/BarChartComponent';

const Dashboard = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  // Estados
  const [transaccion, setTransaccion] = useState({ tipo: 'ingreso', categoria: '', monto: '', descripcion: '' });
  const [transacciones, setTransacciones] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [gastosFijos, setGastosFijos] = useState([]);
  const [ahorro, setAhorro] = useState(null);
  const [filtroMes, setFiltroMes] = useState(new Date().toISOString().slice(0, 7));
  const [mostrarTotales, setMostrarTotales] = useState(false);
  const [nuevoObjetivo, setNuevoObjetivo] = useState({
    monto_objtivo: '',
    monto_cuota: '',
    descripcion: '',
    fecha_finalizacion: '',
    cuotas_pagadas: 0, // Inicializamos cuotas_pagadas
  });
  const [nuevoGastoFijo, setNuevoGastoFijo] = useState({
    categoria: '',
    monto: '',
    descripcion: '',
    mes: filtroMes,
  });
  const [mostrarFormularioGastoFijo, setMostrarFormularioGastoFijo] = useState(false);
  const [mostrarListaGastosFijos, setMostrarListaGastosFijos] = useState(false);
  const [mostrarModalPagarGastosFijos, setMostrarModalPagarGastosFijos] = useState(false);
  const [mostrarFormularioAhorro, setMostrarFormularioAhorro] = useState(false);
  const [mostrarModalEditarAhorro, setMostrarModalEditarAhorro] = useState(false);
  const [mostrarModalRetirarAhorro, setMostrarModalRetirarAhorro] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [password, setPassword] = useState('');
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [showMontoAhorro, setShowMontoAhorro] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Calcular totales
  const calcularTotales = () => {
    let ingresos = 0;
    let gastos = 0;
    const mesFiltro = new Date(filtroMes + '-01');
    transacciones.forEach((t) => {
      if (!t.fecha) return;
      const fecha = new Date(t.fecha);
      if (
        fecha.getFullYear() === mesFiltro.getFullYear() &&
        fecha.getMonth() + 1 === mesFiltro.getMonth()
      ) {
        const monto = parseFloat(t.monto) || 0;
        t.tipo === 'ingreso' ? (ingresos += monto) : (gastos += monto);
      }
    });
    // Sumar gastos fijos del mes
    gastosFijos.forEach((f) => {
      if (f.mes === filtroMes) {
        gastos += parseFloat(f.monto) || 0;
      }
    });
    return { ingresos, gastos, balance: ingresos - gastos };
  };

  const { ingresos, gastos, balance } = calcularTotales();

  const transaccionesFiltradas = useMemo(() => {
    const [anio, mes] = filtroMes.split('-').map(Number);
    return transacciones.filter((t) => {
      if (!t.fecha) return false;
      const fecha = new Date(t.fecha);
      return (
        fecha.getFullYear() === anio &&
        fecha.getMonth() + 1 === mes
      );
    });
  }, [transacciones, filtroMes]);

  // Datos para gráfico de barras
  const datosBarras = useMemo(() => {
    const resumen = {};
    transaccionesFiltradas.forEach((t) => {
      const categoria = t.categoria || 'Sin categoría';
      const tipo = t.tipo?.toLowerCase();
      const monto = parseFloat(t.monto) || 0;
      if (!resumen[categoria]) resumen[categoria] = { categoria, ingreso: 0, gasto: 0 };
      tipo === 'ingreso'
        ? (resumen[categoria].ingreso += monto)
        : (resumen[categoria].gasto += monto);
    });
    return Object.values(resumen);
  }, [transaccionesFiltradas]);

  // Progreso de objetivos
  const objetivosConProgreso = useMemo(() => {
    return (objetivos || []).map((obj, idx) => {
      const meta = parseFloat(obj.monto_objtivo) || 0;
      const cuotasPagadas = parseInt(obj.cuotas_pagadas || 0);
      const cuotasTotales = Math.ceil(meta / parseFloat(obj.monto_cuota)) || 1;
      return {
        ...obj,
        index: idx,
        cuotas_pagadas: cuotasPagadas,
        cuotas_totales: cuotasTotales,
        progreso: Math.min((cuotasPagadas / cuotasTotales) * 100, 100),
      };
    });
  }, [objetivos]);

  // Datos para gráfico de objetivos
  const datosBarrasObjetivos = useMemo(() => {
    return objetivosConProgreso.map((obj) => ({
      nombre: obj.descripcion,
      valor: obj.progreso,
    }));
  }, [objetivosConProgreso]);

  // Cargar datos desde el backend
  const fetchTransacciones = async () => {
    try {
      const res = await axios.get('https://mifinance.onrender.com/get_transacciones',  { params: { email: user.email } });
      setTransacciones(res.data.transacciones || []);
    } catch (err) {
      toast.error('Error al cargar transacciones.');
    }
  };

  const fetchObjetivos = async () => {
    try {
      const res = await axios.get('https://mifinance.onrender.com/get_objetivo',  { params: { email: user.email } });
      setObjetivos(res.data.objetivos || []);
    } catch (err) {
      toast.error('Error al cargar objetivos.');
    }
  };

  const fetchGastosFijos = async () => {
    try {
      const res = await axios.get('https://mifinance.onrender.com/gastos_fijos',  { params: { email: user.email } });
      setGastosFijos(res.data.gastos_fijos || []);
    } catch (err) {
      toast.error('Error al cargar gastos fijos.');
    }
  };

  const fetchAhorro = async () => {
    try {
      const res = await axios.get('https://mifinance.onrender.com/get_ahorro',  { params: { email: user.email } });
      setAhorro(res.data.ahorro?.monto || 0);
    } catch (err) {
      toast.error('Error al cargar monto de ahorro.');
    }
  };

  // Cargar datos al iniciar sesión
  useEffect(() => {
    if (!user?.email) navigate('/login');
    else {
      fetchTransacciones();
      fetchObjetivos();
      fetchGastosFijos();
      fetchAhorro();
    }
  }, [user, navigate]);

  // Manejadores de eventos
  const handleChangeTransaccion = (e) => {
    setTransaccion({ ...transaccion, [e.target.name]: e.target.value });
  };

  const handleSubmitTransaccion = async (e) => {
    e.preventDefault();
    if (!transaccion.categoria.trim() || !transaccion.monto) {
      toast.warn('Por favor, complete categoría y monto.');
      return;
    }
    try {
      await axios.post('https://mifinance.onrender.com/add_transaction',  { ...transaccion, email: user.email, fecha: new Date().toISOString() });
      setTransaccion({ tipo: 'ingreso', categoria: '', monto: '', descripcion: '' });
      fetchTransacciones();
      toast.success('Transacción registrada correctamente.');
    } catch (err) {
      toast.error('Error al registrar transacción.');
    }
  };

  const handleAgregarObjetivo = async (e) => {
    e.preventDefault();
    if (!nuevoObjetivo.descripcion || !nuevoObjetivo.monto_objtivo || !nuevoObjetivo.fecha_finalizacion || !nuevoObjetivo.monto_cuota) {
      toast.warn('Complete todos los campos del objetivo.');
      return;
    }
    try {
      await axios.post('https://mifinance.onrender.com/agregar_objetivo',  {
        ...nuevoObjetivo,
        email: user.email,
        alcanzado: 'no',
      });
      setNuevoObjetivo({
        monto_objtivo: '',
        monto_cuota: '',
        descripcion: '',
        fecha_finalizacion: '',
        cuotas_pagadas: 0,
      });
      fetchObjetivos();
      toast.success('Objetivo registrado correctamente.');
    } catch (err) {
      toast.error('Error al registrar objetivo.');
    }
  };

  const handlePagarCuota = async (index) => {
    const obj = objetivos[index];
    const cuotasPagadas = parseInt(obj.cuotas_pagadas || 0) + 1;
    try {
      // Crear una nueva transacción de gasto
      await axios.post('https://mifinance.onrender.com/add_transaction',  {
        tipo: 'gasto',
        categoria: 'Cuota Objetivo',
        monto: obj.monto_cuota,
        descripcion: `Cuota para ${obj.descripcion}`,
        email: user.email,
        fecha: new Date().toISOString(),
      });

      // Actualizar el objetivo en el backend
      await axios.put('https://mifinance.onrender.com/marcar_cuota',  {
        email: user.email,
        descripcion: obj.descripcion,
        cuotas_pagadas: cuotasPagadas,
      });

      // Actualizar el estado local
      setObjetivos(
        objetivos.map((o, i) => (i === index ? { ...o, cuotas_pagadas: cuotasPagadas } : o))
      );

      // Refetch transacciones para actualizar el total de gastos
      fetchTransacciones();

      // Mover al historial si el objetivo está completo
      if (cuotasPagadas >= obj.cuotas_totales) {
        setHistorial([...historial, obj]);
        setObjetivos(objetivos.filter((_, i) => i !== index));
      }

      toast.success('Cuota pagada correctamente.');
    } catch (err) {
      toast.error('Error al pagar cuota.');
    }
  };

  const handleEliminarObjetivo = async (index) => {
    const obj = objetivos[index];
    try {
      await axios.delete('https://mifinance.onrender.com/eliminar_objetivo',  {
        data: { email: user.email, descripcion: obj.descripcion },
      });
      setObjetivos(objetivos.filter((_, i) => i !== index));
      toast.success('Objetivo eliminado.');
    } catch (err) {
      console.error('Error al eliminar objetivo', err);
      toast.error('No se pudo eliminar el objetivo.');
    }
  };

  const handleAgregarGastoFijo = async (e) => {
    e.preventDefault();
    if (!nuevoGastoFijo.categoria || !nuevoGastoFijo.monto || !nuevoGastoFijo.descripcion) {
      toast.warn('Complete todos los campos del gasto fijo.');
      return;
    }
    try {
      await axios.post('https://mifinance.onrender.com/agregar_gasto_fijo',  {
        ...nuevoGastoFijo,
        email: user.email,
      });
      setNuevoGastoFijo({
        categoria: '',
        monto: '',
        descripcion: '',
        mes: filtroMes,
      });
      fetchGastosFijos();
      toast.success('Gasto fijo registrado correctamente.');
    } catch (err) {
      toast.error('Error al registrar gasto fijo.');
    }
  };

  const handleEditarGastoFijo = async (index) => {
    const gf = gastosFijos[index];
    try {
      await axios.put('https://mifinance.onrender.com/editar_gasto_fijo',  {
        ...gf,
        email: user.email,
      });
      fetchGastosFijos();
      toast.success('Gasto fijo editado correctamente.');
    } catch (err) {
      toast.error('Error al editar gasto fijo.');
    }
  };

  const handleEliminarGastoFijo = async (index) => {
    const gf = gastosFijos[index];
    try {
      await axios.delete('https://mifinance.onrender.com/eliminar_gasto_fijo',  {
        data: { email: user.email, categoria: gf.categoria, mes: gf.mes },
      });
      setGastosFijos(gastosFijos.filter((_, i) => i !== index));
      toast.success('Gasto fijo eliminado.');
    } catch (err) {
      console.error('Error al eliminar gasto fijo', err);
      toast.error('No se pudo eliminar el gasto fijo.');
    }
  };

  const handlePagarGastosFijos = async () => {
    const totalGastosFijos = gastosFijos.reduce((total, gf) => total + parseFloat(gf.monto), 0);
    if (totalGastosFijos <= 0) {
      toast.warn('No hay gastos fijos para pagar.');
      return;
    }
    setModalMessage(`¿Desea pagar los gastos fijos por un monto total de $${totalGastosFijos.toFixed(2)}?`);
    setShowConfirmationModal(true);
  };

  const handleConfirmarPagoGastosFijos = async () => {
    const totalGastosFijos = gastosFijos.reduce((total, gf) => total + parseFloat(gf.monto), 0);
    try {
      // Crear una nueva transacción de gasto
      await axios.post('https://mifinance.onrender.com/add_transaction',  {
        tipo: 'gasto',
        categoria: 'Gastos Fijos',
        monto: totalGastosFijos.toFixed(2),
        descripcion: 'Pago de gastos fijos',
        email: user.email,
        fecha: new Date().toISOString(),
      });

      // Refetch transacciones para actualizar el total de gastos
      fetchTransacciones();

      setMostrarModalPagarGastosFijos(false);
      setShowConfirmationModal(false);
      toast.success('Gastos fijos pagados correctamente.');
    } catch (err) {
      toast.error('Error al pagar gastos fijos.');
    }
  };

  const handleSaveSavings = () => {
    fetchAhorro();
  };

  const handleEditSavings = () => {
    setMostrarModalEditarAhorro(true);
  };

  const handleRetirarSavings = () => {
    setModalMessage('¿Desea retirar una cantidad del ahorro?');
    setShowConfirmationModal(true);
  };

  const handleConfirmarRetiroAhorro = async () => {
    const montoRetiro = prompt('Ingrese el monto que desea retirar:');
    if (!montoRetiro || parseFloat(montoRetiro) <= 0) {
      toast.warn('Por favor, ingrese un monto válido para retirar.');
      return;
    }
    if (parseFloat(montoRetiro) > parseFloat(ahorro)) {
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
        monto: (parseFloat(ahorro) - parseFloat(montoRetiro)).toFixed(2),
        email: user.email,
      });

      setShowConfirmationModal(false);
      fetchAhorro();
      toast.success('Monto retirado correctamente.');
    } catch (err) {
      toast.error('Error al retirar monto.');
    }
  };

  const handleExportData = () => {
    setModalMessage('¿Desea exportar los datos de transacciones, objetivos y gastos fijos?');
    setShowExportModal(true);
  };

  const handleConfirmarExportData = async () => {
    try {
      const res = await axios.get('https://mifinance.onrender.com/export_data',  { params: { email: user.email } });
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'finanzapp_data.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
      toast.success('Datos exportados correctamente.');
    } catch (err) {
      toast.error('Error al exportar datos.');
    }
  };

  return (
    <>
      {/* Barra de Navegación */}
      <NavbarComponent />
      <Container fluid className="mt-8">
        {/* Bienvenida */}
        <h2 className="text-2xl font-bold mb-4 text-center">Bienvenido, {user.nombre}</h2>
        {/* Totales Ocultables */}
        <TotalSummary ingresos={ingresos} gastos={gastos} balance={balance} />
        <button onClick={() => setMostrarTotales(!mostrarTotales)} className="mb-6 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition">
          {mostrarTotales ? 'Ocultar Totales' : 'Mostrar Totales'}
        </button>
        {/* Formulario de Transacción */}
        <TransactionForm onAddTransaction={fetchTransacciones} />
        {/* Filtro por Mes */}
        <FilterTransactions filtroMes={filtroMes} setFiltroMes={setFiltroMes} />
        {/* Tabla de Transacciones */}
        <TransactionsTable transaccionesFiltradas={transaccionesFiltradas} onEditTransaction={fetchTransacciones} />
        {/* Gráfico de Barras */}
        <BarChartComponent data={datosBarras} title="Resumen por Categoría" />
        {/* Objetivos Financieros */}
        <div className="max-w-lg mx-auto mb-8 bg-gray-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">Objetivos Financieros</h3>
          <ObjectiveForm onAddObjective={handleAgregarObjetivo} />
          <button
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
            className="mb-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            {mostrarHistorial ? 'Ocultar Historial' : 'Mostrar Historial'}
          </button>
          {objetivosConProgreso.map((obj) => (
            <ObjectiveCard
              key={obj.index}
              objetivo={obj}
              onPagarCuota={handlePagarCuota}
              onEliminarObjetivo={handleEliminarObjetivo}
              onEditObjective={fetchObjetivos}
            />
          ))}
          <ObjectivesGraph datosBarras={datosBarrasObjetivos} />
          {mostrarHistorial && <HistoricalModal historial={historial} title="Historial de Objetivos Completados" />}
        </div>
        {/* Gastos Fijos */}
        <div className="max-w-lg mx-auto mb-8 bg-gray-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">Gastos Fijos</h3>
          <button
            onClick={() => setMostrarFormularioGastoFijo(!mostrarFormularioGastoFijo)}
            className="mb-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            {mostrarFormularioGastoFijo ? 'Ocultar Formulario' : 'Agregar Gasto Fijo'}
          </button>
          {mostrarFormularioGastoFijo && (
            <FixedExpenseForm
              onAddFixedExpense={handleAgregarGastoFijo}
              setNuevoGastoFijo={setNuevoGastoFijo}
            />
          )}
          <button
            onClick={() => setMostrarListaGastosFijos(!mostrarListaGastosFijos)}
            className="mb-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            {mostrarListaGastosFijos ? 'Ocultar Lista de Gastos Fijos' : 'Mostrar Lista de Gastos Fijos'}
          </button>
          {mostrarListaGastosFijos && (
            <FixedExpenseTable
              gastosFijos={gastosFijos}
              onEditFixedExpense={handleEditarGastoFijo}
              onDeleteFixedExpense={handleEliminarGastoFijo}
            />
          )}
          <button
            onClick={handlePagarGastosFijos}
            className="mb-4 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
          >
            Pagar Gastos Fijos
          </button>
        </div>
        {/* Sección de Ahorro */}
        <div className="max-w-lg mx-auto mb-8 bg-gray-100 p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">Ahorro</h3>
          <button
            onClick={() => setMostrarFormularioAhorro(!mostrarFormularioAhorro)}
            className="mb-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            {mostrarFormularioAhorro ? 'Ocultar Formulario' : 'Agregar/Editar Ahorro'}
          </button>
          {mostrarFormularioAhorro && (
            <SavingsForm onSaveSavings={handleSaveSavings} />
          )}
          <div className="mt-4">
            <p><strong>Sugerencia de Ahorro:</strong> ${parseFloat(ingresos * 0.1).toFixed(2)}</p>
            <button
              onClick={handleEditSavings}
              className="mb-4 px-4 py-2 rounded bg-warning text-white hover:bg-yellow-600 transition"
            >
              Editar Ahorro
            </button>
            <button
              onClick={handleRetirarSavings}
              className="mb-4 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
            >
              Retirar Monto
            </button>
          </div>
          <SavingsDisplay montoAhorro={ahorro} />
        </div>
        {/* Botón de Exportar Datos */}
        <div className="max-w-lg mx-auto mb-8 bg-gray-100 p-4 rounded shadow">
          <button
            onClick={handleExportData}
            className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Exportar Datos
          </button>
        </div>
      </Container>
      {/* Modales */}
      <PayFixedExpensesModal
        show={mostrarModalPagarGastosFijos}
        handleClose={() => setMostrarModalPagarGastosFijos(false)}
        gastosFijos={gastosFijos}
        onPayFixedExpenses={fetchTransacciones}
      />
      <EditSavingsModal
        show={mostrarModalEditarAhorro}
        handleClose={() => setMostrarModalEditarAhorro(false)}
        montoAhorro={ahorro}
        onSaveSavings={handleSaveSavings}
      />
      <WithdrawSavingsModal
        show={mostrarModalRetirarAhorro}
        handleClose={() => setMostrarModalRetirarAhorro(false)}
        montoAhorro={ahorro}
        onSaveSavings={handleSaveSavings}
        onRetirar={handleConfirmarRetiroAhorro}
      />
      <ConfirmationModal
        show={showConfirmationModal}
        handleClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmarPagoGastosFijos}
        message={modalMessage}
      />
      <ExportModal
        show={showExportModal}
        handleClose={() => setShowExportModal(false)}
        onExport={handleConfirmarExportData}
        message={modalMessage}
      />
      <ToastContainer />
    </>
  );
};

export default Dashboard;