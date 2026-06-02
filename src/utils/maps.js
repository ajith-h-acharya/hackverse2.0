/**
 * Generates a Google Maps directions URL for sequential turn-by-turn navigation.
 * Supports multiple stops in order.
 * Format: https://www.google.com/maps/dir/lat1,lng1/lat2,lng2/...
 * 
 * @param {Array} stops - List of stops, each having lat/lng properties or a coordinates array.
 * @returns {string} The Google Maps directions URL.
 */
export function generateGoogleMapsDirUrl(stops) {
  if (!stops || stops.length === 0) return '';
  
  const coordinateStrings = stops.map(stop => {
    let lat = stop.lat;
    let lng = stop.lng;
    
    if (lat === undefined || lng === undefined) {
      if (Array.isArray(stop.coordinates)) {
        lat = stop.coordinates[0];
        lng = stop.coordinates[1];
      } else if (Array.isArray(stop.coords)) {
        lat = stop.coords[0];
        lng = stop.coords[1];
      } else if (typeof stop.location === 'object' && stop.location !== null) {
        lat = stop.location.lat;
        lng = stop.location.lng;
      }
    }
    
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      return `${lat},${lng}`;
    }
    return null;
  }).filter(Boolean);

  if (coordinateStrings.length === 0) return '';
  
  return `https://www.google.com/maps/dir/${coordinateStrings.join('/')}`;
}
