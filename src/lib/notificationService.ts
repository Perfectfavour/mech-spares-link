import { supabase } from './supabase';

export const getUserNotifications = async (userId: string) => {
  try {
    // Get user's last read time
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('last_read_notifications')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get all relevant data
    const [orders, messages, requests, offers] = await Promise.all([
      supabase.from('orders').select('*').or(`buyer_id.eq.${userId},items.seller_id.eq.${userId}`),
      supabase.from('messages').select('*').eq('receiver_id', userId),
      supabase.from('requests').select('*').eq('mechanic_id', userId),
      supabase.from('offers').select('*').eq('seller_id', userId)
    ]);

    const notifications = [];

    // Process orders
    if (orders.data) {
      orders.data.forEach(order => {
        const isBuyer = order.buyer_id === userId;
        notifications.push({
          id: `order-${order.id}`,
          title: isBuyer ? `Order #${order.id} Update` : `New Order #${order.id}`,
          message: isBuyer ?
            `Your order is now ${order.status}` :
            `New order for ${order.items.length} items`,
          time: order.created_at,
          type: 'order',
          referenceId: order.id,
          read: profile.last_read_notifications ?
            new Date(order.created_at) < new Date(profile.last_read_notifications) :
            false
        });
      });
    }

    // Process messages
    if (messages.data) {
      messages.data.forEach(message => {
        notifications.push({
          id: `message-${message.id}`,
          title: `New Message from ${message.sender_id}`,
          message: message.content.substring(0, 50),
          time: message.created_at,
          type: 'message',
          referenceId: message.id,
          read: message.read || (profile.last_read_notifications ?
            new Date(message.created_at) < new Date(profile.last_read_notifications) :
            false)
        });
      });
    }

    // Process requests (for mechanics)
    if (requests.data && requests.data.length > 0) {
      requests.data.forEach(request => {
        notifications.push({
          id: `request-${request.id}`,
          title: `Request Update: ${request.part}`,
          message: `Your request has ${request.responses.length} offers`,
          time: request.created_at,
          type: 'request',
          referenceId: request.id,
          read: profile.last_read_notifications ?
            new Date(request.created_at) < new Date(profile.last_read_notifications) :
            false
        });
      });
    }

    // Process offers (for sellers)
    if (offers.data && offers.data.length > 0) {
      offers.data.forEach(offer => {
        notifications.push({
          id: `offer-${offer.id}`,
          title: `Offer Update: ${offer.part}`,
          message: `Your offer was ${offer.status}`,
          time: offer.created_at,
          type: 'offer',
          referenceId: offer.id,
          read: profile.last_read_notifications ?
            new Date(offer.created_at) < new Date(profile.last_read_notifications) :
            false
        });
      });
    }

    return notifications.sort((a, b) =>
      new Date(b.time).getTime() - new Date(a.time).getTime()
    );

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ last_read_notifications: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return false;
  }
};