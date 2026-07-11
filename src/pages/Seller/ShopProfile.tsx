import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Store, MapPin, Clock, ShieldCheck } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ShopProfile() {
  const navigate = useNavigate();

  const handleSave = () => {
    toast.success('Shop profile updated!');
    navigate(-1);
  };

  return (
    <MobileContainer>
      <div className="p-6 flex items-center gap-4 sticky top-0 bg-background z-10 border-b border-border">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Shop Profile</h1>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto pb-10">
        {/* Banner & Logo */}
        <div className="space-y-4">
          <div className="h-32 w-full bg-muted rounded-[32px] relative overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground group-hover:bg-black/5 transition-colors">
              <Camera size={32} />
            </div>
          </div>
          <div className="flex justify-center -mt-16 relative">
            <div className="w-24 h-24 rounded-[32px] bg-card border-4 border-background shadow-xl flex items-center justify-center text-primary relative overflow-hidden group">
              <Store size={40} />
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} />
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="shopName">Shop Name</Label>
            <Input id="shopName" defaultValue="Abuja Auto Parts" className="h-14 rounded-xl px-4" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input id="location" defaultValue="Gudu Market, Shop 45" className="h-14 rounded-xl pl-12" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About the Shop</Label>
            <Textarea 
              id="bio" 
              defaultValue="Specialists in Toyota and Honda spare parts. Genuine items only. Fast delivery across Abuja." 
              className="min-h-[120px] rounded-2xl p-4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Opening Time</Label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input defaultValue="08:00 AM" className="h-14 rounded-xl pl-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Closing Time</Label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input defaultValue="06:00 PM" className="h-14 rounded-xl pl-12" />
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-3xl border border-primary/20 flex gap-4 items-center">
            <ShieldCheck className="text-primary" size={24} />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Verified Seller</h4>
              <p className="text-[10px] text-primary/70">Your shop documentation is verified.</p>
            </div>
          </div>

          <Button type="button" size="xl" className="w-full font-bold" onClick={handleSave}>
            Save Profile
          </Button>
        </form>
      </div>
    </MobileContainer>
  );
}
