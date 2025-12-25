'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars } from '@/components/rating-stars';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export interface Review {
  id: number;
  reviewer: {
    id: number;
    name: string;
    avatar_url?: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.reviewer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const timeAgo = formatDistanceToNow(new Date(review.created_at), {
    addSuffix: true,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.reviewer.avatar_url} alt={review.reviewer.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-medium text-sm">{review.reviewer.name}</p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
        <RatingStars rating={review.rating} size="sm" />
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
      
      <Separator className="my-4" />
    </div>
  );
}

export default ReviewCard;
