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
import { coursesAPI } from '@/lib/api';
import { Lesson } from '@/types/api';
import { Loader2, Save, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import { editLessonFormSchema, type EditLessonFormData } from '@/lib/schemas';

interface EditLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  lessonId: string;
  onSuccess?: () => void;
}

export function EditLessonDialog({
  open,
  onOpenChange,
  courseId,
  lessonId,
  onSuccess
}: EditLessonDialogProps) {
  const videoUploadRef = useRef<VideoUploadRef>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | undefined>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditLessonFormData>({
    resolver: zodResolver(editLessonFormSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
    },
  });

  useEffect(() => {
    if (open && lessonId) {
      loadLessonData();
    }
  }, [open, lessonId]);

  const loadLessonData = async () => {
    try {
      setLoadingLesson(true);
      const { lessons } = await coursesAPI.getLessons(courseId);
      const lesson = lessons.find((l: Lesson) => l.id === lessonId);

      if (lesson) {
        reset({
          title: lesson.title,
          description: lesson.description || '',
          content: lesson.content || '',
        });
        setCurrentVideoUrl(lesson.video_url);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      toast.error('Erro ao carregar dados da lição');
    } finally {
      setLoadingLesson(false);
    }
  };

  const onSubmit = async (data: EditLessonFormData) => {
    try {
      setLoading(true);

      const updateData: {
        title: string;
        description?: string;
        content?: string;
        video_url?: string;
        duration_minutes?: number;
      } = {
        title: data.title,
        description: data.description || undefined,
        content: data.content || undefined,
      };

      // Only upload and update video if a new file was selected
      if (videoUploadRef.current?.hasFile()) {
        const uploadResult = await videoUploadRef.current?.startUpload();
        if (uploadResult) {
          updateData.video_url = uploadResult.videoId;
          // Também atualiza a duração se disponível
          const videoDuration = videoUploadRef.current?.getVideoDurationMinutes();
          if (videoDuration) {
            updateData.duration_minutes = videoDuration;
          }
        }
      }

      await coursesAPI.updateLesson(courseId, lessonId, updateData);

      toast.success('Lição atualizada com sucesso!');
      handleClose();
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      console.error('Error updating lesson:', err);
      toast.error(
        err.response?.data?.error || 'Erro ao atualizar lição. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state
    videoUploadRef.current?.reset();
    reset();
    setCurrentVideoUrl('');

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
              Editar Lição
            </DialogTitle>
            <DialogDescription>
              Atualize as informações da lição. Você pode substituir o vídeo fazendo um novo upload.
            </DialogDescription>
          </DialogHeader>

          {loadingLesson ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Carregando lição...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Video Upload Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Substituir Vídeo (Opcional)
                </label>
                {currentVideoUrl && (
                  <span className="text-xs text-muted-foreground">
                    Vídeo atual: {currentVideoUrl.substring(0, 20)}...
                  </span>
                )}
              </div>
              <VideoUpload
                ref={videoUploadRef}
                courseId={courseId}
                lessonId={lessonId}
                manualUpload={true}
              />
              <p className="text-xs text-muted-foreground">
                Se selecionar um novo vídeo, ele será enviado ao salvar. Deixe em branco para manter o atual.
              </p>
            </div>

            {/* Lesson Info Section */}
            <div className="space-y-4">
              <label className="text-sm font-medium">
                Informações da Lição
              </label>

              {/* Title */}
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

              {/* Description */}
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

              {/* Content */}
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
              </div>
            </div>
          </div>
          )}

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
              disabled={loading || loadingLesson}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
