'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { OrganizationService } from '@/lib/api';
import type { DistrictDTO, ClubDTO } from '@/lib/api/types';

interface OrganizationsContextType {
  districts: DistrictDTO[];
  districtsLoading: boolean;
  getClubName: (orgNumber: number) => Promise<string>;
  getDistrict: (districtId: number) => DistrictDTO | undefined;
  getOrganizerName: (orgType: number, orgNumber: number) => Promise<string>;
}

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

export function OrganizationsProvider({ children }: { children: React.ReactNode }) {
  const [districts, setDistricts] = useState<DistrictDTO[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(true);
  const [clubCache, setClubCache] = useState<Map<number, ClubDTO>>(new Map());
  const [fetchingClubs, setFetchingClubs] = useState<Set<number>>(new Set());

  // Load districts on mount
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const service = new OrganizationService();
        const response = await service.getDistricts();

        if (response.status === 200 && response.data) {
          setDistricts(response.data);
        } else {
          console.error('Failed to load districts:', response.error);
        }
      } catch (error) {
        console.error('Error loading districts:', error);
      } finally {
        setDistrictsLoading(false);
      }
    };

    loadDistricts();
  }, []);

  // Get club name by orgNumber (lazy load with cache)
  const getClubName = useCallback(async (orgNumber: number): Promise<string> => {
    // Special case: Sveriges Schackförbund
    if (orgNumber === 1) {
      return 'Sveriges Schackförbund';
    }

    // Check cache first
    const cached = clubCache.get(orgNumber);
    if (cached) {
      return cached.name;
    }

    // Avoid duplicate fetches
    if (fetchingClubs.has(orgNumber)) {
      // Wait a bit and try again (simple polling)
      await new Promise(resolve => setTimeout(resolve, 100));
      return getClubName(orgNumber);
    }

    // Fetch club
    try {
      setFetchingClubs(prev => new Set(prev).add(orgNumber));
      const service = new OrganizationService();
      const response = await service.getClub(orgNumber);

      if (response.status === 200 && response.data) {
        setClubCache(prev => new Map(prev).set(orgNumber, response.data!));
        return response.data.name;
      } else {
        console.error(`Failed to load club ${orgNumber}:`, response.error);
        return `Org ${orgNumber}`;
      }
    } catch (error) {
      console.error(`Error loading club ${orgNumber}:`, error);
      return `Org ${orgNumber}`;
    } finally {
      setFetchingClubs(prev => {
        const next = new Set(prev);
        next.delete(orgNumber);
        return next;
      });
    }
  }, [clubCache, fetchingClubs]);

  // Get district by ID
  const getDistrict = useCallback((districtId: number): DistrictDTO | undefined => {
    return districts.find(d => d.id === districtId);
  }, [districts]);

  // Get organizer name based on orgType and orgNumber
  const getOrganizerName = useCallback(async (orgType: number, orgNumber: number): Promise<string> => {
    // orgType -1 OR orgNumber 1 = Federation (Sveriges Schackförbund)
    if (orgType === -1 || orgNumber === 1) {
      return 'Sveriges Schackförbund';
    }

    // orgType 0 = District
    if (orgType === 0) {
      const district = districts.find(d => d.id === orgNumber);
      return district ? district.name : `District ${orgNumber}`;
    }

    // orgType 1 = Club (fetch from API)
    return getClubName(orgNumber);
  }, [districts, getClubName]);

  return (
    <OrganizationsContext.Provider
      value={{
        districts,
        districtsLoading,
        getClubName,
        getDistrict,
        getOrganizerName,
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