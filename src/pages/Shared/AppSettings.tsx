import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, HelpCircle, PhoneCall, Globe } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AppSettings() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const handleThemeChange = (selected: 'light' | 'dark') => {
    setTheme(selected);
    localStorage.setItem('app_theme', selected);
    document.documentElement.classList.toggle('dark', selected === 'dark');
    toast.success(`${selected.charAt(0).toUpperCase() + selected.slice(1)} mode applied!`);
  };

  return (
    <MobileContainer hasBottomNav>
      <div className="p-8 space-y-8 flex-1 pb-24 overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center gap-5">
          <button onClick={() => navigate(-1)} className="text-foreground hover:bg-muted p-2.5 rounded-full transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">App Settings</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Adjust default app preferences.</p>
          </div>
        </div>

        {/* Interface Preferences */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Interface Preferences</h3>
          
          <Card className="p-6 rounded-[28px] border border-border bg-card space-y-6 shadow-sm">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Visual Theme</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Toggle between dark and light modes.</p>
                </div>
              </div>
              
              <div className="flex gap-1.5 bg-muted p-1 rounded-xl shrink-0">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    theme === 'light' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    theme === 'dark' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-border/40 py-1">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Globe size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Default Currency</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Select price tags layout format.</p>
                </div>
              </div>
              
              <div className="flex gap-1.5 bg-muted p-1 rounded-xl shrink-0">
                <button
                  onClick={() => {
                    setCurrency('NGN');
                    toast.success('Currency set to NGN (₦)');
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currency === 'NGN' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  ₦ NGN
                </button>
                <button
                  onClick={() => {
                    setCurrency('USD');
                    toast.success('Currency set to USD ($)');
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currency === 'USD' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>
          </Card>
        </section>

        {/* Support Hotline */}
        <section className="space-y-4">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">Support & Help</h3>

          <Card className="p-6 rounded-[28px] border border-border bg-card space-y-6 shadow-sm">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
                  <PhoneCall size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Call Support Hub</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Speak with help reps: +234 803 000 0000</p>
                </div>
              </div>
              <a
                href="tel:+2348030000000"
                className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
              >
                Call
              </a>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-border/40 py-1">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">User Manual</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Learn how to buy or list spare parts.</p>
                </div>
              </div>
              <button
                onClick={() => toast.info('Sourcing manual download link...')}
                className="bg-muted text-foreground border border-border text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-muted/80 transition-all cursor-pointer"
              >
                Guide
              </button>
            </div>
          </Card>
        </section>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
