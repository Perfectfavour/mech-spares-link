import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft, SendHorizonal } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';

const getDisplayName = (peerId: string) => {
  if (peerId === 'seller-seed') return 'Abuja Auto Parts';
  if (peerId === 'mech-seed') return 'Precision Motors';
  return 'Contact';
};

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { messages, user, profile, sendMessage } = useApp();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');

  const currentUserId = user?.id || profile?.id || 'mech-seed';
  const recipientId = searchParams.get('recipientId');

  const chats = useMemo(() => {
    const map = new Map<string, any>();

    messages.forEach((message: any) => {
      const peerId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
      if (!peerId || peerId === currentUserId) return;

      const existing = map.get(peerId) || {
        id: peerId,
        name: getDisplayName(peerId),
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
  }, [currentUserId, messages, query]);

  const selectedRecipient = recipientId || chats[0]?.id || null;
  const thread = useMemo(() => {
    if (!selectedRecipient) return [];
    return messages.filter((message: any) => {
      const isFromSelected = message.sender_id === selectedRecipient && message.receiver_id === currentUserId;
      const isToSelected = message.sender_id === currentUserId && message.receiver_id === selectedRecipient;
      return isFromSelected || isToSelected;
    });
  }, [currentUserId, messages, selectedRecipient]);

  const handleSend = async () => {
    if (!draft.trim() || !selectedRecipient) return;
    await sendMessage(selectedRecipient, draft.trim());
    setDraft('');
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
              className={`p-4 rounded-[28px] border border-border flex items-center gap-4 active:scale-[0.98] transition-transform ${selectedRecipient === chat.id ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => setSearchParams({ recipientId: chat.id })}
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

        {selectedRecipient ? (
          <div className="rounded-[32px] border border-border bg-card p-4 space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="font-bold">{getDisplayName(selectedRecipient)}</h2>
              <p className="text-sm text-muted-foreground">Start or continue the conversation</p>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {thread.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages yet. Send the first message to start the conversation.</p>
              ) : thread.map((message: any) => (
                <div key={message.id} className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${message.sender_id === currentUserId ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="h-12 rounded-2xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button onClick={handleSend} className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                <SendHorizonal size={18} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
