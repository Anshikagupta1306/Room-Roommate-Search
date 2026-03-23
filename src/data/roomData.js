export const roomData = [
  {
    id: 1,
    title: "Fully Furnished PG Room",
    city: "Delhi",
    price: 8000,
    type: "PG",
    occupancy: "Single",
    furnished: "Fully Furnished",

    availability: "Available", // Available | Occupied | Available From
    availableFrom: "2026-02-15",

    verifiedOwner: true,

    amenities: ["WiFi", "Meals", "Power Backup", "AC"],
    address: "Laxmi Nagar, Delhi",
    latitude: 28.6345,
    longitude: 77.2776,

    owner: {
      name: "Rahul Sharma",
      phone: "9876543210",
      email: "rahul.pg@gmail.com"
    },

    rating: 4.5,
    reviews: [
      {
        user: "Ankit Yadav",
        rating: 5,
        comment: "Very clean room and helpful owner."
      },
      {
        user: "Rohit Singh",
        rating: 4,
        comment: "Good location, food could be better."
      }
    ],

    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
      "https://images.unsplash.com/photo-1560185127-6a8c5a0a8c0a"
    ],

    description:
      "Comfortable PG room ideal for students and working professionals."
  }
];
