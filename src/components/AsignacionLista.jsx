import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export const Search = ({ className }) => (
  <svg className={className} role="img" fill="#000000" height="20" width="20" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 488.4 488.4">
    <path d="M0,203.25c0,112.1,91.2,203.2,203.2,203.2c51.6,0,98.8-19.4,134.7-51.2l129.5,129.5c2.4,2.4,5.5,3.6,8.7,3.6
      s6.3-1.2,8.7-3.6c4.8-4.8,4.8-12.5,0-17.3l-129.6-129.5c31.8-35.9,51.2-83,51.2-134.7c0-112.1-91.2-203.2-203.2-203.2
      S0,91.15,0,203.25z M381.9,203.25c0,98.5-80.2,178.7-178.7,178.7s-178.7-80.2-178.7-178.7s80.2-178.7,178.7-178.7
      S381.9,104.65,381.9,203.25z"/>
  </svg>
);

const AsigList = () => {
  const [asignaciones, setAsignaciones] = useState([]); // Estado para almacenar las asignaciones
  const [filteredAsignaciones, setFilteredAsignaciones] = useState([]); // Estado para manejar las asignaciones filtradas
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [error, setError] = useState(null); // Estado para manejar errores

  // Función para extraer el token de la cookie
  const getTokenFromCookie = () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));

    if (tokenCookie) {
      return tokenCookie.split('=')[1].trim(); 
    }
    return null;
  };

  // Función para eliminar el token de la cookie si es inválido
  const deleteTokenAndRedirect = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    window.location.href = '/';  // Redirigir al login
  };

  // Fetch para obtener las asignaciones
  useEffect(() => {
    const token = getTokenFromCookie();

    if (!token) {
      console.log('Token no encontrado o expirado.');
      deleteTokenAndRedirect();
      return;
    }

    const fetchAsignaciones = async () => {
      try {
        const response = await fetch('http://32768:8080/api/asignaciones', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, 
            },
          });

        if (!response.ok) {
          const errorDetails = await response.text();
          console.log('Detalles del error:', errorDetails);
          throw new Error(`Error al obtener asignaciones. Status: ${response.status}. Detalles: ${errorDetails}`);
        }

        const result = await response.json();
        console.log('Datos obtenidos:', result);

        if (result.data && Array.isArray(result.data.asignaciones)) {
            setAsignaciones(result.data.asignaciones);
            setFilteredAsignaciones(result.data.asignaciones);
        } else {
            throw new Error('La API no devolvió un array de Asignaciones');
        }

        setLoading(false);

      } catch (err) {
        console.error('Error en la solicitud fetch:', err);
        setError(err.message);
        Swal.fire({
            title: 'Error',
            text: `Error al cargar asignaciones: ${err.message}`,
            icon: 'error',
            confirmButtonText: 'OK'
        });
        setLoading(false);
      }
    };

    fetchAsignaciones();
  }, []);

  // Función para filtrar las asignaciones por instrucción
  const filterAsignaciones = (searchTerm) => {
    const filtered = asignaciones.filter(asignacion =>
      asignacion.instruccion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAsignaciones(filtered);
  };

  // Función para mostrar detalles completos de la asignación en SweetAlert
  const handleAsignacionClick = (asignacion) => {
    Swal.fire({
      title: `Asignación: ${asignacion.instruccion}`,
      html: `
        <p><strong>ID:</strong> ${asignacion.idAsignacion}</p>
        <p><strong>Instrucción:</strong> ${asignacion.instruccion}</p>
        <p><strong>Fecha Asignado:</strong> ${new Date(asignacion.fechaAsignado).toLocaleString()}</p>
        <p><strong>Fecha Entrega:</strong> ${new Date(asignacion.fechaEntrega).toLocaleString()}</p>
        <p><strong>ID Usuario:</strong> ${asignacion.idUsuario}</p>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  };

  if (loading) {
    return <div>Cargando asignaciones...</div>;
  }
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <a href="/nueva-asignacion" className="hover:no-underline">
          <button 
            className="bg-azul text-white px-4 py-2 rounded cursor-pointer mr-5 transform hover:bg-amarillo hover:scale-105 transition-colors duration-300 ease-in-out"
          >
            + Añadir Asignación
          </button>
        </a>
        <input
          id="codigo-asignacion"
          name="codigoAsignacion"
          type="text"
          placeholder="Buscar por instrucción"
          className="flex-1 px-2 py-1 border border-black rounded"
          onChange={(e) => filterAsignaciones(e.target.value)}
        />
        <button 
          id="buscar-btn"
          name="buscar"
          className="bg-transparent border-none cursor-pointer ml-2"
        >
          <Search className="text-black w-5 h-5" />
        </button>
      </div>

      {filteredAsignaciones.length > 0 ? (
        filteredAsignaciones.map((asignacion) => (
          <div
            key={asignacion.idAsignacion}
            className="bg-gray-200 hover:bg-gray-300 transition-colors duration-200 ease-in-out rounded-lg overflow-hidden shadow-md cursor-pointer mb-2"
            onClick={() => handleAsignacionClick(asignacion)}
          >
            <div className='p-4'>
              <div className="flex justify-between w-full mb-2">
                <span className="text-lg font-bold text-gray-800">{asignacion.instruccion}</span>
                <span className="text-sm text-gray-500">{new Date(asignacion.fechaEntrega).toLocaleDateString()}</span>
              </div>
              <div className="text-gray-600">
                <p>ID Usuario: {asignacion.idUsuario}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No hay asignaciones disponibles.</p>
      )}
      <div className="mt-10 text-center p-5 bg-amarillo rounded-lg">
          <h2 className="text-2xl font-bold text-white">¡Cada documento cuenta! 📄</h2>
          <p className="text-lg text-white">Recuerda que cada detalle en este documento es esencial para mantener la precisión y el éxito en tus proyectos. ¡Sigue editando con dedicación! 💡</p>
        </div>
    </div>
  );
};

export default AsigList;
