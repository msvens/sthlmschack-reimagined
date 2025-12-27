/**
 * Organization Data Loader
 *
 * Abstraction layer for loading district and club data.
 * Easy to swap implementations:
 * - Static JSON files (current)
 * - Next.js API route
 * - Remote API with caching
 */

import type { DistrictDTO, ClubDTO } from '@/lib/api/types';

export interface OrganizationData {
  districts: DistrictDTO[];
  clubsByDistrict: {
    districtId: number;
    districtName: string;
    clubs: ClubDTO[];
    count: number;
  }[];
  stats: {
    districtCount: number;
    clubCount: number;
  };
}

/**
 * Load organization data from static JSON file
 * This is the current implementation (Option B)
 */
async function loadFromStaticFile(): Promise<OrganizationData> {
  // Fetch from public directory
  const response = await fetch('/data/organizations-all.json');
  if (!response.ok) {
    throw new Error(`Failed to load organizations data: ${response.status}`);
  }
  return response.json();
}

/**
 * Load organization data from Next.js API route
 * Uncomment to use Option C
 */
// async function loadFromNextAPI(): Promise<OrganizationData> {
//   const response = await fetch('/api/organizations');
//   if (!response.ok) {
//     throw new Error(`Failed to load organizations data: ${response.status}`);
//   }
//   return response.json();
// }

/**
 * Main data loader - swap implementation here
 */
export async function loadOrganizationData(): Promise<OrganizationData> {
  // Current: Static file (Option B)
  return loadFromStaticFile();

  // To switch to Next.js API (Option C), uncomment:
  // return loadFromNextAPI();
}

/**
 * Create optimized lookup structures from raw data
 */
export function createOrganizationLookups(data: OrganizationData) {
  // Map: clubId -> ClubDTO
  const clubMap = new Map<number, ClubDTO>();

  // Map: clubId -> districtId
  const clubDistrictMap = new Map<number, number | null>();

  // Process all clubs
  data.clubsByDistrict.forEach(districtData => {
    districtData.clubs.forEach(club => {
      clubMap.set(club.id, club);

      // Extract active district from club's districts array
      if (club.districts && club.districts.length > 0) {
        const activeDistrict = club.districts.find(d => d.active === 1);
        const districtId = activeDistrict
          ? activeDistrict.districtid
          : club.districts[0].districtid;
        clubDistrictMap.set(club.id, districtId);
      } else {
        clubDistrictMap.set(club.id, null);
      }
    });
  });

  // Map: districtId -> DistrictDTO
  const districtMap = new Map<number, DistrictDTO>();
  data.districts.forEach(district => {
    districtMap.set(district.id, district);
  });

  return {
    clubMap,
    clubDistrictMap,
    districtMap,
  };
}
