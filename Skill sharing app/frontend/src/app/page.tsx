'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, UserPlus, Search, Repeat, Loader } from 'lucide-react';
import SkillCard from '@/components/skill-card';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [featuredSkills, setFeaturedSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await apiClient.get('/skills?limit=8');
        if (response.success) {
          const skills = response.data || [];
          setFeaturedSkills(skills.slice(0, 8));
        }
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Changes based on authentication */}
      <section className="relative text-center py-20 md:py-32 rounded-lg overflow-hidden bg-card">
        <div className="relative z-10 container mx-auto px-4">
          {isAuthenticated ? (
            // Logged-in user greeting
            <>
              <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight">
                <span>Welcome back, {user?.name}!</span>
              </h1>
              <p className="mt-4 md:mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
                <span>Ready to learn or teach? Browse our marketplace and start exchanging skills with the community.</span>
              </p>
              <div className="mt-8 flex justify-center gap-4 flex-wrap">
                <Button asChild size="lg" className="font-bold">
                  <Link href="/skills">Browse Skills <Search className="ml-2" /></Link>
                </Button>
                {(user?.role === 'teacher' || user?.role === 'both') && (
                  <Button asChild size="lg" variant="secondary" className="font-bold">
                    <Link href="/skills/create">Create Skill <ArrowRight className="ml-2" /></Link>
                  </Button>
                )}
                <Button asChild size="lg" variant="outline" className="font-bold">
                  <Link href="/exchanges">My Exchanges <ArrowRight className="ml-2" /></Link>
                </Button>
              </div>
            </>
          ) : (
            // Not logged-in user CTA
            <>
              <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight">
                <span>Exchange Your Skills, Empower Each Other.</span>
              </h1>
              <p className="mt-4 md:mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
                <span>Join a vibrant community of learners and teachers. Swap knowledge, grow your talents, and connect with peers.</span>
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg" className="font-bold">
                  <Link href="/register">Join Now <UserPlus className="ml-2" /></Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="font-bold">
                  <Link href="/skills">Browse Skills <ArrowRight className="ml-2" /></Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* How It Works - Only show for non-authenticated users */}
      {!isAuthenticated && (
        <section>
          <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold"><span>How It Works</span></h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              <span>Getting started is as easy as one, two, three.</span>
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Card className="text-center transform hover:-translate-y-2 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/20 text-primary rounded-full w-16 h-16 flex items-center justify-center">
                  <UserPlus size={32} />
                </div>
                <CardTitle className="mt-4 font-headline">1. Create Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground"><span>Sign up and build your profile. Showcase the skills you can teach and the ones you want to learn.</span></p>
              </CardContent>
            </Card>
            <Card className="text-center transform hover:-translate-y-2 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/20 text-primary rounded-full w-16 h-16 flex items-center justify-center">
                  <Search size={32} />
                </div>
                <CardTitle className="mt-4 font-headline">2. Find a Skill</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground"><span>Browse our marketplace to find skills you're interested in, offered by talented members of the community.</span></p>
              </CardContent>
            </Card>
            <Card className="text-center transform hover:-translate-y-2 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto bg-primary/20 text-primary rounded-full w-16 h-16 flex items-center justify-center">
                  <Repeat size={32} />
                </div>
                <CardTitle className="mt-4 font-headline">3. Exchange & Grow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground"><span>Connect with other users, request an exchange, and start sharing your knowledge. It's that simple!</span></p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Featured Skills - Show for everyone */}
      <section>
        <div className="text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold"><span>Featured Skills</span></h2>
          <p className="mt-2 text-muted-foreground">
            <span>Explore some of the most popular skills being exchanged right now.</span>
          </p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin h-8 w-8" />
          </div>
        ) : featuredSkills.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredSkills.map(skill => (
              <SkillCard 
                key={skill.id} 
                id={skill.id}
                title={skill.title}
                user={skill.teacher?.name || 'Unknown'}
                category={skill.category}
                rating={skill.rating}
                reviews={skill.total_reviews}
                imageUrl={skill.image_url}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No skills available at the moment</p>
          </div>
        )}
      </section>
    </div>
  );
}