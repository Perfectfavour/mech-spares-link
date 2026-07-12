import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BellRing, ChevronRight, Trash2, Check } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export default function Notifications() {
  const navigate = useNavigate();
  const { user, messages, orders, requests, offers, updateProfile, products } = useApp();
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Generate notifications based on user activity and role
  const generateNotifications = () => {
    const newNotifications = [];

    if (!user) return newNotifications;
    // Order-related notifications
      const buyerOrders = orders.filter(o => o.buyer_id === user.id);
      buyerOrders.forEach(order => {
      if (deletedIds.has(`order-${order.id}`)) return;
      newNotifications.push({
          id: `order-${order.id}`,
          title: `Order #${order.id} Update`,
          message: `Your order for ${order.items.length} items is now ${order.status}`,
          time: order.date,
          type: 'order',
          referenceId: order.id,
          read: false
        });
      });

      const sellerOrders = orders.filter(o => o.items.some((item: any) => item.seller_id === user.id));
      sellerOrders.forEach(order => {
      if (deletedIds.has(`seller-order-${order.id}`)) return;
      newNotifications.push({
          id: `seller-order-${order.id}`,
          title: `New Order #${order.id}`,
          message: `You have a new order for ${order.items.filter((i: any) => i.seller_id === user.id).length} items`,
          time: order.date,
          type: 'order',
          referenceId: order.id,
          read: false
        });
      });

      // Request-related notifications (for mechanics)
      if (user.role === 'mechanic') {
        const mechanicRequests = requests.filter(r => r.mechanic_id === user.id);
        mechanicRequests.forEach(request => {
        if (deletedIds.has(`request-${request.id}`)) return;
        newNotifications.push({
            id: `request-${request.id}`,
            title: `Request Update: ${request.part}`,
            message: `Your request for ${request.part} has ${request.responses.length} offers`,
            time: request.date,
            type: 'request',
            referenceId: request.id,
            read: request.responses.length > 0
          });
        });
      }

      // Offer-related notifications (for sellers)
      if (user.role === 'seller') {
        const sellerOffers = offers.filter(o => o.seller_id === user.id);
        sellerOffers.forEach(offer => {
        if (deletedIds.has(`offer-${offer.id}`)) return;
        newNotifications.push({
            id: `offer-${offer.id}`,
            title: `Offer Update: ${offer.part}`,
            message: `Your offer for ${offer.part} was ${offer.status}`,
            time: offer.date || new Date().toISOString().split('T')[0],
            type: 'offer',
            referenceId: offer.id,
            read: false
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
          newNotifications.push({
            id: `seller-request-${request.id}`,
            title: `New Request: ${request.part}`,
            message: `A mechanic is looking for a ${request.part} for a ${request.vehicle}. Click to chat and quote.`,
            time: request.date,
            type: 'seller-request',
            referenceId: request.id,
            mechanicId: request.mechanic_id,
            read: false,
          });
        });
      }

      // Message notifications
      messages.forEach(message => {
      if (message.receiver_id === user.id && !deletedIds.has(`message-${message.id}`)) {
        newNotifications.push({
            id: `message-${message.id}`,
            title: `New Message from ${message.sender?.full_name || 'User'}`,
            message: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
            time: message.created_at.split('T')[0],
            type: 'message',
            referenceId: message.id,
          read: message.read || false
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
  }, [user, messages, orders, requests, offers, products]);

  const filteredNotifications = notifications.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.message.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = (id: string) => {
    // Add to deleted set
    setDeletedIds(prev => new Set(prev).add(id));
    // Remove from UI
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification dismissed');
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Update profile to mark notifications as read
      await updateProfile({ last_read_notifications: new Date().toISOString() });

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to update notification status');
}
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read when clicked
    setNotifications(prev => prev.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    ));

    switch (notification.type) {
      case 'order':
        navigate(`/order/${notification.referenceId}`);
        break;
      case 'request':
        navigate(`/request/${notification.referenceId}`);
        break;
      case 'seller-request':
        navigate(`/messages?recipientId=${notification.mechanicId}&requestId=${notification.referenceId}`);
        break;
      case 'offer':
        navigate(`/offer/${notification.referenceId}`);
        break;
      case 'message':
        navigate(`/messages`);
        break;
      default:
        break;
    }
  };

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">Stay updated on offers, orders, and activity.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Search notifications..."
              className="h-14 rounded-2xl pl-4 bg-card border-none shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-12 px-3 text-sm"
              onClick={handleMarkAllAsRead}
            >
              <Check size={14} className="mr-1" />
              Mark all
            </Button>
          )}
        </div>

        <div className="space-y-3 pb-20">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No notifications found</p>
              {query && <p className="text-sm mt-2">Try adjusting your search</p>}
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <Card
                key={item.id}
                className={`p-4 rounded-[28px] border border-border flex items-start gap-3 cursor-pointer ${
                  !item.read ? 'bg-primary/5 border-primary/20' : ''
                }`}
                onClick={() => handleNotificationClick(item)}
              >
                <div className={`p-3 rounded-2xl ${!item.read ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <BellRing size={20} />
                </div>
                <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="font-bold text-sm">{item.title}</h2>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <ChevronRight size={18} className="text-muted-foreground mt-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="text-destructive/70 hover:text-destructive p-1"
                    title="Dismiss notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}

