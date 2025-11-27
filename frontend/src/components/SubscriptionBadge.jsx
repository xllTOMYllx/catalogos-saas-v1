import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Crown } from 'lucide-react';
import useSubscriptionStore from '../store/subscriptionStore';

const SubscriptionBadge = ({ userId }) => {
  const navigate = useNavigate();
  const { catalogSlug } = useParams();
  const { currentSubscription, fetchUserSubscription } = useSubscriptionStore();

  useEffect(() => {
    if (userId) {
      fetchUserSubscription(userId);
    }
  }, [userId, fetchUserSubscription]);

  if (!currentSubscription) {
    return null;
  }

  const getPlanColor = (planName) => {
    const colors = {
      FREE: 'bg-gray-100 text-gray-700',
      BASIC: 'bg-blue-100 text-blue-700',
      PRO: 'bg-purple-100 text-purple-700',
      ENTERPRISE: 'bg-yellow-100 text-yellow-700',
    };
    return colors[planName] || 'bg-gray-100 text-gray-700';
  };

  const handleNavigate = () => {
    // If we're in a client context (has catalogSlug), navigate to client-specific subscription-plans
    // Otherwise, navigate to the global subscription-plans page
    if (catalogSlug) {
      navigate(`/${catalogSlug}/subscription-plans`);
    } else {
      navigate('/subscription-plans');
    }
  };

  return (
    <div
      onClick={handleNavigate}
      className={`inline-flex items-center px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105 ${getPlanColor(
        currentSubscription.plan?.name
      )}`}
    >
      <Crown className="w-4 h-4 mr-1.5" />
      <span className="text-sm font-semibold">
        {currentSubscription.plan?.name || 'Plan'}
      </span>
    </div>
  );
};

export default SubscriptionBadge;
