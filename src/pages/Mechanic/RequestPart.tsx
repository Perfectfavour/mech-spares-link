import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, CheckCircle2, Trash2 } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function RequestPart() {
  const navigate = useNavigate();
  const { addRequest, isSupabaseActive, user, products } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicle: '',
    part: '',
    description: '',
    category: '',
    image: null as string | null
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File, max_size = 800): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas conversion failed'));
            },
            'image/jpeg',
            0.75
          );
        };
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(file);
    });
  };

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const compressedBlob = await compressImage(file, 800);
      let uploadedUrl = '';
      if (isSupabaseActive && user) {
        const fileName = `request-${user.id}-${Date.now()}.jpg`;
        const filePath = `requests/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile_images')
          .upload(filePath, compressedBlob, {
            contentType: 'image/jpeg'
          });
          
        if (uploadError) {
          console.warn("Storage upload failed, trying base64 fallback:", uploadError);
          uploadedUrl = await convertBlobToBase64(compressedBlob);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('profile_images')
            .getPublicUrl(filePath);
          uploadedUrl = publicUrl;
        }
      } else {
        uploadedUrl = await convertBlobToBase64(compressedBlob);
      }
      setFormData(prev => ({ ...prev, image: uploadedUrl }));
      toast.success('Photo added!');
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    if (step < 2) {
      if (!formData.vehicle.trim() || !formData.part.trim() || !formData.category) {
        toast.error('Please enter the vehicle, part, and category details.');
        return;
      }
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        await addRequest({
          vehicle: formData.vehicle,
          part: formData.part,
          description: formData.description,
          category: formData.category,
          image_url: formData.image,
        });
        toast.success('Request sent to all matching sellers!');
        navigate('/orders');
      } catch (error: any) {
        toast.error(error.message || 'Failed to submit request.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Request a Part</h1>
      </div>

      <div className="flex-1 p-6 flex flex-col pb-24">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        {step === 1 ? (
          <div className="space-y-6 flex-1">
            <div className="space-y-2 text-center mb-8">
              <h2 className="text-2xl font-bold">Vehicle Details</h2>
              <p className="text-muted-foreground">Tell us which car needs the part.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle (Make, Model, Year)</Label>
                <Input 
                  id="vehicle" 
                  placeholder="e.g. 2018 Honda Accord" 
                  className="h-14 rounded-xl px-4"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="part">Part Name</Label>
                <Input 
                  id="part" 
                  placeholder="e.g. Left Side Mirror" 
                  className="h-14 rounded-xl px-4"
                  value={formData.part}
                  onChange={(e) => setFormData({...formData, part: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full h-14 rounded-xl px-4 border border-input bg-card font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="" disabled>Select category...</option>
                  {['Engine', 'Brakes', 'Suspension', 'Transmission', 'Electrical', 'Body', 'Filters'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {formData.category && (
                  <p className="text-[11px] text-primary font-semibold px-1 mt-1">
                    💡 Sourcing from {new Set(products.filter((p: any) => p.category === formData.category).map((p: any) => p.seller_id)).size} matching sellers in Abuja
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Additional Details (Optional)</Label>
                <Textarea 
                  id="desc" 
                  placeholder="Specific trim, engine size, or color..." 
                  className="min-h-[120px] rounded-2xl p-4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 flex-1">
            <div className="space-y-2 text-center mb-8">
              <h2 className="text-2xl font-bold">Upload Photos</h2>
              <p className="text-muted-foreground">Photos help sellers identify the exact part.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-3xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                <Camera size={32} />
                <span className="text-xs font-bold uppercase tracking-wide">Camera</span>
              </button>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square rounded-3xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                <Upload size={32} />
                <span className="text-xs font-bold uppercase tracking-wide">Upload</span>
              </button>
            </div>

            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={cameraInputRef} 
              className="hidden" 
              onChange={(e) => handleImageFile(e.target.files?.[0])}
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={(e) => handleImageFile(e.target.files?.[0])}
            />

            {uploading && (
              <div className="text-center py-2 text-sm text-muted-foreground animate-pulse">
                Uploading photo...
              </div>
            )}

            {formData.image && (
              <div className="relative aspect-video rounded-[24px] overflow-hidden border border-border shadow-md mt-4">
                <img 
                  src={formData.image} 
                  alt="Uploaded part preview" 
                  className="w-full h-full object-cover" 
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                  className="absolute top-3 right-3 bg-destructive text-destructive-foreground p-2 rounded-full shadow-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className="bg-primary/5 p-4 rounded-3xl border border-primary/20 flex gap-4 items-start">
              <div className="text-primary mt-1"><CheckCircle2 size={20} /></div>
              <p className="text-sm text-primary/80 leading-snug">
                Sellers in Abuja typically respond within 30 minutes with prices and availability.
              </p>
            </div>
          </div>
        )}

        <div className="py-6">
          <Button size="xl" className="w-full font-bold" onClick={handleNext} disabled={loading || uploading}>
            {loading ? 'Submitting...' : step === 1 ? 'Next Step' : 'Submit Request'}
          </Button>
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
