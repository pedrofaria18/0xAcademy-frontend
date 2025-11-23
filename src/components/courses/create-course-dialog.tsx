'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Blockchain',
    price_usd: '0',
    thumbnail_url: '',
    is_published: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    try {
      setLoading(true);

      const courseData = {
        ...formData,
        thumbnail_url: formData.thumbnail_url.trim() === '' ? undefined : formData.thumbnail_url.trim(),
        price_usd: parseFloat(formData.price_usd) || 0,
        is_published: formData.is_published
      };

      const { course } = await coursesAPI.create(courseData);

      toast.success('Curso criado com sucesso!');

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Blockchain',
        price_usd: '0',
        thumbnail_url: '',
        is_published: false
      });

      onOpenChange(false);

      if (onSuccess) {
        onSuccess(course.id);
      }

      router.push(`/instructor`);
      router.refresh();
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error(
        error.response?.data?.error || 'Erro ao criar curso. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
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
                name="title"
                placeholder="Ex: Introdução ao Solidity"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição *
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Descreva o que os alunos aprenderão neste curso..."
                value={formData.description}
                onChange={handleChange}
                required
                disabled={loading}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Categoria
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <label htmlFor="price_usd" className="text-sm font-medium">
                Preço (USD)
              </label>
              <Input
                id="price_usd"
                name="price_usd"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.price_usd}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em 0 para criar um curso gratuito
              </p>
            </div>

            {/* Thumbnail URL */}
            <div className="grid gap-2">
              <label htmlFor="thumbnail_url" className="text-sm font-medium">
                URL da Thumbnail (Opcional)
              </label>
              <Input
                id="thumbnail_url"
                name="thumbnail_url"
                type="url"
                placeholder="https://..."
                value={formData.thumbnail_url}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Você pode adicionar uma imagem depois
              </p>
            </div>

            {/* Publish Status */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  {formData.is_published ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <label htmlFor="is_published" className="text-sm font-medium">
                    {formData.is_published ? 'Publicar Curso' : 'Salvar como Rascunho'}
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.is_published
                    ? 'O curso ficará visível para todos em "Explorar"'
                    : 'O curso ficará privado até você publicá-lo'}
                </p>
              </div>
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                disabled={loading}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
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
