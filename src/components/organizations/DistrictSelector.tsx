'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SelectableList, SelectableListItem } from '@/components/SelectableList';
import { useOrganizations } from '@/context/OrganizationsContext';
import type { getTranslation } from '@/lib/translations';

export interface DistrictSelectorProps {
  selectedDistrictId: number | null;
  t: ReturnType<typeof getTranslation>;
}

export function DistrictSelector({ selectedDistrictId, t }: DistrictSelectorProps) {
  const router = useRouter();
  const { districts } = useOrganizations();

  const districtItems: SelectableListItem[] = useMemo(() => {
    return districts.map(district => ({
      id: district.id,
      label: district.name,
    }));
  }, [districts]);

  const handleDistrictSelect = (id: string | number) => {
    router.push(`/organizations/districts/${id}`);
  };

  return (
    <SelectableList
      items={districtItems}
      selectedId={selectedDistrictId}
      onSelect={handleDistrictSelect}
      title={t.pages.organizations.districts.selectDistrict}
      variant="dropdown"
      density="compact"
      transparent
    />
  );
}
