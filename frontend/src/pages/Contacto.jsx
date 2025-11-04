import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';
import styles from '../styles/Contacto.module.css';

export default function Contacto() {
  const navigate = useNavigate();
  const { getActiveCatalog } = useAdminStore();
  const activeCatalog = getActiveCatalog() || {};
  const telefono = activeCatalog.business?.telefono || activeCatalog.business?.phone || '1234567890';
  const businessName = activeCatalog.business?.nombre || 'tu negocio';

  const handleWhatsApp = () => {
    const defaultMsg = `¡Hola! Me interesa más información sobre los catálogos de ${businessName}. ¿Podrían ayudarme, por favor?`;
    const waUrl = `https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(defaultMsg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.content}>
          <div className={styles.head}>
            <h1 className={styles.title}>Contacta con Ventas</h1>
            <p className={styles.subtitle}>¿Listo para llevar tu catálogo a la nube? Escríbenos por WhatsApp y te atenderemos rápido.</p>
          </div>

          <article className={styles.card}>
            <p className={styles.lead}>
              Nos enfocamos en ayudar a negocios como el tuyo a publicar, personalizar y distribuir catálogos digitales.
              Envíanos un mensaje por WhatsApp y uno de nuestros especialistas de ventas te guiará con opciones, precios
              y la mejor configuración para tu caso.
            </p>

            <ul className={styles.features}>
              <li>Respuesta rápida por WhatsApp</li>
              <li>Demostración y asesoría personalizada</li>
              <li>Planes escalables y opciones para empresas</li>
            </ul>

            <div className={styles.cta}>
              <button onClick={handleWhatsApp} className={styles.primary} aria-label="Contactar por WhatsApp">
                Contactar por WhatsApp
              </button>
              <button onClick={() => navigate('/login-role')} className={styles.secondary} aria-label="Crear mi catálogo">
                Crear mi catálogo — Gratis
              </button>
            </div>

            <p className={styles.note}>Teléfono de contacto: <strong>{telefono}</strong></p>
          </article>
        </div>
      </section>
    </main>
  );
}