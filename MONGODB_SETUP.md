# MongoDB Database Setup

✅ **MongoDB is now configured and seeded with dummy data!**

## What Was Implemented

### 1. MongoDB Integration
- **Database Connection**: Singleton connection using Mongoose
- **Models**: User and Activity models with proper schemas
- **API Routes**: RESTful Next.js API routes for all operations
- **Seed Script**: Automated database seeding with dummy data

### 2. Database Structure

#### Users Collection
```typescript
{
  email: string (unique, indexed)
  fullName: string (text indexed)
  phoneNumber?: string
  role: 'Admin' | 'Member' | 'Guest'
  status: 'active' | 'deactivated'
  registrationDate: Date
  lastLoginDate?: Date
}
```

#### Activities Collection
```typescript
{
  userId: ObjectId (indexed)
  timestamp: Date (indexed)
  actionType: string (indexed)
  description: string
}
```

### 3. API Endpoints Created

All endpoints are now functional at `http://localhost:3000/api`:

- `GET /api/users` - Get paginated users with filtering
  - Query params: `page`, `pageSize`, `search`, `role`, `status`
  
- `POST /api/users` - Create new user
  - Body: `{ email, fullName, phoneNumber?, role }`
  
- `GET /api/users/[id]` - Get user detail with activity log
  
- `PATCH /api/users/[id]` - Update user information
  - Body: `{ email?, fullName?, phoneNumber?, role? }`
  
- `PATCH /api/users/[id]/status` - Update user status
  - Body: `{ status: 'active' | 'deactivated' }`

### 4. Dummy Data Included

✅ **10 Users** with diverse profiles:
- **2 Admins**: John Doe, Charlie Brown
- **5 Members**: Jane Smith, Alice Williams, Diana Prince, George Martin, Fiona Gallagher (deactivated)
- **3 Guests**: Bob Johnson (deactivated), Edward Norton, Helen Parker

✅ **150 Activity Logs** (15 activities per user):
- login, logout
- profile_update
- role_change
- password_reset
- email_verified
- status_change

## How to Use

### Starting the Application

1. **Ensure MongoDB is running**:
   ```bash
   # MongoDB is already running locally on port 27017
   ```

2. **Start the Next.js dev server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api/users

### Re-seeding the Database

To reset the database with fresh dummy data:

```bash
npm run db:seed
```

This will:
- Clear all existing users and activities
- Create 10 new users
- Generate 150 activity logs
- Display a summary of created data

### Testing the API

You can test the API endpoints directly:

```bash
# Get all users
curl http://localhost:3000/api/users

# Get users with filters
curl "http://localhost:3000/api/users?role=Admin&status=active"

# Search users
curl "http://localhost:3000/api/users?search=John"

# Get user detail (replace USER_ID with actual ID from database)
curl http://localhost:3000/api/users/USER_ID

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","fullName":"Test User","role":"Member"}'
```

## Configuration

### Environment Variables

The `.env.local` file is configured with:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/phelbo-superadmin

# API Base URL (now using Next.js API routes)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### MongoDB Connection String

**Local Development** (current setup):
```
mongodb://localhost:27017/phelbo-superadmin
```

**MongoDB Atlas** (cloud):
```
mongodb+srv://username:password@cluster.mongodb.net/phelbo-superadmin
```

To use MongoDB Atlas:
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Get your connection string
3. Update `MONGODB_URI` in `.env.local`
4. Run `npm run db:seed` to populate the cloud database

## Features Working

✅ **User List Page**
- Paginated display (10, 25, 50, 100 per page)
- Search by name or email
- Filter by role (Admin, Member, Guest)
- Filter by status (active, deactivated)
- Real-time results from MongoDB

✅ **User Detail Page**
- Full user profile information
- Activity log (last 50 activities)
- Fetched from MongoDB with aggregation

✅ **User Creation**
- Form validation with Zod
- Duplicate email detection
- Stored in MongoDB

✅ **User Updates**
- Edit user information
- Role changes
- Status changes (activate/deactivate)
- All persisted to MongoDB

✅ **Search & Filters**
- Text search with regex
- Role and status filtering
- Combined filters support

✅ **Export to CSV**
- Exports current filtered data
- All data comes from MongoDB

## Database Operations

### Viewing Data

Use MongoDB Compass or mongosh:

```bash
# Connect to database
mongosh mongodb://localhost:27017/phelbo-superadmin

# View users
db.users.find().pretty()

# Count users
db.users.countDocuments()

# View activities for a user
db.activities.find({ userId: ObjectId("USER_ID") }).sort({ timestamp: -1 })

# Search users
db.users.find({ $or: [
  { fullName: { $regex: "John", $options: "i" } },
  { email: { $regex: "John", $options: "i" } }
]})
```

### Backup and Restore

```bash
# Backup database
mongodump --db=phelbo-superadmin --out=./backup

# Restore database
mongorestore --db=phelbo-superadmin ./backup/phelbo-superadmin
```

## Troubleshooting

### Issue: "Failed to fetch users"

**Solution**: Check if MongoDB is running
```bash
mongosh --eval "db.version()"
```

If not running, start MongoDB:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Issue: "Connection timed out"

**Solution**: Verify MongoDB connection string in `.env.local`
- Check if MongoDB is running on port 27017
- Ensure no firewall blocking the connection
- Try connecting with mongosh first

### Issue: "No users visible"

**Solution**: Re-seed the database
```bash
npm run db:seed
```

### Issue: "Duplicate key error"

**Solution**: Clear the database and re-seed
```bash
mongosh mongodb://localhost:27017/phelbo-superadmin --eval "db.users.drop(); db.activities.drop();"
npm run db:seed
```

## Next Steps

### Production Deployment

1. **Use MongoDB Atlas** (recommended):
   - Free tier available
   - Automatic backups
   - Global distribution
   - Update `MONGODB_URI` in production environment

2. **Secure the API**:
   - Add authentication middleware
   - Implement rate limiting
   - Add input sanitization
   - Enable CORS properly

3. **Optimize Performance**:
   - Add database indexes (already included)
   - Implement caching with Redis
   - Use connection pooling
   - Monitor query performance

### Development Workflow

1. Make changes to models in `lib/models/`
2. Update API routes in `app/api/`
3. Test with curl or Postman
4. Use `npm run db:seed` to reset data if needed
5. Deploy with environment variables configured

## Summary

✅ **MongoDB**: Installed and running locally  
✅ **Database**: Seeded with 10 users and 150 activities  
✅ **API Routes**: All CRUD operations implemented  
✅ **Frontend**: Connected to real database  
✅ **Ready**: Application is fully functional!

**Your application now uses a real MongoDB database with dummy data!**
