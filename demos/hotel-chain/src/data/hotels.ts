/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Amenity {
  icon: string;
  label: string;
  filterKey: string;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  isFeatured: boolean;
  featuredTag?: string;
  rating: number;
  price: number;
  description?: string;
  imageSrc: string;
  amenities: Amenity[];
}

const EVENT_IMAGES = [
  '/navratri/garba-dandiya.jpg',
  '/navratri/garba-folk-dance.jpg',
  '/navratri/navratri-ground.jpg',
  '/navratri/garba-night.jpg'
];

export const hotels: Hotel[] = [
  {
    id: "gmdc-ground",
    name: "GMDC Ground",
    city: "ahmedabad",
    isFeatured: true,
    featuredTag: "Garba Grandstand",
    rating: 4.9,
    price: 299,
    description: "A landmark Ahmedabad Navratri ground with open-air garba, live dandiya, and a lively food village for every dance break.",
    imageSrc: EVENT_IMAGES[2],
    amenities: [
      { icon: "restaurant", label: "Gujarati Food Village", filterKey: "dining" },
      { icon: "music_note", label: "Live Dandiya Stage", filterKey: "live music" },
      { icon: "local_parking", label: "Ground Parking", filterKey: "free parking" },
      { icon: "medical_services", label: "First Aid Desk", filterKey: "first aid" }
    ]
  },
  {
    id: "aurelian",
    name: "Rang Ratri Grounds",
    city: "ahmedabad",
    isFeatured: true,
    featuredTag: "Artist Night",
    rating: 4.9,
    price: 242,
    description: "A high-energy Ahmedabad garba night with a live folk orchestra, sweeping dance circles, and colourful traditional decor.",
    imageSrc: EVENT_IMAGES[0],
    amenities: [
      { icon: "music_note", label: "Live Folk Orchestra", filterKey: "live music" },
      { icon: "groups", label: "Traditional Garba", filterKey: "traditional garba" },
      { icon: "restaurant", label: "Gujarati Food Court", filterKey: "dining" },
      { icon: "chair", label: "Reserved Viewing", filterKey: "vip seating" }
    ]
  },
  {
    id: "metropolis",
    name: "Sabarmati Sky Garba",
    city: "ahmedabad",
    isFeatured: false,
    rating: 4.6,
    price: 185,
    description: "A riverside community garba with family dance circles and an easygoing folk soundtrack.",
    imageSrc: EVENT_IMAGES[1],
    amenities: [
      { icon: "family_restroom", label: "Family Dance Zone", filterKey: "family zone" },
      { icon: "sports_bar", label: "Dandiya Sticks Included", filterKey: "dandiya" },
      { icon: "local_parking", label: "Free Parking", filterKey: "free parking" }
    ]
  },
  {
    id: "zengarden",
    name: "Navrang Night Bazaar",
    city: "ahmedabad",
    isFeatured: false,
    rating: 4.8,
    price: 210,
    description: "Garba meets Ahmedabad's night-market spirit with artisan stalls, street food, and nonstop dandiya.",
    imageSrc: EVENT_IMAGES[3],
    amenities: [
      { icon: "restaurant", label: "Night Food Bazaar", filterKey: "dining" },
      { icon: "checkroom", label: "Chaniya Choli Rental", filterKey: "costume rental" },
      { icon: "sports_bar", label: "Dandiya Arena", filterKey: "dandiya" }
    ]
  },
  {
    id: "crossroads",
    name: "Manek Chowk Raas Circle",
    city: "ahmedabad",
    isFeatured: false,
    rating: 4.4,
    price: 158,
    description: "An intimate old-city raas circle surrounded by Ahmedabad's celebrated late-night food scene.",
    imageSrc: EVENT_IMAGES[0],
    amenities: [
      { icon: "groups", label: "Traditional Garba", filterKey: "traditional garba" },
      { icon: "restaurant", label: "Street Food Access", filterKey: "dining" }
    ]
  },
  {
    id: "manhattan",
    name: "Vadodara Heritage Raas",
    city: "vadodara",
    isFeatured: true,
    featuredTag: "Heritage Favourite",
    rating: 4.8,
    price: 350,
    description: "Vadodara's graceful heritage setting comes alive with acclaimed singers and beautifully paced traditional garba.",
    imageSrc: EVENT_IMAGES[1],
    amenities: [
      { icon: "groups", label: "Traditional Garba", filterKey: "traditional garba" },
      { icon: "music_note", label: "Live Singers", filterKey: "live music" },
      { icon: "restaurant", label: "Kathiyawadi Dining", filterKey: "dining" },
      { icon: "chair", label: "Heritage Pavilion", filterKey: "vip seating" }
    ]
  },
  {
    id: "brooklyn",
    name: "Sayaji Garden Garba",
    city: "vadodara",
    isFeatured: false,
    rating: 4.7,
    price: 195,
    imageSrc: EVENT_IMAGES[2],
    amenities: [
      { icon: "family_restroom", label: "Family Zone", filterKey: "family zone" },
      { icon: "sports_bar", label: "Dandiya", filterKey: "dandiya" },
      { icon: "medical_services", label: "First Aid", filterKey: "first aid" }
    ]
  },
  {
    id: "champs",
    name: "Surat Dandiya Nights",
    city: "surat",
    isFeatured: true,
    featuredTag: "Dandiya Headliner",
    rating: 4.9,
    price: 420,
    description: "Surat's headline dandiya night pairs chart-topping folk fusion with a vast, brilliantly lit dance floor.",
    imageSrc: EVENT_IMAGES[3],
    amenities: [
      { icon: "music_note", label: "Folk Fusion Concert", filterKey: "live music" },
      { icon: "restaurant", label: "Surti Food Court", filterKey: "dining" },
      { icon: "chair", label: "VIP Deck", filterKey: "vip seating" }
    ]
  },
  {
    id: "montmartre",
    name: "Tapi River Raas",
    city: "surat",
    isFeatured: false,
    rating: 4.5,
    price: 160,
    imageSrc: EVENT_IMAGES[0],
    amenities: [
      { icon: "groups", label: "Traditional Raas", filterKey: "traditional garba" },
      { icon: "local_parking", label: "Free Parking", filterKey: "free parking" }
    ]
  },
  {
    id: "cleveland-arcade",
    name: "Rajkot Rang Utsav",
    city: "rajkot",
    isFeatured: true,
    featuredTag: "Saurashtra Special",
    rating: 4.8,
    price: 280,
    description: "A joyful Rajkot celebration built around Saurashtra folk rhythms, family garba circles, and vibrant local craft.",
    imageSrc: EVENT_IMAGES[1],
    amenities: [
      { icon: "music_note", label: "Saurashtra Folk Stage", filterKey: "live music" },
      { icon: "local_parking", label: "Free Parking", filterKey: "free parking" },
      { icon: "family_restroom", label: "Family Garba", filterKey: "family zone" },
      { icon: "restaurant", label: "Local Food Stalls", filterKey: "dining" }
    ]
  },
  {
    id: "cleveland-lakeside",
    name: "Race Course Dandiya",
    city: "rajkot",
    isFeatured: false,
    rating: 4.6,
    price: 195,
    description: "A spacious open-air dandiya arena near Race Course with energetic DJs and dedicated family circles.",
    imageSrc: EVENT_IMAGES[2],
    amenities: [
      { icon: "local_parking", label: "Free Parking", filterKey: "free parking" },
      { icon: "sports_bar", label: "Dandiya Arena", filterKey: "dandiya" },
      { icon: "family_restroom", label: "Family Zone", filterKey: "family zone" }
    ]
  },
  {
    id: "cleveland-downtown-inn",
    name: "Saurashtra Folk Nights",
    city: "rajkot",
    isFeatured: false,
    rating: 4.1,
    price: 130,
    description: "A value-friendly folk night celebrating regional garba songs and welcoming first-time dancers.",
    imageSrc: EVENT_IMAGES[3],
    amenities: [
      { icon: "groups", label: "Traditional Garba", filterKey: "traditional garba" },
      { icon: "medical_services", label: "First Aid", filterKey: "first aid" }
    ]
  },
  {
    id: "cleveland-flats-boutique",
    name: "Rangilo Rajkot Arena",
    city: "rajkot",
    isFeatured: false,
    rating: 4.3,
    price: 210,
    description: "A polished city arena with dramatic lighting, curated garba sets, and a comfortable VIP viewing deck.",
    imageSrc: EVENT_IMAGES[0],
    amenities: [
      { icon: "chair", label: "VIP Viewing Deck", filterKey: "vip seating" },
      { icon: "restaurant", label: "Food Court", filterKey: "dining" }
    ]
  },
  {
    id: "cleveland-rock-suites",
    name: "Garba No Groove",
    city: "rajkot",
    isFeatured: false,
    rating: 4.5,
    price: 340,
    description: "A contemporary garba concert where live percussion meets crowd-favourite dance tracks.",
    imageSrc: EVENT_IMAGES[1],
    amenities: [
      { icon: "music_note", label: "Live Percussion", filterKey: "live music" },
      { icon: "sports_bar", label: "Dandiya", filterKey: "dandiya" },
      { icon: "checkroom", label: "Costume Rental", filterKey: "costume rental" }
    ]
  }
];
