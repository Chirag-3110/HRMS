import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance } from '../distance';

describe('calculateHaversineDistance', () => {
  it('should return 0 when comparing the same point', () => {
    const lat = 40.7128;
    const lon = -74.0060;
    const distance = calculateHaversineDistance(lat, lon, lat, lon);
    expect(distance).toBe(0);
  });

  it('should calculate correct distance between New York and Newark', () => {
    // NYC: 40.7128° N, 74.0060° W
    // Newark, NJ: 40.7357° N, 74.1724° W
    // Known distance is approx 14-15 km
    const nycLat = 40.7128;
    const nycLng = -74.0060;
    const newarkLat = 40.7357;
    const newarkLng = -74.1724;

    const distance = calculateHaversineDistance(nycLat, nycLng, newarkLat, newarkLng);
    
    // Check that it's close to 14.3 km
    expect(distance).toBeGreaterThan(14.0);
    expect(distance).toBeLessThan(15.0);
  });

  it('should calculate correct distance between London and Paris', () => {
    // London: 51.5074° N, 0.1278° W
    // Paris: 48.8566° N, 2.3522° E
    // Known distance is approx 343 km
    const londonLat = 51.5074;
    const londonLng = -0.1278;
    const parisLat = 48.8566;
    const parisLng = 2.3522;

    const distance = calculateHaversineDistance(londonLat, londonLng, parisLat, parisLng);
    expect(distance).toBeGreaterThan(340);
    expect(distance).toBeLessThan(350);
  });
});
