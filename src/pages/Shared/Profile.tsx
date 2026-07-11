import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Settings, Bell, Shield, LogOut, ChevronRight, Store, Wrench, Phone, Camera, Image as ImageIcon } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const { role, setRole, signOutUser, profile, user, updateProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: false,
    showPhone: false,
    showLocation: true
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setWorkshopName(profile.workshop_name || '');
      setLocation(profile.location || '');
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
      setProfileImage(profile.profile_image || '');
      setCoverImage(profile.cover_image || '');
    }
  }, [profile]);

  const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${type}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${type}_images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);

      // Update state and profile
      if (type === 'profile') {
        setProfileImage(publicUrl);
        await updateProfile({ profile_image: publicUrl });
      } else {
        setCoverImage(publicUrl);
        await updateProfile({ cover_image: publicUrl });
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} image updated!`);
    } catch (error) {
      toast.error(`Failed to upload ${type} image: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    navigate('/login');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !workshopName || !location) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      await updateProfile({
        full_name: fullName,
        workshop_name: workshopName,
        location,
        phone,
        bio,
        profile_image: profileImage,
        cover_image: coverImage
      });
      toast.success('Profile updated successfully!');
      setIsDialogOpen(false);
    } catch (err) {
      toast.error('Failed to update profile.');
    }
  };

  const handleNotificationToggle = async () => {
    const newSetting = !notificationsEnabled;
    setNotificationsEnabled(newSetting);
    try {
      await updateProfile({ notifications_enabled: newSetting });
      toast.success(`Notifications ${newSetting ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to update notification settings');
      setNotificationsEnabled(!newSetting);
    }
  };

  const handlePrivacyChange = async (field: string, value: boolean) => {
    const newSettings = { ...privacySettings, [field]: value };
    setPrivacySettings(newSettings);
    try {
      await updateProfile({ privacy_settings: newSettings });
      toast.success('Privacy settings updated');
    } catch (err) {
      toast.error('Failed to update privacy settings');
      setPrivacySettings(privacySettings);
    }
  };

  const menuItems = [
    { icon: User, label: 'Edit Profile', action: () => {
      if (role === 'seller') {
        navigate('/shop-profile');
      } else {
        setIsDialogOpen(true);
      }
    }},
    { icon: MapPin, label: 'Manage Addresses', action: () => navigate('/addresses') },
    { icon: Bell, label: 'Notifications', action: () => navigate('/notifications') },
    { icon: Shield, label: 'Privacy & Security', action: () => navigate('/privacy') },
    { icon: Settings, label: 'App Settings', action: () => navigate('/app-settings') },
  ];

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-bold">Profile</h1>

        {/* Cover Image with Upload */}
        <div className="relative h-32 w-full rounded-[32px] overflow-hidden bg-muted mb-4">
          {coverImage ? (
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageIcon size={48} />
            </div>
          )}
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
          >
            <Camera size={20} />
          </button>
          <input
            type="file"
            ref={coverInputRef}
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files?.[0], 'cover')}
            className="hidden"
          />
        </div>

        {/* User Card with Profile Image Upload */}
        <div className="flex flex-col items-center gap-4 text-center -mt-16">
          <div className="relative">
            <div className="w-24 h-24 rounded-[32px] bg-primary/10 border-4 border-background shadow-xl flex items-center justify-center text-primary overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow-lg"
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files?.[0], 'profile')}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.full_name || 'John Doe'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email || 'john.doe@workshop.com'}</p>
            {profile?.location && privacySettings.showLocation && (
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <MapPin size={12} /> {profile.location}
              </p>
            )}
          </div>
          <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
            {role === 'mechanic' ? 'Certified Mechanic' : 'Verified Seller'}
          </span>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full p-5 bg-card rounded-[28px] border border-border flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer"
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
          className="w-full p-5 flex items-center gap-4 text-destructive active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut size={20} />
          </div>
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </div>

      {/* Edit Mechanic Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto no-scrollbar rounded-[32px] border border-border p-6 shadow-2xl bg-card">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-xl font-bold">Edit Mechanic Profile</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label htmlFor="mechName">Full Name *</Label>
              <Input
                id="mechName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-xl"
                required 
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="workshopName">Workshop Name *</Label>
              <Input
                id="workshopName"
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
                className="h-12 rounded-xl"
                required 
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="mechLoc">Location Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="mechLoc"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 rounded-xl pl-10"
                  required 
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="mechPhone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="mechPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 rounded-xl pl-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="mechBio">About/Bio</Label>
              <Textarea
                id="mechBio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief bio or details about your workshop's specialties..."
                className="min-h-[100px] rounded-xl p-3"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl h-12 cursor-pointer"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-[2] rounded-xl h-12 font-bold shadow-lg shadow-primary/20 cursor-pointer">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </MobileContainer>
  );
}
