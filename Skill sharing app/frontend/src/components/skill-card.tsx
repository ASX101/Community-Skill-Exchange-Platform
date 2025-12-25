import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookmarkButton } from './bookmark-button';

type SkillCardProps = {
  id: number | string;
  title: string;
  user: string;
  category: string | { id: number; name: string; description?: string };
  rating?: number;
  reviews?: number;
  imageUrl?: string;
};

const getCategoryGradient = (categoryName: string) => {
  const gradients: { [key: string]: string } = {
    'programming': 'from-blue-500 to-cyan-500',
    'design': 'from-purple-500 to-pink-500',
    'business': 'from-green-500 to-emerald-500',
    'photography': 'from-orange-500 to-red-500',
    'music': 'from-rose-500 to-purple-500',
    'language': 'from-yellow-500 to-amber-500',
    'fitness': 'from-red-500 to-pink-500',
    'cooking': 'from-orange-600 to-orange-400',
  };
  
  const key = categoryName.toLowerCase();
  return gradients[key] || 'from-slate-500 to-blue-500';
};

const SkillCard = ({ id, title, user, category, rating = 0, reviews = 0, imageUrl }: SkillCardProps) => {
  const categoryName = typeof category === 'string' ? category : category?.name || 'Uncategorized';
  const gradientClass = getCategoryGradient(categoryName);

  return (
    <Card className={cn("overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-lg hover:border-primary/50 card")}>
      <CardHeader className="p-0 relative">
        <Link href={`/skills/${id}`}>
          <div className="aspect-video w-full bg-muted flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                width={600}
                height={400}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className={cn("w-full h-full bg-gradient-to-br", gradientClass, "flex items-center justify-center text-center px-4 group-hover:scale-105 transition-transform duration-300")}>
                <div className="text-white">
                  <div className="text-sm font-semibold mb-2">{categoryName}</div>
                  <div className="text-lg font-headline font-bold line-clamp-2">{title}</div>
                </div>
              </div>
            )}
          </div>
        </Link>
        <Badge className={cn("absolute top-2 right-2 badge")} variant="secondary">
          {categoryName}
        </Badge>
        <BookmarkButton skillId={parseInt(String(id))} />
      </CardHeader>
      <CardContent className={cn("p-4 flex-grow")}>
        <h3 className={cn("font-headline text-lg font-bold truncate title")}>
          <Link href={`/skills/${id}`} className="hover:text-primary transition-colors">
            <span>{title}</span>
          </Link>
        </h3>
        <div className={cn("flex items-center gap-2 mt-2 text-sm text-muted-foreground meta")}>
          <Avatar className="h-6 w-6">
            <AvatarFallback>{user?.charAt(0) || '?'}</AvatarFallback>
          </Avatar>
          <span>{user}</span>
        </div>
        {rating > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs">⭐ {rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reviews} reviews)</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" variant="secondary">
          <Link href={`/skills/${id}`}>View Skill <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SkillCard;