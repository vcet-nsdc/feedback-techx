export interface FeedbackEntry {
  _id?: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  rating: number;
  comment: string;
  tableId: string;
  timestamp: string;
  createdAt?: Date;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  department: string;
  completedFeedback: string[];
  completionDate?: Date;
  totalRating: number;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lab {
  _id?: string;
  labId: string;
  labName: string;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  icon: string;
}

export interface Admin {
  _id?: string;
  username: string;
  password: string;
  lastLogin?: Date;
  permissions: string[];
  createdAt: Date;
}
