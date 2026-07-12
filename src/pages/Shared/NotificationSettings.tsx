import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Mail, Smartphone, RefreshCw, MessageSquare, Tag } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, role } = useApp();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [chatsEnabled, setChatsEnabled] = useState(true);
  const [ordersEnabled, setOrdersEnabled] = useState(true);
  const [offersEnabled, setOffersEnabled] = useState(true);
  const [requestsEnabled, setRequestsEnabled] = useState(true);

  const STORAGE_KEY = `notif_settings_${user?.id || 'guest'}`;

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setPushEnabled(data.pushEnabled ?? true);
      setEmailEnabled(data.emailEnabled ?? true);
      setChatsEnabled(data.chatsEnabled ?? true);
      setOrdersEnabled(data.ordersEnabled ?? true);
      setOffersEnabled(data.offersEnabled ?? true);
      setRequestsEnabled(data.requestsEnabled ?? true);
    } else if (profile) {
      setPushEnabled(profile.notifications_enabled ?? true);
    }
  }, [profile, STORAGE_KEY]);

  const handleSave = async () => {
    const settings = {
      pushEnabled,
      emailEnabled,
      chatsEnabled,
      ordersEnabled,
      offersEnabled,
      requestsEnabled,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    try {
      await updateProfile({ notifications_enabled: pushEnabled });
      toast.success('Notification settings saved!');
      navigate(-1);
    } catch (err) {
      toast.error('Failed to sync notification settings.');
    }
  };

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-6 flex-1 pb-24 overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-foreground hover:bg-muted p-2 rounded-full transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Notification Settings</h1>
            <p className="text-xs text-muted-foreground">Choose when and how you want to be notified.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Channels Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Notification Channels</h3>
            
            <Card className="p-5 rounded-[28px] border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Push Notifications</h4>
                    <p className="text-[10px] text-muted-foreground">Receive instant alerts on your screen.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                    pushEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    pushEnabled ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Email Digests</h4>
                    <p className="text-[10px] text-muted-foreground">Receive daily order summaries.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailEnabled(!emailEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                    emailEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    emailEnabled ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            </Card>
          </section>

          {/* Activity Section */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Alert Preferences</h3>

            <Card className="p-5 rounded-[28px] border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Chat Messages</h4>
                    <p className="text-[10px] text-muted-foreground">When buyers or sellers message you.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChatsEnabled(!chatsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                    chatsEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    chatsEnabled ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                    <RefreshCw size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Order Updates</h4>
                    <p className="text-[10px] text-muted-foreground">When order status shifts or progresses.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOrdersEnabled(!ordersEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                    ordersEnabled ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    ordersEnabled ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Mechanics Specific Toggle */}
              {role === 'mechanic' && (
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                      <Tag size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">New Bids & Offers</h4>
                      <p className="text-[10px] text-muted-foreground">When sellers quote for your requested spare parts.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOffersEnabled(!offersEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      offersEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      offersEnabled ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              )}

              {/* Sellers Specific Toggle */}
              {role === 'seller' && (
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                      <Bell size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">New Spare Part Requests</h4>
                      <p className="text-[10px] text-muted-foreground">When mechanics request spare parts matching your inventory.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequestsEnabled(!requestsEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      requestsEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      requestsEnabled ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              )}
            </Card>
          </section>
        </div>

        <Button onClick={handleSave} size="xl" className="w-full font-bold shadow-lg shadow-primary/20 cursor-pointer">
          Save Preferences
        </Button>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
