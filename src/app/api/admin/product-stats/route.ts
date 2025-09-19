import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

interface Product {
  id: string;
  name: string;
  icon: string;
}

interface LabData {
  labId: string;
  labName: string;
  products: Product[];
}

interface ProductStats {
  productId: string;
  productName: string;
  labName: string;
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  totalComments: number;
  lastRated: string | null;
}

export async function GET() {
  try {
    const db = await getDatabase();
    const feedbackCollection = db.collection('feedback');
    const labsCollection = db.collection('labs');

    // Get all feedback data
    const allFeedback = await feedbackCollection.find({}).toArray();
    
    // Get all labs data to map product IDs to names
    const allLabs = await labsCollection.find({}).toArray();
    
    // Create a map of product ID to product info
    const productMap = new Map<string, { name: string; labName: string; labId: string }>();
    allLabs.forEach((lab) => {
      const labData = lab as unknown as LabData;
      if (labData.products && Array.isArray(labData.products)) {
        labData.products.forEach((product) => {
          const productData = product as unknown as Product;
          productMap.set(productData.id, {
            name: productData.name,
            labName: labData.labName,
            labId: labData.labId
          });
        });
      }
    });

    // Group feedback by product ID
    const productStats = new Map<string, ProductStats>();

    allFeedback.forEach(feedback => {
      const productId = feedback.tableId;
      const productInfo = productMap.get(productId);
      
      if (!productInfo) return; // Skip if product not found

      if (!productStats.has(productId)) {
        productStats.set(productId, {
          productId,
          productName: productInfo.name,
          labName: productInfo.labName,
          totalRatings: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          totalComments: 0,
          lastRated: null
        });
      }

      const stats = productStats.get(productId)!;
      stats.totalRatings++;
      stats.ratingDistribution[feedback.rating as keyof typeof stats.ratingDistribution]++;
      
      if (feedback.comment && feedback.comment.trim() !== '') {
        stats.totalComments++;
      }

      // Update last rated timestamp
      const feedbackDate = new Date(feedback.timestamp);
      if (!stats.lastRated || feedbackDate > new Date(stats.lastRated)) {
        stats.lastRated = feedback.timestamp;
      }
    });

    // Calculate average ratings and sort by total ratings
    const productStatsArray = Array.from(productStats.values()).map(stats => {
      const totalRatingSum = Object.entries(stats.ratingDistribution).reduce(
        (sum, [rating, count]) => sum + (parseInt(rating) * count), 0
      );
      stats.averageRating = stats.totalRatings > 0 ? totalRatingSum / stats.totalRatings : 0;
      return stats;
    });

    // Sort by total ratings (descending), then by average rating (descending)
    productStatsArray.sort((a, b) => {
      if (a.totalRatings !== b.totalRatings) {
        return b.totalRatings - a.totalRatings;
      }
      return b.averageRating - a.averageRating;
    });

    return NextResponse.json(productStatsArray);
  } catch (error) {
    console.error('Error fetching product stats:', error);
    return NextResponse.json({ error: 'Failed to fetch product statistics' }, { status: 500 });
  }
}
