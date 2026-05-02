/**
 * Mock marketplace data — Vellum hosts the platform; sellers (independent
 * pharmacies) list inventory. All listings are demo-only and are not
 * dispensing data.
 */

export type Category =
  | "otc"
  | "rx"
  | "wellness"
  | "devices"
  | "first-aid"
  | "cold-chain";

export const CATEGORY_LABEL: Record<Category, string> = {
  otc: "Over the counter",
  rx: "Prescription",
  wellness: "Wellness",
  devices: "Devices",
  "first-aid": "First aid",
  "cold-chain": "Cold chain",
};

export type Pharmacy = {
  id: string;
  name: string;
  monogram: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  deliveryHours: string; // "01:30" style
  joined: string; // ISO month
  verified: boolean;
  coldChain: boolean;
  fulfilled: number; // total scripts fulfilled YTD
  tagline: string;
};

export const PHARMACIES: Pharmacy[] = [
  {
    id: "ph-mission",
    name: "Mission Dispensary",
    monogram: "MD",
    city: "Bengaluru",
    state: "KA",
    rating: 4.9,
    reviewCount: 1284,
    deliveryHours: "01:30",
    joined: "2024-03",
    verified: true,
    coldChain: true,
    fulfilled: 18420,
    tagline: "Independent. Compounding on site.",
  },
  {
    id: "ph-meridian",
    name: "Meridian Apothecary",
    monogram: "MA",
    city: "Mumbai",
    state: "MH",
    rating: 4.8,
    reviewCount: 962,
    deliveryHours: "01:00",
    joined: "2024-01",
    verified: true,
    coldChain: true,
    fulfilled: 22115,
    tagline: "Two-hour metro courier, every night of the year.",
  },
  {
    id: "ph-fortwilliam",
    name: "Fort William Chemists",
    monogram: "FW",
    city: "Kolkata",
    state: "WB",
    rating: 4.7,
    reviewCount: 540,
    deliveryHours: "02:00",
    joined: "2024-06",
    verified: true,
    coldChain: false,
    fulfilled: 8900,
    tagline: "Heritage counter, modern logistics.",
  },
  {
    id: "ph-coromandel",
    name: "Coromandel Pharmacy",
    monogram: "CP",
    city: "Chennai",
    state: "TN",
    rating: 4.8,
    reviewCount: 731,
    deliveryHours: "01:45",
    joined: "2024-04",
    verified: true,
    coldChain: true,
    fulfilled: 11240,
    tagline: "Tamil-speaking pharmacist on call till 02:00.",
  },
  {
    id: "ph-northstar",
    name: "Northstar Drugs",
    monogram: "ND",
    city: "Delhi",
    state: "DL",
    rating: 4.6,
    reviewCount: 1102,
    deliveryHours: "01:15",
    joined: "2024-02",
    verified: true,
    coldChain: true,
    fulfilled: 19880,
    tagline: "Founded 1962. Now on Vellum.",
  },
  {
    id: "ph-deccan",
    name: "Deccan Wellness",
    monogram: "DW",
    city: "Hyderabad",
    state: "TG",
    rating: 4.5,
    reviewCount: 412,
    deliveryHours: "02:30",
    joined: "2024-09",
    verified: true,
    coldChain: false,
    fulfilled: 4180,
    tagline: "Wellness-first counter with Rx fulfilment.",
  },
];

export type Product = {
  id: string;
  name: string;
  generic: string;
  strength: string;
  pack: string; // "30 tablets", "100ml"
  category: Category;
  rxRequired: boolean;
  price: number; // INR
  mrp: number; // for strikethrough
  pharmacyId: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  monogramHue: number; // 0-360 for placeholder tile
  tag?: string; // "Cold chain", "Fast moving", "New"
};

