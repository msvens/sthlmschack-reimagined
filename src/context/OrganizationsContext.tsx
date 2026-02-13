'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadOrganizationData, createOrganizationLookups } from '@/lib/organizations/organizationDataLoader';
import type { DistrictDTO, ClubDTO } from '@/lib/api';

interface OrganizationsContextType {
  districts: DistrictDTO[];
  loading: boolean;
  error: string | null;
  getClubName: (orgNumber: number) => string;
  getClub: (clubId: number) => ClubDTO | undefined;
  getAllClubs: (options?: { activeOnly?: boolean; hasRatingPlayersOnly?: boolean }) => ClubDTO[];
  getClubsByDistrict: (districtId: number, options?: { activeOnly?: boolean; hasRatingPlayersOnly?: boolean }) => ClubDTO[];
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
      return district ? district.name : '-';
    }

    // orgType 1 = Club - try club first, then district as fallback
    const club = clubMap.get(orgNumber);
    if (club) {
      return club.name;
    }

    // Fallback: check if orgNumber matches a district
    const district = districtMap.get(orgNumber);
    if (district) {
      return district.name;
    }

    return '-';
  }, [clubMap, districtMap]);

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

  // Get club by ID (instant lookup)
  const getClub = useCallback((clubId: number): ClubDTO | undefined => {
    return clubMap.get(clubId);
  }, [clubMap]);

  // Helper function to filter clubs based on options
  const filterClubs = useCallback((clubs: ClubDTO[], options?: { activeOnly?: boolean; hasRatingPlayersOnly?: boolean }): ClubDTO[] => {
    if (!options) return clubs;

    return clubs.filter(club => {
      // Filter by hasRatingPlayers
      if (options.hasRatingPlayersOnly && club.hasRatingPlayers !== 1) {
        return false;
      }

      // Filter by active status (check most recent district membership)
      if (options.activeOnly) {
        if (!club.districts || club.districts.length === 0) {
          return false;
        }

        // Find the most recent district membership (highest year)
        const mostRecentMembership = club.districts.reduce((latest, current) => {
          return current.year > latest.year ? current : latest;
        });

        // Check if the most recent membership is active
        if (mostRecentMembership.active !== 1) {
          return false;
        }
      }

      return true;
    });
  }, []);

  // Get all clubs as an array (instant)
  const getAllClubs = useCallback((options?: { activeOnly?: boolean; hasRatingPlayersOnly?: boolean }): ClubDTO[] => {
    const allClubs = Array.from(clubMap.values());
    return filterClubs(allClubs, options);
  }, [clubMap, filterClubs]);

  // Get clubs filtered by district (instant)
  const getClubsByDistrict = useCallback((districtId: number, options?: { activeOnly?: boolean; hasRatingPlayersOnly?: boolean }): ClubDTO[] => {
    const allClubs = Array.from(clubMap.values());
    const clubsInDistrict = allClubs.filter(club =>
      club.districts?.some(membership =>
        membership.districtid === districtId && membership.active === 1
      )
    );
    return filterClubs(clubsInDistrict, options);
  }, [clubMap, filterClubs]);

  return (
    <OrganizationsContext.Provider
      value={{
        districts,
        loading,
        error,
        getClubName,
        getClub,
        getAllClubs,
        getClubsByDistrict,
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
