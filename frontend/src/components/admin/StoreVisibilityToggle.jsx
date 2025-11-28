import { useState, useEffect } from 'react';
import { Globe, Lock, Copy, Check, ExternalLink } from 'lucide-react';
import { clientsApi } from '../../api/clients';
import toast from 'react-hot-toast';

/**
 * StoreVisibilityToggle - Toggle para controlar la visibilidad pública de la tienda
 * 
 * Permite al cliente activar/desactivar la URL pública de su tienda
 * Cuando está activada, la tienda es accesible en /tienda/:slug sin autenticación
 */
function StoreVisibilityToggle({ clientId, slug, initialIsPublic = false }) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsPublic(initialIsPublic);
  }, [initialIsPublic]);

  const handleToggle = async () => {
    if (!clientId) {
      toast.error('No se encontró el ID del cliente');
      return;
    }

    try {
      setLoading(true);
      const result = await clientsApi.toggleStoreVisibility(clientId);
      setIsPublic(result.isStorePublic);
      
      if (result.isStorePublic) {
        toast.success('🌐 ¡Tu tienda ahora es pública! Comparte tu URL con tus clientes.', { duration: 4000 });
      } else {
        toast.success('🔒 Tu tienda ahora es privada. Solo tú puedes verla.', { duration: 3000 });
      }
    } catch (error) {
      console.error('Error toggling store visibility:', error);
      toast.error('Error al cambiar la visibilidad de la tienda');
    } finally {
      setLoading(false);
    }
  };

  const publicUrl = `${window.location.origin}/tienda/${slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl)
      .then(() => {
        setCopied(true);
        toast.success('URL copiada al portapapeles');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Error al copiar la URL');
      });
  };

  const handleOpenUrl = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <div className="bg-[#171819] rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isPublic ? (
            <Globe className="w-6 h-6 text-green-400" />
          ) : (
            <Lock className="w-6 h-6 text-yellow-400" />
          )}
          <div>
            <h3 className="font-semibold text-white">Tienda Pública</h3>
            <p className="text-sm text-gray-400">
              {isPublic 
                ? 'Tu tienda es visible para todos' 
                : 'Solo tú puedes ver tu tienda'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            isPublic 
              ? 'bg-green-500 focus:ring-green-500' 
              : 'bg-gray-600 focus:ring-gray-500'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          role="switch"
          aria-checked={isPublic}
          aria-label="Toggle store visibility"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isPublic ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* URL Section - only show when public */}
      {isPublic && slug && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-2">URL pública de tu tienda:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#0f1214] rounded-lg px-3 py-2 text-sm font-mono text-green-400 overflow-hidden">
              <span className="truncate block">{publicUrl}</span>
            </div>
            <button
              onClick={handleCopyUrl}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Copiar URL"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-300" />
              )}
            </button>
            <button
              onClick={handleOpenUrl}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Abrir tienda"
            >
              <ExternalLink className="w-4 h-4 text-gray-300" />
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Comparte esta URL con tus clientes para que vean tu catálogo sin necesidad de iniciar sesión.
          </p>
        </div>
      )}

      {/* Info when private */}
      {!isPublic && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            Activa esta opción para que tus clientes puedan ver tu catálogo en una URL pública. 
            Podrás desactivarla en cualquier momento.
          </p>
        </div>
      )}
    </div>
  );
}

export default StoreVisibilityToggle;
