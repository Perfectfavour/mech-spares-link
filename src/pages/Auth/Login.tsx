import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { Eye, EyeOff, Wrench, Store, MailCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { signInUser, resendConfirmation, authError } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await signInUser(email, password);
      if (success) {
        toast.success('Welcome back to FixLink!');
        navigate('/');
      } else if (authError?.includes('Email not confirmed')) {
        setShowResend(true);
        toast.error('Please confirm your email before logging in');
      } else {
        toast.error(authError || 'Failed to sign in. Please check your credentials.');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendConfirmation(email);
      toast.success('Confirmation email sent! Please check your inbox.');
    } catch (error) {
      toast.error('Failed to resend confirmation email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] overflow-y-auto bg-background flex flex-col justify-between p-6 max-w-md mx-auto no-scrollbar">
      <div className="pt-8 pb-4 flex flex-col items-center gap-3">
        <div className="bg-primary p-3 rounded-2xl text-white">
          <Wrench size={28} />
        </div>
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground text-sm">Sign in to continue your work</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 flex-1 flex flex-col justify-center py-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@workshop.com"
            className="h-12 rounded-xl px-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-12 rounded-xl px-4 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-2 min-h-10 min-w-10 flex items-center justify-center"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {showResend && (
          <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
            <MailCheck className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Email not confirmed.{' '}
              <button
                type="button"
                onClick={handleResend}
                className="text-primary font-medium hover:underline"
                disabled={loading}
              >
                Resend confirmation email
              </button>
            </span>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Link to="/forgot-password" className="text-primary font-medium text-xs">Forgot Password?</Link>
        </div>

        <Button type="submit" size="lg" className="w-full mt-4 h-12 rounded-xl font-bold" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="py-4 text-center mt-auto">
        <p className="text-muted-foreground text-sm">
          Don't have an account? <Link to="/signup" className="text-primary font-bold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
