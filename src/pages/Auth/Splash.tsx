import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileContainer from '@/components/layout/MobileContainer';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <MobileContainer className="bg-primary flex flex-col items-center justify-center text-primary-foreground">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="bg-white p-4 rounded-3xl text-primary">
          <Wrench size={48} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">FixLink</h1>
        <p className="text-primary-foreground/80 font-medium">Genuine Parts, Faster.</p>
      </motion.div>
    </MobileContainer>
  );
}
