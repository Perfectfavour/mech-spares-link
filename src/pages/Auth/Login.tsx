import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { Eye, EyeOff, Wrench, Store } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { signInUser, setRole } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRoleLocal] = useState<'mechanic' | 'seller'>('mechanic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Optimistically set roles for demo experience or wait for profile retrieval
    setRole(role);
    try {
      await signInUser(email, password, role);
      toast.success('Welcome back to FixLink!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 max-w-md mx-auto">
      <div className="py-12 flex flex-col items-center gap-4">
        <div className="bg-primary p-3 rounded-2xl text-white">
          <Wrench size={32} />
        </div>
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to continue your work</p>
      </div>

      <div className="flex p-1 bg-muted rounded-2xl mb-8">
        <button
          onClick={() => setRoleLocal('mechanic')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
            role === 'mechanic' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
          }`}
        >
          <Wrench size={18} />
          <span className="font-semibold">Mechanic</span>
        </button>
        <button
          onClick={() => setRoleLocal('seller')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
            role === 'seller' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
          }`}
        >
          <Store size={18} />
          <span className="font-semibold">Seller</span>
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-6 flex-1">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="name@workshop.com" 
            className="h-14 rounded-xl px-4" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-14 rounded-xl px-4 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground p-3 min-h-12 min-w-12 flex items-center justify-center"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link to="#" className="text-primary font-medium text-sm">Forgot Password?</Link>
        </div>

        <Button type="submit" size="xl" className="w-full" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Don't have an account? <Link to="/signup" className="text-primary font-bold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
