import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, CheckCircle2 } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export default function RequestPart() {
  const navigate = useNavigate();
  const { addRequest } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicle: '',
    part: '',
    description: '',
    image: null as string | null
  });

  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (step < 2) {
      if (!formData.vehicle.trim() || !formData.part.trim()) {
        toast.error('Please enter the vehicle and part details.');
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
        });
        toast.success('Request sent to all sellers!');
        navigate('/orders');
      } catch (error: any) {
        toast.error(error.message || 'Failed to submit request.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <MobileContainer>
      <div className="p-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Request a Part</h1>
      </div>

      <div className="flex-1 p-6 flex flex-col">
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
              <button className="aspect-square rounded-3xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors">
                <Camera size={32} />
                <span className="text-xs font-bold uppercase tracking-wide">Camera</span>
              </button>
              <button className="aspect-square rounded-3xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 transition-colors">
                <Upload size={32} />
                <span className="text-xs font-bold uppercase tracking-wide">Upload</span>
              </button>
            </div>

            <div className="bg-primary/5 p-4 rounded-3xl border border-primary/20 flex gap-4 items-start">
              <div className="text-primary mt-1"><CheckCircle2 size={20} /></div>
              <p className="text-sm text-primary/80 leading-snug">
                Sellers in Abuja typically respond within 30 minutes with prices and availability.
              </p>
            </div>
          </div>
        )}

        <div className="py-6">
          <Button size="xl" className="w-full font-bold" onClick={handleNext} disabled={loading}>
            {loading ? 'Submitting...' : step === 1 ? 'Next Step' : 'Submit Request'}
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
