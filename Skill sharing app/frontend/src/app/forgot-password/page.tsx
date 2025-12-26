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
import Link from "next/link";
import { Mail, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { passwordResetAPI } from '@/lib/api';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await passwordResetAPI.forgotPassword(email);

      if (response.success) {
        setEmailSent(true);
        toast({
          title: 'Password Reset Email Sent',
          description: 'Check your inbox for a link to reset your password.',
        });
      } else {
        setError(response.message || 'Failed to send reset link');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle><span>Forgot Password</span></CardTitle>
          <CardDescription>
            {emailSent
              ? 'An email has been sent with instructions.'
              : 'Enter your email and we will send you a link to reset your password.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {emailSent ? (
            <div className="text-center space-y-3">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <p><span>Password reset link has been sent to your email.</span></p>
              <p className="text-sm text-muted-foreground"><span>If you don't see the email, please check your spam folder.</span></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
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
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            <span>Remembered your password?</span>{' '}
            <Link href="/login" className="underline hover:text-primary">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
