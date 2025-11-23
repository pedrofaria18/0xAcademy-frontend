'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { coursesAPI, userAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  PlayCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Course as APICourse, Lesson as APILesson } from '@/types/api';

interface EnhancedLesson extends APILesson {
  is_preview: boolean;
  is_completed: boolean;
}

interface EnhancedCourse extends Omit<APICourse, 'lessons'> {
  lessons: EnhancedLesson[];
  duration_hours: number;
  total_students: number;
  rating: number;
  is_enrolled: boolean;
  progress?: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { isAuthenticated, handleLogin, user } = useWeb3Auth();
  const [course, setCourse] = useState<EnhancedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Formata duração em minutos (decimal) para "MM:SS"
  const formatDuration = (minutes: number | null | undefined): string => {
    if (!minutes) return '0:00';
    const totalSeconds = Math.round(minutes * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId, isAuthenticated]);

  const loadCourse = async () => {
    try {
      setLoading(true);

      // Carregar dados do curso
      const { course: courseData, hasFullAccess } = await coursesAPI.get(courseId);

      // Carregar aulas do curso se tiver acesso
      let lessonsData: APILesson[] = [];
      if (hasFullAccess) {
        try {
          const result = await coursesAPI.getLessons(courseId);
          lessonsData = result.lessons;
        } catch (error) {
          console.log('Lessons not available');
        }
      } else if (courseData.lessons) {
        lessonsData = courseData.lessons;
      }

      // Se usuário está autenticado, buscar progresso
      let progressData = null;
      let completedLessonIds: string[] = [];
      if (isAuthenticated) {
        try {
          const userProgress = await userAPI.getProgress();
          progressData = userProgress.progress?.find((p: any) => p.course_id === courseId);
          completedLessonIds = progressData?.progress?.filter((p: any) => p.completed).map((p: any) => p.lesson_id) || [];
        } catch (error) {
          console.log('Progress not available');
        }
      }

      // Calcular duração total em horas
      const totalMinutes = lessonsData.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0);
      const duration_hours = Math.ceil(totalMinutes / 60);

      // Mapear aulas para o formato esperado
      const mappedLessons: EnhancedLesson[] = lessonsData.map((lesson) => ({
        ...lesson,
        is_preview: lesson.is_free || false,
        is_completed: completedLessonIds.includes(lesson.id),
      }));

      setCourse({
        ...courseData,
        lessons: mappedLessons,
        duration_hours,
        total_students: courseData._count?.count || 0,
        rating: 4.8, // TODO: Implementar sistema de avaliação
        is_enrolled: hasFullAccess,
        progress: progressData?.progressPercentage || 0,
      });
    } catch (error) {
      toast.error('Erro ao carregar curso');
      console.error('Course load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      handleLogin();
      return;
    }

    try {
      setEnrolling(true);
      await coursesAPI.enroll(courseId);
      toast.success('Inscrito com sucesso!');

      // Recarregar dados do curso para atualizar status de inscrição
      await loadCourse();
    } catch (error) {
      toast.error('Erro ao realizar inscrição');
      console.error('Enrollment error:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    if (!course?.is_enrolled) {
      toast.error('Você precisa se inscrever no curso primeiro');
      return;
    }
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="h-64 bg-muted animate-pulse" />
          <div className="container py-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <main className="flex-1 container py-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Curso não encontrado</h1>
            <p className="mt-4 text-muted-foreground">
              O curso que você está procurando não existe
            </p>
            <Button className="mt-4" onClick={() => router.push('/courses')}>
              Ver Todos os Cursos
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
        {/* Hero Section */}
        <div className="relative h-64 overflow-hidden">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Info */}
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.category && <Badge>{course.category}</Badge>}
                  {course.level && <Badge variant="secondary">{course.level}</Badge>}
                </div>
                <h1 className="text-4xl font-bold mb-4">{course.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.total_students.toLocaleString()} alunos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration_hours}h de conteúdo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons.length} aulas</span>
                  </div>
                </div>

                {course.is_enrolled && course.progress !== undefined && (
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Seu progresso</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Sobre o Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-muted-foreground">
                    {course.description}
                  </p>
                </CardContent>
              </Card>

              {/* Lessons */}
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo do Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors ${lesson.is_completed ? 'bg-accent/50' : ''
                          }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0">
                            {lesson.is_completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : course.is_enrolled || lesson.is_preview ? (
                              <PlayCircle className="h-5 w-5 text-primary" />
                            ) : (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {index + 1}. {lesson.title}
                              </h4>
                              {lesson.is_preview && (
                                <Badge variant="outline" className="text-xs">
                                  Preview
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {lesson.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(lesson.duration_minutes)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartLesson(lesson.id)}
                          >
                            {lesson.is_completed ? 'Revisar' : 'Assistir'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Instructor */}
              <Card>
                <CardHeader>
                  <CardTitle>Instrutor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {course.instructor?.display_name?.charAt(0).toUpperCase() || 'I'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {course.instructor?.display_name || 'Instrutor'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.instructor?.wallet_address?.slice(0, 6)}...{course.instructor?.wallet_address?.slice(-4)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="pt-6 space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {course.price_usd ? `$${course.price_usd.toFixed(2)}` : 'Gratuito'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Acesso vitalício
                    </p>
                  </div>

                  {/* Enroll Button */}
                  {course.is_enrolled ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleStartLesson(course.lessons[0].id)}
                    >
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Continuar Aprendendo
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? 'Inscrevendo...' : 'Inscrever-se Agora'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
