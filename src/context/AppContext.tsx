import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

const AppContext = createContext<AppState | undefined>(undefined);

const defaultProducts = [
  {
    id: 'p1',
    name: 'Brake Pads - Toyota Camry',
    price: 12500,
    priceStr: '₦12,500',
    rating: 4.8,
    reviews: 124,
    image: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/f7177dcb-d482-413c-a72a-aaa68b86c5a9/product-brake-pads-ffa5f246-1783313457127.webp',
    seller: 'Abuja Auto Parts',
    distance: '2.5km',
    location: 'Gudu Market, Shop 45',
    category: 'Brakes',
    description: 'High-performance semi-metallic brake pads specifically designed for Toyota Camry (2012-2022). Low dust, quiet operation, and exceptional stopping power.',
    specs: [
      { key: 'Condition', value: 'Brand New' },
      { key: 'Material', value: 'Semi-Metallic' },
      { key: 'Warranty', value: '6 Months' },
      { key: 'Origin', value: 'Japan' },
    ],
    stock: 24,
  },
  {
    id: 'p2',
    name: 'Alternator - Honda Accord',
    price: 45000,
    priceStr: '₦45,000',
    rating: 4.5,
    reviews: 89,
    image: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/f7177dcb-d482-413c-a72a-aaa68b86c5a9/product-alternator-efc846f3-1783313457481.webp',
    seller: 'Wuse Parts Hub',
    distance: '4.8km',
    location: 'Wuse Zone 6, Block B',
    category: 'Electrical',
    description: '100% genuine Denso alternator for Honda Accord. Tested and verified for optimum charging performance.',
    specs: [
      { key: 'Condition', value: 'Refurbished (A+ Grade)' },
      { key: 'Ampere', value: '135A' },
      { key: 'Warranty', value: '3 Months' },
      { key: 'Origin', value: 'USA' },
    ],
    stock: 12,
  },
  {
    id: 'p3',
    name: 'Oil Filter - Toyota Camry',
    price: 6000,
    priceStr: '₦6,000',
    rating: 4.6,
    reviews: 42,
    image: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/f7177dcb-d482-413c-a72a-aaa68b86c5a9/product-brake-pads-ffa5f246-1783313457127.webp',
    seller: 'Abuja Auto Parts',
    distance: '2.5km',
    location: 'Gudu Market, Shop 45',
    category: 'Engine',
    description: 'Genuine Toyota oil filter for optimum filtration and engine longevity.',
    specs: [
      { key: 'Condition', value: 'Brand New' },
      { key: 'Warranty', value: 'None' },
    ],
    stock: 45,
  }
];

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
  const [orders, setOrders] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
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

    const savedProducts = localStorage.getItem(STORAGE_PREFIX + 'products');
    if (savedProducts) setProducts(JSON.parse(savedProducts));

    const savedProfile = localStorage.getItem(STORAGE_PREFIX + 'profile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfileState(parsedProfile);
      if (parsedProfile.role) setRole(parsedProfile.role);
    }
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
        console.error('Failed to add product to Supabase, saving locally:', e);
        saveLocalProduct(newProduct);
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
        console.error('Failed to save order to Supabase, saving locally:', e);
        saveLocalOrder(order);
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
        console.error('Failed to submit request to Supabase, saving locally:', e);
        saveLocalRequest(newReq);
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
        console.error('Failed to add offer to Supabase, saving locally:', e);
        saveLocalOffer(newOffer);
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
        console.error('Failed to send message to Supabase, saving locally:', e);
        saveLocalMessage(newMsg);
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

    const { data, error } = await supabase.auth.signUp({ email, password: pass });
    if (error) throw error;
    if (data.user) {
      // Create user profile in profiles table
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          full_name: fullName,
          role: roleSelected,
          workshop_name: roleSelected === 'mechanic' ? businessName : null,
          store_name: roleSelected === 'seller' ? businessName : null,
          location: 'Abuja, Nigeria',
        }
      ]);
      if (profileError) throw profileError;

      setUser(data.user);
      setIsLoggedIn(true);
      fetchUserProfile(data.user.id);
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
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
