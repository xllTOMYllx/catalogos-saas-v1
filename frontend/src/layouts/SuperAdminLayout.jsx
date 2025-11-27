import { Outlet } from 'react-router-dom';
import SuperAdminHeader from '../components/SuperAdminHeader';

/**
 * SuperAdminLayout - Layout for the super administrator panel
 * 
 * Includes the SuperAdminHeader with minimal navigation (logo + logout only).
 * Used for managing client accounts, subscriptions, and system settings.
 */
export default function SuperAdminLayout() {
  return (
    <>
      <SuperAdminHeader />
      <Outlet />
    </>
  );
}
