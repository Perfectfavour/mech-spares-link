import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { Wrench, Store, User, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUpUser } = useApp();
  const [role, setRoleLocal] = useState<'mechanic' | 'seller'>('mechanic');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpUser(email, password, fullName, role, businessName);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] overflow-y-auto bg-background flex flex-col justify-between p-6 max-w-md mx-auto no-scrollbar">
      <div className="pt-6 pb-2 flex flex-col items-center gap-3">
        <div className="bg-primary p-3 rounded-2xl text-white">
          <Store size={28} />
        </div>
        <h1 className="text-2xl font-bold">Join FixLink</h1>
        <p className="text-muted-foreground text-sm text-center">
          Join the network of professional mechanics and sellers in Abuja.
        </p>
      </div>

      <div className="flex p-1 bg-muted rounded-2xl mb-4">
        <button
          onClick={() => setRoleLocal('mechanic')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
            role === 'mechanic' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
          }`}
        >
          <Wrench size={18} />
          <span className="font-semibold text-sm">Mechanic</span>
        </button>
        <button
          onClick={() => setRoleLocal('seller')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
            role === 'seller' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
          }`}
        >
          <Store size={18} />
          <span className="font-semibold text-sm">Seller</span>
        </button>
      </div>

      <form onSubmit={handleSignUp} className="space-y-3 flex-1 flex flex-col justify-center py-2">
        <div className="space-y-1">
          <Label htmlFor="fullname">Full Name</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              id="fullname" 
              placeholder="John Doe" 
              className="h-12 rounded-xl pl-12" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              id="email" 
              type="email" 
              placeholder="john@example.com" 
              className="h-12 rounded-xl pl-12" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="workshop">
            {role === 'mechanic' ? 'Workshop Name' : 'Store Name'}
          </Label>
          <div className="relative">
            {role === 'mechanic' ? (
              <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            ) : (
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            )}
            <Input 
              id="workshop" 
              placeholder={role === 'mechanic' ? "Precision Motors" : "Abuja Spare Parts Hub"} 
              className="h-12 rounded-xl pl-12" 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required 
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              className="h-12 rounded-xl pl-12" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full mt-4 h-12 rounded-xl font-bold" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="py-4 text-center mt-auto">
        <p className="text-muted-foreground text-sm">
          Already have an account? <Link to="/login" className="text-primary font-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

