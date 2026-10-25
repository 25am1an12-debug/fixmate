// Service catalog — swap with backend response later via mockApi.getServices()
export const services = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    tagline: 'Leaks, taps, fittings & more',
    price: 149,
    unit: 'visit',
    rating: 4.8,
    jobs: '12k+',
    reviews: 2847,
    badge: 'Most Booked',
    image: 'https://images.pexels.com/photos/32588548/pexels-photo-32588548/free-photo-of-plumber-repairing-pipe-with-wrench-indoors.jpeg?cs=tinysrgb&dpr=1&w=500',
    icon: 'wrench',
    variants: ['Tap & mixer repair', 'Leakage fix', 'Bathroom fittings', 'Water tank cleaning'],
  },
  {
    id: 'electrical',
    name: 'Electrical',
    tagline: 'Wiring, switches, fans & lights',
    price: 149,
    unit: 'visit',
    rating: 4.9,
    jobs: '15k+',
    reviews: 3210,
    badge: 'Popular',
    image: 'https://images.pexels.com/photos/34054464/pexels-photo-34054464/free-photo-of-electrician-diagnosing-electrical-panel-with-multimeter.jpeg?cs=tinysrgb&dpr=1&w=500',
    icon: 'bolt',
    variants: ['Switch & socket repair', 'Fan installation', 'Inverter & wiring', 'MCB & fuse work'],
  },
  {
    id: 'cleaning',
    name: 'Home Cleaning',
    tagline: 'Deep cleaning, kitchen & bath',
    price: 499,
    unit: 'session',
    rating: 4.7,
    jobs: '20k+',
    reviews: 4102,
    badge: 'Verified Pros',
    image: 'https://images.pexels.com/photos/6195274/pexels-photo-6195274.jpeg?cs=tinysrgb&dpr=1&w=500',
    icon: 'sparkles',
    variants: ['Full home deep clean', 'Kitchen deep clean', 'Bathroom deep clean', 'Sofa & carpet shampoo'],
  },
  {
    id: 'appliance',
    name: 'Appliance Repair',
    tagline: 'AC, fridge, washing machine',
    price: 299,
    unit: 'visit',
    rating: 4.8,
    jobs: '18k+',
    reviews: 3560,
    badge: 'Fast Assign',
    image: 'https://images.pexels.com/photos/34734504/pexels-photo-34734504/free-photo-of-technician-repairing-home-appliance-indoors.jpeg?cs=tinysrgb&dpr=1&w=500',
    icon: 'plug',
    variants: ['AC service & repair', 'Refrigerator repair', 'Washing machine repair', 'Chimney & microwave'],
  },
  {
    id: 'painting',
    name: 'Painting',
    tagline: 'Walls, textures & waterproofing',
    price: 999,
    unit: 'room',
    rating: 4.6,
    jobs: '6k+',
    reviews: 1280,
    badge: 'Verified Pros',
    image: 'https://images.pexels.com/photos/6764282/pexels-photo-6764282.jpeg?cs=tinysrgb&dpr=1&w=500',
    icon: 'roller',
    variants: ['Full home painting', 'Single room', 'Texture & stencil', 'Waterproofing'],
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    tagline: 'Furniture repair & fitting',
    price: 199,
    unit: 'visit',
    rating: 4.7,
    jobs: '9k+',
    reviews: 1945,
    badge: 'Fast Assign',
    image: 'https://images.pexels.com/photos/37178416/pexels-photo-37178416/free-photo-of-carpenter-measuring-wooden-plank-in-workshop.jpeg?cs=tinysrgb&dpr=1&w=500',
    icon: 'hammer',
    variants: ['Furniture repair', 'Door & lock fitting', 'Modular kitchen fix', 'Custom woodwork'],
  },
  {
    id: 'pest',
    name: 'Pest Control',
    tagline: 'Cockroach, termite & mosquito',
    price: 449,
    unit: 'session',
    rating: 4.6,
    jobs: '7k+',
    reviews: 1670,
    badge: 'Popular',
    image: 'https://images.pexels.com/photos/32055757/pexels-photo-32055757/free-photo-of-professional-fumigation-in-warehouse-setting.jpeg?cs=tinysrgb&dpr=1&w=500',
    icon: 'shield',
    variants: ['Cockroach control', 'Termite treatment', 'Mosquito & fly control', 'Rodent control'],
  },
  {
    id: 'salon',
    name: 'Salon at Home',
    tagline: 'Haircut, facial & grooming',
    price: 299,
    unit: 'session',
    rating: 4.8,
    jobs: '11k+',
    reviews: 2215,
    badge: 'Most Booked',
    image: 'https://images.pexels.com/photos/8867400/pexels-photo-8867400.jpeg?cs=tinysrgb&dpr=1&w=500',
    icon: 'scissors',
    variants: ['Haircut & styling', 'Facial & cleanup', 'Waxing', 'Mani-pedi'],
  },
];

export const timeSlots = [
  '09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '07:00 PM',
];

// Next 7 days for booking
export function nextDays(count = 7) {
  const days = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d);
  }
  return days;
}
