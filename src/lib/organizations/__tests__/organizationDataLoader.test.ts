import { describe, it, expect } from 'vitest';
import { createOrganizationLookups } from '@/lib/organizations/organizationDataLoader';
import type { OrganizationData } from '@/lib/organizations/organizationDataLoader';
import type { DistrictDTO, ClubDTO } from '@msvens/schack-se-sdk';

function makeDistrict(overrides: Partial<DistrictDTO>): DistrictDTO {
  return {
    id: 1,
    name: 'Test District',
    co_ContantPerson: '',
    street: '',
    zipcode: 0,
    city: '',
    started: '',
    startSeason: '',
    endSeason: '',
    phonenr: '',
    postgiro: '',
    active: 1,
    email: '',
    orgnumber: '',
    authschoolclub: '',
    ...overrides,
  } as DistrictDTO;
}

function makeClub(overrides: Partial<ClubDTO>): ClubDTO {
  return {
    id: 100,
    name: 'Test Club',
    street: '',
    zipcode: 0,
    city: '',
    startdate: '',
    startSeason: '',
    endSeason: '',
    phonenr: '',
    postgiro: '',
    alliansclub: 0,
    email: '',
    orgnumber: '',
    districts: [],
    regYear: {} as ClubDTO['regYear'],
    ...overrides,
  } as ClubDTO;
}

function makeOrgData(overrides: Partial<OrganizationData> = {}): OrganizationData {
  return {
    districts: [],
    clubsByDistrict: [],
    stats: { districtCount: 0, clubCount: 0 },
    ...overrides,
  };
}

describe('createOrganizationLookups', () => {
  it('returns empty maps for empty input', () => {
    const result = createOrganizationLookups(makeOrgData());
    expect(result.clubMap.size).toBe(0);
    expect(result.districtMap.size).toBe(0);
    expect(result.clubDistrictMap.size).toBe(0);
  });

  it('builds correct clubMap', () => {
    const club1 = makeClub({ id: 10, name: 'Club A' });
    const club2 = makeClub({ id: 20, name: 'Club B' });
    const data = makeOrgData({
      clubsByDistrict: [
        { districtId: 1, districtName: 'D1', clubs: [club1, club2], count: 2 },
      ],
    });

    const { clubMap } = createOrganizationLookups(data);
    expect(clubMap.size).toBe(2);
    expect(clubMap.get(10)?.name).toBe('Club A');
    expect(clubMap.get(20)?.name).toBe('Club B');
  });

  it('builds correct districtMap', () => {
    const d1 = makeDistrict({ id: 5, name: 'Stockholm' });
    const d2 = makeDistrict({ id: 7, name: 'Skane' });
    const data = makeOrgData({ districts: [d1, d2] });

    const { districtMap } = createOrganizationLookups(data);
    expect(districtMap.size).toBe(2);
    expect(districtMap.get(5)?.name).toBe('Stockholm');
    expect(districtMap.get(7)?.name).toBe('Skane');
  });

  it('clubDistrictMap picks active district', () => {
    const club = makeClub({
      id: 10,
      districts: [
        { start: '', end: '', year: 2024, districtid: 99, clubid: 10, active: 0 } as ClubDTO['districts'][0],
        { start: '', end: '', year: 2024, districtid: 42, clubid: 10, active: 1 } as ClubDTO['districts'][0],
      ],
    });
    const data = makeOrgData({
      clubsByDistrict: [
        { districtId: 42, districtName: 'Active', clubs: [club], count: 1 },
      ],
    });

    const { clubDistrictMap } = createOrganizationLookups(data);
    expect(clubDistrictMap.get(10)).toBe(42);
  });

  it('clubDistrictMap falls back to first district when no active', () => {
    const club = makeClub({
      id: 10,
      districts: [
        { start: '', end: '', year: 2024, districtid: 77, clubid: 10, active: 0 } as ClubDTO['districts'][0],
        { start: '', end: '', year: 2024, districtid: 88, clubid: 10, active: 0 } as ClubDTO['districts'][0],
      ],
    });
    const data = makeOrgData({
      clubsByDistrict: [
        { districtId: 77, districtName: 'First', clubs: [club], count: 1 },
      ],
    });

    const { clubDistrictMap } = createOrganizationLookups(data);
    expect(clubDistrictMap.get(10)).toBe(77);
  });

  it('clubDistrictMap sets null when club has no districts', () => {
    const club = makeClub({ id: 10, districts: [] });
    const data = makeOrgData({
      clubsByDistrict: [
        { districtId: 1, districtName: 'D1', clubs: [club], count: 1 },
      ],
    });

    const { clubDistrictMap } = createOrganizationLookups(data);
    expect(clubDistrictMap.get(10)).toBeNull();
  });
});
