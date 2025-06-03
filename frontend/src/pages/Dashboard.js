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
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'; // Barra de navegación
import { UserContext } from '../context/UserContext';

const Dashboard = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  // Estados
  const [transaccion, setTransaccion] = useState({ tipo: 'ingreso', categoria: '', monto: '', descripcion: '' });
  const [transacciones, setTransacciones] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [gastosFijos, setGastosFijos] = useState([]);
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

  // Calcular totales
  const calcularTotales = () => {
    let ingresos = 0;
    let gastos = 0;

    const mesFiltro = new Date(filtroMes + '-01');
    transacciones.forEach((t) => {
      if (!t.fecha) return;
      const fecha = new Date(t.fecha);
      if (
        fecha.getMonth() === mesFiltro.getMonth() &&
        fecha.getFullYear() === mesFiltro.getFullYear()
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
  const [anio, mes] = filtroMes.split('-').map(Number); // mes va de 1 a 12
  return transacciones.filter((t) => {
    if (!t.fecha) return false;
    const fecha = new Date(t.fecha);
    return (
      fecha.getFullYear() === anio &&
      fecha.getMonth() + 1 === mes // le sumamos 1 porque getMonth() devuelve 0-11
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
    return (objetivos || []).map((obj) => {
      const meta = parseFloat(obj.monto_objtivo) || 0;
      const cuotasPagadas = parseInt(obj.cuotas_pagadas || 0);
      const cuotasTotales = Math.ceil(meta / parseFloat(obj.monto_cuota)) || 1;

      return {
        ...obj,
        cuotas_pagadas: cuotasPagadas,
        cuotas_totales: cuotasTotales,
        progreso: Math.min((cuotasPagadas / cuotasTotales) * 100, 100),
      };
    });
  }, [objetivos]);

  // Cargar datos desde el backend
  const fetchTransacciones = async () => {
    try {
      const res = await axios.get('http://localhost:5000/get_transacciones', { params: { email: user.email } });
      setTransacciones(res.data.transacciones || []);
    } catch (err) {
      toast.error('Error al cargar transacciones.');
    }
  };

  const fetchObjetivos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/get_objetivos', { params: { email: user.email } });
      setObjetivos(res.data.objetivos || []);
    } catch (err) {
      toast.error('Error al cargar objetivos.');
    }
  };

  const fetchGastosFijos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/gastos_fijos', { params: { email: user.email } });
      setGastosFijos(res.data.gastos_fijos || []);
    } catch (err) {
      toast.error('Error al cargar gastos fijos.');
    }
  };

  // Cargar datos al iniciar sesión
  useEffect(() => {
    if (!user?.email) navigate('/login');
    else {
      fetchTransacciones();
      fetchObjetivos();
      fetchGastosFijos();
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
      await axios.post('http://localhost:5000/add_transaction', { ...transaccion, email: user.email, fecha: new Date().toISOString() });
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
      await axios.post('http://localhost:5000/agregar_objetivo', {
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
      await axios.put('http://localhost:5000/marcar_cuota', {
        email: user.email,
        descripcion: obj.descripcion,
        cuotas_pagadas: cuotasPagadas,
      });
      setObjetivos(
        objetivos.map((o, i) => (i === index ? { ...o, cuotas_pagadas: cuotasPagadas } : o))
      );
      toast.success('Cuota pagada correctamente.');
    } catch (err) {
      toast.error('Error al pagar cuota.');
    }
  };

  const handleEliminarObjetivo = async (index) => {
    const obj = objetivos[index];
    try {
      await axios.delete('http://localhost:5000/eliminar_objetivo', {
        data: { email: user.email, descripcion: obj.descripcion },
      });
      setObjetivos(objetivos.filter((_, i) => i !== index));
      toast.success('Objetivo eliminado');
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
      await axios.post('http://localhost:5000/agregar_gasto_fijo', {
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

  return (
    <>
      {/* Barra de Navegación */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/dashboard" className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition">
              FinanzApp
            </Link>
            <div className="flex space-x-4">
              <Link to="/perfil" className="py-2 px-3 text-gray-700 hover:text-indigo-500 transition">
                Perfil
              </Link>
              <button onClick={() => navigate('/configuracion')} className="py-2 px-3 text-gray-700 hover:text-indigo-500 transition">
                Configuración
              </button>
        <button onClick={logout} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
          Cerrar sesión
        </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bienvenida */}
      <h2 className="text-2xl font-bold mb-4 text-center">Bienvenido, {user.nombre}</h2>

      {/* Totales Ocultables */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded text-center relative">
          <h4 className="text-green-800 font-semibold">Ingresos Totales</h4>
          <p className="text-xl">{mostrarTotales ? `$${ingresos.toFixed(2)}` : '•••••'}</p>
        </div>
        <div className="bg-red-100 p-4 rounded text-center relative">
          <h4 className="text-red-800 font-semibold">Gastos Totales</h4>
          <p className="text-xl">{mostrarTotales ? `$${gastos.toFixed(2)}` : '•••••'}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded text-center relative">
          <h4 className="text-blue-800 font-semibold">Balance</h4>
          <p className="text-xl">{mostrarTotales ? `$${balance.toFixed(2)}` : '•••••'}</p>
        </div>
      </div>
      <button onClick={() => setMostrarTotales(!mostrarTotales)} className="mb-6 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition">
        {mostrarTotales ? 'Ocultar Totales' : 'Mostrar Totales'}
      </button>

      {/* Formulario de Transacción */}
      <form onSubmit={handleSubmitTransaccion} className="max-w-md mx-auto mb-8 bg-gray-100 p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Agregar nueva transacción</h3>
        <div className="mb-2 flex justify-around">
          <label className="mr-3">
            <input type="radio" name="tipo" value="ingreso" checked={transaccion.tipo === 'ingreso'} onChange={handleChangeTransaccion} />
            Ingreso
          </label>
          <label>
            <input type="radio" name="tipo" value="gasto" checked={transaccion.tipo === 'gasto'} onChange={handleChangeTransaccion} />
            Gasto
          </label>
        </div>
        <input name="categoria" type="text" placeholder="Categoría" value={transaccion.categoria} onChange={handleChangeTransaccion} className="w-full mb-2 p-2 rounded border" required />
        <input name="monto" type="number" step="0.01" placeholder="Monto" value={transaccion.monto} onChange={handleChangeTransaccion} className="w-full mb-2 p-2 rounded border" required />
        <input name="descripcion" type="text" placeholder="Descripción (opcional)" value={transaccion.descripcion} onChange={handleChangeTransaccion} className="w-full mb-2 p-2 rounded border" />
        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
          Agregar
        </button>
      </form>

      {/* Filtro por Mes */}
      <div className="max-w-md mx-auto mb-6">
        <label htmlFor="filtroMes" className="font-semibold mr-3">Filtrar Mes:</label>
        <input type="month" id="filtroMes" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="p-1 border rounded" />
      </div>

      {/* Tabla de Transacciones */}
      <div className="overflow-x-auto max-w-4xl mx-auto mb-8">
        <h3 className="text-lg font-semibold mb-3">Transacciones</h3>
        {transaccionesFiltradas.length > 0 ? (
          <table className="min-w-full bg-white border rounded shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-3 border">Fecha</th>
                <th className="py-2 px-3 border">Tipo</th>
                <th className="py-2 px-3 border">Categoría</th>
                <th className="py-2 px-3 border">Monto</th>
                <th className="py-2 px-3 border">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {transaccionesFiltradas.map((t, idx) => (
                <tr key={idx} className={t.tipo === 'ingreso' ? 'bg-green-50' : 'bg-red-50'}>
                  <td className="py-1 px-3 border text-center">{t.fecha?.slice(0, 10)}</td>
                  <td className="py-1 px-3 border text-center capitalize">{t.tipo}</td>
                  <td className="py-1 px-3 border">{t.categoria}</td>
                  <td className="py-1 px-3 border text-right">${parseFloat(t.monto).toFixed(2)}</td>
                  <td className="py-1 px-3 border">{t.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500">No hay transacciones para este mes.</p>
        )}
      </div>

      {/* Gráficos */}
      <div className="flex flex-wrap justify-center gap-6">
        {/* Gráfico de Barras */}
        <div className="max-w-5xl mx-auto mb-8">
          <h3 className="text-xl font-semibold mb-4 text-center">Resumen por Categoría</h3>
          {datosBarras.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosBarras} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ingreso" fill="#4ade80" name="Ingresos" />
                <Bar dataKey="gasto" fill="#f87171" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No hay datos para mostrar.</p>
          )}
        </div>
      </div>

      {/* Objetivos Financieros */}
      <div className="max-w-lg mx-auto mb-8 bg-gray-100 p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Objetivos Financieros</h3>
        <form onSubmit={handleAgregarObjetivo} className="mt-4 max-w-md mx-auto">
          <input
            type="number"
            step="0.01"
            placeholder="Monto Objetivo"
            value={nuevoObjetivo.monto_objtivo}
            onChange={(e) => setNuevoObjetivo({ ...nuevoObjetivo, monto_objtivo: e.target.value })}
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Monto Cuota Mensual"
            value={nuevoObjetivo.monto_cuota}
            onChange={(e) => setNuevoObjetivo({ ...nuevoObjetivo, monto_cuota: e.target.value })}
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            type="text"
            placeholder="Descripción"
            value={nuevoObjetivo.descripcion}
            onChange={(e) => setNuevoObjetivo({ ...nuevoObjetivo, descripcion: e.target.value })}
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            type="date"
            value={nuevoObjetivo.fecha_finalizacion}
            onChange={(e) => setNuevoObjetivo({ ...nuevoObjetivo, fecha_finalizacion: e.target.value })}
            className="w-full mb-4 p-2 rounded border"
            required
          />
          <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
            Agregar Objetivo
          </button>
        </form>
        <div className="mt-4">
          {objetivosConProgreso.map((obj, idx) => (
            <div key={idx} className="mb-4">
              <p><strong>Descripción:</strong> {obj.descripcion}</p>
              <p><strong>Monto Objetivo:</strong> ${parseFloat(obj.monto_objtivo).toFixed(2)}</p>
              <p><strong>Cuotas:</strong> {obj.cuotas_pagadas}/{obj.cuotas_totales}</p>
              <p><strong>Progreso:</strong> {obj.progreso.toFixed(2)}%</p>
              <div className="w-full bg-gray-200 h-2 rounded mt-1">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${Math.min(obj.progreso, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => handlePagarCuota(idx)}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Pagar Cuota
                </button>
                <button
                  onClick={() => handleEliminarObjetivo(idx)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gastos Fijos */}
      <div className="max-w-lg mx-auto mb-8 bg-gray-100 p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Gastos Fijos</h3>
        <form onSubmit={handleAgregarGastoFijo} className="mt-4 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Categoría"
            value={nuevoGastoFijo.categoria}
            onChange={(e) => setNuevoGastoFijo({ ...nuevoGastoFijo, categoria: e.target.value })}
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Monto"
            value={nuevoGastoFijo.monto}
            onChange={(e) => setNuevoGastoFijo({ ...nuevoGastoFijo, monto: e.target.value })}
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            type="text"
            placeholder="Descripción"
            value={nuevoGastoFijo.descripcion}
            onChange={(e) => setNuevoGastoFijo({ ...nuevoGastoFijo, descripcion: e.target.value })}
            className="w-full mb-2 p-2 rounded border"
            required
          />
          <input
            type="month"
            value={nuevoGastoFijo.mes}
            onChange={(e) => setNuevoGastoFijo({ ...nuevoGastoFijo, mes: e.target.value })}
            className="w-full mb-4 p-2 rounded border"
            required
          />
          <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
            Agregar Gasto Fijo
          </button>
        </form>
        <table className="min-w-full bg-white border rounded shadow mt-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-3 border">Categoría</th>
              <th className="py-2 px-3 border">Monto</th>
              <th className="py-2 px-3 border">Descripción</th>
              <th className="py-2 px-3 border">Mes</th>
            </tr>
          </thead>
          <tbody>
            {gastosFijos.length > 0 ? (
              gastosFijos.map((gf, idx) => (
                <tr key={idx} className="hover:bg-gray-100">
                  <td className="py-1 px-3 border">{gf.categoria}</td>
                  <td className="py-1 px-3 border">${parseFloat(gf.monto).toFixed(2)}</td>
                  <td className="py-1 px-3 border">{gf.descripcion}</td>
                  <td className="py-1 px-3 border">{gf.mes}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">No hay gastos fijos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Dashboard;