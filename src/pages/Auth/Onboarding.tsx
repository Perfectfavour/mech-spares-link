import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const slides = [
  {
    title: "Find any spare part in seconds",
    description: "Search thousands of genuine spare parts from verified sellers in Abuja.",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/f7177dcb-d482-413c-a72a-aaa68b86c5a9/spare-parts-category-6165aa93-1783313459392.webp"
  },
  {
    title: "Can't find a spare part?",
    description: "Our unique 'Request a Part' feature lets you ask all sellers at once.",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/f7177dcb-d482-413c-a72a-aaa68b86c5a9/onboarding-1-d84e36c2-1783313457705.webp"
  },
  {
    title: "Fast & Trackable Delivery",
    description: "Get your spare parts delivered to your workshop. Track every step of the way.",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/f7177dcb-d482-413c-a72a-aaa68b86c5a9/delivery-truck-b008bbb6-1783313458260.webp"
  }
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-background flex flex-col justify-between p-8 max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            {/* Circular Image Illustration Wrapper */}
            <div className="w-56 h-56 rounded-full overflow-hidden bg-muted/30 border-4 border-card shadow-xl flex items-center justify-center shrink-0">
              <img src={slides[current].image} alt="Onboarding" className="w-full h-full object-cover scale-105" />
            </div>

            {/* Pagination dots placed between illustration and title */}
            <div className="flex justify-center items-center gap-1.5 py-2">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`transition-all duration-300 rounded-full ${
                    i === current 
                      ? 'w-5 h-2 bg-primary' 
                      : 'w-2 h-2 border border-primary/45 bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Text Contents */}
            <div className="space-y-4 px-2">
              <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight px-2">{slides[current].title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed px-4 max-w-sm">
                {slides[current].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Actions Bar */}
      <div className="w-full pt-6 pb-2">
        {current < slides.length - 1 ? (
          <div className="flex items-center justify-between w-full px-2">
            <button 
              onClick={() => navigate('/login')} 
              className="text-xs font-bold text-muted-foreground hover:text-foreground active:scale-95 transition-all bg-transparent border-none py-2 px-4 cursor-pointer tracking-widest uppercase"
            >
              Skip
            </button>
            <Button 
              onClick={next} 
              className="rounded-full font-bold px-6 h-10 text-xs tracking-widest shadow-md cursor-pointer uppercase"
            >
              Next
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full px-2">
            <Button 
              onClick={next} 
              className="w-full rounded-full font-bold px-10 h-11 text-xs tracking-widest shadow-md cursor-pointer uppercase"
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
