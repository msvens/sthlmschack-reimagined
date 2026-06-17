'use client';

/**
 * Leaflet map of chess clubs. Client-only — loaded via next/dynamic (ssr:false)
 * from ClubMapView. Mirrors the calendar's TournamentMap; basemap look is shared
 * via TILE_SOURCES (src/lib/geo/mapTiles.ts).
 */
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Link } from '@/components/Link';
import { type Language } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useOrganizations } from '@/context/OrganizationsContext';
import { type ClubDTO } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { type GeoPoint } from '@/lib/geo/geocodeLoader';
import { TILE_SOURCES, SWEDEN_CENTER } from '@/lib/geo/mapTiles';

export interface ClubMarker {
  club: ClubDTO;
  point: GeoPoint;
}

// Regular clubs vs school clubs get distinct dots; reuse one icon per kind.
const iconCache = new Map<string, L.DivIcon>();
function clubIcon(isSchool: boolean): L.DivIcon {
  const key = isSchool ? 'school' : 'club';
  const cached = iconCache.get(key);
  if (cached) return cached;
  const swatch = isSchool ? 'bg-amber-500' : 'bg-indigo-500';
  const icon = L.divIcon({
    className: 'club-marker',
    html: `<span class="block h-5 w-5 rounded-full border-2 border-white shadow ${swatch}"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -11],
  });
  iconCache.set(key, icon);
  return icon;
}

function FitToMarkers({ markers }: { markers: ClubMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.point.lat, m.point.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [map, markers]);
  return null;
}

export default function ClubMap({ markers, language }: { markers: ClubMarker[]; language: Language }) {
  const { theme } = useTheme();
  const { getDistrictIdForOrganizer, getDistrict } = useOrganizations();
  const t = getTranslation(language);
  const labels = t.pages.organizations;
  const tiles = TILE_SOURCES[theme];

  return (
    <div className="h-[70vh] min-h-[420px] w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <MapContainer center={SWEDEN_CENTER} zoom={5} scrollWheelZoom className="h-full w-full">
        <TileLayer key={theme} url={tiles.url} attribution={tiles.attribution} />
        <FitToMarkers markers={markers} />
        <MarkerClusterGroup chunkedLoading>
          {markers.map(({ club, point }) => {
            const districtId = getDistrictIdForOrganizer(1, club.id);
            const districtName = districtId != null ? getDistrict(districtId)?.name : undefined;
            return (
              <Marker
                key={club.id}
                position={[point.lat, point.lng]}
                icon={clubIcon(club.schoolClub === 1)}
              >
                <Popup>
                  <Link href={`/organizations/clubs/${club.id}`} className="block text-sm font-semibold">
                    {club.name}
                  </Link>
                  <dl className="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                    {club.city && (
                      <div className="flex gap-1">
                        <dt className="shrink-0 font-medium">{labels.city}:</dt>
                        <dd>{club.city}</dd>
                      </div>
                    )}
                    {districtName && (
                      <div className="flex gap-1">
                        <dt className="shrink-0 font-medium">{labels.clubs.district}:</dt>
                        <dd>{districtName}</dd>
                      </div>
                    )}
                  </dl>
                  {club.schoolClub === 1 && (
                    <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      {labels.schoolClub}
                    </p>
                  )}
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
