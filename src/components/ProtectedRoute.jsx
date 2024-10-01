// ProtectedRoute.js
import { useEffect, useState } from "react"; // O el router que estés utilizando

const ProtectedRoute = ({ children }) => {
  const [isAllowed, setIsAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación a través de las cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];

    if (token) {
      setIsAllowed(true);
    } else {
      router.push("/"); // Redirige a la página de login si no está autenticado
    }
  }, [router]);

  return isAllowed ? children : null;
};

export default ProtectedRoute;
