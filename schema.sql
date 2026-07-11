-- FixLink Database Schema Setup
-- Run this in your Supabase SQL Editor

-- 1. PROFILES TABLE
-- Stores profile information for both mechanics and sellers.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('mechanic', 'seller')),
    workshop_name TEXT,
    store_name TEXT,
    location TEXT,
    bio TEXT,
    opening_time TEXT,
    closing_time TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow users to insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. PRODUCTS TABLE
-- Stores products / spare parts listed by sellers.
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    description TEXT,
    specs JSONB, -- Array of {key, value} specs
    rating NUMERIC NOT NULL DEFAULT 5.0 CHECK (rating BETWEEN 0 AND 5),
    reviews_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow sellers to manage their own products" ON public.products 
    FOR ALL USING (auth.uid() = seller_id);


-- 3. REQUESTS TABLE
-- Stores spare part requests sent out by mechanics.
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mechanic_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle TEXT NOT NULL, -- "Make Model Year"
    part TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Requests Policies
CREATE POLICY "Allow public read access to requests" ON public.requests FOR SELECT USING (true);
CREATE POLICY "Allow mechanics to manage their own requests" ON public.requests 
    FOR ALL USING (auth.uid() = mechanic_id);
CREATE POLICY "Allow sellers to insert/update requests status" ON public.requests
    FOR UPDATE USING (true); -- Allows status update when offer is accepted


-- 4. OFFERS TABLE
-- Stores offers/quotes sent by sellers in response to a part request.
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL CHECK (price >= 0),
    availability TEXT NOT NULL, -- e.g. "In Stock", "1 day"
    delivery_estimate TEXT NOT NULL, -- e.g. "2 hours"
    pickup_option BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Offers Policies
CREATE POLICY "Allow public read access to offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Allow sellers to manage their own offers" ON public.offers 
    FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Allow mechanics to update offer status" ON public.offers
    FOR UPDATE USING (true); -- Allow mechanic to accept/decline an offer


-- 5. ORDERS TABLE
-- Stores buyer orders.
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total NUMERIC NOT NULL CHECK (total >= 0),
    status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Preparing', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled')),
    delivery_address TEXT NOT NULL,
    delivery_method TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders Policies
CREATE POLICY "Allow users to view orders relevant to them" ON public.orders 
    FOR SELECT USING (auth.uid() = buyer_id OR EXISTS (
        SELECT 1 FROM public.order_items oi
        JOIN public.products p ON oi.product_id = p.id
        WHERE oi.order_id = orders.id AND p.seller_id = auth.uid()
    ));
CREATE POLICY "Allow buyers to place orders" ON public.orders 
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Allow order participants to update orders" ON public.orders
    FOR UPDATE USING (auth.uid() = buyer_id OR EXISTS (
        SELECT 1 FROM public.order_items oi
        JOIN public.products p ON oi.product_id = p.id
        WHERE oi.order_id = orders.id AND p.seller_id = auth.uid()
    ));


-- 6. ORDER_ITEMS TABLE
-- Stores individual items within an order.
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL CHECK (price >= 0)
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order Items Policies
CREATE POLICY "Allow read access to order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow inserts to order items" ON public.order_items FOR INSERT WITH CHECK (true);


-- 7. MESSAGES TABLE
-- Stores chat messages between users.
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages Policies
CREATE POLICY "Allow users to read their own chats" ON public.messages 
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Allow users to send messages" ON public.messages 
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
