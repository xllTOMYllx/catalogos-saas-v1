import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { 
  getAdminClients, 
  getAdminStats, 
  getAdminSubscriptionPlans, 
  toggleUserStatus, 
  changeUserSubscription 
} from '../api/admin';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserCheck, 
  UserX, 
  CreditCard, 
  RefreshCw, 
  Power, 
  Edit2, 
  ChevronDown,
  Search,
  AlertCircle
} from 'lucide-react';

function SuperAdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Check authentication and admin role
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast.error('Acceso denegado. Solo administradores.');
      navigate('/login-role');
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  // Fetch data
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsData, statsData, plansData] = await Promise.all([
        getAdminClients(),
        getAdminStats(),
        getAdminSubscriptionPlans(),
      ]);
      setClients(clientsData);
      setStats(statsData);
      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (clientId) => {
    try {
      setActionLoading(clientId);
      const result = await toggleUserStatus(clientId);
      
      if (result.success) {
        // Update local state
        setClients(prev => prev.map(c => 
          c.id === clientId ? { ...c, isActive: result.isActive } : c
        ));
        toast.success(result.isActive ? 'Cuenta activada' : 'Cuenta desactivada');
        
        // Update stats
        const statsData = await getAdminStats();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Error al cambiar estado');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangePlan = async (clientId, planId) => {
    try {
      setActionLoading(clientId);
      const result = await changeUserSubscription(clientId, planId);
      
      if (result.success) {
        toast.success(result.message);
        
        // Immediately update the local state with the new subscription info
        if (result.subscription) {
          setClients(prev => prev.map(c => 
            c.id === clientId 
              ? { 
                  ...c, 
                  subscription: {
                    id: result.subscription.id,
                    status: result.subscription.status,
                    planId: result.subscription.planId,
                    planName: result.subscription.planName,
                  }
                } 
              : c
          ));
        }
        
        // Refresh all data to ensure consistency
        await fetchData();
      }
    } catch (error) {
      console.error('Error changing subscription:', error);
      toast.error('Error al cambiar suscripción');
    } finally {
      setActionLoading(null);
      setShowPlanModal(false);
      setSelectedClient(null);
    }
  };

  const openPlanModal = (client) => {
    setSelectedClient(client);
    setShowPlanModal(true);
  };

  // Filter clients by search query
  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      client.email.toLowerCase().includes(query) ||
      client.nombre?.toLowerCase().includes(query) ||
      client.client?.nombre?.toLowerCase().includes(query) ||
      client.client?.slug?.toLowerCase().includes(query)
    );
  });

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#080c0e] flex items-center justify-center pt-20">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#f24427] animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c0e] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
          <p className="text-gray-400">Gestiona las cuentas de clientes, suscripciones y accesos.</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#121516] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Clientes</p>
                  <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-[#121516] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Clientes Activos</p>
                  <p className="text-2xl font-bold text-green-400">{stats.activeClients}</p>
                </div>
                <UserCheck className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-[#121516] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Clientes Inactivos</p>
                  <p className="text-2xl font-bold text-red-400">{stats.inactiveClients}</p>
                </div>
                <UserX className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <div className="bg-[#121516] rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Suscripciones Activas</p>
                  <p className="text-2xl font-bold text-[#f24427]">{stats.totalSubscriptions}</p>
                </div>
                <CreditCard className="w-10 h-10 text-[#f24427]" />
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por email, nombre o slug..."
              className="w-full pl-10 pr-4 py-3 bg-[#121516] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#f24427]"
            />
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-[#121516] rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Lista de Clientes</h2>
          </div>
          
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchQuery ? 'No se encontraron clientes con esa búsqueda.' : 'No hay clientes registrados aún.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0e10]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Negocio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Suscripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Fecha Registro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-[#0a0e10] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-white">{client.nombre || 'Sin nombre'}</p>
                          <p className="text-sm text-gray-400">{client.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {client.client ? (
                          <div className="flex items-center gap-2">
                            {client.client.logo && (
                              <img 
                                src={client.client.logo} 
                                alt={client.client.nombre} 
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium text-white">{client.client.nombre}</p>
                              <p className="text-xs text-gray-500">/{client.client.slug || 'Sin slug'}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">Sin negocio</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {client.subscription ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            client.subscription.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {client.subscription.planName} ({client.subscription.status})
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">Sin suscripción</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          client.isActive 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {client.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(client.createdAt).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(client.id)}
                            disabled={actionLoading === client.id}
                            className={`p-2 rounded-md transition-colors ${
                              client.isActive
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            } disabled:opacity-50`}
                            title={client.isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openPlanModal(client)}
                            disabled={actionLoading === client.id}
                            className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-md transition-colors disabled:opacity-50"
                            title="Cambiar suscripción"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-[#f24427] hover:bg-[#d6331a] text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Plan Change Modal */}
      {showPlanModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121516] rounded-lg p-6 max-w-md w-full border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              Cambiar Suscripción
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Cliente: <span className="text-white">{selectedClient.email}</span>
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Plan actual: <span className="text-[#f24427]">
                {selectedClient.subscription?.planName || 'Sin suscripción'}
              </span>
            </p>
            
            <div className="space-y-2 mb-6">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleChangePlan(selectedClient.id, plan.id)}
                  disabled={actionLoading === selectedClient.id}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    selectedClient.subscription?.planId === plan.id
                      ? 'border-[#f24427] bg-[#f24427]/10'
                      : 'border-gray-700 hover:border-gray-600'
                  } disabled:opacity-50`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{plan.name}</p>
                      <p className="text-gray-400 text-xs">{plan.description}</p>
                    </div>
                    <p className="text-[#f24427] font-semibold">${plan.price}/mes</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedClient(null);
                }}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;