export const PRODUCTS: Product[] = [
  {
    id: "p-001",
    name: "Atorvastatin",
    generic: "Atorvastatin calcium",
    strength: "20 mg",
    pack: "30 tablets",
    category: "rx",
    rxRequired: true,
    price: 142,
    mrp: 168,
    pharmacyId: "ph-mission",
    inStock: true,
    rating: 4.7,
    reviewCount: 312,
    monogramHue: 264,
    tag: "Fast moving",
  },
  {
    id: "p-002",
    name: "Metformin",
    generic: "Metformin HCl",
    strength: "500 mg",
    pack: "60 tablets",
    category: "rx",
    rxRequired: true,
    price: 88,
    mrp: 110,
    pharmacyId: "ph-meridian",
    inStock: true,
    rating: 4.8,
    reviewCount: 489,
    monogramHue: 142,
  },
  {
    id: "p-003",
    name: "Cetirizine",
    generic: "Cetirizine HCl",
    strength: "10 mg",
    pack: "10 tablets",
    category: "otc",
    rxRequired: false,
    price: 38,
    mrp: 52,
    pharmacyId: "ph-northstar",
    inStock: true,
    rating: 4.5,
    reviewCount: 211,
    monogramHue: 24,
  },
  {
    id: "p-004",
    name: "Vitamin D3",
    generic: "Cholecalciferol",
    strength: "60,000 IU",
    pack: "8 sachets",
    category: "wellness",
    rxRequired: false,
    price: 235,
    mrp: 280,
    pharmacyId: "ph-deccan",
    inStock: true,
    rating: 4.6,
    reviewCount: 158,
    monogramHue: 50,
    tag: "New",
  },
  {
    id: "p-005",
    name: "Omron HEM-7120",
    generic: "Automatic BP monitor",
    strength: "Upper arm cuff",
    pack: "1 unit",
    category: "devices",
    rxRequired: false,
    price: 1689,
    mrp: 1899,
    pharmacyId: "ph-meridian",
    inStock: true,
    rating: 4.7,
    reviewCount: 822,
    monogramHue: 200,
  },
  {
    id: "p-006",
    name: "Insulin Glargine",
    generic: "Glargine 100 IU/ml",
    strength: "3 ml cartridge",
    pack: "5 cartridges",
    category: "cold-chain",
    rxRequired: true,
    price: 1240,
    mrp: 1395,
    pharmacyId: "ph-mission",
    inStock: true,
    rating: 4.9,
    reviewCount: 67,
    monogramHue: 195,
    tag: "Cold chain",
  },
  {
    id: "p-007",
    name: "Paracetamol",
    generic: "Acetaminophen",
    strength: "650 mg",
    pack: "15 tablets",
    category: "otc",
    rxRequired: false,
    price: 28,
    mrp: 36,
    pharmacyId: "ph-fortwilliam",
    inStock: true,
    rating: 4.4,
    reviewCount: 1024,
    monogramHue: 8,
  },
  {
    id: "p-008",
    name: "Pantoprazole",
    generic: "Pantoprazole sodium",
    strength: "40 mg",
    pack: "30 tablets",
    category: "rx",
    rxRequired: true,
    price: 124,
    mrp: 148,
    pharmacyId: "ph-coromandel",
    inStock: true,
    rating: 4.6,
    reviewCount: 287,
    monogramHue: 280,
  },
  {
    id: "p-009",
    name: "Antiseptic Liquid",
    generic: "Chlorhexidine 5%",
    strength: "Topical",
    pack: "100 ml",
    category: "first-aid",
    rxRequired: false,
    price: 79,
    mrp: 95,
    pharmacyId: "ph-northstar",
    inStock: true,
    rating: 4.5,
    reviewCount: 132,
    monogramHue: 350,
  },
  {
    id: "p-010",
    name: "Crepe Bandage",
    generic: "Cotton elastic, 10cm",
    strength: "Standard",
    pack: "1 roll",
    category: "first-aid",
    rxRequired: false,
    price: 65,
    mrp: 80,
    pharmacyId: "ph-fortwilliam",
    inStock: true,
    rating: 4.3,
    reviewCount: 88,
    monogramHue: 30,
  },
  {
    id: "p-011",
    name: "Sertraline",
    generic: "Sertraline HCl",
    strength: "50 mg",
    pack: "30 tablets",
    category: "rx",
    rxRequired: true,
    price: 168,
    mrp: 196,
    pharmacyId: "ph-meridian",
    inStock: true,
    rating: 4.7,
    reviewCount: 174,
    monogramHue: 220,
  },
  {
    id: "p-012",
    name: "Glucose Test Strips",
    generic: "Accu-Chek compatible",
    strength: "Standard",
    pack: "50 strips",
    category: "devices",
    rxRequired: false,
    price: 745,
    mrp: 850,
    pharmacyId: "ph-deccan",
    inStock: false,
    rating: 4.4,
    reviewCount: 254,
    monogramHue: 110,
  },
  {
    id: "p-013",
    name: "Multivitamin",
    generic: "B-complex + zinc",
    strength: "Daily",
    pack: "60 capsules",
    category: "wellness",
    rxRequired: false,
    price: 312,
    mrp: 380,
    pharmacyId: "ph-northstar",
    inStock: true,
    rating: 4.6,
    reviewCount: 519,
    monogramHue: 70,
  },
  {
    id: "p-014",
    name: "Salbutamol Inhaler",
    generic: "Salbutamol 100 mcg",
    strength: "200 doses",
    pack: "1 inhaler",
    category: "rx",
    rxRequired: true,
    price: 215,
    mrp: 248,
    pharmacyId: "ph-coromandel",
    inStock: true,
    rating: 4.8,
    reviewCount: 96,
    monogramHue: 175,
  },
];

export const pharmacyById = (id: string): Pharmacy | undefined =>
  PHARMACIES.find((p) => p.id === id);
