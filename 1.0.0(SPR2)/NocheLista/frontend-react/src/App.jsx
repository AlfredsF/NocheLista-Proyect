import { Routes, Route } from 'react-router-dom';
import Inicio from './components/common/Inicio';
import Login from './components/auth/Login';
import Registro from './components/auth/Registro';
import PrivateRoute from './components/auth/PrivateRoute';
import Perfil from './components/auth/Perfil';
import Catalogo from './components/hotel/Catalogo';
import DetalleHotel from './components/hotel/DetalleHotel';
import MisReservas from './components/reservas/MisReservas';
import AdminDashboard from './components/admin/AdminDashboard';
import Solicitudes from './components/admin/Solicitudes';
import GestionUsuarios from './components/admin/GestionUsuarios';
import HotelDashboard from './components/gestor/HotelDashboard';
import GestionHotel from './components/gestor/GestionHotel';
import GestionHabitaciones from './components/gestor/GestionHabitaciones';
import Promociones from './components/gestor/Promociones';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/hoteles" element={<Catalogo />} />
      <Route path="/hoteles/:id" element={<DetalleHotel />} />
      <Route
        path="/mis-reservas"
        element={
          <PrivateRoute>
            <MisReservas />
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Perfil />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute roles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/solicitudes"
        element={
          <PrivateRoute roles={['admin']}>
            <Solicitudes />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <PrivateRoute roles={['admin']}>
            <GestionUsuarios />
          </PrivateRoute>
        }
      />
      <Route
        path="/gestor"
        element={
          <PrivateRoute roles={['gestor']}>
            <HotelDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/gestor/mi-hotel"
        element={
          <PrivateRoute roles={['gestor']}>
            <GestionHotel />
          </PrivateRoute>
        }
      />
      <Route
        path="/gestor/habitaciones"
        element={
          <PrivateRoute roles={['gestor']}>
            <GestionHabitaciones />
          </PrivateRoute>
        }
      />
      <Route
        path="/gestor/promociones"
        element={
          <PrivateRoute roles={['gestor']}>
            <Promociones />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
