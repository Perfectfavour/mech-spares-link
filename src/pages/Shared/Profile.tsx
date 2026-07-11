import { useNavigate } from 'react-router-dom';
import { User, MapPin, Settings, Bell, Shield, LogOut, ChevronRight, Store, Wrench } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

export default function Profile() {
  const navigate = useNavigate();
  const { role, setRole, signOutUser } = useApp();

  const handleLogout = async () => {
    await signOutUser();
    navigate('/login');
  };

  const menuItems = [
    { icon: User, label: 'Edit Profile' },
    { icon: MapPin, label: 'Manage Addresses' },
    { icon: Bell, label: 'Notifications' },
    { icon: Shield, label: 'Privacy & Security' },
    { icon: Settings, label: 'App Settings' },
  ];

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-bold">Profile</h1>

        {/* User Card */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-24 h-24 rounded-[32px] bg-primary/10 border-4 border-background shadow-xl flex items-center justify-center text-primary">
            <User size={48} />
          </div>
          <div>
            <h2 className="text-xl font-bold">John Doe</h2>
            <p className="text-sm text-muted-foreground">john.doe@workshop.com</p>
          </div>
          <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
            {role === 'mechanic' ? 'Certified Mechanic' : 'Verified Seller'}
          </span>
        </div>

        {/* Role Toggle for MVP/Demo */}
        <Card className="p-5 rounded-[32px] border-2 border-primary/20 bg-primary/5 space-y-4">
          <div className="flex items-center gap-3">
            {role === 'mechanic' ? <Store className="text-primary" /> : <Wrench className="text-primary" />}
            <div className="flex-1">
              <h4 className="font-bold text-sm">Switch to {role === 'mechanic' ? 'Seller' : 'Mechanic'} View</h4>
              <p className="text-[10px] text-muted-foreground">Demo feature: Switch roles to test both experiences.</p>
            </div>
          </div>
          <Button 
            className="w-full rounded-2xl font-bold" 
            variant="outline"
            onClick={() => {
              setRole(role === 'mechanic' ? 'seller' : 'mechanic');
              navigate('/');
            }}
          >
            Switch View
          </Button>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <button 
              key={i} 
              className="w-full p-5 bg-card rounded-[28px] border border-border flex items-center gap-4 active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <item.icon size={20} />
              </div>
              <span className="flex-1 text-left font-bold text-sm">{item.label}</span>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        <button 
          onClick={handleLogout}
          className="w-full p-5 flex items-center gap-4 text-destructive active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut size={20} />
          </div>
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
