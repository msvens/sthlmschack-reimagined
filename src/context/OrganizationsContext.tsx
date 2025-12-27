'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadOrganizationData, createOrganizationLookups } from '@/lib/organizations/organizationDataLoader';
import type { DistrictDTO, ClubDTO } from '@/lib/api/types';

interface OrganizationsContextType {
  districts: DistrictDTO[];
  loading: boolean;
  error: string | null;
  getClubName: (orgNumber: number) => string;
  getDistrict: (districtId: number) => DistrictDTO | undefined;
  getOrganizerName: (orgType: number, orgNumber: number) => string;
  getDistrictIdForOrganizer: (orgType: number, orgNumber: number) => number | null;
}

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

export function OrganizationsProvider({ children }: { children: React.ReactNode }) {
  const [districts, setDistricts] = useState<DistrictDTO[]>([]);
  const [clubMap, setClubMap] = useState<Map<number, ClubDTO>>(new Map());
  const [clubDistrictMap, setClubDistrictMap] = useState<Map<number, number | null>>(new Map());
  const [districtMap, setDistrictMap] = useState<Map<number, DistrictDTO>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all organization data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load data from configured source (static file, API, etc.)
        const data = await loadOrganizationData();

        // Create optimized lookup structures
        const lookups = createOrganizationLookups(data);

        // Update state
        setDistricts(data.districts);
        setClubMap(lookups.clubMap);
        setClubDistrictMap(lookups.clubDistrictMap);
        setDistrictMap(lookups.districtMap);

        console.log(`✅ Loaded ${data.stats.districtCount} districts and ${data.stats.clubCount} clubs`);
      } catch (err) {
        console.error('Failed to load organization data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load organization data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get club name by orgNumber (instant lookup, no async)
  const getClubName = useCallback((orgNumber: number): string => {
    // Special case: Sveriges Schackförbund
    if (orgNumber === 1) {
      return 'Sveriges Schackförbund';
    }

    const club = clubMap.get(orgNumber);
    return club ? club.name : `Org ${orgNumber}`;
  }, [clubMap]);

  // Get district by ID (instant lookup)
  const getDistrict = useCallback((districtId: number): DistrictDTO | undefined => {
    return districtMap.get(districtId);
  }, [districtMap]);

  // Get organizer name based on orgType and orgNumber (instant lookup, no async)
  const getOrganizerName = useCallback((orgType: number, orgNumber: number): string => {
    // orgType -1 OR orgNumber 1 = Federation (Sveriges Schackförbund)
    if (orgType === -1 || orgNumber === 1) {
      return 'Sveriges Schackförbund';
    }

    // orgType 0 = District
    if (orgType === 0) {
      const district = districtMap.get(orgNumber);
      return district ? district.name : `District ${orgNumber}`;
    }

    // orgType 1 = Club
    return getClubName(orgNumber);
  }, [districtMap, getClubName]);

  // Get district ID for a given organizer (instant lookup, no async)
  const getDistrictIdForOrganizer = useCallback((orgType: number, orgNumber: number): number | null => {
    // orgType -1 = Federation - no district
    if (orgType === -1 || orgNumber === 1) {
      return null;
    }

    // orgType 0 = District - orgNumber IS the district ID
    if (orgType === 0) {
      return orgNumber;
    }

    // orgType 1 = Club - lookup district from pre-loaded map
    if (orgType === 1) {
      return clubDistrictMap.get(orgNumber) ?? null;
    }

    return null;
  }, [clubDistrictMap]);

  return (
    <OrganizationsContext.Provider
      value={{
        districts,
        loading,
        error,
        getClubName,
        getDistrict,
        getOrganizerName,
        getDistrictIdForOrganizer,
      }}
    >
      {children}
    </OrganizationsContext.Provider>
  );
}

export function useOrganizations() {
  const context = useContext(OrganizationsContext);
  if (context === undefined) {
    throw new Error('useOrganizations must be used within an OrganizationsProvider');
  }
  return context;
}
