'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { coursesAPI } from '@/lib/api';
import { Lesson } from '@/types/api';
import {
  Loader2,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessonData();
  }, [courseId, lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);

      // Load all lessons for navigation
      const { lessons } = await coursesAPI.getLessons(courseId);

      // Find current lesson
      const currentLesson = lessons.find((l: Lesson) => l.id === lessonId);
      if (!currentLesson) {
        toast.error('Lição não encontrada');
        router.push(`/courses/${courseId}`);
        return;
      }
      setLesson(currentLesson);

    } catch (error: any) {
      console.error('Error loading lesson:', error);
      if (error.response?.status === 403) {
        toast.error('Você precisa estar matriculado neste curso');
        router.push(`/courses/${courseId}`);
      } else {
        toast.error('Erro ao carregar a lição');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 container py-8">
          <div className="animate-pulse max-w-5xl mx-auto">
            <div className="aspect-video bg-muted rounded-lg mb-6"></div>
            <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </main>
      </>
    );
  }

  if (!lesson) {
    return (
      <>
        <Header />
        <main className="flex-1 container py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Lição não encontrada</p>
              <Button
                variant="outline"
                onClick={() => router.push(`/courses/${courseId}`)}
              >
                Voltar ao Curso
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  console.log('Video ID:', lesson.video_url)

  // Construct Cloudflare Stream URL from videoId
  const videoUrl = lesson.video_url
    ? `https://customer-4yntlrebbkshe3nv.cloudflarestream.com/${lesson.video_url}/watch`
    : null;

  console.log('Video URL:', videoUrl)

  return (
    <>
      <Header />
      <main className="flex-1 bg-background">
        <div className="container py-6 max-w-6xl">
          {/* Video Player */}
          {videoUrl ? (
            <div className="mb-6 bg-black rounded-lg overflow-hidden aspect-video">
              <iframe
                src={videoUrl}
                style={{ border: 'none', width: '100%', height: '100%', aspectRatio: '16/9' }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <Card className="mb-6 aspect-video flex items-center justify-center bg-muted">
              <CardContent className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Vídeo sendo processado...
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Isso pode levar alguns minutos. Volte em breve!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Lesson Info */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {lesson.title}
              </h1>
            </div>
          </div>

          {/* Lesson Content */}
          {lesson.content && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Notas da Aula
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
