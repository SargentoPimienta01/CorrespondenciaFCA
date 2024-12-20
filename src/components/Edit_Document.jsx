import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const getTokenFromCookie = () => {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
  if (tokenCookie) {
    return decodeURIComponent(tokenCookie.split('=')[1].trim());
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
    idDocumento: idDocumento || '',
    codigoDoc: '',
    fechaRecepcionFca: '',
    fechaEntrega: '',
    fechaPlazo: '',
    asuntoDoc: '',
    observaciones: '',
    tipoDocumento: '',
    idEncargadoDocumento: '',
    idEncargadoAsignacion: '',
    estado: false,
    documento: null,
    instruccion: '',
  });

  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);

  // Función para obtener la última versión
  const fetchLastVersion = async (token) => {
    const response = await fetch(`https://localhost:7105/api/versionxs`, {
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
    const versions = Array.isArray(data.data.versionxs) ? data.data.versionxs : [];
    const lastVersion = versions
      .filter((v) => v.idDocumento === parseInt(idDocumento, 10))
      .sort((a, b) => new Date(b.fechaModificacion) - new Date(a.fechaModificacion))[0]; // Obtener la última versión
    return lastVersion;
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
        // Fetch users
        const usuariosResponse = await fetch('https://localhost:7105/api/Usuarios', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!usuariosResponse.ok) {
          throw new Error('Error al obtener la lista de usuarios');
        }

        const usuariosData = await usuariosResponse.json();
        if (Array.isArray(usuariosData.data?.usuarios)) {
          setUsuarios(usuariosData.data.usuarios);
        } else {
          console.error('La respuesta de usuarios no tiene el formato esperado:', usuariosData);
          setError('Error al cargar la lista de usuarios');
        }

        // Fetch document data
        const documentResponse = await fetch(`https://localhost:7105/api/documentos/${idDocumento}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!documentResponse.ok) {
          throw new Error('Error al obtener los datos del documento');
        }

        const result = await documentResponse.json();
        const documentData = result.data?.documento;

        if (!documentData) {
          throw new Error('No se encontraron datos del documento');
        }

        // Fetch last version
        const lastVersion = await fetchLastVersion(token);

        setFormData({
          idDocumento: documentData.idDocumento || '',
          codigoDoc: documentData.codigoDoc || '',
          fechaRecepcionFca: lastVersion?.fechaModificacion ? lastVersion.fechaModificacion.split('T')[0] : (documentData.fechaRecepcionFca ? documentData.fechaRecepcionFca.split('T')[0] : ''),
          fechaEntrega: documentData.fechaEntrega ? documentData.fechaEntrega.split('T')[0] : '',
          fechaPlazo: documentData.fechaPlazo ? documentData.fechaPlazo.split('T')[0] : '',
          asuntoDoc: lastVersion?.comentario || documentData.asuntoDoc || '',
          observaciones: documentData.observaciones || '',
          tipoDocumento: documentData.tipoDocumento || '',
          idEncargadoDocumento: documentData.idEncargado || '',
          idEncargadoAsignacion: usuarios[0]?.id_usuario || '',
          estado: documentData.estado || false,
          documento: null,
          instruccion: '',
        });

        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
        setError('Ocurrió un error al obtener los datos necesarios.');
        setLoading(false);
      }
    };

    fetchData();
  }, [idDocumento]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        documento: file,
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        documento: null,
      }));
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

    // Verificación si hay un archivo y confirmar si se desea continuar sin él
    if (!formData.documento) {
      const confirm = await Swal.fire({
        title: '¿Deseas continuar sin archivo?',
        text: 'No has seleccionado ningún documento para subir. ¿Deseas continuar con la nueva versión sin archivo adjunto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
      });

      if (!confirm.isConfirmed) {
        return;  // Si el usuario cancela, detenemos la operación
      }
    }

    try {
      // Actualizar documento
      const updatedDocumentData = {
        idDocumento: formData.idDocumento, // Aseguramos que este campo esté presente
        codigoDoc: formData.codigoDoc,
        fechaRecepcionFca: formatDateForAPI(formData.fechaRecepcionFca),
        fechaEntrega: formData.fechaEntrega ? formatDateForAPI(formData.fechaEntrega) : null,
        fechaPlazo: formData.fechaPlazo ? formatDateForAPI(formData.fechaPlazo) : null,
        asuntoDoc: formData.asuntoDoc,
        observaciones: formData.observaciones,
        tipoDocumento: formData.tipoDocumento,
        idEncargado: parseInt(formData.idEncargadoDocumento, 10),
        estado: formData.estado,

      };


      const documentResponse = await fetch(`https://localhost:7105/api/documentos/${idDocumento}`, {
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

      const assignData = {
        idDocumento: formData.idDocumento,
        fechaAsignado: formatDateForAPI(new Date()),
        fechaEntrega: formData.fechaEntrega ? formatDateForAPI(formData.fechaEntrega) : null,
        idEncargado: parseInt(formData.idEncargadoDocumento, 10),
        instruccion: formData.instruccion,
      };

      const assignResponse = await fetch(`https://localhost:7105/api/asignaciones`, {
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

      // Convertir el archivo a base64
      let encodedFile = null;
      if (formData.documento) {
        const fileReader = new FileReader();
        fileReader.onload = async () => {
          encodedFile = btoa(
            new Uint8Array(fileReader.result).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          const versionData = {
            idDocumento: formData.idDocumento,
            idAsignacion: assignId,
            versionFinal: formData.estado,
            comentario: formData.observaciones,
            documento: encodedFile, // Archivo en base64
          };

          const versionResponse = await fetch('https://localhost:7105/api/versionxs', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(versionData),
          });

          if (!versionResponse.ok) {
            const errorDetails = await versionResponse.json();
            console.error('Detalles del error en la versión:', errorDetails);
            throw new Error('Error al crear la nueva versión');
          }

          Swal.fire({
            title: 'Documento actualizado!',
            text: 'El documento, la asignación y la nueva versión se han creado exitosamente.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
        };

        fileReader.readAsArrayBuffer(formData.documento);
      } else {
        // Si no hay archivo, enviar solo los datos sin el archivo
        const versionData = {
          idDocumento: formData.idDocumento,
          idAsignacion: assignId,
          versionFinal: formData.estado,
          comentario: formData.asuntoDoc,
          documento: null,
        };

        const versionResponse = await fetch('https://localhost:7105/api/versionxs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(versionData),
        });

        if (!versionResponse.ok) {
          const errorDetails = await versionResponse.json();
          console.error('Detalles del error en la versión:', errorDetails);
          throw new Error('Error al crear la nueva versión');
        }

        Swal.fire({
          title: 'Documento actualizado!',
          text: 'El documento, la asignación y la nueva versión se han creado exitosamente.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error en la actualización:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Ocurrió un error al actualizar el documento, la asignación y la versión.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  if (loading) {
    return <div>Cargando datos del documento...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
        <h2 className="text-2xl font-bold mb-4">Actualizar Documento</h2>
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

          {/* Encargado del Documento */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="idEncargadoDocumento">Encargado del Documento</label>
            <select
              name="idEncargadoDocumento"
              id="idEncargadoDocumento"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.idEncargadoDocumento}
              onChange={handleInputChange}
              required
            >
              <option value="">Seleccione un encargado</option>
              {usuarios.map((usuario) => (
                <option key={usuario.idUsuario} value={usuario.idUsuario}>

                  {usuario.nombre || 'Usuario sin nombre'}
                </option>
              ))}
            </select>
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
                readOnly
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

          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="documento">Subir Documento</label>
            <input
              type="file"
              name="documento"
              id="documento"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="border border-gray-300 p-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amarillo cursor-pointer"
              onChange={handleFileChange}
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
              placeholder="Escribe cualquier observación relevante"
            />
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">Asignación del Documento</h2>

          {/* Encargado de la Asignación */}
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
                <option key={usuario.idUsuario} value={usuario.idUsuario}>
                  {usuario.nombre || 'Usuario sin nombre'}
                </option>
              ))}
            </select>
          </div>

          {/* Instrucción para la asignación */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2" htmlFor="instruccion">Instrucción para la Asignación</label>
            <textarea
              name="instruccion"
              id="instruccion"
              rows="3"
              className="border border-gray-300 p-3 rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-amarillo"
              value={formData.instruccion}
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

          {/* ¿Es la última versión? */}
          <div className="flex items-center mb-6">
            <label className="text-sm font-semibold mr-2" htmlFor="estado">¿Es la última versión?</label>
            <input
              type="checkbox"
              name="estado"
              id="estado"
              className="w-5 h-5"
              checked={formData.estado}
              onChange={handleInputChange}
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
              className="bg-azul text-white px-6 py-2 rounded-md hover:bg-amarillo transition-all"
              type="button"
              onClick={() => {
                const url = `/documentos/versiones?idDocumento=${idDocumento}`;
                window.location.href = url;
              }}
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