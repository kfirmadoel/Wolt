// Same distance calculation as the web home page, using the saved location.
export function calculateDistance(location, from) {
  if (!location || !from || !Number.isFinite(location.x) || !Number.isFinite(location.y) ||
      !Number.isFinite(from.x) || !Number.isFinite(from.y)) return null;

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(location.x - from.x);
  const longitudeDelta = toRadians(location.y - from.y);
  const haversine = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(from.x)) * Math.cos(toRadians(location.x)) * Math.sin(longitudeDelta / 2) ** 2;
  const value = Math.min(1, Math.max(0, haversine));
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
