import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import { getValidationError } from '../../utils/validation';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return toast.error('Por favor ingresa tu email.');
    }

    // Validate email format
    const emailError = getValidationError('Email', email, 'email');
    if (emailError) {
      return toast.error(emailError);
    }

    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword(email);
      
      if (response.success) {
        setEmailSent(true);
        toast.success('Revisa tu correo para restablecer tu contraseña.');
      } else {
        toast.error(response.message || 'Error al enviar el correo.');
      }
    } catch (err) {
      console.error('Error en forgot password:', err);
      toast.error('Ocurrió un error. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#080c0e] flex items-center justify-center p-4">
        <div className="bg-[#121516] p-8 rounded-lg w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">¡Correo Enviado!</h2>
            <p className="text-gray-300 mb-4">
              Si existe una cuenta con el email <strong className="text-[#f24427]">{email}</strong>, 
              recibirás un correo con instrucciones para restablecer tu contraseña.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Revisa tu bandeja de entrada y carpeta de spam. El enlace expirará en 1 hora.
            </p>
          </div>
          
          <Link 
            to="/login" 
            className="inline-block w-full bg-[#f24427] text-white py-3 rounded hover:bg-[#d6331a] font-semibold"
          >
            Volver al Login
          </Link>
          
          <button
            onClick={() => {
              setEmailSent(false);
              setEmail('');
            }}
            className="w-full mt-3 text-gray-400 hover:text-white py-2"
          >
            ¿No recibiste el correo? Reenviar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c0e] flex items-center justify-center p-4">
      <div className="bg-[#121516] p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          ¿Olvidaste tu Contraseña?
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu-email@ejemplo.com"
              className="w-full p-3 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427] focus:outline-none"
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-[#f24427] text-white py-3 rounded hover:bg-[#d6331a] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
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

export default ForgotPassword;
