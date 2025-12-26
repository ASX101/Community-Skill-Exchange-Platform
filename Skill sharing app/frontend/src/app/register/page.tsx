'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { User, Mail, KeyRound, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('learner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleEmailRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setErrors({});

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await register(name, email, password, role);

      if (response.success) {
        toast({
          title: 'Registration Successful!',
          description: 'Please check your email to verify your account. You can then log in.',
        });
        // Redirect to verification pending page or login page
        router.push('/login');
      } else {
        if (response.errors) {
          setErrors(response.errors);
        }
        setError(response.message || 'Registration failed. Please try again.');
        toast({
          title: 'Registration Failed',
          description: response.message || 'An error occurred during registration.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration. Please try again.');
      toast({
        title: 'Error',
        description: 'An error occurred during registration.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle><span>Sign Up</span></CardTitle>
          <CardDescription>
            <span>Join our community to start learning and teaching.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailRegister} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Your Name"
                  required
                  className="pl-9"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Min 8 characters"
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  className="pl-9"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>I want to:</Label>
              <RadioGroup value={role} onValueChange={setRole} className="flex gap-4" disabled={loading}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="learner" id="learner" />
                  <Label htmlFor="learner" className="font-normal cursor-pointer">Learn</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teacher" id="teacher" />
                  <Label htmlFor="teacher" className="font-normal cursor-pointer">Teach</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="font-normal cursor-pointer">Both</Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Create an account'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span>Already have an account?</span>{' '}
            <Link href="/login" className="underline hover:text-primary">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
