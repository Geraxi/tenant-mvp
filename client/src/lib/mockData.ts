export interface Property {
  id: string;
  title: string;
  city: string;
  area: string;
  price: number;
  image: string;
  images: string[];
  type: string;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  pets: boolean;
  description: string;
}

export interface TenantProfile {
  id: string;
  name: string;
  age: number;
  budget: number;
  image: string;
  images: string[];
  bio: string;
  occupation: string;
  moveInDate: string;
  preferences: string[];
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Modern Loft in Downtown",
    city: "Milano",
    area: "Navigli",
    price: 1200,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
    ],
    type: "Apartment",
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
    pets: true,
    description: "Beautiful open space loft in the heart of Navigli. High ceilings, industrial style, and a private balcony."
  },
  {
    id: "2",
    title: "Sunny Two-Bedroom",
    city: "Roma",
    area: "Trastevere",
    price: 1500,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80"
    ],
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 1,
    furnished: false,
    pets: false,
    description: "Charming apartment in a historic building. Great light, quiet street, close to all amenities."
  },
  {
    id: "3",
    title: "Cozy Studio near University",
    city: "Bologna",
    area: "Centro",
    price: 750,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da97ee87?auto=format&fit=crop&w=800&q=80"
    ],
    type: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    furnished: true,
    pets: false,
    description: "Perfect for students. Compact, efficient, and right next to the university campus."
  },
  {
    id: "4",
    title: "Luxury Penthouse with View",
    city: "Milano",
    area: "City Life",
    price: 3500,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513584685908-78720f82cd82?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80"
    ],
    type: "Penthouse",
    bedrooms: 3,
    bathrooms: 2,
    furnished: true,
    pets: true,
    description: "Exclusive penthouse with panoramic views of the city skyline. Concierge service, gym, and parking included."
  }
];

export const mockTenants: TenantProfile[] = [
  {
    id: "t1",
    name: "Giulia",
    age: 26,
    budget: 900,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
    ],
    bio: "Graphic designer looking for a bright studio. I'm quiet, tidy, and love plants!",
    occupation: "Designer",
    moveInDate: "Oct 1",
    preferences: ["No pets", "Non-smoker", "Central"]
  },
  {
    id: "t2",
    name: "Marco",
    age: 30,
    budget: 1300,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
    ],
    bio: "Software engineer moving to the city for work. Looking for a modern 1-bedroom.",
    occupation: "Developer",
    moveInDate: "ASAP",
    preferences: ["Parking", "Fiber internet"]
  },
  {
    id: "t3",
    name: "Elena & Tom",
    age: 28,
    budget: 1600,
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
    images: [
       "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
       "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"
    ],
    bio: "Young couple looking for our first shared home. We both work in marketing.",
    occupation: "Marketing",
    moveInDate: "Nov 1",
    preferences: ["Balcony", "Pet friendly"]
  }
];

export const mockRoommates: TenantProfile[] = [
  {
    id: "r1",
    name: "Alessandro",
    age: 24,
    budget: 600,
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80"
    ],
    bio: "Student at Politecnico. Looking for a single room. I'm chill and like to cook.",
    occupation: "Student",
    moveInDate: "Sept 1",
    preferences: ["Student friendly", "Near Metro"]
  },
  {
    id: "r2",
    name: "Sara",
    age: 27,
    budget: 750,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"
    ],
    bio: "Working professional. Looking for a double room in a shared apartment.",
    occupation: "Architect",
    moveInDate: "Oct 15",
    preferences: ["Female only", "Balcony"]
  },
  {
    id: "r3",
    name: "Davide",
    age: 29,
    budget: 800,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=800&q=80"
    ],
    bio: "Photographer. I travel a lot. Looking for a friendly environment.",
    occupation: "Photographer",
    moveInDate: "ASAP",
    preferences: ["Flexible", "Artist friendly"]
  }
];
