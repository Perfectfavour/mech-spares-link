import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, MapPin, Radio, Shield } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function PrivacySettings() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, role, isSupabaseActive } = useApp();

  const [showLocation, setShowLocation] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [profilePrivate, setProfilePrivate] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const STORAGE_KEY = `privacy_settings_${user?.id || 'guest'}`;

  // Load preferences
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setShowLocation(data.showLocation ?? true);
      setShowOnlineStatus(data.showOnlineStatus ?? true);
      setProfilePrivate(data.profilePrivate ?? false);
    } else if (profile?.privacy_settings) {
      const settings = profile.privacy_settings;
      setShowLocation(settings.showLocation ?? true);
      setShowOnlineStatus(settings.showOnlineStatus ?? true);
      setProfilePrivate(settings.profilePrivate ?? false);
    }
  }, [profile, STORAGE_KEY]);

  const savePrivacySettings = async (nextLocation: boolean, nextOnline: boolean, nextPrivate: boolean) => {
    setShowLocation(nextLocation);
    setShowOnlineStatus(nextOnline);
    setProfilePrivate(nextPrivate);

    const settings = {
      showLocation: nextLocation,
      showOnlineStatus: nextOnline,
      profilePrivate: nextPrivate,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    try {
      await updateProfile({ privacy_settings: settings });
      toast.success('Privacy settings updated!');
    } catch (err) {
      toast.error('Failed to sync privacy preferences.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please enter new password details.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setChangingPass(true);
    try {
      if (isSupabaseActive) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) throw error;
      }
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setChangingPass(false);
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
            <h1 className="text-2xl font-bold">Privacy & Security</h1>
            <p className="text-xs text-muted-foreground">Manage your credentials and data visibility.</p>
          </div>
        </div>

        {/* Visibility Toggles */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Privacy Options</h3>
          
          <Card className="p-5 rounded-[28px] border border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {role === 'seller' ? 'Show Store Location' : 'Show Workshop Location'}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">Allow clients to view your location pin.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => savePrivacySettings(!showLocation, showOnlineStatus, profilePrivate)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  showLocation ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  showLocation ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Radio size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Active Status</h4>
                  <p className="text-[10px] text-muted-foreground">Let others see when you are online.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => savePrivacySettings(showLocation, !showOnlineStatus, profilePrivate)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  showOnlineStatus ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  showOnlineStatus ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Shield size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Private Profile</h4>
                  <p className="text-[10px] text-muted-foreground">Hide details from guests and visitors.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => savePrivacySettings(showLocation, showOnlineStatus, !profilePrivate)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  profilePrivate ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  profilePrivate ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          </Card>
        </section>

        {/* Change Password */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Security Update</h3>

          <Card className="p-5 rounded-[28px] border border-border bg-card">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-sm text-foreground">Update Password</h4>
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="text-xs font-bold text-primary flex items-center gap-1 cursor-pointer"
                >
                  {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPasswords ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="space-y-1">
                <Label htmlFor="currPass">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="currPass"
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-12 rounded-xl pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="newPass">New Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="newPass"
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 rounded-xl pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPass">Confirm New Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="confirmPass"
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 rounded-xl pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={changingPass}
                className="w-full h-12 rounded-xl font-bold mt-2"
              >
                {changingPass ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>
        </section>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
