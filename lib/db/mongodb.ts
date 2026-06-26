/**
 * MongoDB Connection Utility
 * 
 * This module provides a singleton MongoDB connection that can be reused
 * across API routes. It uses connection pooling for optimal performance.
 * 
 * Features:
 * - Singleton pattern to prevent multiple connections
 * - Connection pooling for performance
 * - Automatic reconnection handling
 * - Development mode caching to prevent hot-reload connection issues
 */

import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'phelbo_superadmin';

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development mode, use a global variable to preserve the connection
// across hot-reloads. This prevents "Too many connections" errors.
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client for each instance
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Get MongoDB client instance
 * @returns Promise that resolves to MongoClient
 */
export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Get MongoDB database instance
 * @returns Promise that resolves to Database
 */
export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

/**
 * Test MongoDB connection
 * @returns Promise that resolves to true if connection is successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await getMongoClient();
    await client.db('admin').command({ ping: 1 });
    console.log('✓ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    return false;
  }
}

export default clientPromise;
