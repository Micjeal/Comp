/**
 * CommunityConnect Types Definitions
 * Aligned with Master Blueprint & Backend Schema
 */

export type UserRole = 'user' | 'leader' | 'organizer' | 'moderator' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  coverUrl?: string;
  bio: string;
  location: string;
  role: UserRole;
  stats: {
    campaignsCount: number;
    groupsCount: number;
    eventsCount: number;
    followersCount: number;
  };
  verified: boolean;
  createdAt: string;
}

export type CampaignCategory =
  | 'Education'
  | 'Environment'
  | 'Health'
  | 'Youth'
  | 'Community support'
  | 'Culture'
  | 'Volunteering'
  | 'Human Rights';

export type GoalType = 'signatures' | 'volunteers' | 'attendance' | 'fundraising' | 'awareness';

export type CampaignStatus = 'draft' | 'under_review' | 'published' | 'paused' | 'completed' | 'rejected';

export interface Campaign {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerVerified?: boolean;
  organizerName?: string;
  organizerAvatar?: string;
  organizerVerified?: boolean;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: CampaignCategory;
  coverUrl: string;
  location: string;
  isOnline: boolean;
  goalType: GoalType;
  goalValue: number;
  currentValue: number;
  unitLabel?: string; // e.g., 'UGX', 'signatures', 'volunteers'
  status: CampaignStatus;
  participantsCount: number;
  publishedAt: string;
  deadline?: string;
  updates?: CampaignUpdate[];
  goalsList?: string[];
  isJoined?: boolean;
  isBookmarked?: boolean;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorAvatar: string;
}

export interface Group {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: CampaignCategory;
  coverUrl: string;
  logoUrl: string;
  visibility: 'public' | 'private';
  location: string;
  memberCount: number;
  isMember?: boolean;
  membershipStatus?: 'approved' | 'pending' | 'none';
  createdAt: string;
  adminName: string;
}

export interface DiscussionPost {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole?: string;
  body: string;
  mediaUrl?: string;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Event {
  id: string;
  groupId?: string;
  campaignId?: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar?: string;
  title: string;
  description: string;
  category: CampaignCategory;
  coverUrl: string;
  venue: string;
  latitude?: number;
  longitude?: number;
  isOnline: boolean;
  startTime: string;
  endTime: string;
  capacity?: number;
  registeredCount: number;
  isRegistered?: boolean;
  agenda?: { time: string; activity: string }[];
}

export interface EducationalResource {
  id: string;
  title: string;
  category: CampaignCategory;
  summary: string;
  content: string;
  author: string;
  readTimeMinutes: number;
  imageUrl: string;
  downloadUrl?: string;
  publishedAt: string;
  tags: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'campaign' | 'group' | 'event' | 'system' | 'report';
  title: string;
  message: string;
  resourceType?: 'campaign' | 'group' | 'event' | 'resource';
  resourceId?: string;
  readAt?: string;
  createdAt: string;
}

export interface ReportPayload {
  resourceType: 'campaign' | 'group' | 'event' | 'post' | 'user';
  resourceId: string;
  reason:
    | 'Harassment or bullying'
    | 'Hate or discriminatory content'
    | 'Threats or violence'
    | 'False or misleading information'
    | 'Spam'
    | 'Privacy violation'
    | 'Other';
  details?: string;
}

export interface ApiGatewayResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, any>;
}
