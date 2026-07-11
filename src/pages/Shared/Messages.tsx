import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, MessageSquare, Phone } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const chats = [
  { id: 1, name: 'Abuja Auto Parts', lastMsg: 'Your order is being prepared.', time: '5m', unread: 2, role: 'Seller' },
  { id: 2, name: 'Precision Motors', lastMsg: 'Do you have the 2018 Camry side mirror?', time: '1h', unread: 0, role: 'Mechanic' },
  { id: 3, name: 'Wuse Parts Hub', lastMsg: 'The price for the alternator is ₦45,000.', time: '2h', unread: 0, role: 'Seller' },
];

export default function Messages() {
  const navigate = useNavigate();

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input 
            placeholder="Search messages..." 
            className="h-14 rounded-2xl pl-12 bg-card border-none shadow-sm"
          />
        </div>

        <div className="space-y-4 pb-20">
          {chats.map((chat) => (
            <Card 
              key={chat.id} 
              className="p-4 rounded-[28px] border border-border flex items-center gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {chat.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm truncate">{chat.name}</h4>
                  <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground truncate flex-1 pr-4">{chat.lastMsg}</p>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
