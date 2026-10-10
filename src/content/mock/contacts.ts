import { Contact } from '../types';

// MOCK DATA — placeholder contacts. Keys double as avatar names (src/assets/characters/<key>.png).
const contacts: Record<string, Contact> = {
  // Adam's phone
  wife: { name: 'Partner', number: '5550101' },
  colleague: { name: 'Colleague', number: '5550102' },
  unknown: { name: 'Unknown', number: '5550100', private: true },
  techyonic: { name: 'Support', number: 'support@example.com' },
  // Zoey's phone
  zoey: { name: 'Zoey', number: '5550200' },
  zoeysmom: { name: 'Mom', number: '5550201' },
  zoeysdad: { name: 'Dad', number: '5550202' },
  lily: { name: 'Best Friend', number: '5550203' },
  betty: { name: 'Friend A', number: '5550204' },
  kyle: { name: 'Friend B', number: '5550205' },
  besties: { name: 'Group Chat', number: '', group: { members: ['lily', 'betty', 'kyle'] } },
};

export default contacts;
