import React, { useState } from 'react';
import Swal from 'sweetalert2';

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
    idEncargado: usuarios[0]?.id_usuario || ''  // Nota: Cambié idUsuario a id_usuario
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
  const handleSubmit = async () => {
    try {
      const response = await fetch('https://tu-url-de-api.com/documentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          title: 'Documento registrado!',
          text: 'El documento se ha registrado exitosamente.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        // Aquí podrías resetear el formulario si quieres
        setFormData({
          codigoDoc: '',
          fechaRecepcionFca: '',
          fechaEntrega: '',
          fechaPlazo: '',
          asuntoDoc: '',
          observaciones: '',
          tipoDocumento: '',
          ultimaVersion: 1,
          idEncargado: usuarios[0]?.id_usuario || ''
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Ocurrió un error al registrar el documento.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'No se pudo conectar con el servidor.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
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

        {/* Botón de enviar */}
        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-azul text-white px-6 py-2 rounded-md hover:bg-amarillo transition-all"
          >
            Registrar Documento
          </button>
        </div>

        {/* Mensaje de éxito */}
        <div className="mt-10 text-center p-5 bg-amarillo rounded-lg">
          <h2 className="text-2xl font-bold text-white">¡Cada documento cuenta! 📄</h2>
          <p className="text-lg text-white">Recuerda que cada detalle en este documento es esencial para mantener la precisión y el éxito en tus proyectos. ¡Sigue editando con dedicación! 💡</p>
        </div>
      </div>
    </div>
  );
};

export default NewDocumentForm;
