import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// Función para obtener el token desde las cookies
const getTokenFromCookie = () => {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
  if (tokenCookie) {
    return tokenCookie.split('=')[1].trim();
  }
  return null;
};

const NewAssignmentForm = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    idUsuario: '',
    instruccion: '',
    fechaEntrega: '',
  });

  useEffect(() => {
    const fetchUsuarios = async () => {
      const token = getTokenFromCookie();
      if (!token) {
        Swal.fire({
          title: 'Error!',
          text: 'No se encontró el token de autenticación. Redirigiendo al login.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return (window.location.href = '/login');
      }

      try {
        const response = await fetch('http://localhost:5064/api/usuarios', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error('Error al obtener los usuarios: ' + errorData.message);
        }

        const result = await response.json();
        setUsuarios(result.data.usuarios); // Asume que los usuarios vienen en este formato
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Ocurrió un error al obtener los usuarios.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    };

    fetchUsuarios();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getTokenFromCookie();

    if (!formData.idUsuario || !formData.instruccion || !formData.fechaEntrega) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, completa todos los campos.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5064/api/asignaciones', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idUsuario: formData.idUsuario,
          instruccion: formData.instruccion,
          fechaEntrega: new Date(formData.fechaEntrega).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error('Error al crear la asignación: ' + errorData.message);
      }

      Swal.fire({
        title: 'Éxito!',
        text: 'La asignación se ha creado correctamente.',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      // Resetear formulario
      setFormData({
        idUsuario: '',
        instruccion: '',
        fechaEntrega: '',
      });
    } catch (error) {
      console.error('Error al crear asignación:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Ocurrió un error al crear la asignación.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4">Nueva Asignación</h2>

      <div className="mb-4">
        <label htmlFor="idUsuario" className="block text-sm font-semibold mb-2">
          Usuario Encargado
        </label>
        <select
          name="idUsuario"
          id="idUsuario"
          className="border border-gray-300 p-3 rounded-md shadow-sm w-full"
          value={formData.idUsuario}
          onChange={handleInputChange}
        >
          <option value="">Seleccione un usuario</option>
          {usuarios.map((usuario) => (
            <option key={usuario.id_usuario} value={usuario.id_usuario}>
              {usuario.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="instruccion" className="block text-sm font-semibold mb-2">
          Instrucción
        </label>
        <textarea
          name="instruccion"
          id="instruccion"
          className="border border-gray-300 p-3 rounded-md shadow-sm w-full"
          rows="3"
          value={formData.instruccion}
          onChange={handleInputChange}
        ></textarea>
      </div>

      <div className="mb-4">
        <label htmlFor="fechaEntrega" className="block text-sm font-semibold mb-2">
          Fecha de Entrega
        </label>
        <input
          type="date"
          name="fechaEntrega"
          id="fechaEntrega"
          className="border border-gray-300 p-3 rounded-md shadow-sm w-full"
          value={formData.fechaEntrega}
          onChange={handleInputChange}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-all"
      >
        Crear Asignación
      </button>
    </form>
  );
};

export default NewAssignmentForm;
