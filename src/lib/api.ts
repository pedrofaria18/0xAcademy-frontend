import axios from 'axios';
import toast from 'react-hot-toast';
import type {
  NonceResponse,
  AuthVerifyResponse,
  AuthMeResponse,
  CoursesListResponse,
  CourseDetailResponse,
  Course,
  Lesson,
  Enrollment,
  EnrolledCoursesResponse,
  UserProgressResponse,
  TeachingCoursesResponse,
  CertificatesResponse,
  LessonProgressResponse,
  UploadUrlResponse,
  Video,
  User,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Read from Zustand persist storage (0xacademy-auth key)
    const authStorage = localStorage.getItem('0xacademy-auth');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear Zustand persist storage on unauthorized
      localStorage.removeItem('0xacademy-auth');
      window.location.href = '/';
      toast.error('Sessão expirada. Por favor, faça login novamente.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Ocorreu um erro. Por favor, tente novamente.');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  getNonce: async (address: string): Promise<NonceResponse> => {
    const response = await api.post<NonceResponse>('/auth/nonce', { address });
    return response.data;
  },

  verify: async (message: string, signature: string): Promise<AuthVerifyResponse> => {
    const response = await api.post<AuthVerifyResponse>('/auth/verify', { message, signature });
    return response.data;
  },

  getMe: async (): Promise<AuthMeResponse> => {
    const response = await api.get<AuthMeResponse>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    // Zustand persist will handle storage cleanup via store.logout()
    // No need to manually remove here as it would conflict with Zustand's persistence
  },
};

// Courses API calls
export const coursesAPI = {
  list: async (params?: { page?: number; limit?: number; category?: string; search?: string }): Promise<CoursesListResponse> => {
    const response = await api.get<CoursesListResponse>('/courses', { params });
    return response.data;
  },

  get: async (id: string): Promise<CourseDetailResponse> => {
    const response = await api.get<CourseDetailResponse>(`/courses/${id}`);
    return response.data;
  },

  create: async (data: Partial<Course>): Promise<{ course: Course }> => {
    const response = await api.post<{ course: Course }>('/courses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Course>): Promise<{ course: Course }> => {
    const response = await api.patch<{ course: Course }>(`/courses/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/courses/${id}`);
    return response.data;
  },

  publish: async (id: string, publish = true): Promise<{ course: Course }> => {
    const response = await api.post<{ course: Course }>(`/courses/${id}/publish`, { publish });
    return response.data;
  },

  enroll: async (id: string): Promise<{ enrollment: Enrollment }> => {
    const response = await api.post<{ enrollment: Enrollment }>(`/courses/${id}/enroll`);
    return response.data;
  },

  getLessons: async (courseId: string): Promise<{ lessons: Lesson[] }> => {
    const response = await api.get<{ lessons: Lesson[] }>(`/courses/${courseId}/lessons`);
    return response.data;
  },

  createLesson: async (courseId: string, data: Partial<Lesson>): Promise<{ lesson: Lesson }> => {
    const response = await api.post<{ lesson: Lesson }>(`/courses/${courseId}/lessons`, data);
    return response.data;
  },

  updateLesson: async (courseId: string, lessonId: string, data: Partial<Lesson>): Promise<{ lesson: Lesson }> => {
    const response = await api.patch<{ lesson: Lesson }>(`/courses/${courseId}/lessons/${lessonId}`, data);
    return response.data;
  },

  deleteLesson: async (courseId: string, lessonId: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/courses/${courseId}/lessons/${lessonId}`);
    return response.data;
  },

  getEnrolled: async (): Promise<EnrolledCoursesResponse> => {
    const response = await api.get<EnrolledCoursesResponse>('/courses/enrolled');
    return response.data;
  },
};

// User API calls
export const userAPI = {
  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/user/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    const response = await api.patch<{ user: User }>('/user/profile', data);
    return response.data;
  },

  getTeaching: async (): Promise<TeachingCoursesResponse> => {
    const response = await api.get<TeachingCoursesResponse>('/user/teaching');
    return response.data;
  },

  getProgress: async (): Promise<UserProgressResponse> => {
    const response = await api.get<UserProgressResponse>('/user/progress');
    return response.data;
  },

  markLessonComplete: async (lessonId: string, completed = true): Promise<LessonProgressResponse> => {
    const response = await api.post<LessonProgressResponse>(`/user/progress/lesson/${lessonId}`, { completed });
    return response.data;
  },

  getCertificates: async (): Promise<CertificatesResponse> => {
    const response = await api.get<CertificatesResponse>('/user/certificates');
    return response.data;
  },

  getPublicProfile: async (address: string): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>(`/user/${address}`);
    return response.data;
  },

  becomeInstructor: async (): Promise<{ user: User; message: string }> => {
    const response = await api.post<{ user: User; message: string }>('/user/become-instructor');
    return response.data;
  },
};

// Video API calls
export const videoAPI = {
  getUploadUrl: async (courseId: string, lessonId?: string): Promise<UploadUrlResponse> => {
    const response = await api.post<UploadUrlResponse>('/videos/upload-url', { courseId, lessonId });
    return response.data;
  },

  get: async (videoId: string): Promise<{ video: Video }> => {
    const response = await api.get<{ video: Video }>(`/videos/${videoId}`);
    return response.data;
  },

  delete: async (videoId: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/videos/${videoId}`);
    return response.data;
  },

  uploadToCloudflare: async (uploadURL: string, file: File): Promise<any> => {
    const response = await fetch(uploadURL, {
      method: 'POST',
      body: file,
    });
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    return response.json();
  },
};
