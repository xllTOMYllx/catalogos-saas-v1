import { useNavigate } from 'react-router-dom';
import { X, TrendingUp, AlertCircle } from 'lucide-react';

/**
 * Modal component to display when subscription limits are reached
 * Shows error message with option to upgrade plan
 */
const SubscriptionLimitModal = ({ isOpen, onClose, title, message, type = 'generic' }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate('/subscription-plans');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title || 'Límite Alcanzado'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            {message || 'Has alcanzado el límite de tu plan actual.'}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>¿Sabías?</strong> Actualizando tu plan puedes:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              {type === 'catalog' && (
                <>
                  <li>• Crear más catálogos para diferentes negocios</li>
                  <li>• Agregar más productos por catálogo</li>
                </>
              )}
              {type === 'product' && (
                <>
                  <li>• Agregar productos ilimitados (plan PRO)</li>
                  <li>• Acceder a funciones avanzadas</li>
                </>
              )}
              {type === 'generic' && (
                <>
                  <li>• Expandir tus límites actuales</li>
                  <li>• Acceder a funciones premium</li>
                </>
              )}
              <li>• Obtener soporte prioritario</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Ver Planes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionLimitModal;
