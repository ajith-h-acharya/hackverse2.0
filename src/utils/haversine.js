// Calculates distance between two coordinates in kilometers
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(2));
}

export function calculateTotalDistance(pathCoordinates) {
  if (!pathCoordinates || pathCoordinates.length < 2) return 0;
  
  let total = 0;
  for (let i = 0; i < pathCoordinates.length - 1; i++) {
    total += calculateDistance(
      pathCoordinates[i].lat,
      pathCoordinates[i].lng,
      pathCoordinates[i+1].lat,
      pathCoordinates[i+1].lng
    );
  }
  return total.toFixed(2);
}

