import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, MapPin, Check, Home, Briefcase } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

interface Address {
  id: string;
  label: string;
  type: 'home' | 'work' | 'other';
  address: string;
  isDefault: boolean;
}

export default function Addresses() {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useApp();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [addressText, setAddressText] = useState('');
  const [type, setType] = useState<'home' | 'work' | 'other'>('work');

  const STORAGE_KEY = `addresses_${user?.id || 'guest'}`;

  // Load addresses on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAddresses(JSON.parse(saved));
    } else {
      // Default initial address from profile location
      const initial: Address[] = [
        {
          id: 'addr-default',
          label: profile?.role === 'seller' ? 'Main Store' : 'Main Workshop',
          type: 'work',
          address: profile?.location || 'Plot 124, Gudu District, Abuja',
          isDefault: true,
        },
      ];
      setAddresses(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  }, [profile, STORAGE_KEY]);

  const saveAddresses = (updated: Address[]) => {
    setAddresses(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !addressText.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      label: label.trim(),
      type,
      address: addressText.trim(),
      isDefault: addresses.length === 0, // default if first
    };

    const next = [...addresses, newAddr];
    saveAddresses(next);
    setIsAdding(false);
    setLabel('');
    setAddressText('');
    setType('work');
    toast.success('Address added successfully!');
  };

  const handleDelete = (id: string) => {
    const target = addresses.find((a) => a.id === id);
    if (target?.isDefault && addresses.length > 1) {
      toast.error('Cannot delete default address. Set another default first.');
      return;
    }
    const next = addresses.filter((a) => a.id !== id);
    saveAddresses(next);
    toast.success('Address removed');
  };

  const handleSetDefault = async (id: string) => {
    const next = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveAddresses(next);

    const defaultAddr = addresses.find((a) => a.id === id);
    if (defaultAddr) {
      try {
        await updateProfile({ location: defaultAddr.address });
      } catch (err) {
        console.error('Failed to sync default address to profile');
      }
    }
    toast.success('Default address updated!');
  };

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-6 flex-1 pb-24 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-foreground hover:bg-muted p-2 rounded-full transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Addresses</h1>
            <p className="text-xs text-muted-foreground">Manage your pickup and delivery locations.</p>
          </div>
        </div>

        {isAdding ? (
          <Card className="p-5 rounded-[28px] border border-border bg-card space-y-4">
            <h3 className="font-bold text-sm">Add New Location</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="label">Address Label</Label>
                <Input
                  id="label"
                  placeholder="e.g. Apo Warehouse, Garki Workshop"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Location Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['work', 'home', 'other'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                        type === t
                          ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                          : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  placeholder="e.g. Plot 15, Garki II, Abuja"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-xl h-11 font-bold">
                  Save Address
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full h-13 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 shadow-none cursor-pointer"
          >
            <Plus size={18} />
            Add New Address
          </Button>
        )}

        <div className="space-y-3">
          {addresses.map((item) => (
            <Card
              key={item.id}
              className={`p-5 rounded-[28px] border transition-all flex gap-4 ${
                item.isDefault ? 'border-primary/20 bg-primary/[0.01]' : 'border-border bg-card'
              }`}
            >
              <div className={`p-3 rounded-2xl shrink-0 self-start ${
                item.isDefault ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {item.type === 'home' ? <Home size={18} /> : item.type === 'work' ? <Briefcase size={18} /> : <MapPin size={18} />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-foreground">{item.label}</h4>
                  {item.isDefault && (
                    <span className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.address}</p>

                {!item.isDefault && (
                  <button
                    onClick={() => handleSetDefault(item.id)}
                    className="text-[10px] text-primary hover:underline font-bold mt-2 cursor-pointer flex items-center gap-1"
                  >
                    Set as Default
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="text-muted-foreground/40 hover:text-destructive p-2 rounded-full hover:bg-destructive/10 transition-all self-center cursor-pointer"
                title="Delete address"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
