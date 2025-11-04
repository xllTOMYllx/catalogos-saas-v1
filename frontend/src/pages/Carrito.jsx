import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAdminStore } from '../store/adminStore';
import styles from '../styles/carrito.module.css';

/**
 * Página /carrito con edición completa y resumen.
 * Usa la API de cartStore: updateQuantity, removeItem, getTotal, y setState para vaciar.
 */
export default function CarritoPage() {
  const navigate = useNavigate();
  const { items = [], getTotal, updateQuantity, removeItem } = useCartStore();
  const { business } = useAdminStore();
  const businessPhone = business?.telefono || business?.phone || '1234567890';

  const total = typeof getTotal === 'function' ? getTotal() : 0;

  const formatCurrency = (v) => `$${Number(v || 0).toFixed(2)}`;

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
    const msg = `¡Hola! Mi pedido: ${items.map(i => {
      const name = i.nombre ?? i.name ?? 'Producto';
      const qty = i.quantity ?? 1;
      const price = i.price ?? i.precio ?? 0;
      return `${name} x${qty} - $${(price).toFixed(2)}`;
    }).join(', ')} Total: $${Number(total).toFixed(2)}`;
    const url = `https://wa.me/${String(businessPhone).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1>Carrito</h1>
        <p className={styles.subtitle}>Revisa y edita los productos antes de enviar tu pedido.</p>
      </div>

      <div className={styles.content}>
        <div className={styles.list}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <p>Tu carrito está vacío.</p>
              <Link to="/colecciones" className={styles.ctaLink}>Ver catálogos</Link>
            </div>
          ) : (
            items.map(item => {
              const name = item.nombre ?? item.name ?? 'Producto';
              const qty = item.quantity ?? 1;
              const price = item.price ?? item.precio ?? 0;
              const lineTotal = (price * qty) || 0;
              const img = item.ruta ?? item.image ?? 'https://via.placeholder.com/140x140';

              return (
                <div key={item.id} className={styles.line}>
                  <img src={img} alt={name} className={styles.img} />
                  <div className={styles.meta}>
                    <h3 className={styles.name}>{name}</h3>
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
              <button onClick={() => navigate('/colecciones')} className={styles.secondary}>Seguir comprando</button>
              <button onClick={handleClear} className={styles.tertiary}>Vaciar carrito</button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}