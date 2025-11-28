import React from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { Minus, Plus, Trash2, Star } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import styles from '../styles/carrito.module.css';

/**
 * PublicStoreCarrito - Página de carrito para tiendas públicas
 * 
 * Similar a Carrito.jsx pero específico para la ruta /tienda/:slug/carrito
 * Usa los datos de la tienda pública desde el contexto del layout.
 */
export default function PublicStoreCarrito() {
  const navigate = useNavigate();
  const { storeData, slug } = useOutletContext();
  const { items = [], getTotal, updateQuantity, removeItem } = useCartStore();
  
  const businessData = storeData || {};
  const businessPhone = businessData.telefono || '';
  const businessName = businessData.nombre || 'Tienda';
  const storeColor = businessData.color || '#f24427';

  const total = typeof getTotal === 'function' ? getTotal() : 0;

  const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`;

  // Link to go back to the public store
  const storeLink = `/tienda/${slug}`;

  const changeQty = (id, qty) => {
    const next = Math.max(1, Number(qty) || 1);
    if (typeof updateQuantity === 'function') updateQuantity(id, next);
  };

  const handleRemove = (id) => {
    if (typeof removeItem === 'function') removeItem(id);
  };

  const handleClear = () => {
    if (confirm('¿Vaciar carrito?')) {
      if (typeof useCartStore.setState === 'function') useCartStore.setState({ items: [] });
    }
  };

  const handleWhatsApp = () => {
    // Validate that cart has items before sending
    if (!items || items.length === 0) {
      alert('Debes agregar productos al carrito antes de enviar tu pedido.');
      return;
    }
    
    // Validate that we have a phone number
    const phone = String(businessPhone).replace(/\D/g, '');
    if (!phone) {
      alert('No hay número de contacto disponible para esta tienda.');
      return;
    }
    
    const msg = `¡Hola! Mi pedido de ${businessName}: ${items.map(i => {
      const name = i.nombre ?? i.name ?? 'Producto';
      const qty = i.quantity ?? 1;
      const price = i.price ?? i.precio ?? 0;
      const variantInfo = i.variantInfo ? ` (${i.variantInfo})` : '';
      return `${name}${variantInfo} x${qty} - $${(price).toFixed(2)}`;
    }).join(', ')} Total: $${Number(total).toFixed(2)}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="flex-1 pt-16 sm:pt-20">
      {/* Public Store Banner */}
      <div 
        className="py-3 px-4 text-center"
        style={{ background: `linear-gradient(90deg, ${storeColor} 0%, ${storeColor}cc 100%)` }}
      >
        <p className="text-sm sm:text-base font-medium text-white flex items-center justify-center gap-2">
          <Star className="w-4 h-4" />
          <span>¿Te gusta esta tienda? </span>
          <Link to="/login-role" className="underline font-bold hover:text-yellow-100">
            ¡Crea la tuya gratis!
          </Link>
        </p>
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Carrito</h1>
          <p className={styles.subtitle}>Revisa y edita los productos antes de enviar tu pedido.</p>
        </div>

        <div className={styles.content}>
          <div className={styles.list}>
            {items.length === 0 ? (
              <div className={styles.empty}>
                <p>Tu carrito está vacío.</p>
                <Link to={storeLink} className={styles.ctaLink}>Ver catálogo</Link>
              </div>
            ) : (
              items.map(item => {
                const name = item.nombre ?? item.name ?? 'Producto';
                const qty = item.quantity ?? 1;
                const price = item.price ?? item.precio ?? 0;
                const lineTotal = (price * qty) || 0;
                const img = item.ruta ?? item.image ?? 'https://via.placeholder.com/140x140';
                const variantInfo = item.variantInfo ?? null;

                return (
                  <div key={item.id} className={styles.line}>
                    <img src={img} alt={name} className={styles.img} />
                    <div className={styles.meta}>
                      <h3 className={styles.name}>{name}</h3>
                      {variantInfo && (
                        <p className={styles.variant}>{variantInfo}</p>
                      )}
                      <p className={styles.unit}>Precio unitario: <strong>{formatCurrency(price)}</strong></p>
                      <div className={styles.qty}>
                        <button onClick={() => changeQty(item.id, qty - 1)} className={styles.qtyBtn}><Minus /></button>
                        <input value={qty} onChange={(e) => changeQty(item.id, e.target.value)} type="number" min="1" className={styles.qtyInput} />
                        <button onClick={() => changeQty(item.id, qty + 1)} className={styles.qtyBtn}><Plus /></button>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <div className={styles.lineTotal}>{formatCurrency(lineTotal)}</div>
                      <button onClick={() => handleRemove(item.id)} className={styles.removeBtn} title="Eliminar"><Trash2 /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <aside className={styles.summary}>
            <div className={styles.summaryBox}>
              <div className={styles.row}><span>Subtotal</span><span>{formatCurrency(total)}</span></div>
              <div className={styles.row}><span>Envío estimado</span><span>—</span></div>
              <div className={styles.rowTotal}><span>Total</span><span>{formatCurrency(total)}</span></div>

              <div className={styles.actionsSummary}>
                <button onClick={handleWhatsApp} className={styles.primary}>Enviar por WhatsApp</button>
                <button onClick={() => navigate(storeLink)} className={styles.secondary}>Seguir comprando</button>
                <button onClick={handleClear} className={styles.tertiary}>Vaciar carrito</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
