import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft, SendHorizonal } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { messages, user, profile, sendMessage, isSupabaseActive, addOffer, offers } = useApp();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [recipientNames, setRecipientNames] = useState<Record<string, string>>({
    'seller-seed': 'Abuja Auto Parts',
    'mech-seed': 'Precision Motors',
  });

  const currentUserId = user?.id || profile?.id || 'mech-seed';
  const recipientId = searchParams.get('recipientId');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Pre-populate cache from messages join profiles
  useEffect(() => {
    messages.forEach((message: any) => {
      const p = message.sender_id === currentUserId ? message.receiver : message.sender;
      const peerId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
      if (p && peerId && !recipientNames[peerId]) {
        const name = p.store_name || p.workshop_name || p.full_name;
        if (name) {
          setRecipientNames(prev => ({ ...prev, [peerId]: name }));
        }
      }
    });
  }, [messages, currentUserId]);

  const chats = useMemo(() => {
    const map = new Map<string, any>();

    messages.forEach((message: any) => {
      const peerId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
      if (!peerId || peerId === currentUserId) return;

      const peerProfile = message.sender_id === currentUserId ? message.receiver : message.sender;
      const peerName = peerProfile?.store_name || peerProfile?.workshop_name || peerProfile?.full_name || recipientNames[peerId] || 'Contact';

      const existing = map.get(peerId) || {
        id: peerId,
        name: peerName,
        lastMsg: message.content,
        time: message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Now',
        unread: 0,
      };

      existing.lastMsg = message.content;
      existing.time = message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Now';
      map.set(peerId, existing);
    });

    return Array.from(map.values()).filter((chat) =>
      chat.name.toLowerCase().includes(query.toLowerCase()) || chat.lastMsg.toLowerCase().includes(query.toLowerCase())
    );
  }, [currentUserId, messages, query, recipientNames]);

  const selectedRecipient = recipientId || chats[0]?.id || null;

  // Auto-fetch profile name for selected recipient if not cached
  useEffect(() => {
    if (!selectedRecipient) return;
    if (recipientNames[selectedRecipient]) return;

    const foundChat = chats.find(c => c.id === selectedRecipient);
    if (foundChat) {
      setRecipientNames(prev => ({ ...prev, [selectedRecipient]: foundChat.name }));
      return;
    }

    if (isSupabaseActive) {
      supabase
        .from('profiles')
        .select('full_name, store_name, workshop_name')
        .eq('id', selectedRecipient)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const name = data[0].store_name || data[0].workshop_name || data[0].full_name || 'Contact';
            setRecipientNames(prev => ({ ...prev, [selectedRecipient]: name }));
          }
        });
    }
  }, [selectedRecipient, chats, isSupabaseActive]);

  const thread = useMemo(() => {
    if (!selectedRecipient) return [];
    return messages.filter((message: any) => {
      const isFromSelected = message.sender_id === selectedRecipient && message.receiver_id === currentUserId;
      const isToSelected = message.sender_id === currentUserId && message.receiver_id === selectedRecipient;
      return isFromSelected || isToSelected;
    });
  }, [currentUserId, messages, selectedRecipient]);

  // Scroll to bottom on thread change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const handleSend = async () => {
    if (!draft.trim() || !selectedRecipient) return;

    const draftText = draft.trim();
    await sendMessage(selectedRecipient, draftText);
    setDraft('');

    const requestId = searchParams.get('requestId');
    const isSeller = profile?.role === 'seller' || user?.user_metadata?.role === 'seller';

    if (isSeller && requestId) {
      const digits = draftText.replace(/,/g, '').match(/\d+/);

      if (digits) {
        const alreadyResponded = offers.some(
          (o: any) => o.request_id === requestId && o.seller_id === currentUserId
        );

        if (!alreadyResponded) {
          const price = Number(digits[0]);

          try {
            await addOffer({
              request_id: requestId,
              price,
              availability: 'In Stock',
              delivery_estimate: 'Same Day',
              pickup_option: true,
              notes: draftText,
            });
            toast.success('Offer submitted to buyer!');

            // Clean query parameter only when offer is successfully submitted
            searchParams.delete('requestId');
            setSearchParams(searchParams);
          } catch (err) {
            console.error('Error submitting offer via message:', err);
          }
        }
      }
    }
  };

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-6 pb-32">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search messages..."
            className="h-14 rounded-2xl pl-12 bg-card border-none shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className={`p-4 rounded-[28px] border border-border cursor-pointer flex items-center gap-4 active:scale-[0.98] transition-transform ${selectedRecipient === chat.id ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setSearchParams({ recipientId: chat.id })}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {chat.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-end mb-1">
                  <h4 className="font-bold text-sm truncate mr-3">{chat.name}</h4>
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

        {selectedRecipient ? (
          <div className="rounded-[32px] border border-border bg-card p-5 space-y-4 shadow-md">
            <div className="border-b border-border pb-3">
              <h2 className="font-bold text-lg">{recipientNames[selectedRecipient] || 'Contact'}</h2>
              <p className="text-xs text-muted-foreground">Start or continue the conversation</p>
            </div>

            <div className="flex flex-col h-[380px] justify-between">
              <div className="flex-1 space-y-3 overflow-y-auto pr-2 pb-4">
                {thread.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-6">
                    <p className="text-sm text-muted-foreground">No messages yet. Send the first message to start the conversation.</p>
                  </div>
                ) : (
                  thread.map((message: any) => {
                    const isSelf = message.sender_id === currentUserId;
                    const timeString = message.created_at
                      ? new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                      : 'Just now';
                    return (
                      <div key={message.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex flex-col max-w-[80%] space-y-1">
                          <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all duration-200 ${
                            isSelf 
                              ? 'bg-primary text-primary-foreground rounded-tr-sm hover:bg-primary/95' 
                              : 'bg-muted text-foreground rounded-tl-sm hover:bg-muted/90'
                          }`}>
                            {message.content}
                          </div>
                          <span className={`text-[9px] text-muted-foreground/80 px-1 ${isSelf ? 'text-right' : 'text-left'}`}>
                            {timeString}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border/40">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="h-12 rounded-2xl bg-muted/30 border-border"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button onClick={handleSend} className="h-12 w-12 rounded-2xl cursor-pointer bg-primary text-white flex items-center justify-center active:scale-[0.95] transition-transform">
                  <SendHorizonal size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
