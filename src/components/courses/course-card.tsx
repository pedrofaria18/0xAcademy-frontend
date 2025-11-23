import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatAddress } from '@/lib/utils';
import { Users } from 'lucide-react';
import type { Course } from '@/types/api';

interface CourseCardProps {
  course: Course;
}

function CourseCardComponent({ course }: CourseCardProps) {
  const enrollmentCount = course._count?.count || 0;

  return (
    <Link href={`/courses/${course.id}`} className="block h-full">
      <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full bg-muted">
            {course.thumbnail_url ? (
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover rounded-t-lg"
                priority={false}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-muted-foreground text-sm">Sem imagem</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {course.category && (
              <Badge variant="secondary" className="text-xs">
                {course.category}
              </Badge>
            )}
            {course.level && (
              <Badge variant="outline" className="text-xs capitalize">
                {course.level}
              </Badge>
            )}
          </div>

          <h3 className="font-semibold line-clamp-2 mb-2 text-base">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {course.description}
          </p>

          <div className="mt-4 text-sm text-muted-foreground">
            <p className="truncate">
              Por{' '}
              {course.instructor?.display_name ||
                (course.instructor
                  ? formatAddress(course.instructor.wallet_address)
                  : 'Instrutor')}
            </p>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{enrollmentCount} alunos</span>
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

export const CourseCard = memo(CourseCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.course.id === nextProps.course.id &&
    prevProps.course.title === nextProps.course.title &&
    prevProps.course._count?.count === nextProps.course._count?.count
  );
});
