'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const userId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setError(null);
        
        // Fetch user profile
        const userResponse = await apiClient.get(`/users/${userId}`);
        
        if (!userResponse || !userResponse.success) {
          throw new Error(userResponse?.message || 'Failed to load user profile');
        }

        setUser(userResponse.data);

        // Fetch user's skills
        try {
          const skillsResponse = await apiClient.get(`/skills/user/${userId}`);
          if (skillsResponse && skillsResponse.success) {
            setSkills(skillsResponse.data || []);
          } else {
            setSkills([]);
          }
        } catch (skillError) {
          console.error('Failed to fetch user skills:', skillError);
          setSkills([]);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setError(error.message || 'Failed to load profile');
        toast({ 
          title: 'Error', 
          description: error.message || 'Failed to load profile',
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-lg font-bold">Failed to Load Profile</h2>
              <p className="text-sm text-muted-foreground text-center">{error || 'User not found'}</p>
              <Button asChild variant="outline">
                <Link href="/skills">Back to Skills</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and basic info */}
          <div className="flex gap-6">
            <div className="w-32 h-32 relative rounded-full overflow-hidden bg-primary/20 flex-shrink-0">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-4">
                <Badge>{user.role}</Badge>
                <Badge variant="outline">{user.status}</Badge>
              </div>
              {user.rating && (
                <p className="mt-4">⭐ {user.rating} ({user.total_reviews} reviews)</p>
              )}
            </div>
          </div>

          {user.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{user.bio}</p>
            </div>
          )}

          {currentUser?.id === user.id && (
            <Button asChild>
              <Link href="/profile/edit">Edit Profile</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Skills Section */}
      {skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills ({skills.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {skills.map(skill => (
                <Card key={skill.id} className="p-4">
                  <Link href={`/skills/${skill.id}`} className="hover:text-primary">
                    <h3 className="font-semibold">{skill.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{skill.level}</Badge>
                      <Badge variant="outline">{skill.duration}</Badge>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}