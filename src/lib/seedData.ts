export const seededProducts = [
  {
    id: 'p1',
    name: 'Brake Pads - Toyota Camry',
    price: 12500,
    priceStr: '₦12,500',
    rating: 4.8,
    reviews: 124,
    reviews_count: 124,
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
    condition: 'New',
  },
  {
    id: 'p2',
    name: 'Alternator - Honda Accord',
    price: 45000,
    priceStr: '₦45,000',
    rating: 4.5,
    reviews: 89,
    reviews_count: 89,
    image: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/f7177dcb-d482-413c-a72a-aaa68b86c5a9/product-alternator-efc846f3-1783313457481.webp',
    seller: 'Wuse Parts Hub',
    seller_id: 'seller-seed-2',
    distance: '4.8km',
    location: 'Wuse Zone 6, Block B',
    category: 'Electrical',
    description: '100% genuine Denso alternator for Honda Accord. Tested and verified for optimum charging performance.',
    specs: [
      { key: 'Condition', value: 'Refurbished' },
      { key: 'Ampere', value: '135A' },
      { key: 'Warranty', value: '3 Months' },
      { key: 'Origin', value: 'USA' },
    ],
    stock: 12,
    condition: 'Used',
  },
  {
    id: 'p3',
    name: 'Oil Filter - Toyota Camry',
    price: 6000,
    priceStr: '₦6,000',
    rating: 4.6,
    reviews: 42,
    reviews_count: 42,
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
    condition: 'New',
  },
];

export const seededOrders = [
  {
    id: 'ord-seed-1',
    date: '2026-07-10',
    status: 'Confirmed',
    total: 25000,
    deliveryAddress: 'Garki, Abuja',
    deliveryMethod: 'Express Delivery',
    paymentMethod: 'Pay on Delivery',
    items: [
      { id: 'p1', name: 'Brake Pads - Toyota Camry', price: 12500, quantity: 2 },
    ],
  },
];

export const seededRequests = [
  {
    id: 'req-seed-1',
    vehicle: '2018 Honda Accord',
    part: 'Alternator',
    description: 'Battery not charging and warning light stays on.',
    mechanic_id: 'mech-seed',
    status: 'responded',
    date: '2026-07-10',
    responses: [],
  },
];

export const seededOffers = [
  {
    id: 'off-seed-1',
    request_id: 'req-seed-1',
    seller_id: 'seller-seed',
    price: 42000,
    availability: 'In stock',
    delivery_estimate: 'Today',
    pickup_option: true,
    status: 'pending',
  },
];

export const seededMessages = [
  {
    id: 'msg-seed-1',
    sender_id: 'seller-seed',
    receiver_id: 'mech-seed',
    content: 'Your alternator is available and can be delivered today.',
    created_at: '2026-07-11T09:00:00.000Z',
  },
  {
    id: 'msg-seed-2',
    sender_id: 'mech-seed',
    receiver_id: 'seller-seed',
    content: 'Perfect, I will pick it up after lunch.',
    created_at: '2026-07-11T09:05:00.000Z',
  },
];

export const seededNotifications = [
  {
    id: 'note-seed-1',
    title: 'New offer received',
    message: 'A seller replied to your request for a Honda Accord alternator.',
    time: '5 min ago',
    unread: true,
  },
  {
    id: 'note-seed-2',
    title: 'Order confirmed',
    message: 'Your brake pads order is now confirmed and being prepared.',
    time: '1 hour ago',
    unread: false,
  },
  {
    id: 'note-seed-3',
    title: 'Inventory updated',
    message: 'Your shop profile is now visible to nearby mechanics.',
    time: 'Yesterday',
    unread: false,
  },
];

export const seededProfile = {
  id: 'mech-seed',
  full_name: 'John Doe',
  role: 'mechanic',
  workshop_name: 'Precision Motors',
  store_name: null,
  location: 'Garki, Abuja',
  email: 'john.doe@workshop.com',
};
