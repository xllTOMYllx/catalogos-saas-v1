import { useAdminStore } from '../../store/adminStore';
import ProductList from './ProductList';
import CustomizationForm from './CustomizationForm';
import { useState } from 'react';

function AdminDashboard() {
  const { business } = useAdminStore();
  const [activeTab, setActiveTab] = useState('products');  // Tabs: products | customization

  return (
    <div className="min-h-screen bg-[#080c0e] text-white flex">
      {/* Sidebar responsive */}
      <aside className="w-64 bg-[#121516] p-4 hidden md:block">
        <h1 className="text-2xl font-bold mb-6">{business.nombre} Admin</h1>
        <nav className="space-y-4">
          <button onClick={() => setActiveTab('products')} className={`w-full p-2 rounded ${activeTab === 'products' ? 'bg-[#f24427]' : 'hover:bg-gray-700'}`}>Gestión Productos</button>
          <button onClick={() => setActiveTab('customization')} className={`w-full p-2 rounded ${activeTab === 'customization' ? 'bg-[#f24427]' : 'hover:bg-gray-700'}`}>Personalización</button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8">
        <header className="mb-6">
          <h2 className="text-3xl font-bold">Panel de Administración</h2>
          <p className="text-gray-400">Gestiona tu catálogo y configura tu negocio.</p>
        </header>

        {activeTab === 'products' && <ProductList />}
        {activeTab === 'customization' && <CustomizationForm />}
      </main>
    </div>
  );
}

export default AdminDashboard;