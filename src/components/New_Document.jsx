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
    tipoDocumento: '',  
    ultimaVersion: 1,
    idEncargado: usuarios[0]?.id_usuario || '',  
    documento: null  // Campo para el archivo (PDF, Word, Excel)
  });

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Función para manejar el cambio de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        const binaryStr = event.target.result;
        const byteArray = new Uint8Array(binaryStr); // Convertir a Uint8Array (similar a byte[] en C#)
        setFormData({
          ...formData,
          documento: byteArray,  // Almacenar el archivo convertido en bytes
        });
      };
  
      reader.readAsArrayBuffer(file); // Leer el archivo como un array de bytes
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevenir la recarga de la página

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

    // Validar si no se ha subido un archivo
    if (!formData.documento) {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No has subido ningún archivo. ¿Deseas continuar sin archivo?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      });

      // Si cancela, detener la operación
      if (!result.isConfirmed) {
        Swal.fire({
          title: 'Cancelado',
          text: 'El registro fue cancelado.',
          icon: 'info',
          confirmButtonText: 'OK',
        });
        return;
      }
    }

    // Formatear los datos antes de enviar
    const formattedData = {
      ...formData,
      fechaRecepcionFca: formatDateForAPI(formData.fechaRecepcionFca),
      fechaEntrega: formatDateForAPI(formData.fechaEntrega),
      fechaPlazo: formatDateForAPI(formData.fechaPlazo),
      idEncargado: parseInt(formData.idEncargado, 10), // Asegurarse de que es un número
    };

    try {
      // Crear el documento
      const documentResponse = await fetch('http://localhost:5064/api/documentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData),
      });

      if (!documentResponse.ok) {
        const errorDetails = await documentResponse.json();
        console.error('Error en el registro del documento:', errorDetails);
        throw new Error('Error al crear el documento');
      }

      // Obtener el id del documento recién creado
      const documentData = await documentResponse.json();
      const { idDocumento } = documentData.data.documento;

      // Crear la primera versión del documento (si existe archivo)
      const versionData = new FormData();
      versionData.append('idDocumento', idDocumento);
      versionData.append('versionFinal', false);  // Es la primera versión, no es la final
      versionData.append('comentario', formData.asuntoDoc);

      if (formData.documento) {
        versionData.append('documento', new Blob([formData.documento]));  // Añadir el archivo si existe
      }

      const versionResponse = await fetch('http://localhost:5064/api/versionxs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: versionData,
      });

      if (!versionResponse.ok) {
        const errorDetails = await versionResponse.json();
        console.error('Error en la creación de la versión:', errorDetails);
        throw new Error('Error al crear la nueva versión');
      }

      Swal.fire({
        title: 'Documento registrado!',
        text: 'El documento y su primera versión se han registrado exitosamente.',
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
        idEncargado: usuarios[0]?.id_usuario || '',  
        documento: null
      });

    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      Swal.fire({
        title: 'Error!',
        text: 'No se pudo registrar el documento y su versión.',
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

          {/* Subir Documento */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="documento">Subir Documento</label>
            <input
              type="file"
              name="documento"
              id="documento"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
            />
          </div>

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
