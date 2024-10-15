import React, { useState, useEffect } from 'react';

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
  const [procesos, setProcesos] = useState([]); // Estado para almacenar los procesos
  const [filteredProcesos, setFilteredProcesos] = useState([]); // Estado para manejar los procesos filtrados
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [error, setError] = useState(null); // Estado para manejar errores
  const [token, setToken] = useState(null);  // Estado para almacenar el token

  // Función para extraer el token de la cookie
  const getTokenFromCookie = () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));

    if (tokenCookie) {
      return tokenCookie.split('=')[1].trim();  // Asegúrate de eliminar cualquier espacio adicional
    }
    return null;  // Retornar null si no se encuentra la cookie
  };

  // Función para extraer la expiración del token de la cookie
  const getExpiryFromCookie = () => {
    const cookies = document.cookie.split(';');
    const expiryCookie = cookies.find(cookie => cookie.trim().startsWith('expiry='));

    if (expiryCookie) {
      return expiryCookie.split('=')[1].trim();  // Extraer la expiración
    }
    return null;  // Retornar null si no se encuentra la cookie de expiración
  };

  // Función para eliminar el token y la expiración de la cookie (logout)
  const deleteTokenAndExpiryFromCookie = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';  // Eliminar la cookie de token
    document.cookie = 'expiry=; Max-Age=0; path=/;';  // Eliminar la cookie de expiración
  };

  // Función para verificar si el token ha expirado
  const checkTokenExpiry = () => {
    const expiryTime = getExpiryFromCookie();
    
    if (!expiryTime) return false; // Si no hay una cookie de expiración, consideramos que no hay expiración

    const expiryDate = new Date(parseInt(expiryTime, 10)); // Convertir la expiración en una fecha
    const now = new Date();

    if (expiryDate.getTime() < now.getTime()) {
      console.log('Token ha expirado. Redirigiendo al login...');
      return true;
    }
    return false;
  };

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

    const fetchProcesos = async () => {
      try {
        console.log('Iniciando fetch de procesos...');
        const response = await fetch('http://localhost:5064/api/asignaciones', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Incluir el token extraído en los headers
          },
        });

        console.log('Estado de respuesta:', response.status);
        if (!response.ok) {
          const errorDetails = await response.text();
          console.log('Detalles del error:', errorDetails);
          throw new Error(`Error al obtener los procesos. Status: ${response.status}. Detalles: ${errorDetails}`);
        }

        const result = await response.json();
        console.log('Datos obtenidos:', result);

        if (result.data && Array.isArray(result.data.procesos)) {
          setProcesos(result.data.procesos);
          setFilteredProcesos(result.data.procesos);
        } else {
          throw new Error('La API no devolvió un array de Procesos');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error en la solicitud fetch:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProcesos();
  }, [token]);  // Ejecutar el useEffect cuando el token cambie

  const filterProcesos = (searchTerm) => {
    setFilteredProcesos(procesos.filter(proceso =>
      proceso.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  };

  const handleProcessClick = (e, procesoId) => {
    e.stopPropagation(); // Detiene la propagación al padre
    console.log(`Navegando al proceso ID: ${procesoId}`);
    window.location.href = `/procesos/${procesoId}`;
  };

  if (loading) return <p>Cargando procesos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <a href="/nuevo-proceso" className="hover:no-underline">
          <button 
            className="bg-azul text-white px-4 py-2 rounded cursor-pointer mr-5 transform hover:bg-amarillo hover:scale-105 transition-colors duration-300 ease-in-out"
          >
            + Añadir Asignacion
          </button>
        </a>
        <label htmlFor="codigo-proceso" className="sr-only">Código de la Asignacion</label>
        <input
          id="codigo-proceso"
          name="codigoProceso"
          type="text"
          placeholder="Código del proceso"
          className="flex-1 px-2 py-1 border border-black rounded"
          onChange={(e) => filterProcesos(e.target.value)}
        />
        <button 
          id="buscar-btn"
          name="buscar"
          className="bg-transparent border-none cursor-pointer ml-2"
        >
          <Search className="text-black w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {Array.isArray(filteredProcesos) && filteredProcesos.length > 0 ? (
          filteredProcesos.map(proceso => (
            <div
              key={proceso.idProceso} 
              className="bg-gray-200 hover:bg-gray-300 transition-colors duration-200 ease-in-out rounded-lg overflow-hidden shadow-md cursor-pointer"
              onClick={(e) => handleProcessClick(e, proceso.idProceso)}
            >
              <div className='p-4'>
                <a href={`/procesos/${proceso.idProceso}`} className="hover:text-azul hover:no-underline">
                  <div className="flex justify-between w-full mb-2">
                    <span className="text-lg font-bold text-gray-800">{proceso.codigo || `Proceso #${proceso.idProceso}`}</span>
                    <span className="text-sm text-gray-500">{new Date(proceso.fechaInicio).toLocaleDateString()}</span>
                  </div>
                  <div className="text-gray-600">
                    {proceso.descripcion || 'Sin descripción disponible'}
                  </div>
                </a>
              </div>
            </div>
          ))
        ) : (
          <p>No hay procesos disponibles.</p>
        )}
        <div className="mt-10 text-center p-5 bg-amarillo rounded-lg">
          <h2 className="text-2xl font-bold text-white">¡Cada documento cuenta! 📄</h2>
          <p className="text-lg text-white">Recuerda que cada detalle en este documento es esencial para mantener la precisión y el éxito en tus proyectos. ¡Sigue editando con dedicación! 💡</p>
        </div>
      </div>
    </div>
  );
};

export default AsigList;
