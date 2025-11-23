'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { userAPI, coursesAPI } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateCourseDialog } from '@/components/courses/create-course-dialog';

import {
  BookOpen,
  Plus,
  Edit,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface InstructorCourse {
  id: string;
  title: string;
  thumbnail_url: string;
  status: 'draft' | 'published' | 'archived';
  students_enrolled: number;
  total_lessons: number;
  revenue: number;
  created_at: string;
}

export default function InstructorPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useWeb3Auth();

  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [createCourseOpen, setCreateCourseOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadInstructorData();
    }
  }, [isAuthenticated]);


  const loadInstructorData = async () => {
    try {
      setLoading(true);

      const teachingData = await userAPI.getTeaching();

      const mappedCourses = teachingData.courses?.map((course: any) => ({
        id: course.id,
        title: course.title,
        thumbnail_url: course.thumbnail_url || '',
        status: course.is_published ? 'published' as const : 'draft' as const,
        students_enrolled: course._count?.[0]?.count || 0,
        total_lessons: course._lessons?.[0]?.count || 0,
        revenue: (course._count?.[0]?.count || 0) * (course.price_usd || 0),
        created_at: course.created_at,
      })) || [];

      setCourses(mappedCourses);
    } catch (error) {
      toast.error('Erro ao carregar dados do instrutor');
      console.error('Instructor data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeInstructor = async () => {
    try {
      setLoading(true);
      const response = await userAPI.becomeInstructor();
      toast.success(response.message || 'Você agora é um instrutor!');

      window.location.reload();
    } catch (error) {
      console.error('Failed to become instructor:', error);
      toast.error('Erro ao se tornar instrutor');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="flex-1 container py-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Acesso Negado</h1>
            <p className="mt-4 text-muted-foreground">
              Por favor, conecte sua wallet para acessar a área do instrutor
            </p>
          </div>
        </main>
      </>
    );
  }

  if (user?.role !== 'instructor') {
    return (
      <>
        <Header />
        <main className="flex-1 container py-24">
          <div className="text-center max-w-md mx-auto">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold mb-4">Torne-se um Instrutor</h1>
            <p className="text-muted-foreground mb-6">
              Compartilhe seu conhecimento e ajude outros a aprender sobre Web3 e blockchain.
            </p>
            <Button size="lg" onClick={handleBecomeInstructor} disabled={loading}>
              {loading ? 'Processando...' : 'Tornar-se Instrutor'}
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
          <div className="mb-24 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Área do Instrutor</h1>
              <p className="mt-2 text-muted-foreground">
                Gerencie seus cursos e acompanhe seu desempenho
              </p>
            </div>
            <Button size="lg" className="gap-2" onClick={() => setCreateCourseOpen(true)}>
              <Plus className="h-4 w-4" />
              Criar Novo Curso
            </Button>
          </div>

          {/* Courses List */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Meus Cursos</h2>

            {loading ? (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum curso criado
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando seu primeiro curso
                  </p>
                  <Button onClick={() => setCreateCourseOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Curso
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          {course.thumbnail_url ? (
                            <img
                              src={course.thumbnail_url}
                              alt={course.title}
                              className="w-40 h-24 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-40 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xs">Sem imagem</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold line-clamp-1">
                                {course.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">
                                  {course.total_lessons} aula{course.total_lessons > 1 && 's'}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/instructor/courses/${course.id}/edit`)}
                                title="Editar curso"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateCourseDialog
        open={createCourseOpen}
        onOpenChange={setCreateCourseOpen}
        onSuccess={() => {
          loadInstructorData();
        }}
      />
    </>
  );
}
