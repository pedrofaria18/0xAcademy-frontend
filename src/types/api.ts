// API Response Types
// These types match the backend API responses

export interface User {
  id: string;
  wallet_address: string;
  address: string; // Alias for wallet_address
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  email?: string; // Optional for future use
  social_links?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  role?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthVerifyResponse {
  token: string;
  user: User;
}

export interface AuthMeResponse {
  user: User;
}

export interface NonceResponse {
  nonce: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price_usd?: number;
  thumbnail_url?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  tags?: string[];
  instructor_id: string;
  created_at: string;
  updated_at?: string;
  instructor?: {
    id: string;
    wallet_address: string;
    display_name?: string;
    avatar_url?: string;
  };
  lessons?: Lesson[];
  _count?: {
    count: number;
  };
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  content?: string;
  order: number;
  duration_minutes?: number;
  is_free: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  course?: Course;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  enrollment_id: string;
  completed: boolean;
  completed_at?: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  issued_at: string;
  certificate_url?: string;
  course?: {
    id: string;
    title: string;
    instructor?: {
      display_name?: string;
      wallet_address: string;
    };
  };
}

export interface Video {
  id: string;
  playbackUrl: string;
  thumbnail: string;
  status: string;
  duration?: number;
  size?: number;
  meta?: Record<string, any>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CoursesListResponse {
  courses: Course[];
  pagination: Pagination;
}

export interface CourseDetailResponse {
  course: Course;
  hasFullAccess: boolean;
}

export interface UploadUrlResponse {
  uploadURL: string;
  videoId: string;
}

export interface EnrolledCoursesResponse {
  enrollments: Enrollment[];
}

export interface UserProgressResponse {
  progress: Array<{
    id: string;
    user_id: string;
    course_id: string;
    enrolled_at: string;
    course: {
      id: string;
      title: string;
      thumbnail_url?: string;
      _total_lessons: Array<{ count: number }>;
    };
    progress: Array<{
      lesson_id: string;
      completed: boolean;
      completed_at?: string;
    }>;
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
  }>;
}

export interface TeachingCoursesResponse {
  courses: Course[];
}

export interface CertificatesResponse {
  certificates: Certificate[];
}

export interface LessonProgressResponse {
  progress: Progress;
  courseCompleted: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
