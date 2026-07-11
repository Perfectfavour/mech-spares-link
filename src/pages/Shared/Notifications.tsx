import { useMemo, useState } from 'react';
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
  const { user, messages, orders, requests, offers } = useApp();
  const [query, setQuery] = useState('');

  // Generate notifications based on user activity and role
  const generateNotifications = () => {
    const notifications = [];

    // Order-related notifications
    if (user) {
      // Buyer notifications
      const buyerOrders = orders.filter(o => o.buyer_id === user.id);
      buyerOrders.forEach(order => {
        notifications.push({
          id: `order-${order.id}`,
          title: `Order #${order.id} Update`,
          message: `Your order for ${order.items.length} items is now ${order.status}`,
          time: order.date,
          type: 'order',
          referenceId: order.id,
          read: false
        });
      });

      // Seller notifications
      const sellerOrders = orders.filter(o => o.items.some((item: any) => item.seller_id === user.id));
      sellerOrders.forEach(order => {
        notifications.push({
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
          notifications.push({
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
          notifications.push({
            id: `offer-${offer.id}`,
            title: `Offer Update: ${offer.part}`,
            message: `Your offer for ${offer.part} was ${offer.status}`,
            time: offer.date || new Date().toISOString().split('T')[0],
            type: 'offer',
            referenceId: offer.id,
            read: false
          });
        });
      }

      // Message notifications
      messages.forEach(message => {
        if (message.receiver_id === user.id && !message.read) {
          notifications.push({
            id: `message-${message.id}`,
            title: `New Message from ${message.sender?.full_name || 'User'}`,
            message: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
            time: message.created_at.split('T')[0],
            type: 'message',
            referenceId: message.id,
            read: false
          });
        }
      });
    }

    return notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  };

  const notifications = useMemo(() => {
    const allNotifications = generateNotifications();
    return allNotifications.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.message.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, user, messages, orders, requests, offers]);

  const handleDelete = (id: string) => {
    // In a real app, you would update the database
    // For now, we'll just show a toast
    toast.success('Notification dismissed');
  };

  const handleNotificationClick = (notification: any) => {
    switch (notification.type) {
      case 'order':
        navigate(`/order/${notification.referenceId}`);
        break;
      case 'request':
        navigate(`/request/${notification.referenceId}`);
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

        <div className="relative">
          <Input
            placeholder="Search notifications..."
            className="h-14 rounded-2xl pl-4 bg-card border-none shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="space-y-3 pb-20">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No notifications found</p>
              {query && <p className="text-sm mt-2">Try adjusting your search</p>}
            </div>
          ) : (
            notifications.map((item) => (
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

        {notifications.length > 0 && (
          <div className="fixed top-20 ml-55 p-6">
            <Button
              variant="outline"
              className=" rounded-xl h-12"
              onClick={() => {
                // Mark all as read functionality
                toast.success('All notifications marked as read');
              }}
            >
              Mark All as Read
            </Button>
          </div>
        )}
      </div>
      <BottomNav />
    </MobileContainer>
  );
}

