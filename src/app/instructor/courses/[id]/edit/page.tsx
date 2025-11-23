'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/header';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { coursesAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Save,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  ExternalLink,
  Loader2,
  GripVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Course, Lesson } from '@/types/api';

// Helper function outside component to avoid recreation on every render
const formatDuration = (minutes: number | null | undefined): string => {
  if (!minutes) return '0:00';
  const totalSeconds = Math.round(minutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Lazy load dialogs for better performance
 * Only loaded when user opens them
 */
const CreateLessonDialog = dynamic(
  () => import('@/components/courses/create-lesson-dialog').then((mod) => ({ default: mod.CreateLessonDialog })),
  {
    loading: () => null,
    ssr: false,
  }
);

const EditLessonDialog = dynamic(
  () => import('@/components/courses/edit-lesson-dialog').then((mod) => ({ default: mod.EditLessonDialog })),
  {
    loading: () => null,
    ssr: false,
  }
);

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

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { user, isAuthenticated } = useWeb3Auth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Blockchain',
    price_usd: '0',
    thumbnail_url: '',
    is_published: false
  });

  // Dialog states
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [editLessonOpen, setEditLessonOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLessonDialogOpen, setDeleteLessonDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string>('');

  const loadCourseData = useCallback(async () => {
    try {
      setLoading(true);

      // Load course details
      const { course } = await coursesAPI.get(courseId);

      // Verify if user is the instructor
      if (course.instructor_id !== user?.id) {
        toast.error('Você não tem permissão para editar este curso');
        router.push('/instructor');
        return;
      }

      setCourseData(course);
      setFormData({
        title: course.title,
        description: course.description || '',
        category: course.category || 'Blockchain',
        price_usd: String(course.price_usd || 0),
        thumbnail_url: course.thumbnail_url || '',
        is_published: course.is_published || false
      });

      // Load lessons
      try {
        const { lessons: lessonsData } = await coursesAPI.getLessons(courseId);
        setLessons(lessonsData.sort((a: Lesson, b: Lesson) => a.order - b.order));
      } catch (error) {
        console.log('No lessons yet');
        setLessons([]);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do curso');
      console.error('Course load error:', error);
      router.push('/instructor');
    } finally {
      setLoading(false);
    }
  }, [courseId, user?.id, router]);

  useEffect(() => {
    if (isAuthenticated && courseId) {
      loadCourseData();
    }
  }, [isAuthenticated, courseId, loadCourseData]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveCourse = useCallback(async () => {
    if (!formData.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price_usd: parseFloat(formData.price_usd) || 0,
        thumbnail_url: formData.thumbnail_url.trim() === '' ? undefined : formData.thumbnail_url.trim(),
        is_published: formData.is_published
      };

      await coursesAPI.update(courseId, updateData);

      toast.success('Curso atualizado com sucesso!');
      await loadCourseData();
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast.error(
        error.response?.data?.error || 'Erro ao atualizar curso. Tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  }, [formData, courseId, loadCourseData]);

  const handleTogglePublish = useCallback(async () => {
    if (!courseData) return;

    try {
      setSaving(true);
      const newPublishState = !formData.is_published;

      await coursesAPI.publish(courseId, newPublishState);

      setFormData(prev => ({ ...prev, is_published: newPublishState }));
      toast.success(newPublishState ? 'Curso publicado!' : 'Curso despublicado');
    } catch (error: any) {
      console.error('Error toggling publish:', error);
      toast.error('Erro ao alterar status de publicação');
    } finally {
      setSaving(false);
    }
  }, [courseData, formData.is_published, courseId]);

  const handleDeleteCourse = useCallback(async () => {
    try {
      setSaving(true);
      await coursesAPI.delete(courseId);
      toast.success('Curso deletado com sucesso');
      router.push('/instructor');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error('Erro ao deletar curso');
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  }, [courseId, router]);

  const handleDeleteLesson = useCallback(async () => {
    if (!lessonToDelete) return;

    try {
      await coursesAPI.deleteLesson(courseId, lessonToDelete);
      toast.success('Lição deletada com sucesso');
      setLessonToDelete('');
      setDeleteLessonDialogOpen(false);
      await loadCourseData();
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      toast.error('Erro ao deletar lição');
    }
  }, [lessonToDelete, courseId, loadCourseData]);

  const handleEditLesson = useCallback((lessonId: string) => {
    setSelectedLessonId(lessonId);
    setEditLessonOpen(true);
  }, []);

  const handleViewAsStudent = useCallback(() => {
    window.open(`/courses/${courseId}`, '_blank');
  }, [courseId]);

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="flex-1 container py-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Acesso Negado</h1>
            <p className="mt-4 text-muted-foreground">
              Por favor, conecte sua wallet para acessar esta página
            </p>
          </div>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 container py-8">
          <div className="space-y-6">
            <div className="h-12 bg-muted animate-pulse rounded-lg" />
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </>
    );
  }

  if (!courseData) {
    return (
      <>
        <Header />
        <main className="flex-1 container py-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Curso não encontrado</h1>
            <Button className="mt-4" onClick={() => router.push('/instructor')}>
              Voltar para Dashboard
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/instructor')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Dashboard
            </Button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Editar Curso</h1>
                <p className="text-muted-foreground">
                  Gerencie as informações e conteúdo do seu curso
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleViewAsStudent}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver como Aluno
                </Button>
                <Button
                  variant={formData.is_published ? 'outline' : 'default'}
                  onClick={handleTogglePublish}
                  disabled={saving}
                >
                  {formData.is_published ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Despublicar
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Publicar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Curso</CardTitle>
                <CardDescription>
                  Atualize as informações básicas do seu curso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    disabled={saving}
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
                    disabled={saving}
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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
                      disabled={saving}
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
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Thumbnail URL */}
                <div className="grid gap-2">
                  <label htmlFor="thumbnail_url" className="text-sm font-medium">
                    URL da Thumbnail
                  </label>
                  <Input
                    id="thumbnail_url"
                    name="thumbnail_url"
                    type="url"
                    placeholder="https://..."
                    value={formData.thumbnail_url}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  {formData.thumbnail_url && (
                    <div className="mt-2">
                      <img
                        src={formData.thumbnail_url}
                        alt="Thumbnail preview"
                        className="w-64 h-36 object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 pt-4">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={formData.is_published ? 'default' : 'secondary'}>
                    {formData.is_published ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveCourse} disabled={saving}>
                    {saving ? (
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
                </div>
              </CardContent>
            </Card>

            {/* Lessons Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lições do Curso</CardTitle>
                    <CardDescription className="mt-2">
                      Gerencie o conteúdo das aulas do seu curso
                    </CardDescription>
                  </div>
                  <Button onClick={() => setCreateLessonOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Lição
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {lessons.length === 0 ? (
                  <div className="py-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nenhuma lição criada
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Comece adicionando a primeira lição do seu curso
                    </p>
                    <Button onClick={() => setCreateLessonOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeira Lição
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {index + 1}.
                            </span>
                            <h4 className="font-medium">{lesson.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {lesson.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(lesson.duration_minutes)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLesson(lesson.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setLessonToDelete(lesson.id);
                              setDeleteLessonDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                <CardDescription>
                  Ações irreversíveis que afetam seu curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">Deletar Curso</h4>
                    <p className="text-sm text-muted-foreground">
                      Esta ação não pode ser desfeita. Todas as lições e dados do curso serão perdidos.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deletar Curso
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <CreateLessonDialog
        open={createLessonOpen}
        onOpenChange={setCreateLessonOpen}
        onSuccess={() => {
          loadCourseData();
        }}
      />

      {editLessonOpen && selectedLessonId && (
        <EditLessonDialog
          open={editLessonOpen}
          onOpenChange={setEditLessonOpen}
          courseId={courseId}
          lessonId={selectedLessonId}
          onSuccess={() => {
            loadCourseData();
          }}
        />
      )}

      {/* Delete Course Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso vai deletar permanentemente o curso
              &quot;{courseData.title}&quot; e todas as suas lições.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar Curso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Lesson Dialog */}
      <AlertDialog open={deleteLessonDialogOpen} onOpenChange={setDeleteLessonDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Lição?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A lição será permanentemente removida do curso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar Lição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
