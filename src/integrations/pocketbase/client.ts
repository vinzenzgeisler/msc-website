import PocketBase, { RecordModel } from 'pocketbase';

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL || 'https://backend.msc-oberlausitz.de';

export const pb = new PocketBase(pocketbaseUrl);
pb.autoCancellation(false);

export async function listAllRecords<T = RecordModel>(collectionName: string): Promise<T[]> {
  const perPage = 200;
  let page = 1;
  let items: T[] = [];

  while (true) {
    const result = await pb.collection(collectionName).getList<T>(page, perPage);
    items = items.concat(result.items);

    if (page >= result.totalPages || result.items.length === 0) {
      break;
    }

    page += 1;
  }

  return items;
}

export type UserRole = 'super_admin' | 'admin' | 'editor';

export interface Profile {
  user_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  category: string | null;
  image_url: string | null;
  status: 'draft' | 'published';
  author_id: string | null;
  published_at: string | null;
  display_date: string | null;
  locale: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  start_dt: string;
  end_dt: string | null;
  location: string | null;
  locale: string;
  is_main_event: boolean;
  contact_email: string | null;
  registration_url: string | null;
  detail_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  tier: 'main' | 'partner' | 'supporter';
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface PartnerClub {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  website: string | null;
  logo_url: string | null;
  active: boolean;
  sort_order: number;
  locale: string;
  created_at: string;
}

export interface Download {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  category: string | null;
  created_at: string;
}

export interface MediaAlbum {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  images: string[];
  locale: string;
  created_at: string;
}

export interface MediaFile {
  id: string;
  album_id: string | null;
  file_url: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  alt_text: string | null;
  created_at: string;
}

export interface EventScheduleEntry {
  id?: string;
  time: string;
  title: string;
  category?: string;
}

export interface EventSchedule {
  id: string;
  event: string;
  day_label: string;
  day_number: number;
  entries: EventScheduleEntry[];
  locale: string;
}

export interface StructuredEventScheduleEntry {
  id: string;
  event: string;
  schedule_day: string;
  time_label: string;
  title: string;
  sort_order: number;
  locale: string;
}

export interface EventInfo {
  id: string;
  event: string;
  section: string;
  title: string;
  content: string | null;
  sort_order: number;
  locale: string;
}

export interface ParticipantClass {
  id: string;
  event: string;
  name: string;
  description: string | null;
  icon: 'bike' | 'car' | 'users';
  sort_order: number;
  locale: string;
}

export interface EventArchive {
  id: string;
  title: string;
  year: number;
  description: string | null;
  album_id: string | null;
  sort_order: number;
  locale: string;
  created_at: string;
}

export function mapEventArchiveRecord(record: RecordModel): EventArchive {
  return {
    id: record.id,
    title: record.title,
    year: Number(record.year || 0),
    description: record.description || null,
    album_id: record.albumId || null,
    sort_order: Number(record.sortOrder || 0),
    locale: record.locale || 'de',
    created_at: record.created,
  };
}

export interface HistoryTimelineEntry {
  id: string;
  year_label: string;
  title: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  locale: string;
}

export interface MembershipBenefit {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  sort_order: number;
  locale: string;
}

export interface MembershipStep {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  locale: string;
}

export interface DisciplineHighlight {
  id: string;
  discipline_key: 'motocross' | 'trial' | 'touring';
  title: string;
  description: string | null;
  icon: string;
  sort_order: number;
  locale: string;
}

export interface SiteSettings {
  id?: string;
  site_name: string;
  site_short_name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  facebook_url: string;
  instagram_url: string;
  contact_map_embed_url: string;
  contact_map_link: string;
  contact_map_label: string;
  sponsoring_email: string;
  meta_title: string;
  meta_description: string;
  logo_url: string | null;
  logo_alt: string;
  default_og_image_url: string | null;
  founding_year: number | null;
  member_count: string;
  section_count: string;
  member_count_label: string;
  tradition_years_label: string;
  section_count_label: string;
}

export function buildSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getFileUrl(record: RecordModel, fieldName: string, fileName?: string | null) {
  const candidate = fileName ?? record[fieldName];
  if (!candidate || typeof candidate !== 'string') return null;
  return pb.files.getURL(record, candidate);
}

export function mapProfileRecord(record: RecordModel): Profile {
  return {
    user_id: record.id,
    email: record.email,
    full_name: record.name || null,
    role: record.role as UserRole,
    is_active: Boolean(record.isActive ?? true),
    created_at: record.created,
    updated_at: record.updated,
  };
}

export function mapPostRecord(record: RecordModel): Post {
  const createdAt = record.created || record.createdAt || record.created_at || null;
  const updatedAt = record.updated || record.updatedAt || record.updated_at || null;
  const publishedAt = record.publishedAt || record.published_at || null;
  const displayDate = publishedAt || createdAt || updatedAt || null;

  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    content: record.content || null,
    excerpt: record.excerpt || null,
    category: record.category || null,
    image_url: getFileUrl(record, 'image'),
    status: record.published ? 'published' : 'draft',
    author_id: null,
    published_at: publishedAt,
    display_date: displayDate,
    locale: record.locale,
    is_pinned: Boolean(record.isPinned),
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

export function mapCalendarEventRecord(record: RecordModel): CalendarEvent {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    description: record.description || null,
    category: record.category || null,
    start_dt: record.startDt,
    end_dt: record.endDt || null,
    location: record.location || null,
    locale: record.locale,
    is_main_event: Boolean(record.isMainEvent),
    contact_email: record.contactEmail || null,
    registration_url: record.registrationUrl || null,
    detail_url: record.detailUrl || null,
    published: Boolean(record.published),
    created_at: record.created,
    updated_at: record.updated,
  };
}

export function mapSponsorRecord(record: RecordModel): Sponsor {
  return {
    id: record.id,
    name: record.name,
    logo_url: getFileUrl(record, 'logo'),
    website: record.website || null,
    tier: record.tier,
    active: Boolean(record.active),
    sort_order: Number(record.sortOrder || 0),
    created_at: record.created,
  };
}

export function mapPartnerClubRecord(record: RecordModel): PartnerClub {
  return {
    id: record.id,
    name: record.name,
    description: record.description || null,
    location: record.location || null,
    website: record.website || null,
    logo_url: getFileUrl(record, 'logo'),
    active: Boolean(record.active),
    sort_order: Number(record.sortOrder || 0),
    locale: record.locale || 'de',
    created_at: record.created,
  };
}

export function mapDownloadRecord(record: RecordModel): Download {
  const fileName = record.file || null;

  return {
    id: record.id,
    title: record.title,
    description: record.description || null,
    file_url: getFileUrl(record, 'file') || '',
    file_type: typeof fileName === 'string' && fileName.includes('.') ? fileName.split('.').pop() || null : null,
    file_size: null,
    category: record.category || null,
    created_at: record.created,
  };
}

export function mapMediaAlbumRecord(record: RecordModel): MediaAlbum {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    description: record.description || null,
    cover_image_url: getFileUrl(record, 'coverImage'),
    images: Array.isArray(record.images) ? record.images : [],
    locale: record.locale || 'de',
    created_at: record.created,
  };
}

