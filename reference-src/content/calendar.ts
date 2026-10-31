import { CAMPAIGN_START } from '../config/brand';

/**
 * Seasonal windows from the campaign start (Dec 2026). Windows marked approx depend on
 * moon sighting by the national authority and must be confirmed before use.
 */
export interface Season {
  id: string;
  from: string;
  to: string;
  approx?: boolean;
}

export const SEASONS: Season[] = [
  { id: 'launch', from: CAMPAIGN_START, to: '2026-12-31' },
  { id: 'coptic-christmas', from: '2027-01-05', to: '2027-01-07' },
  { id: 'ramadan-prep', from: '2027-01-25', to: '2027-02-07', approx: true },
  { id: 'ramadan', from: '2027-02-08', to: '2027-03-08', approx: true },
  { id: 'eid', from: '2027-03-09', to: '2027-03-12', approx: true },
  { id: 'mothers-day', from: '2027-03-19', to: '2027-03-21' },
];

export function getActiveSeason(now: Date = new Date()): Season | undefined {
  const day = now.toISOString().slice(0, 10);
  return SEASONS.find((s) => day >= s.from && day <= s.to);
}
