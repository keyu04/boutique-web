import { BRAND } from '@shared';

export function formatPageTitle(description: string): string {
  return `${BRAND.name} Fashion | ${description}`;
}
