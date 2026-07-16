export type AttendanceStatus = 'hadir' | 'tidak_hadir' | 'ragu';
export type WeddingStatus = 'draft' | 'published';

export interface CoupleProfile {
  id: string;
  role: 'groom' | 'bride';
  fullName: string;
  nickname: string;
  parentNames: string;
  photoUrl: string;
  instagramUrl?: string;
  description: string;
  sortOrder: number;
}

export interface WeddingEvent {
  id: string;
  eventType: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  venueName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  dressCode?: string;
  notes?: string;
  sortOrder: number;
}

export interface LoveStoryItem {
  id: string;
  title: string;
  story: string;
  date: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  cloudinaryPublicId?: string;
  caption?: string;
  altText: string;
  featured?: boolean;
  orientation?: 'horizontal' | 'vertical';
  sortOrder: number;
}

export interface GiftAccount {
  id: string;
  giftType: 'bank' | 'qris' | 'shipping';
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  qrisUrl?: string;
  shippingAddress?: string;
  sortOrder: number;
}

export interface GuestRecord {
  id: string;
  name: string;
  greeting: string;
  phone: string;
  group: string;
  invitationQuota: number;
  slug: string;
  token: string;
  invitationStatus: 'belum_dikirim' | 'sudah_dikirim';
  rsvpStatus: AttendanceStatus | 'belum';
  notes?: string;
  firstOpenedAt?: string;
  lastOpenedAt?: string;
}


export interface RsvpRecord {
  id: string;
  guestId?: string;
  guestName: string;
  attendanceStatus: AttendanceStatus;
  guestCount: number;
  phone?: string;
  message?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GuestMessage {
  id: string;
  guestName: string;
  message: string;
  attendanceStatus: AttendanceStatus;
  approved: boolean;
  createdAt: string;
}

export type LayoutPresetId =
  | 'cinematic-editorial'
  | 'classic-invitation'
  | 'storytelling-journey'
  | 'modern-minimal'
  | 'cultural-heritage';

export type CoverStyle = 'curtain' | 'envelope' | 'door' | 'paper' | 'floral';
export type NavigationStyle =
  'floating-dock' | 'top-bar' | 'side-dots' | 'menu-button' | 'minimal';
export type GalleryStyle =
  'masonry' | 'classic-grid' | 'polaroid' | 'filmstrip' | 'slideshow';
export type StoryStyle =
  'cinematic' | 'vertical' | 'zigzag' | 'polaroid' | 'scrapbook';

export type ThemePresetId =
  | 'luxury-gold'
  | 'modern-botanical'
  | 'elegant-nusantara'
  | 'romantic-blush'
  | 'midnight-silver'
  | 'ivory-minimal';

export interface ThemeConfig {
  preset: ThemePresetId;
  layoutPreset: LayoutPresetId;
  coverStyle: CoverStyle;
  navigationStyle: NavigationStyle;
  galleryStyle: GalleryStyle;
  storyStyle: StoryStyle;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  surface: string;
  muted: string;
  headingFont: string;
  bodyFont: string;
  mode: 'light' | 'dark';
  animationIntensity: 'low' | 'medium' | 'high';
  layoutStyle: 'editorial' | 'botanical' | 'heritage' | 'classic' | 'minimal';
  ornamentStyle:
    'gold-lines' | 'botanical' | 'batik' | 'floral' | 'geometric' | 'minimal';
  heroStyle: 'cinematic' | 'split' | 'royal' | 'soft';
  surfaceStyle: 'glass' | 'paper' | 'clean';
  cornerStyle: 'soft' | 'round' | 'classic';
}

export interface WeddingContent {
  id: string;
  slug: string;
  title: string;
  status: WeddingStatus;
  groomName: string;
  brideName: string;
  eventDate: string;
  timezone: string;
  quote: string;
  thankYouMessage: string;
  pastEventMessage: string;
  heroImageUrl: string;
  couples: CoupleProfile[];
  events: WeddingEvent[];
  loveStories: LoveStoryItem[];
  media: MediaItem[];
  gifts: GiftAccount[];
  guests: GuestRecord[];
  rsvps?: RsvpRecord[];
  messages: GuestMessage[];
  musicUrl: string;
  musicTitle: string;
  videoUrl: string;
  videoPosterUrl: string;
  theme: ThemeConfig;
  whatsappTemplate: string;
  seo: {
    title: string;
    description: string;
    imageUrl: string;
  };
}
