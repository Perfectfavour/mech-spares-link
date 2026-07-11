import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const slides = [
  {
    title: "Find any part in seconds",
    description: "Search thousands of genuine spare parts from verified sellers in Abuja.",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/f7177dcb-d482-413c-a72a-aaa68b86c5a9/spare-parts-category-6165aa93-1783313459392.webp"
  },
  {
    title: "Can't find a part?",
    description: "Our unique 'Request a Part' feature lets you ask all sellers at once.",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/f7177dcb-d482-413c-a72a-aaa68b86c5a9/onboarding-1-d84e36c2-1783313457705.webp"
  },
  {
    title: "Fast & Trackable Delivery",
    description: "Get your parts delivered to your workshop. Track every step of the way.",
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
    <div className="min-h-screen bg-background flex flex-col p-6 max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="flex flex-col items-center text-center gap-8"
          >
            <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img src={slides[current].image} alt="Onboarding" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">{slides[current].title}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {slides[current].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-6 py-8">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-primary' : 'w-2 bg-primary/20'
              }`}
            />
          ))}
        </div>
        <Button size="xl" onClick={next} className="w-full flex justify-between items-center px-8">
          <span>{current === slides.length - 1 ? 'Get Started' : 'Next'}</span>
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
}
