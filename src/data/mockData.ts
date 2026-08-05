import { Campaign, Group, Event, EducationalResource, UserProfile, NotificationItem } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr_guest',
  fullName: 'Guest Member',
  username: 'guest',
  email: '',
  phone: '',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
  coverUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000',
  bio: 'Community guest member',
  location: 'Kampala, Uganda',
  role: 'user',
  stats: {
    campaignsCount: 0,
    groupsCount: 0,
    eventsCount: 0,
    followersCount: 0,
  },
  verified: false,
  createdAt: new Date().toISOString(),
};

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp_001',
    ownerId: 'usr_001',
    ownerName: 'Civic Youth Action',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    ownerVerified: true,
    title: 'Wetland & Urban Drainage Cleanup Initiative',
    slug: 'wetland-urban-drainage-cleanup',
    summary: 'Mobilizing local residents to clear clogged drainage channels and prevent urban flooding before the rainy season.',
    description: 'Recurrent flash flooding in Bwaise and Kawempe damages homes and local markets. This community campaign aims to clear plastic waste, unblock channels, and install waste collection bins across 5 parishes.',
    category: 'Environment',
    coverUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000',
    location: 'Kampala, Uganda',
    isOnline: false,
    goalType: 'volunteers',
    goalValue: 500,
    currentValue: 340,
    unitLabel: 'volunteers',
    status: 'published',
    participantsCount: 340,
    publishedAt: '2026-07-20T10:00:00Z',
    isJoined: true,
    isBookmarked: true,
    goalsList: ['Clear 12km of drainage channels', 'Deploy 50 plastic segregation bins', 'Train 200 youth environmental ambassadors'],
  },
  {
    id: 'cmp_002',
    ownerId: 'usr_002',
    ownerName: 'David Ochieng',
    ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    ownerVerified: true,
    title: 'Primary School Digital Literacy Lab',
    slug: 'primary-school-digital-literacy-lab',
    summary: 'Equipping rural primary schools in Wakiso with solar-powered refurbished laptops and offline learning resources.',
    description: 'Digital access is vital for quality primary education. We are raising solar-powered laptop kits and training 15 teachers in digital pedagogy.',
    category: 'Education',
    coverUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1000',
    location: 'Wakiso, Uganda',
    isOnline: false,
    goalType: 'fundraising',
    goalValue: 20,
    currentValue: 14,
    unitLabel: 'solar laptops',
    status: 'published',
    participantsCount: 120,
    publishedAt: '2026-07-25T14:30:00Z',
    isJoined: false,
    isBookmarked: false,
    goalsList: ['Install 20 solar laptops', 'Provide teacher ICT training', 'Establish digital library'],
  },
  {
    id: 'cmp_003',
    ownerId: 'usr_003',
    ownerName: 'Grace Akello',
    ownerAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250',
    ownerVerified: true,
    title: 'Community Maternal Health & Nutrition Drive',
    slug: 'maternal-health-nutrition-drive',
    summary: 'Providing maternal health care packages, nutritional workshops, and health screenings for young mothers.',
    description: 'Ensuring safe deliveries and healthy infant development through community health worker visits and nutritional guidance.',
    category: 'Health',
    coverUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1000',
    location: 'Jinja, Uganda',
    isOnline: false,
    goalType: 'attendance',
    goalValue: 300,
    currentValue: 210,
    unitLabel: 'mothers reached',
    status: 'published',
    participantsCount: 210,
    publishedAt: '2026-08-01T09:00:00Z',
    isJoined: true,
    isBookmarked: false,
  },
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'grp_001',
    ownerId: 'usr_001',
    name: 'Eco-Champions Youth Network',
    description: 'Youth-led environmental action coalition driving plastic recycling, tree planting, and urban wetland conservation across Uganda.',
    category: 'Environment',
    coverUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1000',
    logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=250',
    visibility: 'public',
    location: 'Kampala, Uganda',
    memberCount: 148,
    isMember: true,
    membershipStatus: 'approved',
    createdAt: '2026-05-10T08:00:00Z',
    adminName: 'Civic Youth Action',
  },
  {
    id: 'grp_002',
    ownerId: 'usr_002',
    name: 'Civic Tech & Community Innovators',
    description: 'A collaborative forum connecting developers, civic advocates, and local leaders to build open digital tools for public accountability.',
    category: 'Youth',
    coverUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000',
    logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    visibility: 'public',
    location: 'Uganda',
    memberCount: 92,
    isMember: true,
    membershipStatus: 'approved',
    createdAt: '2026-06-01T10:00:00Z',
    adminName: 'David Ochieng',
  },
  {
    id: 'grp_003',
    ownerId: 'usr_003',
    name: 'Women Literacy & Leadership Circle',
    description: 'Peer support, micro-savings, and vocational skill development workshops for women community leaders.',
    category: 'Community support',
    coverUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000',
    logoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=250',
    visibility: 'public',
    location: 'Kampala, Uganda',
    memberCount: 230,
    isMember: false,
    membershipStatus: 'none',
    createdAt: '2026-04-18T12:00:00Z',
    adminName: 'Grace Akello',
  },
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt_001',
    organizerId: 'usr_001',
    organizerName: 'Civic Youth Action',
    title: 'Monthly Community Drainage Cleanup Drive',
    description: 'Hands-on Saturday morning cleanup drive in Bwaise. Gloves, gumboots, and waste disposal bags will be provided to all volunteers.',
    category: 'Environment',
    coverUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=1000',
    venue: 'Bwaise Community Playgrounds',
    isOnline: false,
    startTime: '2026-08-15T08:00:00Z',
    endTime: '2026-08-15T12:00:00Z',
    capacity: 100,
    registeredCount: 64,
    isRegistered: true,
  },
  {
    id: 'evt_002',
    organizerId: 'usr_002',
    organizerName: 'David Ochieng',
    title: 'Youth Civic Leadership & Ethics Workshop',
    description: 'Interactive workshop on transparent campaign organization, public speaking, and engaging local government leaders effectively.',
    category: 'Youth',
    coverUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000',
    venue: 'Centenary Park Conference Centre',
    isOnline: true,
    startTime: '2026-08-20T14:00:00Z',
    endTime: '2026-08-20T17:00:00Z',
    capacity: 200,
    registeredCount: 112,
    isRegistered: false,
  },
];

