import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título não pode ter mais de 200 caracteres'),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  thumbnail_url: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')), // Allow empty string
  category: z.string().optional(),
  level: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .optional(),
  tags: z.array(z.string()).optional(),
  is_published: z.boolean().optional().default(false),
});

export type CreateCourseData = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial();

export type UpdateCourseData = z.infer<typeof updateCourseSchema>;

export const createLessonSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título não pode ter mais de 200 caracteres'),
  description: z.string().optional(),
  video_url: z.string().optional(),
  content: z.string().optional(),
  order: z
    .number()
    .int('Ordem deve ser um número inteiro')
    .min(0, 'Ordem não pode ser negativa')
    .optional(),
  duration_minutes: z
    .number()
    .min(0, 'Duração não pode ser negativa')
    .optional(),
  is_free: z.boolean().default(false),
});

export type CreateLessonData = z.infer<typeof createLessonSchema>;

export const updateLessonSchema = createLessonSchema.partial();

export type UpdateLessonData = z.infer<typeof updateLessonSchema>;

export const createCourseFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título não pode ter mais de 200 caracteres'),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  thumbnail_url: z.string().optional(),
  category: z.string().optional(),
  level: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .optional(),
  tags: z.array(z.string()).optional(),
  is_published: z.boolean().default(false),
});

export type CreateCourseFormData = z.infer<typeof createCourseFormSchema>;

export const createLessonFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(200, 'Título não pode ter mais de 200 caracteres'),
  description: z.string().optional().default(''),
  content: z.string().optional().default(''),
});

export type CreateLessonFormData = z.infer<typeof createLessonFormSchema>;

export const editLessonFormSchema = createLessonFormSchema;

export type EditLessonFormData = z.infer<typeof editLessonFormSchema>;
