import { useAdminStore } from '../store/adminStore';
import styles from '../styles/nosotros.module.css';

/**
 * ClientNosotros - Página "Sobre Nosotros" específica para el catálogo de un cliente
 * 
 * Muestra la información del negocio guardada en el panel de admin del cliente.
 */
export default function ClientNosotros() {
  const { getActiveCatalog } = useAdminStore();
  
  const activeCatalog = getActiveCatalog() || {};
  const businessData = activeCatalog.business || {};
  
  const businessName = businessData.nombre || 'Nuestro Negocio';
  const businessDescription = businessData.descripcion || 'Bienvenido a nuestra tienda en línea. Ofrecemos productos de alta calidad para satisfacer tus necesidades.';
  const businessAddress = businessData.direccion || null;
  const businessPhone = businessData.telefono || businessData.phone || null;
  const businessLogo = businessData.logo || '/logosinfondo.png';

  const handleWhatsApp = () => {
    if (businessPhone) {
      const defaultMsg = businessData.mensajeContacto || `¡Hola! Vi su página de ${businessName} y me gustaría más información.`;
      const waUrl = `https://wa.me/${String(businessPhone).replace(/\D/g, '')}?text=${encodeURIComponent(defaultMsg)}`;
      window.open(waUrl, '_blank');
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.overlayShapes} aria-hidden="true">
          <div className={styles.shapeRed}></div>
          <div className={styles.shapeBlue}></div>
        </div>

        <div className={styles.content}>
          <div className={styles.head}>
            <img 
              src={businessLogo} 
              alt={`Logo de ${businessName}`} 
              className="w-20 h-20 mx-auto mb-4 rounded-lg object-cover shadow-lg"
            />
            <h1 className={styles.title}>Sobre {businessName}</h1>
            <p className={styles.subtitle}>Conoce más sobre nosotros y lo que hacemos</p>
          </div>

          <article className={styles.card}>
            <p className={styles.lead}>
              {businessDescription}
            </p>

            {(businessAddress || businessPhone) && (
              <ul className={styles.features}>
                {businessAddress && (
                  <li>📍 {businessAddress}</li>
                )}
                {businessPhone && (
                  <li>📞 {businessPhone}</li>
                )}
              </ul>
            )}

            {businessPhone && (
              <div className={styles.cta}>
                <button onClick={handleWhatsApp} className={styles.primary}>
                  Contáctanos por WhatsApp
                </button>
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
