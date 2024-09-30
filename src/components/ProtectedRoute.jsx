import React, { useState, useEffect } from 'react';
import Auth from '../pages/login/authLogin';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    useEffect(() => {
      // Este código solo se ejecutará en el cliente
      const auth = new Auth();
      const valid = auth.isAuthenticated();
      if (!valid) {
        auth.logout(); // Redirige al login si el token es inválido o ha expirado
      } else {
        setIsAuthenticated(true); // Si el token es válido, renderizar el contenido
      }
    }, []);
  
    // Solo renderiza los hijos si está autenticado
    return isAuthenticated ? <>{children}</> : null;
  };
export default ProtectedRoute;
