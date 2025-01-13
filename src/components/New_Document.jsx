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

const NewDocumentAndAssignForm = ({ usuarios }) => {
  const currentDateTime = new Date().toISOString().split('T')[0]; // Fecha en formato 'YYYY-MM-DD'

  const [formData, setFormData] = useState({
    codigoDoc: '',
    fechaRecepcionFca: currentDateTime, // Fecha automática
    fechaAsignado: currentDateTime, // Fecha automática
    fechaEntrega: '', // Fecha de entrega de la asignación
    fechaPlazo: '',  // Plazo general del documento
    asuntoDoc: '',
    observaciones: '', // Campo de observaciones añadido
    tipoDocumento: '',  
    ultimaVersion: '',
    idEncargadoDocumento: usuarios[0]?.id_usuario || '', // Encargado del documento (dueño)
    idEncargadoAsignacion: usuarios[0]?.id_usuario || '', // Encargado de la tarea (asignación)
    estado: false,
    documento: null,  // Archivo que se subirá como la primera versión del documento
    instruccion: '', // Campo para la asignación
  });

  const [loading, setLoading] = useState(false);

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = btoa(
          new Uint8Array(event.target.result)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        setFormData({
          ...formData,
          documento: base64String,  // Guardamos el archivo convertido a Base64
        });
      };
      reader.readAsArrayBuffer(file); // Leer el archivo como array buffer para convertirlo a Base64
    } else {
      setFormData({
        ...formData,
        documento: null,  // Si no se selecciona un archivo, dejamos el campo como null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
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

    // Si no hay archivo, preguntar si se quiere continuar sin archivo
    if (!formData.documento) {
      const { isConfirmed } = await Swal.fire({
        title: 'No has adjuntado ningún archivo',
        text: '¿Deseas continuar sin adjuntar un archivo?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'No, cancelar',
      });

      if (!isConfirmed) {
        return; // Si el usuario cancela, no se envía el formulario
      }
    }
  
    setLoading(true);
  
    try {
      // 1. Crear el documento y obtener su ID
      const documentData = {
        codigoDoc: formData.codigoDoc,
        fechaRecepcionFca: formatDateForAPI(formData.fechaRecepcionFca),
        fechaEntrega: formData.fechaEntrega ? formatDateForAPI(formData.fechaEntrega) : null,
        fechaPlazo: formData.fechaPlazo ? formatDateForAPI(formData.fechaPlazo) : null, // Plazo final para el documento
        asuntoDoc: formData.asuntoDoc,
        ultimaVersion: 1,
        estado: false,
        observaciones: formData.observaciones,
        tipoDocumento: formData.tipoDocumento,
        idEncargado: parseInt(formData.idEncargadoDocumento, 10),
      };
  
      const documentResponse = await fetch(`https://localhost:32769/api/documentos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });
  
      if (!documentResponse.ok) {
        const errorDetails = await documentResponse.json();
        console.error('Detalles del error:', errorDetails);
        throw new Error('Error al crear el documento');
      }

      const createdDocument = await documentResponse.json();
      console.log('Respuesta del documento creado:', createdDocument); // Log para inspeccionar la respuesta
  
      const documentId = createdDocument.data?.documento?.idDocumento; // Acceder correctamente al ID del documento
      if (!documentId) {
        throw new Error('No se pudo obtener el ID del documento creado.');
      }
  
      // 2. Crear la asignación vinculada al documento
      const assignData = {
        idDocumento: documentId, // ID del documento recién creado
        fechaAsignado: formatDateForAPI(formData.fechaAsignado),
        fechaEntrega: formData.fechaEntrega ? formatDateForAPI(formData.fechaEntrega) : null, 
        idEncargado: parseInt(formData.idEncargadoAsignacion, 10),
        instruccion: formData.instruccion,
      };
  
      const assignResponse = await fetch(`https://localhost:32769/api/asignaciones`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignData),
      });
  
      if (!assignResponse.ok) {
        const errorDetails = await assignResponse.json();
        console.error('Detalles del error en la asignación:', errorDetails);
        throw new Error('Error al crear la asignación');
      }
  
      const createdAssign = await assignResponse.json();
      const assignId = createdAssign.data?.asignacion?.idAsignacion;
  
      if (!assignId) {
        throw new Error('No se pudo obtener el ID de la asignación creada.');
      }
  
      // 3. Crear la primera versión del documento
      const versionData = {
        idDocumento: documentId,
        idAsignacion: assignId,
        versionFinal: false,
        comentario: formData.observaciones,
        documento: formData.documento || null, // Aquí enviamos el archivo en Base64 o null si no hay archivo
      };
  
      const versionResponse = await fetch('https://localhost:32769/api/versionxs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(versionData),
      });

      console.log('Datos Enviados: ', versionData);
  
      if (!versionResponse.ok) {
        const errorDetails = await versionResponse.json();
        console.error('Detalles del error en la versión:', errorDetails);
        throw new Error('Error al crear la nueva versión');
      }
  
      Swal.fire({
        title: 'Éxito!',
        text: 'El documento, la asignación y la versión se han creado exitosamente.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
  
    } catch (error) {
      console.error('Error en el flujo de creación:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Ocurrió un error al crear el documento, la asignación y la versión.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Sección de Creación de Documento */}
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
        <h2 className="text-2xl font-bold mb-4">Creación del Documento y Primera Versión</h2>
        
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

          {/* Asunto */}
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

          <div className="flex flex-col space-y-4">
          {/* Encargado del Documento (dueño) */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="idEncargadoDocumento">Encargado del Documento (Dueño)</label>
            <select
            name="idEncargadoDocumento"
            id="idEncargadoDocumento"
            className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
            value={formData.idEncargadoDocumento}
            onChange={handleInputChange}
          >
            <option key='' value="">Seleccione un encargado</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id_usuario} value={usuario.id_usuario}>
                {usuario.nombre}
              </option>
            ))}
          </select>
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

          {/* Subir Documento (Primera Versión) */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="documento">Subir Documento (Primera Versión)</label>
            <input
              type="file"
              name="documento"
              id="documento"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo cursor-pointer"
            />
          </div>

          {/* Fecha de Recepción (automática, no editable) */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="fechaRecepcionFca">Fecha de Recepción FCA</label>
            <input
              type="date"
              name="fechaRecepcionFca"
              id="fechaRecepcionFca"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.fechaRecepcionFca}
              readOnly
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

          {/* Observaciones */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="observaciones">Observaciones</label>
            <textarea
              name="observaciones"
              id="observaciones"
              rows="3"
              className="border border-gray-300 p-3 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.observaciones}
              onChange={handleInputChange}
              placeholder="Escribe cualquier observación relevante"
            />
          </div>
        </div>

        {/* Sección de Asignación */}
        <h2 className="text-2xl font-bold mt-8 mb-4">Asignación del Documento</h2>

          {/* Encargado de la Asignación (Responsable de la tarea) */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="idEncargadoAsignacion">Encargado de la Asignación</label>
            <select
              name="idEncargadoAsignacion"
              id="idEncargadoAsignacion"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.idEncargadoAsignacion}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un encargado</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Instrucción */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="instruccion">Instrucción</label>
            <textarea
              name="instruccion"
              id="instruccion"
              rows="3"
              className="border border-gray-300 p-3 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.instruccion}
              onChange={handleInputChange}
              placeholder="Escribe aquí las instrucciones para la asignación"
              required
            />
          </div>

          {/* Fecha de Entrega */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="fechaEntrega">Fecha de Entrega (Asignación)</label>
            <input
              type="date"
              name="fechaEntrega"
              id="fechaEntrega"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.fechaEntrega}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Botón de enviar */}
          <div className="flex justify-between items-center mb-6">
            <button
              type="submit"
              className="bg-azul text-white px-6 py-2 rounded-md hover:bg-amarillo transition-all"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar'}
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

export default NewDocumentAndAssignForm;