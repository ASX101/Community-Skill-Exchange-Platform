'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Repeat, Bookmark, MapPin, Star, User, AlertCircle, Loader } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { ReviewCard } from '@/components/review-card';

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const skillId = params.id as string;

  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [exchangeData, setExchangeData] = useState({
    start_date: '',
    end_date: '',
    notes: '',
  });
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const response = await apiClient.get(`/skills/${skillId}`);
        if (response.success) {
          setSkill(response.data);
        } else {
          toast({ title: 'Error', description: 'Skill not found', variant: 'destructive' });
          router.push('/skills');
        }
      } catch (error) {
        console.error('Failed to fetch skill:', error);
        toast({ title: 'Error', description: 'Failed to load skill', variant: 'destructive' });
        router.push('/skills');
      } finally {
        setLoading(false);
      }
    };

    if (skillId) {
      fetchSkill();
    }
  }, [skillId, router, toast]);

  useEffect(() => {
    if (skill?.id) {
      fetchReviews();
    }
  }, [skill?.id]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await apiClient.get(`/reviews/skill/${skillId}`);
      if (response.success) {
        setReviews(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && skill?.id && !authLoading) {
      checkBookmarkStatus();
    }
  }, [isAuthenticated, skill?.id, authLoading]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await apiClient.get(`/bookmarks/check/${skill.id}`);
      if (response.success) {
        setIsBookmarked(response.data?.is_bookmarked || false);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleRequestExchange = async () => {
    if (!isAuthenticated) {
      toast({ 
        title: 'Error',
        description: 'Please login to request exchanges',
        variant: 'destructive'
      });
      router.push('/login');
      return;
    }

    if (user?.role === 'teacher') {
      toast({ 
        title: 'Error',
        description: 'Only learners or users with both roles can request exchanges.',
        variant: 'destructive'
      });
      return;
    }

    // Validate dates
    if (!exchangeData.start_date || !exchangeData.end_date) {
      toast({ 
        title: 'Error',
        description: 'Please select both start and end dates',
        variant: 'destructive'
      });
      return;
    }

    if (new Date(exchangeData.start_date) >= new Date(exchangeData.end_date)) {
      toast({ 
        title: 'Error',
        description: 'End date must be after start date',
        variant: 'destructive'
      });
      return;
    }

    setExchangeLoading(true);
    try {
      const response = await apiClient.post('/exchanges', {
        skill_id: skill.id,
        start_date: exchangeData.start_date,
        end_date: exchangeData.end_date,
        notes: exchangeData.notes || null,
      });

      if (response.success) {
        toast({ 
          title: 'Success', 
          description: 'Exchange request sent to the teacher!' 
        });
        setExchangeDialogOpen(false);
        // Reset form
        setExchangeData({
          start_date: '',
          end_date: '',
          notes: '',
        });
      } else {
        toast({ 
          title: 'Error',
          description: response.message || 'Failed to send exchange request',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Exchange error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to request exchange',
        variant: 'destructive'
      });
    } finally {
      setExchangeLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast({ 
        title: 'Error',
        description: 'Please login to bookmark skills',
        variant: 'destructive'
      });
      router.push('/login');
      return;
    }

    setBookmarkLoading(true);
    try {
      let response;
      
      if (isBookmarked) {
        // Remove bookmark
        response = await apiClient.delete(`/bookmarks/${skill.id}`);
      } else {
        // Add bookmark
        response = await apiClient.post('/bookmarks', {
          skill_id: skill.id,
        });
      }

      if (response.success) {
        setIsBookmarked(!isBookmarked);
        toast({ 
          title: 'Success', 
          description: isBookmarked ? 'Bookmark removed' : 'Skill bookmarked!' 
        });
      } else {
        console.error('Bookmark response:', response);
        toast({ 
          title: 'Error',
          description: response.message || 'Failed to bookmark skill',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Bookmark error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to bookmark skill',
        variant: 'destructive'
      });
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Please login to submit a review',
        variant: 'destructive'
      });
      router.push('/login');
      return;
    }

    if (!reviewData.comment.trim()) {
      toast({
        title: 'Error',
        description: 'Please write a comment',
        variant: 'destructive'
      });
      return;
    }

    setReviewLoading(true);
    try {
      const response = await apiClient.post('/reviews', {
        skill_id: skill.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        reviewee_id: skill.teacher_id,
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Review submitted successfully!'
        });
        setReviewDialogOpen(false);
        setReviewData({ rating: 5, comment: '' });
        fetchReviews();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to submit review',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Review error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive'
      });
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-12">
        <Loader className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="max-w-5xl mx-auto text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Skill not found</h1>
        <Link href="/skills">
          <Button className="mt-4">Back to Skills</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="p-0">
              {skill.image_url && (
                <Image
                  src={skill.image_url}
                  alt={skill.title}
                  width={800}
                  height={450}
                  className="rounded-t-lg object-cover w-full h-56"
                />
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {skill.category && (
                <Badge variant="secondary">
                  {typeof skill.category === 'object' ? skill.category.name : skill.category}
                </Badge>
              )}
              <h1 className="font-headline text-3xl md:text-4xl font-bold mt-2">
                <span>{skill.title}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground mt-4">
                {skill.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold">{skill.rating}</span>
                  </div>
                )}
              </div>
              <p className="mt-6 text-foreground/80 whitespace-pre-wrap">{skill.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle><span>Offered by</span></CardTitle>
            </CardHeader>
            <CardContent>
              {skill.teacher ? (
                <Link href={`/profile/${skill.teacher_id}`} className="flex items-center gap-4 group">
                  <Avatar className="h-16 w-16">
                    {skill.teacher.avatar_url && (
                      <AvatarImage src={skill.teacher.avatar_url} alt={skill.teacher.name} />
                    )}
                    <AvatarFallback className="text-2xl">{skill.teacher.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      <span>{skill.teacher.name}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground"><span>View Profile</span></p>
                  </div>
                </Link>
              ) : (
                <p className="text-muted-foreground">Teacher info not available</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            {isAuthenticated ? (
              <>
                <Dialog open={exchangeDialogOpen} onOpenChange={setExchangeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      <Repeat className="mr-2 h-5 w-5" /> Request Exchange
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Skill Exchange</DialogTitle>
                      <DialogDescription>
                        Set the dates for your skill exchange with {skill.teacher?.name || 'the teacher'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={exchangeData.start_date}
                          onChange={(e) => 
                            setExchangeData({ ...exchangeData, start_date: e.target.value })
                          }
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={exchangeData.end_date}
                          onChange={(e) => 
                            setExchangeData({ ...exchangeData, end_date: e.target.value })
                          }
                          min={exchangeData.start_date || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any specific goals or requirements for this exchange?"
                          value={exchangeData.notes}
                          onChange={(e) => 
                            setExchangeData({ ...exchangeData, notes: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setExchangeDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleRequestExchange}
                        disabled={exchangeLoading}
                      >
                        {exchangeLoading ? 'Sending...' : 'Send Request'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => router.push('/login')}
              >
                <Repeat className="mr-2 h-5 w-5" /> Login to Request Exchange
              </Button>
            )}
            <Button 
              size="lg" 
              variant={isBookmarked ? "default" : "outline"}
              className="w-full" 
              onClick={handleBookmark}
              disabled={!isAuthenticated || bookmarkLoading}
            >
              <Bookmark className={`mr-2 h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} /> 
              {bookmarkLoading ? 'Loading...' : (isBookmarked ? 'Bookmarked' : 'Bookmark Skill')}
            </Button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reviews ({reviews.length})</CardTitle>
                {isAuthenticated && (
                  <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Star className="mr-2 h-4 w-4" /> Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                        <DialogDescription>
                          Share your experience learning this skill
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setReviewData({ ...reviewData, rating: star })}
                                className="p-0 border-0 bg-transparent hover:opacity-80"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= reviewData.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="comment">Comment</Label>
                          <Textarea
                            id="comment"
                            placeholder="What did you think about this skill?"
                            value={reviewData.comment}
                            onChange={(e) =>
                              setReviewData({ ...reviewData, comment: e.target.value })
                            }
                            rows={4}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setReviewDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitReview}
                          disabled={reviewLoading}
                        >
                          {reviewLoading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="animate-spin h-6 w-6" />
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No reviews yet. Be the first to review this skill!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}