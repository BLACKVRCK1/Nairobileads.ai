export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface NairobiHub {
  id: string;
  name: string;
  category: string;
  center: GeoPoint;
  description: string;
  badgeColor: string;
}

// Bounding box for Nairobi Metro Area
export const NAIROBI_BOUNDS = {
  minLat: -1.3800, // South (National Park / Mombasa Rd)
  maxLat: -1.1200, // North (Ruiru / Tatu City)
  minLng: 36.6800, // West (Karen / Dagoretti)
  maxLng: 36.9800, // East (Eastern Bypass / Ruiru / Embakasi)
};

export const NAIROBI_HUBS: NairobiHub[] = [
  {
    id: 'westlands',
    name: 'Westlands & Parklands',
    category: 'Tech & High-Growth SaaS',
    center: { lat: -1.2655, lng: 36.8042 },
    description: 'Chiromo Rd, Waiyaki Way, Mpaka Rd',
    badgeColor: 'emerald',
  },
  {
    id: 'upperhill',
    name: 'Upper Hill Financial District',
    category: 'Banking, Insurance & SACCOs',
    center: { lat: -1.2996, lng: 36.8174 },
    description: 'Hospital Rd, Kilimanjaro Ave, Mara Rd',
    badgeColor: 'indigo',
  },
  {
    id: 'industrial_area',
    name: 'Industrial Area & Enterprise Rd',
    category: 'Heavy Manufacturing & FMCG',
    center: { lat: -1.3128, lng: 36.8519 },
    description: 'Commercial St, Lunga Lunga, Enterprise Rd',
    badgeColor: 'amber',
  },
  {
    id: 'ruiru_tatu',
    name: 'Ruiru & Tatu City Industrial',
    category: 'Logistics, Warehousing & Agro-Parks',
    center: { lat: -1.1448, lng: 36.9388 },
    description: 'Tatu City, Eastern Bypass, Thika Superhighway',
    badgeColor: 'cyan',
  },
  {
    id: 'kilimani',
    name: 'Kilimani & Hurlingham',
    category: 'Consultancies & Healthcare',
    center: { lat: -1.2921, lng: 36.7850 },
    description: 'Lenana Rd, Argwings Kodhek, Ngong Rd',
    badgeColor: 'teal',
  },
  {
    id: 'cbd',
    name: 'Nairobi Central Business District',
    category: 'Legal, Retail & Public Agencies',
    center: { lat: -1.2864, lng: 36.8172 },
    description: 'Kenyatta Ave, Harambee Ave, Moi Ave',
    badgeColor: 'blue',
  },
  {
    id: 'gigiri',
    name: 'Gigiri & Diplomatic Zone',
    category: 'UN Agencies & NGOs',
    center: { lat: -1.2325, lng: 36.8118 },
    description: 'UN Avenue, Limuru Rd',
    badgeColor: 'purple',
  },
];

/**
 * Resolves or estimates coordinates for a lead based on its officeAddress, locationDetail, or location
 */
