/**
 * Responses navigation — cross-org creator links.
 *
 * The back office is multi-tenant: each creator whose intake lives outside the
 * CRM exposes a Responses module on its own org/bu. This builds the list of
 * creator → responses links used both by the Responses sidebar (to switch
 * between creators) and the Centro sidebar (to reach any creator's responses
 * from anywhere). Data-driven from `sources.ts` — no hardcoded org strings.
 */
import { responsesTenants } from './sources';

export interface CreatorResponseLink {
  organizer: string;
  bu: string;
  label: string;
  href: string;
  icon: string;
}

export function creatorResponseLinks(): CreatorResponseLink[] {
  return responsesTenants().map((t) => ({
    organizer: t.organizer,
    bu: t.bu,
    label: t.creatorLabel,
    href: `/${t.organizer}/${t.bu}/responses`,
    icon: '📥',
  }));
}
