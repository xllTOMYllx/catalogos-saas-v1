import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/nosotros.module.css';

export default function Nosotros() {
  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.overlayShapes} aria-hidden="true">
          <div className={styles.shapeRed}></div>
          <div className={styles.shapeBlue}></div>
        </div>

        <div className={styles.content}>
          <div className={styles.head}>
            <h1 className={styles.title}>Sobre Nosotros</h1>
            <p className={styles.subtitle}>Alojamos y potenciamos tus catálogos de producto en la nube</p>
          </div>

          <article className={styles.card}>
            <p className={styles.lead}>
              Somos una plataforma SaaS dedicada a que negocios como el tuyo publiquen, gestionen y entreguen
              catálogos digitales de forma fiable y escalable. Simplificamos integraciones, control de acceso
              y personalización por cliente, para que te concentres en vender.
            </p>

            <ul className={styles.features}>
              <li>Alojamiento escalable y redundante</li>
              <li>Integraciones sencillas (ERP, CSV, APIs)</li>
              <li>Personalización por catálogo/tenant</li>
              <li>Seguridad, backups y cumplimiento</li>
              <li>Soporte técnico y actualizaciones continuas</li>
            </ul>

            <div className={styles.cta}>
              <Link to="/login-role" className={styles.primary}>Crear mi catálogo — Gratis</Link>
              <Link to="/contacto" className={styles.secondary}>Contactar ventas</Link>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.values}>
        <div className={styles.valuesInner}>
          <div className={styles.valueItem}>
            <h3>Disponibilidad 24/7</h3>
            <p>Arquitectura redundante y entrega rápida de activos para clientes en cualquier parte.</p>
          </div>
          <div className={styles.valueItem}>
            <h3>Control y permisos</h3>
            <p>Roles, permisos y separación por cliente para mantener tus datos organizados y seguros.</p>
          </div>
          <div className={styles.valueItem}>
            <h3>Escalabilidad</h3>
            <p>Crece sin preocuparte: desde tiendas pequeñas hasta grandes catálogos empresariales.</p>
          </div>
        </div>
      </section>
    </main>
  );
}