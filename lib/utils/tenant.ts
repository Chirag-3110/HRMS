/**
 * Formats a tenantId string into a human-readable tenant name.
 */
export function formatTenantName(id: string): string {
  if (!id) return '';
  if (id === 'apex-logistics') return 'Apex Express & Logistics';
  if (id === 'prime-healthcare') return 'Prime Clinical Healthcare';
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
