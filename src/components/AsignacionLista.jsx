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
  const [token, setToken] = useState(null);  // Estado para almacenar el token

  // Función para extraer el token de la cookie
  const getTokenFromCookie = () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));

    if (tokenCookie) {
      return tokenCookie.split('=')[1].trim(); 
    }
    return null;
  };

  // Función para extraer la expiración del token de la cookie
  const getExpiryFromCookie = () => {
    const cookies = document.cookie.split(';');
    const expiryCookie = cookies.find(cookie => cookie.trim().startsWith('expiry='));

    if (expiryCookie) {
      return expiryCookie.split('=')[1].trim();
    }
    return null; 
  };

  // Función para eliminar el token y la expiración de la cookie (logout)
  const deleteTokenAndExpiryFromCookie = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';  
    document.cookie = 'expiry=; Max-Age=0; path=/;';
  };

  // Función para verificar si el token ha expirado
  const checkTokenExpiry = () => {
    const expiryTime = getExpiryFromCookie();
    
    if (!expiryTime) return false; 

    const expiryDate = new Date(parseInt(expiryTime, 10)); 
    const now = new Date();

    return expiryDate.getTime() < now.getTime(); 
  };

  // Fetch para obtener las asignaciones
  useEffect(() => {

    const token = getTokenFromCookie();
    const tokenExpired = checkTokenExpiry();

    console.log('Token extraído de la cookie:', token);

    if (!token || tokenExpired) {
      console.log('Token no encontrado o expirado.');
      deleteTokenAndExpiryFromCookie();  // Eliminar el token si está vencido o no se encuentra
      window.location.href = '/';  // Redirigir al login
      return;
    }

    setToken(token);

    const fetchAsignaciones = async () => {
      try {
        const response = await fetch('http://localhost:5064/api/asignaciones', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, 
            },
          });

        console.log('Estado de respuesta:', response.status);

        if (!response.ok) {
          const errorDetails = await response.text();
          console.log('Detalles del error:', errorDetails);
          throw new Error(`Error al obtener asignaciones. Status: ${response.status}. Detalles: ${errorDetails}`);
        }

        const result = await response.json();
        console.log('Datos obtenidos:', result);

        if (result.data && Array.isArray(result.data.asignaciones)) {
            setProcesos(result.data.asignaciones);
            setFilteredProcesos(result.data.asignaciones);
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
  }, [token]);

  const filterAsignaciones = (searchTerm) => {
    setFilteredProcesos(asignaciones.filter(asignacion =>
      asignacion.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  };

  const handleProcessClick = (e, AsignacionId) => {
    e.stopPropagation(); // Detiene la propagación al padre
    console.log(`Navegando al proceso ID: ${AsignacionId}`);
    window.location.href = `/asignaciones/${AsignacionId}`;
  };

  if (loading) {
    return <div>Cargando asignaciones...</div>;
  }
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Asignaciones en Curso</h1>
      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        filteredAsignaciones.length > 0 ? (
          filteredAsignaciones.map((asignacion) => (
            <div key={asignacion.idAsignacion} className="border-b border-gray-300 pb-2 mb-2">
              <p><strong>Título:</strong> {asignacion.titulo}</p>
              <p><strong>Descripción:</strong> {asignacion.descripcion}</p>
              <p><strong>Fecha de Inicio:</strong> {new Date(asignacion.fechaInicio).toLocaleDateString()}</p>
              <p><strong>Fecha de Fin:</strong> {asignacion.fechaFin ? new Date(asignacion.fechaFin).toLocaleDateString() : 'En curso'}</p>
            </div>
          ))
        ) : (
          <p>No hay asignaciones en curso.</p>
        )
      )}
    </div>
  );
};

export default AsigList;
