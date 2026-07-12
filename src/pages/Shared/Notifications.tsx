import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Check, Bell, Package, Wrench, MessageSquare, Percent } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export default function Notifications() {
  const navigate = useNavigate();
  const { user, messages, orders, requests, offers, updateProfile, products, role, profile } = useApp();
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Generate notifications based on user activity and role
  const generateNotifications = () => {
    const newNotifications = [];

    if (!user) return newNotifications;

    const lastReadTime = profile?.last_read_notifications ? new Date(profile.last_read_notifications).getTime() : 0;

    // Order-related notifications (for mechanics)
    if (role === 'mechanic') {
      const buyerOrders = orders.filter(o => o.buyer_id === user.id);
      buyerOrders.forEach(order => {
        if (deletedIds.has(`order-${order.id}`)) return;
        const timeVal = new Date(order.date).getTime();
        newNotifications.push({
          id: `order-${order.id}`,
          title: `Order Update`,
          message: `Your order #${order.id.slice(0, 8)} is now ${order.status}`,
          time: order.date,
          type: 'order',
          referenceId: order.id,
          read: timeVal <= lastReadTime
        });
      });

      // Request-related notifications (for mechanics)
      const mechanicRequests = requests.filter(r => r.mechanic_id === user.id);
      mechanicRequests.forEach(request => {
        if (deletedIds.has(`request-${request.id}`)) return;
        const timeVal = new Date(request.date).getTime();
        newNotifications.push({
          id: `request-${request.id}`,
          title: `Request Update: ${request.part}`,
          message: `Your request for ${request.part} has received ${request.responses?.length || 0} offers`,
          time: request.date,
          type: 'request',
          referenceId: request.id,
          read: (request.responses?.length === 0) || timeVal <= lastReadTime
        });
      });
    }

    // Seller-related notifications
    if (role === 'seller') {
      const sellerOrders = orders.filter(o => o.items.some((item: any) => item.seller_id === user.id));
      sellerOrders.forEach(order => {
        if (deletedIds.has(`seller-order-${order.id}`)) return;
        const timeVal = new Date(order.date).getTime();
        newNotifications.push({
          id: `seller-order-${order.id}`,
          title: `New Order Received`,
          message: `Order #${order.id.slice(0, 8)} has been placed for your parts`,
          time: order.date,
          type: 'order',
          referenceId: order.id,
          read: timeVal <= lastReadTime
        });
      });

      // Offer-related notifications (for sellers)
      const sellerOffers = offers.filter(o => o.seller_id === user.id);
      sellerOffers.forEach(offer => {
        if (deletedIds.has(`offer-${offer.id}`)) return;
        const timeVal = offer.date ? new Date(offer.date).getTime() : Date.now();
        newNotifications.push({
          id: `offer-${offer.id}`,
          title: `Offer Update: ${offer.part || 'Part'}`,
          message: `Your offer was ${offer.status}`,
          time: offer.date || new Date().toISOString().split('T')[0],
          type: 'offer',
          referenceId: offer.id,
          read: timeVal <= lastReadTime
        });
      });

      // Request alerts for matching categories (for sellers)
      const sellerCategories = Array.from(
        new Set(products.filter((p) => p.seller_id === user.id).map((p) => p.category))
      );
      const sellerRespondedRequestIds = new Set(
        offers.filter((o) => o.seller_id === user.id).map((o) => o.request_id)
      );
      const matchingRequests = requests.filter(
        (r) =>
          sellerCategories.includes(r.category) &&
          r.status === 'pending' &&
          !sellerRespondedRequestIds.has(r.id)
      );

      matchingRequests.forEach((request) => {
        if (deletedIds.has(`seller-request-${request.id}`)) return;
        const timeVal = new Date(request.date).getTime();
        newNotifications.push({
          id: `seller-request-${request.id}`,
          title: `New Part Request`,
          message: `Sourcing ${request.part} for ${request.vehicle}`,
          time: request.date,
          type: 'seller-request',
          referenceId: request.id,
          mechanicId: request.mechanic_id,
          read: timeVal <= lastReadTime,
        });
      });
    }

    // Message notifications
    messages.forEach(message => {
      if (message.receiver_id === user.id && !deletedIds.has(`message-${message.id}`)) {
        const timeVal = new Date(message.created_at).getTime();
        newNotifications.push({
          id: `message-${message.id}`,
          title: `New Message`,
          message: `${message.sender?.full_name || 'User'}: "${message.content.substring(0, 45)}${message.content.length > 45 ? '...' : ''}"`,
          time: message.created_at.split('T')[0],
          type: 'message',
          referenceId: message.id,
          senderId: message.sender_id,
          read: message.read || timeVal <= lastReadTime
        });
      }
    });

    return newNotifications.sort((a, b) =>
      new Date(b.time).getTime() - new Date(a.time).getTime()
    );
  };

  // Initialize notifications on mount
  useEffect(() => {
    setNotifications(generateNotifications());
  }, [user, messages, orders, requests, offers, products, profile, role]);

  const filteredNotifications = notifications.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.message.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setDeletedIds(prev => new Set(prev).add(id));
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification dismissed');
  };

  const handleMarkAllAsRead = async () => {
    try {
      await updateProfile({ last_read_notifications: new Date().toISOString() });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleNotificationClick = (notification: any) => {
    setNotifications(prev => prev.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    ));

    switch (notification.type) {
      case 'order':
        navigate(role === 'seller' ? `/order/${notification.referenceId}` : `/order-tracking/${notification.referenceId}`);
        break;
      case 'request':
        navigate(`/orders`);
        break;
      case 'seller-request':
        navigate(`/messages?recipientId=${notification.mechanicId}&requestId=${notification.referenceId}`);
        break;
      case 'offer':
        navigate(`/orders`);
        break;
      case 'message':
        navigate(`/messages?recipientId=${notification.senderId}`);
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: string, read: boolean) => {
    const baseClass = `w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
      !read ? 'bg-primary/10 text-primary shadow-sm' : 'bg-muted text-muted-foreground'
    }`;
    
    let Icon = Bell;
    if (type === 'order') Icon = Package;
    else if (type === 'request' || type === 'seller-request') Icon = Wrench;
    else if (type === 'message') Icon = MessageSquare;
    else if (type === 'offer') Icon = Percent;

    return (
      <div className={baseClass}>
        <Icon size={18} />
      </div>
    );
  };

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-foreground hover:bg-muted p-2 rounded-full transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-xs text-muted-foreground">Stay updated on offers, orders, and activity.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Search notifications..."
              className="h-12 rounded-full pl-4 bg-muted border-none text-sm placeholder:text-muted-foreground/60"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {notifications.some(n => !n.read) && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-10 px-4 text-xs font-bold border-2 hover:bg-muted cursor-pointer"
              onClick={handleMarkAllAsRead}
            >
              <Check size={14} className="mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="space-y-4 pb-20">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground space-y-2">
              <Bell className="mx-auto text-muted-foreground/30" size={48} />
              <p className="font-semibold text-foreground">All caught up!</p>
              <p className="text-xs">No notifications found at the moment.</p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`group relative p-4 rounded-[24px] border border-border bg-card hover:bg-muted/30 transition-all flex items-start gap-4 cursor-pointer select-none active:scale-[0.99] ${
                  !item.read ? 'border-primary/15 bg-primary/[0.01]' : ''
                }`}
              >
                {/* Unread indicator dot */}
                {!item.read && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}

                {/* Circular Icon */}
                {getNotificationIcon(item.type, item.read)}

                {/* Body Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex justify-between items-baseline gap-2">
                    <h4 className={`text-sm font-bold truncate ${!item.read ? 'text-foreground' : 'text-foreground/80'}`}>
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="inline-block text-[9px] text-muted-foreground/60 font-semibold tracking-wider uppercase mt-2">
                    {item.time}
                  </span>
                </div>

                {/* Dismiss Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="text-muted-foreground/40 hover:text-destructive p-2 rounded-full hover:bg-destructive/10 transition-all self-center cursor-pointer"
                  title="Dismiss notification"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}

