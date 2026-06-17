'use client';

/**
 * Leaflet map of tournament locations. Client-only — loaded via next/dynamic
 * (ssr:false) from MapView, never imported directly into a server render.
 *
 * Basemap look is governed entirely by TILE_SOURCES below: that constant is the
 * single swap point. Switching to a different raster style, or to MapLibre
 * vector tiles later, touches this file only — the markers, popups and the
 * data feeding them stay unchanged.
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
import { parseLocalDate, type TournamentDto } from '@/lib/api';
import { getTranslation } from '@/lib/translations';
import { getTournamentTypeKey } from '@/lib/utils/tournamentFilters';
import { getTypeSwatchClasses } from './calendarColors';
import { type GeoPoint } from '@/lib/geo/geocodeLoader';
import { TILE_SOURCES, SWEDEN_CENTER } from '@/lib/geo/mapTiles';

export interface MapMarker {
  tournament: TournamentDto;
  point: GeoPoint;
}

// Reuse one divIcon per tournament type (colored dot, white ring). Using a
// divIcon sidesteps Leaflet's broken default-marker-image path under bundlers.
const iconCache = new Map<number, L.DivIcon>();
function markerIcon(type: number): L.DivIcon {
  const cached = iconCache.get(type);
  if (cached) return cached;
  const swatch = getTypeSwatchClasses(type);
  const icon = L.divIcon({
    className: 'tournament-marker',
    html: `<span class="block h-3.5 w-3.5 rounded-full border-2 border-white shadow ${swatch}"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -8],
  });
  iconCache.set(type, icon);
  return icon;
}

/** Frame the map to the markers whenever the set changes. */
function FitToMarkers({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.point.lat, m.point.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
  }, [map, markers]);
  return null;
}

export default function TournamentMap({
  markers,
  language,
}: {
  markers: MapMarker[];
  language: Language;
}) {
  const { theme } = useTheme();
  const { getOrganizerName } = useOrganizations();
  const t = getTranslation(language);
  const tiles = TILE_SOURCES[theme];
  const locale = language === 'sv' ? 'sv-SE' : 'en-US';
  const rangeFmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const typeLabels = t.components.tournamentTypeFilter;
  const details = t.pages.calendar.dayDetails;

  function typeLabel(type: number): string {
    const key = getTournamentTypeKey(type) as keyof typeof typeLabels;
    return key in typeLabels ? typeLabels[key] : '';
  }

  function formatRange(tournament: TournamentDto): string {
    const start = rangeFmt.format(parseLocalDate(tournament.start));
    if (!tournament.end || tournament.end === tournament.start) return start;
    return `${start} – ${rangeFmt.format(parseLocalDate(tournament.end))}`;
  }

  return (
    <div className="h-[70vh] min-h-[420px] w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <MapContainer center={SWEDEN_CENTER} zoom={5} scrollWheelZoom className="h-full w-full">
        <TileLayer key={theme} url={tiles.url} attribution={tiles.attribution} />
        <FitToMarkers markers={markers} />
        <MarkerClusterGroup chunkedLoading>
          {markers.map(({ tournament, point }) => (
            <Marker
              key={tournament.id}
              position={[point.lat, point.lng]}
              icon={markerIcon(tournament.type)}
            >
              <Popup>
                <Link href={`/results/${tournament.id}`} className="block text-sm font-semibold">
                  {tournament.name}
                </Link>
                <dl className="mt-1 space-y-0.5 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex gap-1">
                    <dt className="shrink-0 font-medium">{details.organizer}:</dt>
                    <dd>{getOrganizerName(tournament.orgType, tournament.orgNumber)}</dd>
                  </div>
                  {tournament.city && (
                    <div className="flex gap-1">
                      <dt className="shrink-0 font-medium">{details.city}:</dt>
                      <dd>{tournament.city}</dd>
                    </div>
                  )}
                  {typeLabel(tournament.type) && (
                    <div className="flex gap-1">
                      <dt className="shrink-0 font-medium">{details.type}:</dt>
                      <dd>{typeLabel(tournament.type)}</dd>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <dt className="shrink-0 font-medium">{details.dateRange}:</dt>
                    <dd>{formatRange(tournament)}</dd>
                  </div>
                </dl>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
