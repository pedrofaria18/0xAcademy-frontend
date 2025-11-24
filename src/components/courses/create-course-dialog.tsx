'use client';

import { useRouter } from 'next/navigation';
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
import { coursesAPI } from '@/lib/api';
import { Loader2, Plus, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createCourseFormSchema,
  type CreateCourseFormData,
} from '@/lib/schemas';

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (courseId: string) => void;
}

const CATEGORIES = [
  'Blockchain',
  'Smart Contracts',
  'DeFi',
  'NFTs',
  'Web3 Development',
  'Security',
  'Trading',
  'Other'
];

export function CreateCourseDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateCourseDialogProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseFormSchema) as any,
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      category: 'Blockchain',
      thumbnail_url: '',
      is_published: false,
    },
  });

  const isPublished = watch('is_published');

  const onSubmit = async (data: CreateCourseFormData) => {
    try {
      const courseData = {
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        tags: data.tags,
        thumbnail_url: data.thumbnail_url?.trim() === '' ? undefined : data.thumbnail_url?.trim(),
        is_published: data.is_published || false,
      };

      const { course } = await coursesAPI.create(courseData);

      toast.success('Curso criado com sucesso!');
      reset();
      onOpenChange(false);

      if (onSuccess) {
        onSuccess(course.id);
      }

      router.push(`/instructor`);
      router.refresh();
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      console.error('Error creating course:', err);
      toast.error(
        err.response?.data?.error || 'Erro ao criar curso. Tente novamente.'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Criar Novo Curso</DialogTitle>
            <DialogDescription>
              Preencha as informações básicas do curso. Você poderá adicionar
              lições depois.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título do Curso *
              </label>
              <Input
                id="title"
                placeholder="Ex: Introdução ao Solidity"
                disabled={isSubmitting}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição *
              </label>
              <textarea
                id="description"
                placeholder="Descreva o que os alunos aprenderão neste curso..."
                disabled={isSubmitting}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Categoria
              </label>
              <select
                id="category"
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('category')}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            {/* Thumbnail URL */}
            <div className="grid gap-2">
              <label htmlFor="thumbnail_url" className="text-sm font-medium">
                URL da Thumbnail (Opcional)
              </label>
              <Input
                id="thumbnail_url"
                type="url"
                placeholder="https://..."
                disabled={isSubmitting}
                {...register('thumbnail_url')}
              />
              {errors.thumbnail_url && (
                <p className="text-sm text-destructive">{errors.thumbnail_url.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Você pode adicionar uma imagem depois
              </p>
            </div>

            {/* Publish Status */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {isPublished ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <label htmlFor="is_published" className="text-sm font-medium">
                    {isPublished ? 'Publicar Curso' : 'Salvar como Rascunho'}
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPublished
                    ? 'O curso ficará visível para todos em "Explorar"'
                    : 'O curso ficará privado até você publicá-lo'}
                </p>
              </div>
              <input
                type="checkbox"
                id="is_published"
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                {...register('is_published')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Curso
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