export const INITIAL_RESOURCES: EducationalResource[] = [
  {
    id: 'res_001',
    title: 'Handbook for Lawful Community Advocacy & Campaign Organization',
    category: 'Human Rights',
    summary: 'A step-by-step practical guide on setting up lawful petitions, organizing peaceful community gatherings, and engaging local council leaders.',
    content: `## Principles of Lawful Civic Advocacy

Civic participation is most effective when conducted with clarity, lawfulness, and mutual respect.

### 1. Identifying Core Community Issues
- Define the problem clearly using objective evidence.
- Gather input from diverse parish residents.
- Ensure the issue respects local laws and anti-discrimination standards.

### 2. Building a Coalition
- Engage faith leaders, youth clubs, and local council representatives (LC1/LC2).
- Establish clear guidelines on respectful communication.

### 3. Submitting Petitions & Formal Letters
- Format petition headers clearly stating the exact request.
- Ensure all signers provide verifiable name and parish location.
- Schedule formal presentation meetings with relevant authorities.`,
    author: 'Uganda Civil Society Development Forum',
    readTimeMinutes: 8,
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-04-10T00:00:00Z',
    tags: ['Advocacy', 'Civic Rights', 'Petitions', 'Leadership'],
  },
  {
    id: 'res_002',
    title: 'Community Environmental Sanitation & Waste Management Guide',
    category: 'Environment',
    summary: 'Best practices for organizing neighborhood plastic recycling, composting organic waste, and protecting local natural water sources.',
    content: `## Sustainable Community Sanitation Practices

A healthy environment begins at the household and parish level.

### Key Focus Areas:
1. **Source Separation**: Separating plastics, glass, and organic waste.
2. **Community Composting**: Converting organic market waste into valuable agricultural compost for local farmers.
3. **Drainage Care**: Keeping storm channels clear from silt and plastic blockage before rainy seasons.`,
    author: 'National Environmental Management Network',
    readTimeMinutes: 6,
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-05-18T00:00:00Z',
    tags: ['Sanitation', 'Environment', 'Recycling', 'Health'],
  },
  {
    id: 'res_003',
    title: 'Youth Leadership & Ethical Governance Training Module',
    category: 'Youth',
    summary: 'Interactive learning module on transparent project management, integrity in volunteer work, and inclusive decision making.',
    content: `## Foundations of Ethical Leadership

Youth leaders are the driving force behind long-term community transformation.

### Core Values:
- **Transparency**: Open financial tracking and public reporting.
- **Inclusivity**: Ensuring equal voice for women, youth, and persons with disabilities.
- **Accountability**: Fulfilling campaign commitments systematically.`,
    author: 'Civic Values Institute',
    readTimeMinutes: 10,
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    publishedAt: '2026-06-22T00:00:00Z',
    tags: ['Youth', 'Ethics', 'Governance', 'Leadership'],
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_001',
    userId: 'usr_001',
    type: 'campaign',
    title: 'Cleanup Campaign Milestone!',
    message: 'Your campaign "Clean Urban Drainage" reached 340 volunteer signups!',
    resourceType: 'campaign',
    resourceId: 'cmp_001',
    readAt: undefined,
    createdAt: '2026-08-04T10:15:00Z',
  },
  {
    id: 'notif_002',
    userId: 'usr_001',
    type: 'event',
    title: 'Upcoming Event Reminder',
    message: 'Monthly Community Drainage Cleanup takes place this Saturday at 08:00 AM.',
    resourceType: 'event',
    resourceId: 'evt_001',
    readAt: undefined,
    createdAt: '2026-08-03T16:00:00Z',
  },
  {
    id: 'notif_003',
    userId: 'usr_001',
    type: 'group',
    title: 'New Discussion in Eco-Champions',
    message: 'David posted an update regarding plastic recycling drop-off centers.',
    resourceType: 'group',
    resourceId: 'grp_001',
    readAt: '2026-08-02T12:00:00Z',
    createdAt: '2026-08-02T11:30:00Z',
  },
];
