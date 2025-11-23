import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatAddress, formatPrice } from '@/lib/utils';
import { Users, Clock } from 'lucide-react';
import type { Course } from '@/types/api';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const enrollmentCount = course._count?.count || 0;

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full bg-muted">
            {course.thumbnail_url ? (
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                fill
                className="object-cover rounded-t-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-muted-foreground">Sem imagem</span>
              </div>
            )}
            {course.price_usd === 0 && (
              <Badge className="absolute top-2 right-2">Grátis</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="flex gap-2 mb-2">
            {course.category && (
              <Badge variant="secondary" className="text-xs">
                {course.category}
              </Badge>
            )}
            {course.level && (
              <Badge variant="outline" className="text-xs">
                {course.level}
              </Badge>
            )}
          </div>
          
          <h3 className="font-semibold line-clamp-2 mb-2">{course.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Por {course.instructor?.display_name || (course.instructor ? formatAddress(course.instructor.wallet_address) : 'Instrutor')}
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {enrollmentCount}
            </span>
          </div>
          
          {course.price_usd !== undefined && course.price_usd > 0 && (
            <span className="font-semibold text-primary">
              {formatPrice(course.price_usd)}
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
