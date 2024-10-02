import React, { useState } from 'react';
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

// Función para eliminar el token
const deleteToken = () => {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

// Redirigir al login si el token es inválido o no está presente
const redirectToLogin = () => {
  deleteToken(); // Eliminar cualquier token existente
  window.location.href = '/'; // Redirigir al login
};

// Función para formatear las fechas en el formato esperado por la API
const formatDateForAPI = (date) => {
  return new Date(date).toISOString().slice(0, 19);  // Eliminar la 'Z' del final
};

const NewDocumentForm = ({ usuarios }) => {
  const [formData, setFormData] = useState({
    codigoDoc: '',
    fechaRecepcionFca: '',
    fechaEntrega: '',
    fechaPlazo: '',
    asuntoDoc: '',
    observaciones: '',
    tipoDocumento: '',  // Asegurarnos de que tipoDocumento está inicializado
    ultimaVersion: 1,
    idEncargado: usuarios[0]?.id_usuario || '',  // Inicializa con el primer encargado, en formato numérico
    documento: '' // Campo requerido "documento"
  });

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevenir la recarga de la página

    console.log("Intentando enviar el formulario...");
    const token = getTokenFromCookie();

    if (!token) {
      Swal.fire({
        title: 'Error!',
        text: 'No se encontró el token de autenticación. Redirigiendo al login.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return redirectToLogin();
    }

    // Forzar a que idEncargado sea un número entero y formatear fechas correctamente
    const formattedData = {
      ...formData,
      fechaRecepcionFca: formatDateForAPI(formData.fechaRecepcionFca),
      fechaEntrega: formatDateForAPI(formData.fechaEntrega),
      fechaPlazo: formatDateForAPI(formData.fechaPlazo),
      idEncargado: parseInt(formData.idEncargado, 10), // Asegurarse de que es un número
    };

    console.log('Enviando datos formateados:', formattedData);
    console.log('Token:', token);

    try {
      const response = await fetch('http://localhost:5064/api/documentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData),
      });

      console.log('Estado de la respuesta:', response.status);

      if (response.ok) {
        Swal.fire({
          title: 'Documento registrado!',
          text: 'El documento se ha registrado exitosamente.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        // Resetear el formulario después de un registro exitoso
        setFormData({
          codigoDoc: '',
          fechaRecepcionFca: '',
          fechaEntrega: '',
          fechaPlazo: '',
          asuntoDoc: '',
          observaciones: '',
          tipoDocumento: '',
          ultimaVersion: 1,
          idEncargado: usuarios[0]?.id_usuario || '',  // Restablecer el idEncargado como número
          documento: '' // Restablecer el campo documento
        });
      } else if (response.status === 401) {
        Swal.fire({
          title: 'Error de Autenticación!',
          text: 'El token ha expirado. Redirigiendo al login.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        redirectToLogin();
      } else {
        const errorResponse = await response.json();
        console.error('Error en el registro:', errorResponse);
        
        // Mostrar los errores de validación en consola y en un mensaje de alerta
        Swal.fire({
          title: 'Error!',
          text: `Ocurrió un error al registrar el documento: ${JSON.stringify(errorResponse.errors)}`,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      Swal.fire({
        title: 'Error!',
        text: 'No se pudo conectar con el servidor.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
        <div className="flex flex-col space-y-4">
          {/* Código del documento */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="codigoDoc">Código del Documento</label>
            <input
              type="text"
              name="codigoDoc"
              id="codigoDoc"
              required
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.codigoDoc}
              onChange={handleInputChange}
            />
          </div>

          {/* Encargado */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="idEncargado">Encargado</label>
            <select
              name="idEncargado"
              id="idEncargado"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.idEncargado}
              onChange={handleInputChange}
            >
              {usuarios.map((usuario) => (
                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div className="flex flex-col space-y-4">
            {/* Fecha de Recepción FCA */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2" htmlFor="fechaRecepcionFca">Fecha de Recepción FCA</label>
              <input
                type="date"
                name="fechaRecepcionFca"
                id="fechaRecepcionFca"
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
                value={formData.fechaRecepcionFca}
                onChange={handleInputChange}
              />
            </div>

            {/* Fecha de Entrega */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2" htmlFor="fechaEntrega">Fecha de Entrega</label>
              <input
                type="date"
                name="fechaEntrega"
                id="fechaEntrega"
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
                value={formData.fechaEntrega}
                onChange={handleInputChange}
              />
            </div>

            {/* Fecha Plazo */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2" htmlFor="fechaPlazo">Fecha Límite</label>
              <input
                type="date"
                name="fechaPlazo"
                id="fechaPlazo"
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
                value={formData.fechaPlazo}
                onChange={handleInputChange}
              />
            </div>

            {/* Tipo de Documento */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2" htmlFor="tipoDocumento">Tipo de Documento</label>
              <select
                name="tipoDocumento"
                id="tipoDocumento"
                className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
              >
                <option value="">Seleccione un tipo</option>
                <option value="Informe">Informe</option>
                <option value="Propuesta">Propuesta</option>
                <option value="Contrato">Contrato</option>
                <option value="Solicitud">Solicitud</option>
                <option value="Notificación">Notificación</option>
              </select>
            </div>
          </div>

          {/* Asunto y Observaciones */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2" htmlFor="asuntoDoc">Asunto</label>
              <textarea
                name="asuntoDoc"
                id="asuntoDoc"
                rows="3"
                className="border border-gray-300 p-3 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-amarillo"
                value={formData.asuntoDoc}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2" htmlFor="observaciones">Observaciones</label>
              <textarea
                name="observaciones"
                id="observaciones"
                rows="3"
                className="border border-gray-300 p-3 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-amarillo"
                value={formData.observaciones}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Campo Documento 
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="documento">Documento</label>
            <input
              type="text"
              name="documento"
              id="documento"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.documento}
              onChange={handleInputChange}
            />
          </div>
          */}

          {/* Botón de enviar */}
          <div className="flex justify-between items-center mb-6">
            <button
              type="submit"
              className="bg-azul text-white px-6 py-2 rounded-md hover:bg-amarillo transition-all"
            >
              Registrar Documento
            </button>
          </div>
        </div>
        <div className="mt-10 text-center p-5 bg-amarillo rounded-lg">
          <h2 className="text-2xl font-bold text-white">¡Cada documento cuenta! 📄</h2>
          <p className="text-lg text-white">Recuerda que cada detalle en este documento es esencial para mantener la precisión y el éxito en tus proyectos. ¡Sigue editando con dedicación! 💡</p>
        </div>
      </div>
    </form>
  );
};

export default NewDocumentForm;