export function getLeadCoordinates(lead: {
  coordinates?: { lat: number; lng: number };
  officeAddress?: string | null;
  locationDetail?: string;
  location?: string;
  id?: string;
}): GeoPoint {
  if (lead.coordinates && lead.coordinates.lat && lead.coordinates.lng) {
    return lead.coordinates;
  }

  const text = `${lead.officeAddress || ''} ${lead.locationDetail || ''} ${lead.location || ''}`.toLowerCase();

  // Pseudo-hash offset to slightly jitter items in same hub so markers don't overlap completely
  const hash = (lead.id || 'seed').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const jitterLat = ((hash % 10) - 5) * 0.0018;
  const jitterLng = (((hash * 7) % 10) - 5) * 0.0018;

  if (text.includes('tatu') || text.includes('ruiru') || text.includes('thika')) {
    return { lat: -1.1448 + jitterLat, lng: 36.9388 + jitterLng };
  }
  if (text.includes('westlands') || text.includes('chiromo') || text.includes('waiyaki') || text.includes('mpaka')) {
    return { lat: -1.2655 + jitterLat, lng: 36.8042 + jitterLng };
  }
  if (text.includes('upper hill') || text.includes('britam') || text.includes('hospital road') || text.includes('mara')) {
    return { lat: -1.2996 + jitterLat, lng: 36.8174 + jitterLng };
  }
  if (text.includes('industrial') || text.includes('enterprise') || text.includes('commercial st') || text.includes('lunga')) {
    return { lat: -1.3128 + jitterLat, lng: 36.8519 + jitterLng };
  }
  if (text.includes('kilimani') || text.includes('hurlingham') || text.includes('lenana') || text.includes('argwings')) {
    return { lat: -1.2921 + jitterLat, lng: 36.7850 + jitterLng };
  }
  if (text.includes('gigiri') || text.includes('un avenue') || text.includes('limuru')) {
    return { lat: -1.2325 + jitterLat, lng: 36.8118 + jitterLng };
  }
  if (text.includes('parklands')) {
    return { lat: -1.2585 + jitterLat, lng: 36.8206 + jitterLng };
  }
  if (text.includes('mombasa road') || text.includes('airport') || text.includes('jkia')) {
    return { lat: -1.3364 + jitterLat, lng: 36.8833 + jitterLng };
  }
  if (text.includes('karen') || text.includes('langata')) {
    return { lat: -1.3197 + jitterLat, lng: 36.7065 + jitterLng };
  }

  // Default Central Nairobi coordinate
  return { lat: -1.2864 + jitterLat, lng: 36.8172 + jitterLng };
}

export interface NeighborhoodDensity {
  hub: NairobiHub;
  leadCount: number;
  percentage: number;
  intensity: number; // 0 to 1
  pos: { x: number; y: number };
  leads: any[];
}

/**
 * Calculates lead density grouped by Nairobi neighborhood hubs
 */
export function calculateNeighborhoodDensities(leads: any[]): NeighborhoodDensity[] {
  const totalLeads = leads.length;

  return NAIROBI_HUBS.map((hub) => {
    const hubLeads = leads.filter((lead) => {
      const text = `${lead.officeAddress || ''} ${lead.locationDetail || ''} ${lead.location || ''}`.toLowerCase();
      const hubKey = hub.id.toLowerCase();
      const primaryName = hub.name.toLowerCase().split(' ')[0];
      return text.includes(hubKey) || text.includes(primaryName) || (hub.id === 'upperhill' && text.includes('upper hill')) || (hub.id === 'industrial_area' && text.includes('industrial'));
    });

    const leadCount = hubLeads.length;
    const percentage = totalLeads > 0 ? (leadCount / totalLeads) * 100 : 0;
    // Normalized intensity between 0 and 1
    const intensity = totalLeads > 0 ? Math.min(1, leadCount / Math.max(1, Math.ceil(totalLeads * 0.4))) : 0;
    const pos = coordsToPercent(hub.center);

    return {
      hub,
      leadCount,
      percentage,
      intensity,
      pos,
      leads: hubLeads,
    };
  });
}

/**
 * Converts GPS Coordinates to percentage (0 to 100) within the Nairobi bounding canvas
 */
export function coordsToPercent(point: GeoPoint): { x: number; y: number } {
  const { minLat, maxLat, minLng, maxLng } = NAIROBI_BOUNDS;
  
  // Clamp values
  const clampedLat = Math.max(minLat, Math.min(maxLat, point.lat));
  const clampedLng = Math.max(minLng, Math.min(maxLng, point.lng));

  // Latitude goes from Top (maxLat) to Bottom (minLat)
  const y = ((maxLat - clampedLat) / (maxLat - minLat)) * 100;
  // Longitude goes from Left (minLng) to Right (maxLng)
  const x = ((clampedLng - minLng) / (maxLng - minLng)) * 100;

  return { x, y };
}
