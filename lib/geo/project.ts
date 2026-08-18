/**
 * Projection équirectangulaire simple : latitude/longitude -> pourcentage
 * (0-100) dans un cadre 2:1, pour positionner des pins en `position: absolute`
 * sur une carte du monde plate sans dépendance cartographique.
 */
export function projectToPercent(latitude: number, longitude: number) {
  const x = ((longitude + 180) / 360) * 100;
  const y = ((90 - latitude) / 180) * 100;
  return { x, y };
}
