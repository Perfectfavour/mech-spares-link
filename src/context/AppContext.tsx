import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { seededProducts, seededOrders, seededRequests, seededOffers, seededMessages, seededProfile } from '../lib/seedData';

export type Role = 'mechanic' | 'seller';

interface AppState {
  role: Role;
  setRole: (role: Role) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  user: any | null;
  profile: any | null;
  setProfile: (profile: any) => void;
  cart: any[];
  addToCart: (item: any) => void;
  removeFromCart: (idx: number) => void;
  updateCartItemQty: (idx: number, qty: number) => void;
  clearCart: () => void;
  orders: any[];
  addOrder: (order: any) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  requests: any[];
  addRequest: (req: any) => Promise<void>;
  offers: any[];
  addOffer: (offer: any) => Promise<void>;
  messages: any[];
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  isSupabaseActive: boolean;
  signUpUser: (email: string, pass: string, fullName: string, role: Role, businessName: string) => Promise<void>;
  signInUser: (email: string, pass: string, selectedRole?: Role) => Promise<void>;
  signOutUser: () => Promise<void>;
  products: any[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: any) => Promise<void>;
}

const fallbackAppState: AppState = {
  role: 'mechanic',
  setRole: () => undefined,
  isLoggedIn: false,
  setIsLoggedIn: () => undefined,
  user: null,
  profile: null,
  setProfile: () => undefined,
  cart: [],
  addToCart: () => undefined,
  removeFromCart: () => undefined,
  updateCartItemQty: () => undefined,
  clearCart: () => undefined,
  orders: [],
  addOrder: async () => undefined,
  updateOrderStatus: async () => undefined,
  requests: [],
  addRequest: async () => undefined,
  offers: [],
  addOffer: async () => undefined,
  messages: [],
  sendMessage: async () => undefined,
  isSupabaseActive: false,
  signUpUser: async () => undefined,
  signInUser: async () => undefined,
  signOutUser: async () => undefined,
  products: seededProducts,
  fetchProducts: async () => undefined,
  addProduct: async () => undefined,
};

const AppContext = createContext<AppState>(fallbackAppState);

