import { pgTable, text, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  summary: text('summary').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  isOnline: boolean('is_online').default(false).notNull(),
  coverUrl: text('cover_url').notNull(),
  goalType: text('goal_type').notNull(),
  goalValue: integer('goal_value').notNull(),
  currentValue: integer('current_value').default(0).notNull(),
  unitLabel: text('unit_label').notNull(),
  organizerName: text('organizer_name').notNull(),
  organizerAvatar: text('organizer_avatar').notNull(),
  organizerVerified: boolean('organizer_verified').default(false).notNull(),
  status: text('status').default('active').notNull(),
  createdAt: text('created_at').notNull(),
  updates: jsonb('updates').default([]).notNull(),
  endorsements: integer('endorsements').default(0).notNull(),
});

export const groups = pgTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  visibility: text('visibility').default('public').notNull(),
  memberCount: integer('member_count').default(1).notNull(),
  activeDiscussions: integer('active_discussions').default(0).notNull(),
  coverUrl: text('cover_url').notNull(),
  createdAt: text('created_at').notNull(),
  isJoined: boolean('is_joined').default(false).notNull(),
});

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  campaignId: text('campaign_id'),
  category: text('category').notNull(),
  description: text('description').notNull(),
  venue: text('venue').notNull(),
  isOnline: boolean('is_online').default(false).notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  capacity: integer('capacity').default(100).notNull(),
  attendeeCount: integer('attendee_count').default(1).notNull(),
  coverUrl: text('cover_url').notNull(),
  organizerName: text('organizer_name').notNull(),
  isRegistered: boolean('is_registered').default(false).notNull(),
});

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  groupId: text('group_id').notNull(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name').notNull(),
  authorAvatar: text('author_avatar').notNull(),
  authorRole: text('author_role').notNull(),
  body: text('body').notNull(),
  mediaUrl: text('media_url'),
  likeCount: integer('like_count').default(0).notNull(),
  commentCount: integer('comment_count').default(0).notNull(),
  isLiked: boolean('is_liked').default(false).notNull(),
  createdAt: text('created_at').notNull(),
});

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull(),
  authorName: text('author_name').notNull(),
  authorAvatar: text('author_avatar').notNull(),
  body: text('body').notNull(),
  createdAt: text('created_at').notNull(),
});
