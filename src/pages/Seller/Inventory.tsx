import { Search, Plus, MoreVertical, Filter, ArrowLeft } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const inventory = [
  { id: 1, name: 'Brake Pads - Toyota Camry', stock: 24, price: '₦12,500', category: 'Brakes' },
  { id: 2, name: 'Oil Filter - Honda Civic', stock: 45, price: '₦3,200', category: 'Engine' },
  { id: 3, name: 'Spark Plug - Mercedes C300', stock: 12, price: '₦8,500', category: 'Electrical' },
  { id: 4, name: 'Front Struts - Nissan Rogue', stock: 6, price: '₦65,000', category: 'Suspension' },
];

export default function Inventory() {
  const navigate = useNavigate();

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <Button size="icon" className="w-12 h-12 rounded-2xl shadow-lg shadow-primary/20">
            <Plus size={24} />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input 
            placeholder="Search inventory..." 
            className="h-14 rounded-2xl pl-12 bg-card border-none shadow-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['All', 'Brakes', 'Engine', 'Suspension', 'Electrical', 'Body'].map((cat, i) => (
            <button 
              key={cat}
              className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                i === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-card border border-border text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4 pb-20">
          {inventory.map((item) => (
            <Card key={item.id} className="p-5 rounded-[32px] border border-border shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.category}</span>
                  <h4 className="font-bold text-lg leading-tight">{item.name}</h4>
                </div>
                <button className="text-muted-foreground p-3 min-h-12 min-w-12 flex items-center justify-center"><MoreVertical size={20} /></button>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Price</p>
                    <p className="font-black">{item.price}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">In Stock</p>
                    <p className={`font-black ${item.stock < 10 ? 'text-destructive' : 'text-foreground'}`}>
                      {item.stock} units
                    </p>
                  </div>
                </div>
                <button className="bg-primary/5 text-primary text-xs font-bold px-4 py-2 rounded-xl">
                  Edit Stock
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