const defaultProducts = seededProducts;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const isSupabaseConfigured =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-project-url.supabase.co';

  const [isSupabaseActive, setIsSupabaseActive] = useState(!!isSupabaseConfigured);
  const [role, setRole] = useState<Role>('mechanic');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfileState] = useState<any | null>(null);

  // Lists
  const [cart, setCart] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>(seededOrders);
  const [requests, setRequests] = useState<any[]>(seededRequests);
  const [offers, setOffers] = useState<any[]>(seededOffers);
  const [messages, setMessages] = useState<any[]>(seededMessages);
  const [products, setProducts] = useState<any[]>(defaultProducts);

  // Sync profile update with storage/db
  const setProfile = (prof: any) => {
    setProfileState(prof);
    if (prof?.role) {
      setRole(prof.role);
    }
  };

  // Local storage keys for hybrid mode
  const STORAGE_PREFIX = 'fixlink_';

  // Load local state initially
  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_PREFIX + 'cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedOrders = localStorage.getItem(STORAGE_PREFIX + 'orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedRequests = localStorage.getItem(STORAGE_PREFIX + 'requests');
    if (savedRequests) setRequests(JSON.parse(savedRequests));

    const savedOffers = localStorage.getItem(STORAGE_PREFIX + 'offers');
    if (savedOffers) setOffers(JSON.parse(savedOffers));

    const savedMessages = localStorage.getItem(STORAGE_PREFIX + 'messages');
    if (savedMessages) setMessages(JSON.parse(savedMessages));

    const savedProfile = localStorage.getItem(STORAGE_PREFIX + 'profile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfileState(parsedProfile);
      if (parsedProfile.role) setRole(parsedProfile.role);
    }

    const savedProducts = localStorage.getItem(STORAGE_PREFIX + 'products');
    if (savedProducts) setProducts(JSON.parse(savedProducts));

  }, []);

  // Save Cart to local
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_PREFIX + 'profile', JSON.stringify(profile));
    }
  }, [profile]);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_PREFIX + 'profile')) {
      setProfile(seededProfile);
    }
  }, []);

  // Supabase Auth and Session handling
  useEffect(() => {
    if (!isSupabaseActive) {
      // Fallback: check if mock session exists
      const mockSession = localStorage.getItem(STORAGE_PREFIX + 'mock_session');
      if (mockSession) {
        const parsed = JSON.parse(mockSession);
        setUser(parsed.user);
        setProfile(parsed.profile);
        setIsLoggedIn(true);
      }
      return;
    }

    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setIsLoggedIn(true);
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfileState(null);
        setIsLoggedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseActive]);

  // Fetch real-time data when logged in
  useEffect(() => {
    if (isLoggedIn && isSupabaseActive && user) {
      refreshDatabaseData();

      // Subscribe to real-time updates for messages
      const messageChannel = supabase
        .channel('messages-db-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
          }
        )
        .subscribe();

      // Subscribe to offers changes
      const offerChannel = supabase
        .channel('offers-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'offers' },
          () => {
            fetchOffers();
          }
        )
        .subscribe();

      // Subscribe to requests changes
      const requestChannel = supabase
        .channel('requests-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'requests' },
          () => {
            fetchRequests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageChannel);
        supabase.removeChannel(offerChannel);
        supabase.removeChannel(requestChannel);
      };
    }
  }, [isLoggedIn, user, isSupabaseActive]);

  // Fetch User Profile from DB
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) {
        setProfile(data);
      } else if (error) {
        console.error('Error fetching profile:', error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshDatabaseData = () => {
    fetchProducts();
    fetchOrders();
    fetchRequests();
    fetchOffers();
    fetchMessages();
  };

  const shouldFallbackToLocal = (error: any) => {
    const message = String(error?.message || error?.details || error?.hint || '').toLowerCase();
    return (
      !error ||
      error?.status === 429 ||
      message.includes('rate limit') ||
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('permission denied') ||
      (message.includes('relation') && message.includes('does not exist')) ||
      message.includes('does not exist') ||
      message.includes('not configured')
    );
  };

  const handleSupabaseWriteFallback = (error: any, fallback: () => void, context: string) => {
    if (shouldFallbackToLocal(error)) {
      console.warn(`${context} falling back to local storage:`, error);
      fallback();
      return true;
    }
    return false;
  };

  // PRODUCTS ACTIONS
  const fetchProducts = async () => {
    if (!isSupabaseActive) return;
    try {
      const { data } = await supabase.from('products').select('*');
      if (data && data.length > 0) {
        setProducts(data);
        localStorage.setItem(STORAGE_PREFIX + 'products', JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addProduct = async (prod: any) => {
    const newProduct = {
      ...prod,
      id: prod.id || `p-${Date.now()}`,
    };
    if (isSupabaseActive && user) {
      try {
        const { data, error } = await supabase.from('products').insert([
          {
            seller_id: user.id,
            name: prod.name,
            price: prod.price,
            category: prod.category,
            stock: prod.stock || 10,
            image_url: prod.image,
            description: prod.description,
            specs: prod.specs,
          }
        ]).select();
        if (error) throw error;
        if (data) {
          setProducts((prev) => [...prev, data[0]]);
        }
      } catch (e) {
        if (!handleSupabaseWriteFallback(e, () => saveLocalProduct(newProduct), 'Failed to add product to Supabase')) {
          console.error('Unexpected product insert error:', e);
        }
      }
    } else {
      saveLocalProduct(newProduct);
    }
  };

  const saveLocalProduct = (p: any) => {
    const updated = [...products, p];
    setProducts(updated);
    localStorage.setItem(STORAGE_PREFIX + 'products', JSON.stringify(updated));
  };

  // CART ACTIONS
  const addToCart = (item: any) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: (i.quantity || 1) + (item.quantity || 1) } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (idx: number) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCartItemQty = (idx: number, qty: number) => {
    setCart((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => setCart([]);

  // ORDERS ACTIONS
  const fetchOrders = async () => {
    if (!isSupabaseActive || !user) return;
    try {
      // Query orders where buyer_id = user.id
      const { data } = await supabase
        .from('orders')
        .select(`*, order_items(*, products(*))`)
        .order('created_at', { ascending: false });
      if (data) {
        const mapped = data.map((o) => ({
          id: o.id,
          date: o.created_at.split('T')[0],
          status: o.status,
          total: o.total,
          deliveryAddress: o.delivery_address,
          deliveryMethod: o.delivery_method,
          paymentMethod: o.payment_method,
          items: o.order_items.map((item: any) => ({
            id: item.product_id,
            name: item.products?.name || 'Spare Part',
            price: item.price,
            quantity: item.quantity,
            image: item.products?.image_url,
          })),
        }));
        setOrders(mapped);
        localStorage.setItem(STORAGE_PREFIX + 'orders', JSON.stringify(mapped));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addOrder = async (order: any) => {
    if (isSupabaseActive && user) {
      try {
        const { data: ord, error } = await supabase
          .from('orders')
          .insert([
            {
              buyer_id: user.id,
              total: order.total,
              status: 'Confirmed',
              delivery_address: 'Precision Motors, Plot 124, Gudu District, Abuja',
              delivery_method: 'Express Delivery',
              payment_method: 'Pay on Delivery',
            }
          ])
          .select()
          .single();

        if (error) throw error;

        if (ord) {
          // Insert order items
          const itemsToInsert = order.items.map((item: any) => ({
            order_id: ord.id,
            product_id: item.id.startsWith('p') && item.id.length > 5 ? item.id : undefined, // Check if UUID
            quantity: item.quantity || 1,
            price: item.price,
          }));

          // Clean items that don't match standard UUID product IDs for seed mock items
          // Create dummy product if it doesn't match UUID
          for (let i = 0; i < itemsToInsert.length; i++) {
            if (!itemsToInsert[i].product_id) {
              // Try to find if product exists or insert placeholder
              const { data: placeholderProd } = await supabase
                .from('products')
                .insert([
                  {
                    seller_id: user.id,
                    name: order.items[i].name,
                    price: order.items[i].price,
                    category: order.items[i].category || 'Brakes',
                    stock: 5,
                  }
                ])
                .select()
                .single();
              if (placeholderProd) {
                itemsToInsert[i].product_id = placeholderProd.id;
              }
            }
          }

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert.filter((i: any) => i.product_id));

          if (itemsError) throw itemsError;

          setOrders((prev) => [
            { ...order, id: ord.id, date: ord.created_at.split('T')[0] },
            ...prev
          ]);
        }
      } catch (e) {
        if (!handleSupabaseWriteFallback(e, () => saveLocalOrder(order), 'Failed to save order to Supabase')) {
          console.error('Unexpected order insert error:', e);
        }
      }
    } else {
      saveLocalOrder(order);
    }
    clearCart();
  };

  const saveLocalOrder = (o: any) => {
    const updated = [o, ...orders];
    setOrders(updated);
    localStorage.setItem(STORAGE_PREFIX + 'orders', JSON.stringify(updated));
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (isSupabaseActive) {
      try {
        await supabase.from('orders').update({ status }).eq('id', orderId);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      } catch (e) {
        console.error(e);
      }
    } else {
      const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
      setOrders(updated);
      localStorage.setItem(STORAGE_PREFIX + 'orders', JSON.stringify(updated));
    }
  };

  // REQUESTS ACTIONS
  const fetchRequests = async () => {
    if (!isSupabaseActive) return;
    try {
      const { data } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        const mapped = data.map((r) => ({
          id: r.id,
          vehicle: r.vehicle,
          part: r.part,
          description: r.description,
          status: r.status,
          date: r.created_at.split('T')[0],
          responses: offers.filter((o) => o.request_id === r.id) || [],
        }));
        setRequests(mapped);
        localStorage.setItem(STORAGE_PREFIX + 'requests', JSON.stringify(mapped));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addRequest = async (req: any) => {
    const newReq = {
      ...req,
      id: req.id || `req-${Date.now()}`,
      responses: []
    };
    if (isSupabaseActive && user) {
      try {
        const { data, error } = await supabase
          .from('requests')
          .insert([
            {
              mechanic_id: user.id,
              vehicle: req.vehicle,
              part: req.part,
              description: req.description,
              status: 'pending',
            }
          ])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setRequests((prev) => [
            {
              id: data.id,
              vehicle: data.vehicle,
              part: data.part,
              description: data.description,
              status: data.status,
              date: data.created_at.split('T')[0],
              responses: [],
            },
            ...prev
          ]);
        }
      } catch (e) {
        if (!handleSupabaseWriteFallback(e, () => saveLocalRequest(newReq), 'Failed to submit request to Supabase')) {
          console.error('Unexpected request insert error:', e);
        }
      }
    } else {
      saveLocalRequest(newReq);
    }
  };

  const saveLocalRequest = (r: any) => {
    const updated = [r, ...requests];
    setRequests(updated);
    localStorage.setItem(STORAGE_PREFIX + 'requests', JSON.stringify(updated));
  };

  // OFFERS ACTIONS
  const fetchOffers = async () => {
    if (!isSupabaseActive) return;
    try {
      const { data } = await supabase.from('offers').select('*');
      if (data) {
        setOffers(data);
        localStorage.setItem(STORAGE_PREFIX + 'offers', JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addOffer = async (offer: any) => {
    const newOffer = {
      ...offer,
      id: offer.id || `off-${Date.now()}`,
    };
    if (isSupabaseActive && user) {
      try {
        const { data, error } = await supabase
          .from('offers')
          .insert([
            {
              request_id: offer.request_id,
              seller_id: user.id,
              price: offer.price,
              availability: offer.availability,
              delivery_estimate: offer.delivery_estimate,
              pickup_option: offer.pickup_option || false,
              status: 'pending',
            }
          ])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setOffers((prev) => [...prev, data]);
          // Update request status to responded
          await supabase.from('requests').update({ status: 'responded' }).eq('id', offer.request_id);
        }
      } catch (e) {
        if (!handleSupabaseWriteFallback(e, () => saveLocalOffer(newOffer), 'Failed to add offer to Supabase')) {
          console.error('Unexpected offer insert error:', e);
        }
      }
    } else {
      saveLocalOffer(newOffer);
    }
  };

  const saveLocalOffer = (o: any) => {
    const updated = [...offers, o];
    setOffers(updated);
    localStorage.setItem(STORAGE_PREFIX + 'offers', JSON.stringify(updated));

    // Update request responses locally
    const reqs = requests.map((r) =>
      r.id === o.request_id
        ? { ...r, status: 'responded', responses: [...(r.responses || []), o] }
        : r
    );
    setRequests(reqs);
    localStorage.setItem(STORAGE_PREFIX + 'requests', JSON.stringify(reqs));
  };

  // MESSAGES ACTIONS
  const fetchMessages = async () => {
    if (!isSupabaseActive || !user) return;
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        localStorage.setItem(STORAGE_PREFIX + 'messages', JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender_id: user?.id || 'current-user',
      receiver_id: receiverId,
      content,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseActive && user) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .insert([
            {
              sender_id: user.id,
              receiver_id: receiverId,
              content,
            }
          ])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          // State gets updated via postgres subscription but we update it here for safety too
          setMessages((prev) => {
            if (prev.find((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
        }
      } catch (e) {
        if (!handleSupabaseWriteFallback(e, () => saveLocalMessage(newMsg), 'Failed to send message to Supabase')) {
          console.error('Unexpected message insert error:', e);
        }
      }
    } else {
      saveLocalMessage(newMsg);
    }
  };

  const saveLocalMessage = (m: any) => {
    const updated = [...messages, m];
    setMessages(updated);
    localStorage.setItem(STORAGE_PREFIX + 'messages', JSON.stringify(updated));
  };

  // AUTH ACTIONS
  const signUpUser = async (email: string, pass: string, fullName: string, roleSelected: Role, businessName: string) => {
    if (!isSupabaseActive) {
      // Mock SignUp
      const mockUser = { id: `usr-${Date.now()}`, email };
      const mockProfile = {
        id: mockUser.id,
        full_name: fullName,
        role: roleSelected,
        workshop_name: roleSelected === 'mechanic' ? businessName : null,
        store_name: roleSelected === 'seller' ? businessName : null,
        location: 'Abuja, Nigeria',
      };
      localStorage.setItem(
        STORAGE_PREFIX + 'mock_session',
        JSON.stringify({ user: mockUser, profile: mockProfile })
      );
      setUser(mockUser);
      setProfile(mockProfile);
      setIsLoggedIn(true);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password: pass });
      if (error) throw error;

      if (data.user) {
        const profilePayload: Record<string, any> = {
          id: data.user.id,
          full_name: fullName,
          role: roleSelected,
          workshop_name: roleSelected === 'mechanic' ? businessName : null,
          store_name: roleSelected === 'seller' ? businessName : null,
        };

        try {
          const { error: profileError } = await supabase.from('profiles').insert([profilePayload]);
          if (profileError) {
            console.warn('Profile insert skipped:', profileError.message);
          }
        } catch (profileInsertError) {
          console.warn('Profile insert failed:', profileInsertError);
        }

        const localProfile = {
          id: data.user.id,
          full_name: fullName,
          role: roleSelected,
          workshop_name: roleSelected === 'mechanic' ? businessName : null,
          store_name: roleSelected === 'seller' ? businessName : null,
          location: 'Abuja, Nigeria',
        };

        setProfile(localProfile);
        setUser(data.user);
        setIsLoggedIn(true);
        fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.includes('26 seconds')) {
        const fallbackProfile = {
          id: `local-${Date.now()}`,
          full_name: fullName,
          role: roleSelected,
          workshop_name: roleSelected === 'mechanic' ? businessName : null,
          store_name: roleSelected === 'seller' ? businessName : null,
          location: 'Abuja, Nigeria',
        };
        setProfile(fallbackProfile);
        setRole(roleSelected);
        setIsLoggedIn(true);
        return;
      }

      if (handleSupabaseWriteFallback(error, () => {
        const fallbackProfile = {
          id: `local-${Date.now()}`,
          full_name: fullName,
          role: roleSelected,
          workshop_name: roleSelected === 'mechanic' ? businessName : null,
          store_name: roleSelected === 'seller' ? businessName : null,
          location: 'Abuja, Nigeria',
        };
        setProfile(fallbackProfile);
        setRole(roleSelected);
        setIsLoggedIn(true);
      }, 'Sign-up failed')) {
        return;
      }

      throw error;
    }
  };

  const signInUser = async (email: string, pass: string, selectedRole?: Role) => {
    if (!isSupabaseActive) {
      // Mock Login
      const mockSession = localStorage.getItem(STORAGE_PREFIX + 'mock_session');
      if (mockSession) {
        const parsed = JSON.parse(mockSession);
        if (parsed.user.email === email) {
          setUser(parsed.user);
          setProfile(parsed.profile);
          setRole(parsed.profile.role || selectedRole || role);
          setIsLoggedIn(true);
          return;
        }
      }
      // General default profile if user not signed up
      const mockUser = { id: 'usr-default', email };
      const mockProfile = {
        id: mockUser.id,
        full_name: 'John Doe',
        role: selectedRole || role,
        workshop_name: 'Precision Motors',
        store_name: selectedRole === 'seller' ? 'Abuja Parts Hub' : null,
        location: 'Garki, Abuja',
      };
      setUser(mockUser);
      setProfile(mockProfile);
      setRole(mockProfile.role);
      setIsLoggedIn(true);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    if (data.user) {
      setUser(data.user);
      setIsLoggedIn(true);
      fetchUserProfile(data.user.id);
    }
  };

  const signOutUser = async () => {
    if (isSupabaseActive) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(STORAGE_PREFIX + 'mock_session');
    setUser(null);
    setProfileState(null);
    setIsLoggedIn(false);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isLoggedIn,
        setIsLoggedIn,
        user,
        profile,
        setProfile,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQty,
        clearCart,
        orders,
        addOrder,
        updateOrderStatus,
        requests,
        addRequest,
        offers,
        addOffer,
        messages,
        sendMessage,
        isSupabaseActive,
        signUpUser,
        signInUser,
        signOutUser,
        products,
        fetchProducts,
        addProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
