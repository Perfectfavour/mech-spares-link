import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { isSupabaseActive } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);

    try {
      if (isSupabaseActive) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) throw error;
        toast.success('Password reset link sent to your email!');
      } else {
        // Mock Success
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success('Mock Mode: Password reset link sent to ' + email);
      }
      navigate('/login');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to send reset link. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] overflow-y-auto bg-background flex flex-col justify-between p-6 max-w-md mx-auto no-scrollbar">
      <div className="pt-8 pb-4 flex flex-col items-center gap-3">
        <div className="bg-primary p-3 rounded-2xl text-white">
          <KeyRound size={28} />
        </div>
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground text-sm text-center">
          Enter your email to receive a password reset link
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4 flex-1 flex flex-col justify-center py-4">
        <div className="space-y-1">
          <Label htmlFor="resetEmail">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              id="resetEmail" 
              type="email" 
              placeholder="name@workshop.com" 
              className="h-12 rounded-xl pl-12 pr-4" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full mt-4 h-12 rounded-xl font-bold" disabled={loading}>
          {loading ? 'Sending Link...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="py-4 text-center mt-auto">
        <p className="text-muted-foreground text-sm">
          Remember your password? <Link to="/login" className="text-primary font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
