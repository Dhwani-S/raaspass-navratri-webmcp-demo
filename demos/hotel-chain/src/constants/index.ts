/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const AVAILABLE_AMENITIES = [
  'dining',
  'live music',
  'traditional garba',
  'dandiya',
  'family zone',
  'vip seating',
  'costume rental',
  'free parking',
  'first aid'
] as string[];

export const CITY_LABELS: Record<string, string> = {
  ahmedabad: 'Ahmedabad, Gujarat',
  vadodara: 'Vadodara, Gujarat',
  surat: 'Surat, Gujarat',
  rajkot: 'Rajkot, Gujarat',
  all: 'All Venues'
};

export const CITY_KEYWORDS: Record<string, string[]> = {
  ahmedabad: ['ahmedabad', 'amdavad'],
  vadodara: ['vadodara', 'baroda'],
  surat: ['surat'],
  rajkot: ['rajkot']
};

export function getTargetCity(query: string | null): string | null {
  const q = (query || '').toLowerCase();
  if (q === '' || q === 'all') return 'all';

  for (const [city, keywords] of Object.entries(CITY_KEYWORDS)) {
    if (keywords.some(k => q.includes(k))) return city;
  }

  return null;
}

export const Z_INDEX = {
  NAV: 50,
  MODAL: 100,
  FLOATING_CTA: 40
} as const;
