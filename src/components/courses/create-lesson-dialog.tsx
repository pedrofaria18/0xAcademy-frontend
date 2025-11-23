'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoUpload, VideoUploadRef } from '@/components/video/video-upload';
import { coursesAPI, userAPI } from '@/lib/api';
import { Loader2, Plus, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import { createLessonFormSchema, type CreateLessonFormData } from '@/lib/schemas';

interface CreateLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface InstructorCourse {
  id: string;
  title: string;
}

export function CreateLessonDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateLessonDialogProps) {
  const videoUploadRef = useRef<VideoUploadRef>(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateLessonFormData>({
    resolver: zodResolver(createLessonFormSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
    },
  });

  useEffect(() => {
    if (open) {
      loadCourses();
    }
  }, [open]);

  const loadCourses = async () => {
    try {
      const teachingData = await userAPI.getTeaching();
      const coursesData = teachingData.courses?.map((course: any) => ({
        id: course.id,
        title: course.title,
      })) || [];
      setCourses(coursesData);

      setSelectedCourseId(coursesData[0].id);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Erro ao carregar cursos');
    }
  };

  const onSubmit = async (data: CreateLessonFormData) => {
    if (!selectedCourseId) {
      toast.error('Selecione um curso primeiro');
      return;
    }

    if (!videoUploadRef.current?.hasFile()) {
      toast.error('Por favor, selecione um arquivo de vídeo');
      return;
    }

    try {
      setLoading(true);

      const videoDuration = videoUploadRef.current?.getVideoDurationMinutes();

      const { lesson } = await coursesAPI.createLesson(selectedCourseId, {
        title: data.title,
        description: data.description || undefined,
        content: data.content || undefined,
        duration_minutes: videoDuration || undefined,
      });

      videoUploadRef.current?.setLessonId(lesson.id);

      const uploadResult = await videoUploadRef.current?.startUpload();

      if (!uploadResult) {
        toast.error('Erro ao fazer upload do vídeo');
        return;
      }

      await coursesAPI.updateLesson(selectedCourseId, lesson.id, {
        video_url: uploadResult.videoId,
      });

      toast.success('Lição criada! O vídeo será processado em alguns instantes.');
      handleClose();
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      console.error('Error creating lesson:', err);
      toast.error(
        err.response?.data?.error || 'Erro ao criar lição. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    videoUploadRef.current?.reset();
    reset();
    if (courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }

    onOpenChange(false);

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Criar Nova Lição
            </DialogTitle>
            <DialogDescription>
              Selecione o curso, escolha o vídeo e preencha as informações. O upload será feito ao clicar em criar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="course-select" className="text-sm font-medium">
                Selecione o Curso *
              </label>
              <select
                id="course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione um curso...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  1. Selecione o Vídeo *
                </label>
              </div>
              <VideoUpload
                ref={videoUploadRef}
                courseId={selectedCourseId}
                manualUpload={true}
              />
              <p className="text-xs text-muted-foreground">
                O upload será feito automaticamente ao criar a lição
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">
                2. Informações da Lição *
              </label>

              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium text-muted-foreground">
                  Título *
                </label>
                <Input
                  id="title"
                  placeholder="Ex: Introdução ao Ethereum"
                  disabled={loading}
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium text-muted-foreground">
                  Descrição Breve
                </label>
                <Input
                  id="description"
                  placeholder="Resumo da lição..."
                  disabled={loading}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="content" className="text-sm font-medium text-muted-foreground">
                  Conteúdo / Notas da Aula (Opcional)
                </label>
                <textarea
                  id="content"
                  placeholder="Material complementar, links, código, etc..."
                  disabled={loading}
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                  {...register('content')}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Você pode usar HTML básico para formatação
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fazendo Upload e Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Fazer Upload e Criar Lição
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
