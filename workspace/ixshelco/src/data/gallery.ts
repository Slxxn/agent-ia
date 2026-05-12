export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  url: string;
}

export const galleryImages: GalleryImage[] = [
  { id: '1', title: 'Nail Art Marbrure', category: 'nail-art', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80' },
  { id: '2', title: 'Semi-Permanent Rose', category: 'semi-permanent', url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&q=80' },
  { id: '3', title: 'French Manucure', category: 'manucure', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80' },
  { id: '4', title: 'Nail Art Géométrique', category: 'nail-art', url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&q=80' },
  { id: '5', title: 'Ongles Nude', category: 'semi-permanent', url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&q=80' },
  { id: '6', title: 'Nail Art Floral', category: 'nail-art', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80' },
  { id: '7', title: 'Pose Gel Naturel', category: 'gel', url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&q=80' },
  { id: '8', title: 'Manucure Classique', category: 'manucure', url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&q=80' },
  { id: '9', title: 'Nail Art Ombré', category: 'nail-art', url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=800&q=80' },
];

export const galleryCategories = [
  { id: 'nail-art', name: 'Nail Art' },
  { id: 'semi-permanent', name: 'Semi-Permanent' },
  { id: 'manucure', name: 'Manucure' },
  { id: 'gel', name: 'Pose Gel' },
];

export default galleryImages;
