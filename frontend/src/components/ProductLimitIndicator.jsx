import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, TrendingUp, Package } from 'lucide-react';
import { getProductLimits } from '../api/subscriptions';

/**
 * Component that displays subscription limits for products in a catalog
 * Shows current usage vs maximum allowed per catalog
 */
const ProductLimitIndicator = ({ userId, catalogId }) => {
  const navigate = useNavigate();
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLimits = async () => {
      if (!userId || !catalogId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getProductLimits(userId, catalogId);
        setLimits(data);
      } catch (err) {
        console.error('Error fetching product limits:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, [userId, catalogId]);

  if (loading) {
    return null;
  }

  if (error) {
    return null;
  }

  if (!limits) {
    return null;
  }

  const { currentProducts, maxProducts, canAdd } = limits;
  const isUnlimited = maxProducts === -1;
  const percentage = isUnlimited ? 0 : (currentProducts / maxProducts) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = !canAdd;

  return (
    <div className={`rounded-lg p-4 border ${
      isAtLimit 
        ? 'bg-red-50 border-red-200' 
        : isNearLimit 
        ? 'bg-yellow-50 border-yellow-200' 
        : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Package className={`w-5 h-5 ${
              isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'
            }`} />
            {(isAtLimit || isNearLimit) && (
              <AlertCircle className={`w-5 h-5 ${
                isAtLimit ? 'text-red-600' : 'text-yellow-600'
              }`} />
            )}
            <h3 className="font-semibold text-gray-900">
              Límite de Productos
            </h3>
          </div>
          
          <div className="mb-2">
            <p className="text-sm text-gray-700">
              {isUnlimited ? (
                <span className="font-medium text-green-700">
                  ✓ Productos ilimitados en este catálogo
                </span>
              ) : (
                <>
                  Has utilizado{' '}
                  <span className="font-bold">{currentProducts}</span> de{' '}
                  <span className="font-bold">{maxProducts}</span> productos disponibles
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
                    : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          )}

          {isAtLimit && (
            <p className="text-sm text-red-700 mt-2">
              Has alcanzado el límite de productos para este catálogo.
            </p>
          )}
          
          {isNearLimit && !isAtLimit && (
            <p className="text-sm text-yellow-700 mt-2">
              Te estás acercando al límite de productos.
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

export default ProductLimitIndicator;
