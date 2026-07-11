-- FixLink Database Schema Setup
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('mechanic', 'seller')),
    workshop_name TEXT,
    store_name TEXT,
    location TEXT,
    city TEXT DEFAULT 'Abuja',
    phone TEXT,
    bio TEXT,
    opening_time TEXT,
    closing_time TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    description TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    brand TEXT,
    condition TEXT DEFAULT 'New',
    compatibility TEXT,
    rating NUMERIC NOT NULL DEFAULT 5.0 CHECK (rating BETWEEN 0 AND 5),
    reviews_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mechanic_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle TEXT NOT NULL,
    part TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'completed')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- 4. OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL CHECK (price >= 0),
    availability TEXT NOT NULL,
    delivery_estimate TEXT NOT NULL,
    pickup_option BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total NUMERIC NOT NULL CHECK (total >= 0),
    status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Preparing', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled')),
    delivery_address TEXT NOT NULL,
    delivery_method TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 6. ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 7. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 8. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_requests_mechanic_id ON public.requests(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_offers_request_id ON public.offers(request_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- RLS POLICIES
CREATE POLICY "Profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Products are readable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their own products" ON public.products FOR ALL TO authenticated
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Requests are readable by authenticated users" ON public.requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mechanics can manage their own requests" ON public.requests FOR ALL TO authenticated
    USING (auth.uid() = mechanic_id)
    WITH CHECK (auth.uid() = mechanic_id);
CREATE POLICY "Sellers can update request status" ON public.requests FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.offers o WHERE o.request_id = requests.id AND o.seller_id = auth.uid()));

CREATE POLICY "Offers are readable by authenticated users" ON public.offers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sellers can manage their own offers" ON public.offers FOR ALL TO authenticated
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Mechanics can update offers on their requests" ON public.offers FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = offers.request_id AND r.mechanic_id = auth.uid()));

CREATE POLICY "Users can view orders relevant to them" ON public.orders FOR SELECT TO authenticated
    USING (
        auth.uid() = buyer_id OR EXISTS (
            SELECT 1
            FROM public.order_items oi
            JOIN public.products p ON oi.product_id = p.id
            WHERE oi.order_id = orders.id AND p.seller_id = auth.uid()
        )
    );
CREATE POLICY "Buyers can place orders" ON public.orders FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Order participants can update orders" ON public.orders FOR UPDATE TO authenticated
    USING (
        auth.uid() = buyer_id OR EXISTS (
            SELECT 1
            FROM public.order_items oi
            JOIN public.products p ON oi.product_id = p.id
            WHERE oi.order_id = orders.id AND p.seller_id = auth.uid()
        )
    );

CREATE POLICY "Order items are readable by authenticated users" ON public.order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Buyers can insert order items" ON public.order_items FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id AND o.buyer_id = auth.uid()
        )
    );

CREATE POLICY "Users can read their own chats" ON public.messages FOR SELECT TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Reviews are readable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can update their reviews" ON public.reviews FOR UPDATE TO authenticated
    USING (auth.uid() = reviewer_id);
