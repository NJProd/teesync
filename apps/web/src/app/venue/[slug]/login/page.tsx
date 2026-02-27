'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { useTenant } from '@/lib/tenant-context';
import { Monitor, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { signIn } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo mode — skip Firebase auth entirely
  const isDemoMode = slug === 'demo';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isDemoMode) {
        // Demo: just redirect to POS
        router.push(`/venue/${slug}/pos`);
        return;
      }

      await signIn(email, password);
      router.push(`/venue/${slug}/pos`);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    router.push(`/venue/${slug}/pos`);
  }

  if (tenantLoading && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-4">
            <Monitor className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {isDemoMode ? 'Tee Sync Demo' : tenant?.name || 'Tee Sync'}
          </CardTitle>
          <CardDescription>
            {isDemoMode
              ? 'Try the full POS experience with sample data'
              : 'Sign in to access the staff dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isDemoMode ? (
            <div className="space-y-4">
              <Button
                onClick={handleDemoLogin}
                className="w-full"
                size="lg"
              >
                Enter Demo Dashboard
              </Button>
              <p className="text-xs text-zinc-500 text-center">
                No account needed. Explore booking, POS, and customer management
                with pre-loaded sample data.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-zinc-400">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-zinc-400">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
