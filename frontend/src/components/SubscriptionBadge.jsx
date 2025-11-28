import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Crown, Star, Zap, Building2, Sparkles } from 'lucide-react';
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

  // Get the appropriate icon based on the plan
  const getPlanIcon = (planName) => {
    switch (planName) {
      case 'FREE':
        return <Star className="w-4 h-4 mr-1.5" />;
      case 'BASIC':
        return <Zap className="w-4 h-4 mr-1.5" />;
      case 'PRO':
        return <Sparkles className="w-4 h-4 mr-1.5" />;
      case 'ENTERPRISE':
        return <Building2 className="w-4 h-4 mr-1.5" />;
      default:
        return <Crown className="w-4 h-4 mr-1.5" />;
    }
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

  const planName = currentSubscription.plan?.name;

  return (
    <div
      onClick={handleNavigate}
      className={`inline-flex items-center px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105 ${getPlanColor(
        planName
      )}`}
    >
      {getPlanIcon(planName)}
      <span className="text-sm font-semibold">
        {planName || 'Plan'}
      </span>
    </div>
  );
};

export default SubscriptionBadge;