export function flattenMediaFiles(record: RecordModel): MediaFile[] {
  const images = Array.isArray(record.images) ? record.images : [];

  return images.map((fileName: string) => ({
    id: `${record.id}:${fileName}`,
    album_id: record.id,
    file_url: pb.files.getURL(record, fileName),
    file_name: fileName,
    file_type: fileName.includes('.') ? fileName.split('.').pop() || null : null,
    file_size: null,
    alt_text: record.title || null,
    created_at: record.created,
  }));
}

export function mapEventScheduleRecord(record: RecordModel): EventSchedule {
  return {
    id: record.id,
    event: record.event,
    day_label: record.dayLabel,
    day_number: Number(record.dayNumber || 0),
    entries: Array.isArray(record.entries) ? record.entries : [],
    locale: record.locale,
  };
}

export function mapStructuredEventScheduleEntryRecord(record: RecordModel): StructuredEventScheduleEntry {
  return {
    id: record.id,
    event: record.event,
    schedule_day: record.scheduleDay,
    time_label: record.timeLabel,
    title: record.title,
    sort_order: Number(record.sortOrder || 0),
    locale: record.locale || 'de',
  };
}

export function mapEventInfoRecord(record: RecordModel): EventInfo {
  return {
    id: record.id,
    event: record.event,
    section: record.section,
    title: record.title,
    content: record.content || null,
    sort_order: Number(record.sortOrder || 0),
    locale: record.locale,
  };
}

export function mapParticipantClassRecord(record: RecordModel): ParticipantClass {
  return {
    id: record.id,
    event: record.event,
    name: record.name,
    description: record.description || null,
    icon: record.icon,
    sort_order: Number(record.sortOrder || 0),
    locale: record.locale,
  };
}

export function mapHistoryTimelineEntryRecord(record: RecordModel): HistoryTimelineEntry {
  return {
    id: record.id,
    year_label: record.yearLabel,
    title: record.title,
    description: record.description || null,
    image_url: getFileUrl(record, 'image'),
    sort_order: Number(record.sortOrder || 0),
    locale: record.locale || 'de',
  };
}

export function mapMembershipBenefitRecord(record: RecordModel): MembershipBenefit {
  return {
    id: record.id,
    title: record.title,
    description: record.description || null,
    icon: record.icon,
    sort_order: Number(record.sortOrder || 0),
    locale: record.locale || 'de',
  };
}

export function mapMembershipStepRecord(record: RecordModel): MembershipStep {
  return {
    id: record.id,
    title: record.title,
    description: record.description || null,
    sort_order: Number(record.sortOrder || 0),
    locale: record.locale || 'de',
  };
}

export function mapDisciplineHighlightRecord(record: RecordModel): DisciplineHighlight {
  return {
    id: record.id,
    discipline_key: record.disciplineKey,
    title: record.title,
    description: record.description || null,
    icon: record.icon,
    sort_order: Number(record.sortOrder || 0),
    locale: record.locale || 'de',
  };
}

export function mapSiteSettingsRecord(record: RecordModel): SiteSettings {
  return {
    id: record.id,
    site_name: record.siteName || '',
    site_short_name: record.siteShortName || '',
    description: record.description || '',
    contact_email: record.contactEmail || '',
    contact_phone: record.contactPhone || '',
    address: record.address || '',
    facebook_url: record.facebookUrl || '',
    instagram_url: record.instagramUrl || '',
    contact_map_embed_url: record.contactMapEmbedUrl || '',
    contact_map_link: record.contactMapLink || '',
    contact_map_label: record.contactMapLabel || '',
    sponsoring_email: record.sponsoringEmail || '',
    meta_title: record.metaTitle || '',
    meta_description: record.metaDescription || '',
    logo_url: getFileUrl(record, 'logo'),
    logo_alt: record.logoAlt || '',
    default_og_image_url: getFileUrl(record, 'defaultOgImage'),
    founding_year: typeof record.foundingYear === 'number' ? record.foundingYear : record.foundingYear ? Number(record.foundingYear) : null,
    member_count: record.memberCount || '',
    section_count: record.sectionCount || '',
    member_count_label: record.memberCountLabel || '',
    tradition_years_label: record.traditionYearsLabel || '',
    section_count_label: record.sectionCountLabel || '',
  };
}
