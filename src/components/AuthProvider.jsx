import { useEffect } from 'react';
import Auth from '../pages/login/authLogin';  // Clase Auth que verifica las cookies

export default function ProtectedPage({ children }) {
  useEffect(() => {
    const auth = new Auth();
    auth.checkTokenValidity(); // Verificar token al montar el componente
  }, []);

  return (
    <div>
      {children} {/* Renderizar el contenido de la página solo si pasa la verificación */}
    </div>
  );
}
