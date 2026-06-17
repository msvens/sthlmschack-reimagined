/**
 * Shared Leaflet basemap config for the calendar and club maps. This is the
 * single swap point for how the map looks — change a URL here (or point at
 * MapLibre vector tiles later) and both maps follow. CARTO raster, keyless,
 * theme-aware.
 */
export const TILE_SOURCES = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
} as const;

/** Roughly centres the map on Sweden before fitting to markers. */
export const SWEDEN_CENTER: [number, number] = [62.5, 16.5];
