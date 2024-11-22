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

const ProcessList = () => {
  const [procesos, setProcesos] = useState([]);
  const [filteredProcesos, setFilteredProcesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  const getTokenFromCookie = () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1].trim() : null;
  };

  const getExpiryFromCookie = () => {
    const cookies = document.cookie.split(';');
    const expiryCookie = cookies.find(cookie => cookie.trim().startsWith('expiry='));
    return expiryCookie ? expiryCookie.split('=')[1].trim() : null;
  };

  const deleteTokenAndExpiryFromCookie = () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    document.cookie = 'expiry=; Max-Age=0; path=/;';
  };

  const checkTokenExpiry = () => {
    const expiryTime = getExpiryFromCookie();
    if (!expiryTime) return false;
    const expiryDate = new Date(parseInt(expiryTime, 10));
    const now = new Date();
    return expiryDate.getTime() < now.getTime();
  };

  useEffect(() => {
    const token = getTokenFromCookie();
    if (!token || checkTokenExpiry()) {
      deleteTokenAndExpiryFromCookie();
      window.location.href = '/';
      return;
    }

    setToken(token);
    const fetchProcesos = async () => {
      try {
        const response = await fetch('http://10.1.1.61:8080/api/procesos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(`Error al obtener los procesos: ${errorDetails}`);
        }

        const result = await response.json();
        if (result.data && Array.isArray(result.data.procesos)) {
          setProcesos(result.data.procesos);
          setFilteredProcesos(result.data.procesos);
        } else {
          throw new Error('La API no devolvió un array de Procesos');
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProcesos();
  }, []);

  const filterProcesos = (searchTerm) => {
    if (!searchTerm) {
      setFilteredProcesos(procesos);
    } else {
      const filtered = procesos.filter(proceso =>
        proceso.nombre && proceso.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProcesos(filtered);
    }
  };

  const handleProcessClick = (e, procesoId) => {
    e.stopPropagation();
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
            + Añadir Proceso
          </button>
        </a>
        <input
          id="codigo-proceso"
          name="codigoProceso"
          type="text"
          placeholder="Nombre del proceso"
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
        {filteredProcesos.length > 0 ? (
          filteredProcesos.map(proceso => (
            <div
              key={proceso.idProceso} 
              className="bg-gray-200 hover:bg-gray-300 transition-colors duration-200 ease-in-out rounded-lg overflow-hidden shadow-md cursor-pointer"
              onClick={(e) => handleProcessClick(e, proceso.idProceso)}
            >
              <div className='p-4'>
                <a href={`/procesos/${proceso.idProceso}`} className="hover:text-azul hover:no-underline">
                  <div className="flex justify-between w-full mb-2">
                    <span className="text-lg font-bold text-gray-800">{proceso.nombre || `Proceso #${proceso.idProceso}`}</span>
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

export default ProcessList;
