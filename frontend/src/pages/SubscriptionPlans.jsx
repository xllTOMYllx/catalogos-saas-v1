import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useSubscriptionStore from '../store/subscriptionStore';
import { CONTACT_CONFIG, getWhatsAppURL } from '../config/contact';
import { useAuth } from '../contexts/useAuth';

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { plans, currentSubscription, fetchPlans, fetchUserSubscription, loading } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Get user and client data from AuthContext
  const { user, client } = useAuth();

  useEffect(() => {
    fetchPlans();
    if (user?.id) {
      fetchUserSubscription(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowContactModal(true);
  };

  const handleContactSupport = () => {
    if (!selectedPlan) return;

    // Use catalog/store name from client data, fallback to user name or email
    const displayName = client?.nombre || user?.nombre || user?.email || 'Cliente';

    // Generate WhatsApp message with plan details
    const message = CONTACT_CONFIG.messages.planChangeRequest(
      selectedPlan.name,
      displayName,
      user?.email || 'No proporcionado'
    );

    // Open WhatsApp in new tab
    const whatsappURL = getWhatsAppURL(message);
    window.open(whatsappURL, '_blank');

    // Close modal and show toast
    setShowContactModal(false);
    toast.success('Redirigiendo a WhatsApp para contactar con soporte...');
    setSelectedPlan(null);
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
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20 py-12 px-4">
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
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Contactar Soporte
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

      {/* Contact Support Modal */}
      {showContactModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold">Contactar con Soporte</h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Has seleccionado el plan <span className="font-bold text-blue-600">{selectedPlan.name}</span>.
              </p>
              <p className="text-gray-600 mb-3">
                Para cambiar tu plan, uno de nuestros agentes te atenderá por WhatsApp para:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mb-3">
                <li>Verificar la disponibilidad del plan</li>
                <li>Coordinar el proceso de pago</li>
                <li>Activar tu nuevo plan</li>
                <li>Resolver cualquier duda</li>
              </ul>
              <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
                💡 Al hacer clic en "Abrir WhatsApp", se abrirá una conversación con un mensaje predefinido con los detalles de tu solicitud.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedPlan(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleContactSupport}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
