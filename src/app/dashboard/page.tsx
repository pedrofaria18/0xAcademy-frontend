'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { coursesAPI, userAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  PlayCircle,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EnrolledCourse {
  id: string;
  title: string;
}

interface UserStats {
  courses_enrolled: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useWeb3Auth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [stats, setStats] = useState<UserStats>({
    courses_enrolled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const enrolledData = await coursesAPI.getEnrolled();

      setStats({
        courses_enrolled: enrolledData.enrollments?.length || 0,
      });

      const mappedCourses = enrolledData.enrollments?.map((enrollment: any) => {
        return {
          id: enrollment.course.id,
          title: enrollment.course.title
        };
      }) || [];

      setEnrolledCourses(mappedCourses);
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard');
      console.error('Dashboard error:', error);
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
              Por favor, conecte sua wallet para acessar o dashboard
            </p>
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
            <h1 className="text-3xl font-bold">Meu Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Bem-vindo de volta, {user?.display_name || 'Estudante'}!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cursos Ativos
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.courses_enrolled}</div>
                <p className="text-xs text-muted-foreground">
                  cursos em andamento
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Continue Learning */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Continue Aprendendo</h2>
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="h-48 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum curso em andamento
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Comece sua jornada de aprendizado explorando nossos cursos
                  </p>
                  <Link href="/courses">
                    <Button>Explorar Cursos</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        {course.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Link href={`/courses/${course.id}`}>
                        <Button className="w-full" variant="outline">
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Continuar
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
