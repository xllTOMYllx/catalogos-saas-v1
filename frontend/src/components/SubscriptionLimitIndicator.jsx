import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, TrendingUp } from 'lucide-react';
import useSubscriptionStore from '../store/subscriptionStore';

/**
 * Component that displays subscription limits for catalogs
 * Shows current usage vs maximum allowed
 */
const SubscriptionLimitIndicator = ({ userId }) => {
  const navigate = useNavigate();
  const { limits, fetchUserLimits } = useSubscriptionStore();

  useEffect(() => {
    if (userId) {
      fetchUserLimits(userId);
    }
  }, [userId, fetchUserLimits]);

  if (!limits) {
    return null;
  }

  const { currentCatalogs, maxCatalogs, canCreateCatalog } = limits;
  const isUnlimited = maxCatalogs === -1;
  const percentage = isUnlimited ? 0 : (currentCatalogs / maxCatalogs) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = !canCreateCatalog;

  return (
    <div className={`rounded-lg p-4 border ${
      isAtLimit 
        ? 'bg-red-50 border-red-200' 
        : isNearLimit 
        ? 'bg-yellow-50 border-yellow-200' 
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {(isAtLimit || isNearLimit) && (
              <AlertCircle className={`w-5 h-5 ${
                isAtLimit ? 'text-red-600' : 'text-yellow-600'
              }`} />
            )}
            <h3 className="font-semibold text-gray-900">
              Límite de Catálogos
            </h3>
          </div>
          
          <div className="mb-2">
            <p className="text-sm text-gray-700">
              {isUnlimited ? (
                <span className="font-medium text-green-700">
                  ✓ Catálogos ilimitados
                </span>
              ) : (
                <>
                  Has utilizado{' '}
                  <span className="font-bold">{currentCatalogs}</span> de{' '}
                  <span className="font-bold">{maxCatalogs}</span> catálogos disponibles
                </>
              )}
            </p>
          </div>

          {!isUnlimited && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isAtLimit
                    ? 'bg-red-600'
                    : isNearLimit
                    ? 'bg-yellow-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          )}

          {isAtLimit && (
            <p className="text-sm text-red-700 mt-2">
              Has alcanzado el límite de tu plan actual.
            </p>
          )}
          
          {isNearLimit && !isAtLimit && (
            <p className="text-sm text-yellow-700 mt-2">
              Te estás acercando al límite de tu plan.
            </p>
          )}
        </div>

        {(isAtLimit || isNearLimit) && (
          <button
            onClick={() => navigate('/subscription-plans')}
            className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isAtLimit
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Mejorar Plan
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionLimitIndicator;
