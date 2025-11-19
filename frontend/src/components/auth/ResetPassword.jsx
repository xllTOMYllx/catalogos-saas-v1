import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      toast.error('Token de recuperación no encontrado.');
      navigate('/login');
      return;
    }
    
    setToken(tokenFromUrl);
    verifyToken(tokenFromUrl);
  }, [searchParams, navigate]);

  const verifyToken = async (tokenToVerify) => {
    setIsVerifying(true);
    try {
      const response = await authApi.verifyResetToken(tokenToVerify);
      
      if (response.success) {
        setTokenValid(true);
      } else {
        toast.error(response.message || 'Token inválido o expirado.');
        setTokenValid(false);
      }
    } catch (err) {
      console.error('Error verifying token:', err);
      toast.error('Error al verificar el token.');
      setTokenValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      return toast.error('Por favor completa todos los campos.');
    }

    if (newPassword.length < 6) {
      return toast.error('La contraseña debe tener al menos 6 caracteres.');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Las contraseñas no coinciden.');
    }

    setIsLoading(true);
    try {
      const response = await authApi.resetPassword(token, newPassword);
      
      if (response.success) {
        toast.success('¡Contraseña actualizada! Ahora puedes iniciar sesión.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(response.message || 'Error al restablecer la contraseña.');
      }
    } catch (err) {
      console.error('Error en reset password:', err);
      toast.error('Ocurrió un error. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#080c0e] flex items-center justify-center p-4">
        <div className="bg-[#121516] p-8 rounded-lg w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f24427] mx-auto mb-4"></div>
          <p className="text-gray-300">Verificando token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-[#080c0e] flex items-center justify-center p-4">
        <div className="bg-[#121516] p-8 rounded-lg w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Token Inválido</h2>
          <p className="text-gray-300 mb-6">
            El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.
          </p>
          <Link 
            to="/forgot-password" 
            className="inline-block w-full bg-[#f24427] text-white py-3 rounded hover:bg-[#d6331a] font-semibold mb-3"
          >
            Solicitar Nuevo Enlace
          </Link>
          <Link 
            to="/login" 
            className="inline-block w-full text-gray-400 hover:text-white py-2"
          >
            Volver al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c0e] flex items-center justify-center p-4">
      <div className="bg-[#121516] p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          Restablecer Contraseña
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Ingresa tu nueva contraseña a continuación.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427] focus:outline-none"
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427] focus:outline-none"
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-[#f24427] text-white py-3 rounded hover:bg-[#d6331a] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Restablecer Contraseña'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="text-gray-400 hover:text-[#f24427] text-sm"
          >
            ← Volver al Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
