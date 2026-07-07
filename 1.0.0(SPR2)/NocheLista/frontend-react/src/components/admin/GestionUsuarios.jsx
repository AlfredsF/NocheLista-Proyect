import { useState, useEffect } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import api from '../../services/api';

const roles = { cliente: 'Cliente', gestor: 'Gestor', admin: 'Admin' };

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarUsuarios = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/admin/usuarios/').then(r => r.data);
      setUsuarios(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const handleCambiarRol = async (id, rol) => {
    try {
      await api.put(`/admin/usuarios/${id}/`, { rol });
      alert('Rol actualizado');
      cargarUsuarios();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este usuario permanentemente?')) return;
    try {
      await api.delete(`/admin/usuarios/${id}/`);
      cargarUsuarios();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  return (
    <>
      <Header />
      <main className="container my-5">
        <h1 className="fw-bold mb-4">Gestión de Usuarios</h1>
        <div id="usuariosContainer">
          {loading ? (
            <p className="text-muted text-center py-5">Cargando...</p>
          ) : error ? (
            <p className="text-danger text-center">{error}</p>
          ) : usuarios.length === 0 ? (
            <p className="text-muted text-center py-5">No hay usuarios.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.nombre_completo}</td>
                      <td>
                        <span className={`badge ${u.rol === 'admin' ? 'bg-danger' : u.rol === 'gestor' ? 'bg-primary' : 'bg-secondary'}`}>
                          {roles[u.rol] || u.rol}
                        </span>
                      </td>
                      <td>{u.telefono || '-'}</td>
                      <td>
                        <select
                          className="form-select form-select-sm d-inline-block w-auto"
                          value={u.rol}
                          onChange={(e) => handleCambiarRol(u.id, e.target.value)}
                        >
                          <option value="cliente">Cliente</option>
                          <option value="gestor">Gestor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button className="btn btn-danger btn-sm ms-2" onClick={() => handleEliminar(u.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
