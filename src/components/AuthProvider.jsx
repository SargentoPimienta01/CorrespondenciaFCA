import React, { useEffect, useState } from 'react';
import Auth from '../pages/login/authLogin';

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Este código solo se ejecutará en el cliente
    const auth = new Auth();
    if (!auth.isAuthenticated()) {
      auth.logout(); // Si el token es inválido o ha expirado, redirige al login
    } else {
      setIsAuthenticated(true); // Si el token es válido, permite acceso
    }
  }, []);

  return isAuthenticated ? <>{children}</> : null;
};

export default AuthProvider;
