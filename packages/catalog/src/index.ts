export * from './types';
export * from './resolvers';
export * from './validate';

import type { BusinessUnitProduct } from './types';
import { GERMAN_ROZ_MAIN } from './products/german-roz-main';

export { GERMAN_ROZ_MAIN };

/**
 * Every product in the catalog. Lucas con Lucas is intentionally NOT here
 * (business decision 2026-06-09: it keeps its own isolated stack).
 */
export const CATALOG: BusinessUnitProduct[] = [GERMAN_ROZ_MAIN];

export function getProductByKey(productKey: string): BusinessUnitProduct | null {
  return CATALOG.find((p) => p.productKey === productKey) ?? null;
}

export function getProductByBu(orgKey: string, buKey: string): BusinessUnitProduct | null {
  return CATALOG.find((p) => p.orgKey === orgKey && p.buKey === buKey) ?? null;
}
