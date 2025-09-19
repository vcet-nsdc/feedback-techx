import { getDatabase } from './mongodb';
import { FeedbackEntry, User, Lab, Admin } from './models';

// Feedback operations
export async function saveFeedback(feedback: Omit<FeedbackEntry, '_id'>): Promise<FeedbackEntry> {
  const db = await getDatabase();
  const collection = db.collection<FeedbackEntry>('feedback');
  
  const feedbackWithTimestamp = {
    ...feedback,
    createdAt: new Date()
  };
  
  const result = await collection.insertOne(feedbackWithTimestamp);
  return { ...feedbackWithTimestamp, _id: result.insertedId.toString() };
}

export async function getFeedback(filters: {
  email?: string;
  productId?: string;
  department?: string;
} = {}): Promise<FeedbackEntry[]> {
  const db = await getDatabase();
  const collection = db.collection<FeedbackEntry>('feedback');
  
  const query: Record<string, string> = {};
  if (filters.email) query.studentEmail = filters.email;
  if (filters.productId) query.tableId = filters.productId;
  if (filters.department) query.studentDepartment = filters.department;
  
  const feedback = await collection.find(query).sort({ timestamp: -1 }).toArray();
  return feedback.map(f => ({ ...f, _id: f._id?.toString() }));
}

export async function getFeedbackStats(): Promise<{
  totalUsers: number;
  totalFeedback: number;
  averageRating: number;
}> {
  const db = await getDatabase();
  const collection = db.collection<FeedbackEntry>('feedback');
  
  const totalFeedback = await collection.countDocuments();
  const uniqueEmails = await collection.distinct('studentEmail');
  const totalUsers = uniqueEmails.length;
  
  const avgResult = await collection.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]).toArray();
  
  const averageRating = avgResult.length > 0 ? avgResult[0].avgRating : 0;
  
  return {
    totalUsers,
    totalFeedback,
    averageRating: Number(averageRating.toFixed(2))
  };
}

// User operations
export async function updateUserProgress(email: string, productId: string): Promise<User> {
  const db = await getDatabase();
  const collection = db.collection<User>('users');
  
  const user = await collection.findOne({ email });
  
  if (!user) {
    // Create new user
    const newUser: Omit<User, '_id'> = {
      name: '',
      email,
      department: '',
      completedFeedback: [productId],
      totalRating: 0,
      averageRating: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(newUser);
    return { ...newUser, _id: result.insertedId.toString() };
  } else {
    // Update existing user
    const updatedFeedback = [...new Set([...user.completedFeedback, productId])];
    const isCompleted = updatedFeedback.length >= 25;
    
    const updateData: Partial<User> = {
      completedFeedback: updatedFeedback,
      updatedAt: new Date()
    };
    
    if (isCompleted && !user.completionDate) {
      updateData.completionDate = new Date();
    }
    
    await collection.updateOne(
      { email },
      { $set: updateData }
    );
    
    return { ...user, ...updateData, _id: user._id?.toString() };
  }
}

export async function getLeaderboard(): Promise<User[]> {
  const db = await getDatabase();
  const collection = db.collection<User>('users');
  
  const users = await collection.find({}).toArray();
  
  // Calculate stats for each user
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const feedback = await getFeedback({ email: user.email });
      const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
      const averageRating = feedback.length > 0 ? totalRating / feedback.length : 0;
      
      return {
        ...user,
        _id: user._id?.toString(),
        totalRating,
        averageRating,
        isCompleted: user.completedFeedback.length >= 25
      };
    })
  );
  
  // Sort by completion status, then by feedback count, then by average rating
  return usersWithStats.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return b.isCompleted ? 1 : -1;
    }
    if (a.completedFeedback.length !== b.completedFeedback.length) {
      return b.completedFeedback.length - a.completedFeedback.length;
    }
    return b.averageRating - a.averageRating;
  });
}

// Lab operations
export async function getLabs(): Promise<Lab[]> {
  const db = await getDatabase();
  const collection = db.collection<Lab>('labs');
  
  const labs = await collection.find({}).toArray();
  return labs.map(lab => ({ ...lab, _id: lab._id?.toString() }));
}

export async function initializeLabs(): Promise<void> {
  const db = await getDatabase();
  const collection = db.collection<Lab>('labs');
  
  const existingLabs = await collection.countDocuments();
  if (existingLabs > 0) return; // Already initialized
  
  const labs: Omit<Lab, '_id'>[] = [
    {
      labId: 'a',
      labName: 'LAB 308-A',
      products: [
        { id: 'a1', name: 'Trueconnect.jio', icon: '📶' },
        { id: 'a2', name: 'Drone', icon: '🚁' },
        { id: 'a3', name: 'Samsung Ecosystem', icon: '📱' },
        { id: 'a4', name: 'IP CAMERA', icon: '📹' },
        { id: 'a5', name: '100 Billion Tech', icon: '💰' },
        { id: 'a6', name: 'VSCode', icon: '💻' }
      ]
    },
    {
      labId: 'c',
      labName: 'LAB 308-C',
      products: [
        { id: 'c1', name: 'SimilaCure', icon: '💊' },
        { id: 'c2', name: 'Allotrak', icon: '📊' },
        { id: 'c3', name: 'Reliance Samarth', icon: '🛍️' },
        { id: 'c4', name: 'Temperature Calibrator', icon: '🌡️' },
        { id: 'c5', name: 'Video Door Phone', icon: '🚪' },
        { id: 'c6', name: 'Motherboard Full Setup Raw - 1', icon: '⚙️' },
        { id: 'c7', name: 'Dial Club', icon: '☎️' },
        { id: 'c8', name: 'Website/App', icon: '🌐' },
        { id: 'c9', name: 'Copilot', icon: '🤖' }
      ]
    },
    {
      labId: 'd',
      labName: 'LAB 308-D',
      products: [
        { id: 'd1', name: 'DND Services', icon: '🚫' },
        { id: 'd2', name: 'Her Circle', icon: '♀️' },
        { id: 'd3', name: 'Optimis', icon: '📈' },
        { id: 'd4', name: 'RDiscovery', icon: '🔬' },
        { id: 'd5', name: 'PaperPal', icon: '📝' },
        { id: 'd6', name: 'MDVR Camera Shivsahi', icon: '🚌' },
        { id: 'd7', name: 'Motherboard Full Setup Raw - 2', icon: '🛠️' },
        { id: 'd8', name: 'OSM', icon: '🗺️' },
        { id: 'd9', name: 'Apple Ecosystem', icon: '🍏' },
        { id: 'd10', name: 'EDQuest', icon: '🎓' }
      ]
    }
  ];
  
  await collection.insertMany(labs);
}

// Admin operations
export async function getAdmin(username: string): Promise<Admin | null> {
  const db = await getDatabase();
  const collection = db.collection<Admin>('admins');
  
  const admin = await collection.findOne({ username });
  return admin ? { ...admin, _id: admin._id?.toString() } : null;
}

export async function initializeAdmin(): Promise<void> {
  const db = await getDatabase();
  const collection = db.collection<Admin>('admins');
  
  const existingAdmin = await collection.countDocuments();
  if (existingAdmin > 0) return; // Already initialized
  
  const admin: Omit<Admin, '_id'> = {
    username: 'vcet-nsdc',
    password: 'AIDS@2025', // In production, this should be hashed
    permissions: ['leaderboard', 'feedback_view', 'analytics'],
    createdAt: new Date()
  };
  
  await collection.insertOne(admin);
}
