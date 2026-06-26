/**
 * Database Seed Script
 * 
 * Populates MongoDB with dummy data for development and testing
 * 
 * Run with: npx tsx scripts/seed-database.ts
 */

import { connectDB, disconnectDB } from '../lib/mongodb';
import { User } from '../lib/models/User';
import { Activity } from '../lib/models/Activity';

const dummyUsers = [
  {
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    phoneNumber: '+1 (555) 123-4567',
    role: 'Admin' as const,
    status: 'active' as const,
    registrationDate: new Date('2024-01-15T10:30:00Z'),
    lastLoginDate: new Date('2024-03-20T14:45:00Z'),
  },
  {
    email: 'jane.smith@example.com',
    fullName: 'Jane Smith',
    phoneNumber: '+1 (555) 234-5678',
    role: 'Member' as const,
    status: 'active' as const,
    registrationDate: new Date('2024-02-01T08:00:00Z'),
    lastLoginDate: new Date('2024-03-19T16:20:00Z'),
  },
  {
    email: 'bob.johnson@example.com',
    fullName: 'Bob Johnson',
    role: 'Guest' as const,
    status: 'deactivated' as const,
    registrationDate: new Date('2024-01-20T12:15:00Z'),
    lastLoginDate: new Date('2024-02-15T09:30:00Z'),
  },
  {
    email: 'alice.williams@example.com',
    fullName: 'Alice Williams',
    phoneNumber: '+1 (555) 456-7890',
    role: 'Member' as const,
    status: 'active' as const,
    registrationDate: new Date('2024-02-10T14:00:00Z'),
    lastLoginDate: new Date('2024-03-21T10:15:00Z'),
  },
  {
    email: 'charlie.brown@example.com',
    fullName: 'Charlie Brown',
    role: 'Admin' as const,
    status: 'active' as const,
    registrationDate: new Date('2024-01-05T09:00:00Z'),
    lastLoginDate: new Date('2024-03-20T18:30:00Z'),
  },
  {
    email: 'diana.prince@example.com',
    fullName: 'Diana Prince',
    phoneNumber: '+1 (555) 567-8901',
    role: 'Member' as const,
    status: 'active' as const,
    registrationDate: new Date('2024-02-15T11:45:00Z'),
    lastLoginDate: new Date('2024-03-18T13:20:00Z'),
  },
  {
    email: 'edward.norton@example.com',
    fullName: 'Edward Norton',
    role: 'Guest' as const,
    status: 'active' as const,
    registrationDate: new Date('2024-03-01T10:00:00Z'),
    lastLoginDate: new Date('2024-03-15T15:45:00Z'),
  },
  {
    email: 'fiona.gallagher@example.com',
    fullName: 'Fiona Gallagher',
    phoneNumber: '+1 (555) 678-9012',
    role: 'Member' as const,
    status: 'deactivated' as const,
    registrationDate: new Date('2024-01-25T13:30:00Z'),
    lastLoginDate: new Date('2024-02-20T11:00:00Z'),
  },
  {
    email: 'george.martin@example.com',
    fullName: 'George Martin',
    phoneNumber: '+1 (555) 789-0123',
    role: 'Member' as const,
    status: 'active' as const,
    registrationDate: new Date('2024-02-20T09:15:00Z'),
    lastLoginDate: new Date('2024-03-22T08:45:00Z'),
  },
  {
    email: 'helen.parker@example.com',
    fullName: 'Helen Parker',
    role: 'Guest' as const,
    status: 'active' as const,
    registrationDate: new Date('2024-03-05T14:20:00Z'),
    lastLoginDate: new Date('2024-03-20T11:30:00Z'),
  },
];

// Activity templates
const activityTemplates = [
  { actionType: 'login', description: 'User logged in from Chrome on MacOS' },
  { actionType: 'login', description: 'User logged in from Firefox on Windows' },
  { actionType: 'login', description: 'User logged in from Safari on iOS' },
  { actionType: 'logout', description: 'User logged out' },
  { actionType: 'profile_update', description: 'Updated profile information' },
  { actionType: 'profile_update', description: 'Updated profile picture' },
  { actionType: 'profile_update', description: 'Updated phone number' },
  { actionType: 'role_change', description: 'Role changed from Member to Admin by superadmin@example.com' },
  { actionType: 'role_change', description: 'Role changed from Admin to Member by superadmin@example.com' },
  { actionType: 'password_reset', description: 'Password reset requested via email' },
  { actionType: 'password_reset', description: 'Password successfully reset' },
  { actionType: 'email_verified', description: 'Email address verified successfully' },
  { actionType: 'status_change', description: 'Account status changed to active by superadmin@example.com' },
  { actionType: 'status_change', description: 'Account status changed to deactivated by superadmin@example.com' },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Activity.deleteMany({});
    console.log('✓ Existing data cleared');

    // Insert users
    console.log('👥 Creating users...');
    const users = await User.insertMany(dummyUsers);
    console.log(`✓ Created ${users.length} users`);

    // Generate activities for each user
    console.log('📝 Creating activity logs...');
    const activities = [];
    
    for (const user of users) {
      // Create 15 activities per user
      for (let i = 0; i < 15; i++) {
        const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - i * 2); // Activities spread over time
        
        activities.push({
          userId: user._id,
          timestamp,
          actionType: template.actionType,
          description: template.description,
        });
      }
    }
    
    await Activity.insertMany(activities);
    console.log(`✓ Created ${activities.length} activities`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`\nSummary:`);
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Activities: ${activities.length}`);
    console.log(`  - Admins: ${users.filter(u => u.role === 'Admin').length}`);
    console.log(`  - Members: ${users.filter(u => u.role === 'Member').length}`);
    console.log(`  - Guests: ${users.filter(u => u.role === 'Guest').length}`);
    console.log(`  - Active: ${users.filter(u => u.status === 'active').length}`);
    console.log(`  - Deactivated: ${users.filter(u => u.status === 'deactivated').length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
    console.log('\n✓ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
