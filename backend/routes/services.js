import { Router } from 'express';

const router = Router();

// Mirrors the frontend catalog; move to DB when services become dynamic.
const services = [
  { id: 'plumbing', name: 'Plumbing', tagline: 'Leaks, taps, fittings & more', price: 149, unit: 'visit', rating: 4.8, jobs: '12k+', icon: 'wrench', variants: ['Tap & mixer repair', 'Leakage fix', 'Bathroom fittings', 'Water tank cleaning'] },
  { id: 'electrical', name: 'Electrical', tagline: 'Wiring, switches, fans & lights', price: 149, unit: 'visit', rating: 4.9, jobs: '15k+', icon: 'bolt', variants: ['Switch & socket repair', 'Fan installation', 'Inverter & wiring', 'MCB & fuse work'] },
  { id: 'cleaning', name: 'Home Cleaning', tagline: 'Deep cleaning, kitchen & bath', price: 499, unit: 'session', rating: 4.7, jobs: '20k+', icon: 'sparkles', variants: ['Full home deep clean', 'Kitchen deep clean', 'Bathroom deep clean', 'Sofa & carpet shampoo'] },
  { id: 'appliance', name: 'Appliance Repair', tagline: 'AC, fridge, washing machine', price: 299, unit: 'visit', rating: 4.8, jobs: '18k+', icon: 'plug', variants: ['AC service & repair', 'Refrigerator repair', 'Washing machine repair', 'Chimney & microwave'] },
  { id: 'painting', name: 'Painting', tagline: 'Walls, textures & waterproofing', price: 999, unit: 'room', rating: 4.6, jobs: '6k+', icon: 'roller', variants: ['Full home painting', 'Single room', 'Texture & stencil', 'Waterproofing'] },
  { id: 'carpentry', name: 'Carpentry', tagline: 'Furniture repair & fitting', price: 199, unit: 'visit', rating: 4.7, jobs: '9k+', icon: 'hammer', variants: ['Furniture repair', 'Door & lock fitting', 'Modular kitchen fix', 'Custom woodwork'] },
  { id: 'pest', name: 'Pest Control', tagline: 'Cockroach, termite & mosquito', price: 449, unit: 'session', rating: 4.6, jobs: '7k+', icon: 'shield', variants: ['Cockroach control', 'Termite treatment', 'Mosquito & fly control', 'Rodent control'] },
  { id: 'salon', name: 'Salon at Home', tagline: 'Haircut, facial & grooming', price: 299, unit: 'session', rating: 4.8, jobs: '11k+', icon: 'scissors', variants: ['Haircut & styling', 'Facial & cleanup', 'Waxing', 'Mani-pedi'] },
];

router.get('/', (req, res) => res.json({ ok: true, services }));

export default router;
