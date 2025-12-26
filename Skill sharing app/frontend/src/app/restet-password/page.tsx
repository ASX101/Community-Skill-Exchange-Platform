'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { passwordResetAPI } from '@/lib/api';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="mx-auto max-w-sm w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
              <p><span>Invalid reset link. Please request a new one.</span></p>
              <Button onClick={() => router.push('/forgot-password')} className="w-full mt-4">
                Request New Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

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
      const response = await passwordResetAPI.resetPassword(token, email, password, confirmPassword);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(response.message || 'Failed to reset password');
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
          <CardTitle><span>Reset Password</span></CardTitle>
          <CardDescription>
            {success ? 'Password reset successful!' : 'Enter your new password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-3">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <p><span>Your password has been reset successfully!</span></p>
              <p className="text-sm text-muted-foreground"><span>Redirecting to login in 3 seconds...</span></p>
              <Button onClick={() => router.push('/login')} className="w-full mt-4">
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
