import { User } from '../types';

export function dashboardPathForRole(role: User['role']): string {
  if (role === 'DOCTOR') return '/doctor/dashboard';
  if (role === 'ADMIN') return '/admin/dashboard';
  return '/patient/dashboard';
}
