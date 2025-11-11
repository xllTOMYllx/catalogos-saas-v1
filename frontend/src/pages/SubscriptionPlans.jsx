import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useSubscriptionStore from '../store/subscriptionStore';

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { plans, currentSubscription, fetchPlans, fetchUserSubscription, changePlan, loading } = useSubscriptionStore();
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Get user from localStorage (assuming auth stores user info there)
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchPlans();
    if (user.id) {
      fetchUserSubscription(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPlan = (planId) => {
    setSelectedPlanId(planId);
    setShowConfirmModal(true);
  };

  const handleConfirmPlanChange = async () => {
    try {
      await changePlan(user.id, selectedPlanId);
      toast.success('Plan actualizado exitosamente');
      setShowConfirmModal(false);
      setSelectedPlanId(null);
    } catch (error) {
      toast.error('Error al actualizar el plan: ' + error.message);
    }
  };

  const getPlanFeatures = (features) => {
    if (!features) return [];
    return [
      features.customization ? 'Personalización ' + features.customization : null,
      features.analytics ? 'Análisis y estadísticas' : null,
      features.api_access ? 'Acceso API' : null,
      features.priority_support ? 'Soporte prioritario' : null,
      features.white_label ? 'White label' : null,
      'Soporte ' + (features.support || 'básico'),
    ].filter(Boolean);
  };

  if (loading && plans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando planes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Planes de Suscripción
          </h1>
          <p className="text-xl text-gray-600">
            Elige el plan perfecto para tu negocio
          </p>
          {currentSubscription && (
            <p className="mt-4 text-sm text-gray-500">
              Plan actual:{' '}
              <span className="font-semibold text-gray-900">
                {currentSubscription.plan?.name}
              </span>
            </p>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.planId === plan.id;
            const features = getPlanFeatures(plan.features);

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  isCurrentPlan ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Plan Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">
                      ${plan.price}
                    </span>
                    <span className="ml-2 text-blue-100">
                      /{plan.billing_period === 'monthly' ? 'mes' : 'año'}
                    </span>
                  </div>
                </div>

                {/* Plan Body */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Limits */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {plan.max_catalogs === -1
                          ? 'Catálogos ilimitados'
                          : `${plan.max_catalogs} catálogo${plan.max_catalogs > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {plan.max_products_per_catalog === -1
                          ? 'Productos ilimitados'
                          : `Hasta ${plan.max_products_per_catalog} productos`}
                      </span>
                    </div>
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Plan Actual
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                    >
                      Seleccionar Plan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Volver
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Confirmar Cambio de Plan</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro que deseas cambiar a este plan? Los cambios se aplicarán inmediatamente.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedPlanId(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPlanChange}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
