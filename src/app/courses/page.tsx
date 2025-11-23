'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { coursesAPI } from '@/lib/api';
import { CourseCard } from '@/components/courses/course-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Course } from '@/types/api';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCourses();
  }, [page, search]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesAPI.list({ 
        page, 
        limit: 12, 
        search: search || undefined 
      });
      setCourses(data.courses);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Erro ao carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCourses();
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Explorar Cursos</h1>
            <p className="mt-2 text-muted-foreground">
              Descubra os melhores cursos sobre Web3, Blockchain e Criptomoedas
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2 max-w-md">
              <Input
                type="search"
                placeholder="Buscar cursos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <Button variant="outline" size="default">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum curso encontrado</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
