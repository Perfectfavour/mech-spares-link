import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft, SendHorizonal, Trash2, MessageSquare } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { messages, user, profile, sendMessage, isSupabaseActive, addOffer, offers, deleteChat } = useApp();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [recipientNames, setRecipientNames] = useState<Record<string, string>>({
    'seller-seed': 'Abuja Auto Spare Parts',
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

  const selectedRecipient = recipientId || null;

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
  }, [thread, selectedRecipient]);

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

  const handleBackToList = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('recipientId');
    nextParams.delete('requestId');
    setSearchParams(nextParams);
  };

  const handleDeleteChat = async () => {
    if (!selectedRecipient) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete your entire chat history with this contact? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await deleteChat(selectedRecipient);
      toast.success('Chat history deleted');
      handleBackToList();
    } catch (err) {
      toast.error('Failed to delete chat');
    }
  };

  return (
    <MobileContainer hasBottomNav>
      {!selectedRecipient ? (
        // --- CHAT LIST VIEW ---
        <div className="p-6 space-y-6 pb-24">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-foreground hover:bg-muted p-2 rounded-full transition-all">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search messages..."
              className="h-12 rounded-full pl-12 bg-muted border-none text-sm placeholder:text-muted-foreground/60"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {chats.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">No conversations yet</p>
                <p className="text-xs">Your active chats will appear here.</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className="group p-4 rounded-[24px] border border-border bg-card hover:bg-muted/30 flex items-center gap-4 active:scale-[0.99] transition-all cursor-pointer"
                  onClick={() => setSearchParams({ recipientId: chat.id })}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {chat.name.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-sm truncate pr-2 text-foreground">{chat.name}</h4>
                      <span className="text-[10px] text-muted-foreground/80 whitespace-nowrap">{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground truncate flex-1 pr-4 leading-normal">{chat.lastMsg}</p>
                      {chat.unread > 0 && (
                        <span className="w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // --- CHAT THREAD VIEW (SEPARATE VIEW SCREEN) ---
        <div className="flex flex-col h-full bg-background pb-24">
          {/* Active Chat Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-lg z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBackToList} 
                className="text-foreground hover:bg-muted p-2 rounded-full transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="font-bold text-sm text-foreground">
                  {recipientNames[selectedRecipient] || 'Contact'}
                </h2>
                <p className="text-[10px] text-muted-foreground">Active conversation</p>
              </div>
            </div>
            
            <button
              onClick={handleDeleteChat}
              className="text-muted-foreground/60 hover:text-destructive p-2.5 rounded-full hover:bg-destructive/10 transition-all cursor-pointer"
              title="Delete whole chat"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Messages Thread list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
            {thread.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                <MessageSquare size={36} className="text-muted-foreground/30" />
                <p className="text-sm font-semibold">No messages yet</p>
                <p className="text-xs">Type a message below to start the conversation.</p>
              </div>
            ) : (
              thread.map((message: any) => {
                const isSelf = message.sender_id === currentUserId;
                const timeString = message.created_at
                  ? new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                  : 'Just now';
                return (
                  <div key={message.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col max-w-[75%] space-y-1">
                      <div className={`rounded-[20px] px-4 py-2.5 text-sm shadow-sm transition-all duration-200 ${
                        isSelf 
                          ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                          : 'bg-muted text-foreground rounded-tl-sm'
                      }`}>
                        {message.content}
                      </div>
                      <span className={`text-[9px] text-muted-foreground/60 px-1 ${isSelf ? 'text-right' : 'text-left'}`}>
                        {timeString}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Bar */}
          <div className="p-4 border-t border-border/40 bg-background flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              className="h-12 rounded-full bg-muted/50 border-none text-sm placeholder:text-muted-foreground/50 px-5"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button 
              onClick={handleSend} 
              className="h-12 w-12 rounded-full cursor-pointer bg-primary text-white flex items-center justify-center active:scale-[0.95] hover:bg-primary/95 transition-all shrink-0 shadow-md shadow-primary/10"
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>
      )}
      <BottomNav />
    </MobileContainer>
  );
}
