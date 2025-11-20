import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { calculatePasswordStrength, getPasswordStrengthPercentage } from '../utils/passwordStrength';

/**
 * Password input component with show/hide toggle and optional strength indicator
 */
function PasswordInput({ 
  id,
  value, 
  onChange, 
  placeholder = 'Contraseña',
  label,
  required = false,
  minLength = 6,
  disabled = false,
  showStrengthIndicator = false,
  className = ''
}) {
  const [showPassword, setShowPassword] = useState(false);
  const strength = calculatePasswordStrength(value);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full p-3 pr-12 bg-[#171819] text-white rounded border border-gray-600 focus:border-[#f24427] focus:outline-none ${className}`}
          required={required}
          minLength={minLength}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
          tabIndex={-1}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      
      {showStrengthIndicator && value && (
        <div className="mt-2">
          {/* Strength bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${getPasswordStrengthPercentage(strength.score)}%` }}
            />
          </div>
          
          {/* Strength label and feedback */}
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Seguridad: <span className={`font-semibold ${
                strength.score === 1 ? 'text-red-500' :
                strength.score === 2 ? 'text-orange-500' :
                strength.score === 3 ? 'text-yellow-500' :
                strength.score === 4 ? 'text-green-500' : 'text-gray-500'
              }`}>
                {strength.label || 'Ingresa una contraseña'}
              </span>
            </span>
            {strength.score < 4 && strength.feedback.length > 0 && (
              <span className="text-xs text-gray-500">
                {strength.feedback.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordInput;
