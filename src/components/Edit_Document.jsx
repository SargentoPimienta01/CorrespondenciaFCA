import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const getTokenFromCookie = () => {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
  if (tokenCookie) {
    return tokenCookie.split('=')[1].trim();
  }
  return null;
};

const deleteToken = () => {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

const redirectToLogin = () => {
  deleteToken();
  window.location.href = '/';
};

const formatDateForAPI = (date) => {
  return new Date(date).toISOString().slice(0, 19);
};

const EditDocumentForm = ({ idDocumento }) => {
  const [formData, setFormData] = useState({
    idDocumento,
    codigoDoc: '',
    fechaRecepcionFca: '',
    fechaEntrega: '',
    fechaPlazo: '',
    asuntoDoc: '',
    observaciones: '',
    tipoDocumento: '',
    idEncargado: '',
    documento: null,
  });

  const [loading, setLoading] = useState(true);

  const getLastVersion = async () => {
    const token = getTokenFromCookie();
    try {
      const response = await fetch(`http://localhost:5064/api/versionxs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener las versiones');
      }

      const data = await response.json();
      const versiones = Array.isArray(data) ? data : data.versions;
      if (!Array.isArray(versiones)) {
        throw new Error('El formato de las versiones no es el esperado');
      }
      const filteredVersions = versiones.filter(version => version.idDocumento === idDocumento);
      const ultimaVersion = Math.max(...filteredVersions.map(version => version.id_version), 0);
      console.log('Ultima Version:', ultimaVersion)
      return ultimaVersion;
    } catch (error) {
      console.error('Error al obtener la última versión:', error);
      return 0;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
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

      try {
        const response = await fetch(`http://localhost:5064/api/documentos/${idDocumento}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los datos del documento');
        }

        const result = await response.json();
        const documentData = result.data.documento;

        setFormData({
          idDocumento: documentData.idDocumento,
          codigoDoc: documentData.codigoDoc,
          fechaRecepcionFca: documentData.fechaRecepcionFca.split('T')[0],
          fechaEntrega: documentData.fechaEntrega.split('T')[0],
          fechaPlazo: documentData.fechaPlazo.split('T')[0],
          asuntoDoc: documentData.asuntoDoc,
          observaciones: documentData.observaciones,
          tipoDocumento: documentData.tipoDocumento,
          idEncargado: documentData.idEncargado,
          documento: null,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los datos del documento:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [idDocumento]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      documento: e.target.files[0],
    });
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

    try {
      const lastVersion = await getLastVersion();
      const nextVersion = lastVersion + 1;

      const updatedDocumentData = {
        ...formData,
        fechaRecepcionFca: formatDateForAPI(formData.fechaRecepcionFca),
        fechaEntrega: formatDateForAPI(formData.fechaEntrega),
        fechaPlazo: formatDateForAPI(formData.fechaPlazo),
        idEncargado: parseInt(formData.idEncargado, 10),
        ultimaVersion: nextVersion,
      };

      const documentResponse = await fetch(`http://localhost:5064/api/documentos/${idDocumento}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDocumentData),
      });

      if (!documentResponse.ok) {
        const errorDetails = await documentResponse.json();
        console.error('Detalles del error:', errorDetails);
        throw new Error('Error al actualizar el documento');
      }

      const versionData = new FormData();
      versionData.append('idDocumento', formData.idDocumento);
      versionData.append('documento', formData.documento);

      const versionResponse = await fetch('http://localhost:5064/api/versionxs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: versionData,
      });

      if (!versionResponse.ok) {
        throw new Error('Error al crear la nueva versión');
      }

      Swal.fire({
        title: 'Documento actualizado!',
        text: 'El documento y la versión se han actualizado exitosamente.',
        icon: 'success',
        confirmButtonText: 'OK',
      });

    } catch (error) {
      console.error('Error en la actualización:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Ocurrió un error al actualizar el documento y la versión.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  if (loading) {
    return <div>Cargando datos del documento...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
        <div className="flex flex-col space-y-4">
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
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="idEncargado">Encargado</label>
            <input
              type="text"
              name="idEncargado"
              id="idEncargado"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.idEncargado}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col space-y-4">
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
          <div className="flex flex-col">
            <label htmlFor="documento">Subir Documento</label>
            <input
              type="file"
              name="documento"
              id="documento"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex justify-between items-center mb-6">
            <button
              type="submit"
              className="bg-azul text-white px-6 py-2 rounded-md hover:bg-amarillo transition-all"
            >
              Actualizar Documento
            </button>
            <button
              className="bg-azul text-white px-4 py-2 rounded-md hover:bg-amarillo transition-all"
              onClick={() => window.location.href = `/documentos/versiones`}
            >
              Ver Historial de Versiones
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

export default EditDocumentForm;
