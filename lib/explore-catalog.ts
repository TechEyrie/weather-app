import type { GeoLocation } from "@/lib/open-meteo";

export type ExploreCountry = {
  code: string;
  name: string;
};

export const EXPLORE_COUNTRIES: ExploreCountry[] = [
  { code: "ID", name: "Indonesia" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "JP", name: "Japan" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "SG", name: "Singapore" },
  { code: "IN", name: "India" },
];

type FeaturedSeed = Omit<GeoLocation, "id"> & { id?: number };

function featured(countryCode: string, seeds: FeaturedSeed[]): GeoLocation[] {
  return seeds.map((s, i) => ({
    id: s.id ?? i,
    name: s.name,
    country: s.country,
    admin1: s.admin1,
    latitude: s.latitude,
    longitude: s.longitude,
  }));
}

export const FEATURED_BY_COUNTRY: Record<string, GeoLocation[]> = {
  ID: featured("ID", [
    {
      name: "Central Jakarta",
      country: "Indonesia",
      admin1: "Jakarta",
      latitude: -6.2088,
      longitude: 106.8456,
    },
    {
      name: "Denpasar",
      country: "Indonesia",
      admin1: "Bali",
      latitude: -8.6705,
      longitude: 115.2126,
    },
    {
      name: "Surabaya",
      country: "Indonesia",
      admin1: "East Java",
      latitude: -7.2575,
      longitude: 112.7521,
    },
  ]),
  US: featured("US", [
    {
      name: "New York",
      country: "United States",
      admin1: "New York",
      latitude: 40.7128,
      longitude: -74.006,
    },
    {
      name: "Los Angeles",
      country: "United States",
      admin1: "California",
      latitude: 34.0522,
      longitude: -118.2437,
    },
    {
      name: "Chicago",
      country: "United States",
      admin1: "Illinois",
      latitude: 41.8781,
      longitude: -87.6298,
    },
  ]),
  GB: featured("GB", [
    {
      name: "London",
      country: "United Kingdom",
      admin1: "England",
      latitude: 51.5074,
      longitude: -0.1278,
    },
    {
      name: "Manchester",
      country: "United Kingdom",
      admin1: "England",
      latitude: 53.4808,
      longitude: -2.2426,
    },
  ]),
  JP: featured("JP", [
    {
      name: "Tokyo",
      country: "Japan",
      admin1: "Tokyo",
      latitude: 35.6762,
      longitude: 139.6503,
    },
    {
      name: "Osaka",
      country: "Japan",
      admin1: "Osaka",
      latitude: 34.6937,
      longitude: 135.5023,
    },
  ]),
  AU: featured("AU", [
    {
      name: "Sydney",
      country: "Australia",
      admin1: "New South Wales",
      latitude: -33.8688,
      longitude: 151.2093,
    },
    {
      name: "Melbourne",
      country: "Australia",
      admin1: "Victoria",
      latitude: -37.8136,
      longitude: 144.9631,
    },
  ]),
  DE: featured("DE", [
    {
      name: "Berlin",
      country: "Germany",
      admin1: "Berlin",
      latitude: 52.52,
      longitude: 13.405,
    },
    {
      name: "Munich",
      country: "Germany",
      admin1: "Bavaria",
      latitude: 48.1351,
      longitude: 11.582,
    },
  ]),
  SG: featured("SG", [
    {
      name: "Singapore",
      country: "Singapore",
      latitude: 1.3521,
      longitude: 103.8198,
    },
  ]),
  IN: featured("IN", [
    {
      name: "Mumbai",
      country: "India",
      admin1: "Maharashtra",
      latitude: 19.076,
      longitude: 72.8777,
    },
    {
      name: "Delhi",
      country: "India",
      admin1: "Delhi",
      latitude: 28.7041,
      longitude: 77.1025,
    },
  ]),
};