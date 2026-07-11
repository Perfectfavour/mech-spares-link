import { useState } from 'react';
import { Search, Plus, MoreVertical, ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import MobileContainer from '@/components/layout/MobileContainer';
import BottomNav from '@/components/layout/BottomNav';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const categories = ['Brakes', 'Engine', 'Suspension', 'Electrical', 'Body', 'Filters'];

export default function Inventory() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct, user } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Brakes');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');

  // Filter products by current seller
  const sellerProducts = products.filter((p) => p.seller_id === user?.id);

  // Filter by category and search query
  const filteredProducts = sellerProducts.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const openAddDialog = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Brakes');
    setPrice('');
    setStock('');
    setDescription('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category || 'Brakes');
    setPrice(String(product.price));
    setStock(String(product.stock));
    setDescription(product.description || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const payload = {
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      description,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success('Product updated successfully!');
      } else {
        await addProduct(payload);
        toast.success('Product added successfully!');
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error('An error occurred while saving the product.');
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        toast.success('Product deleted successfully!');
      } catch (err) {
        toast.error('Failed to delete product.');
      }
    }
  };

  return (
    <MobileContainer hasBottomNav>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <Button 
            size="icon" 
            className="w-12 h-12 rounded-2xl shadow-lg shadow-primary/20 cursor-pointer"
            onClick={openAddDialog}
          >
            <Plus size={24} />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input 
            placeholder="Search inventory..." 
            className="h-14 rounded-2xl pl-12 bg-card border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['All', ...categories].map((cat) => (
            <button 
              key={cat}
              className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-card border border-border text-muted-foreground'
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Inventory List */}
        <div className="space-y-4 pb-20">
          {filteredProducts.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground text-sm">
              No products found in this category. Click the "+" button to add inventory.
            </div>
          ) : (
            filteredProducts.map((item) => (
              <Card key={item.id} className="p-5 rounded-[32px] border border-border shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{item.category}</span>
                    <h4 className="font-bold text-lg leading-tight">{item.name}</h4>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground p-3 min-h-12 min-w-12 flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
                        <MoreVertical size={20} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border border-border bg-card p-1 shadow-md">
                      <DropdownMenuItem 
                        onClick={() => openEditDialog(item)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-muted"
                      >
                        <Edit2 size={14} /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={14} /> Delete Item
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Price</p>
                      <p className="font-black text-primary">₦{(item.price || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">In Stock</p>
                      <p className={`font-black ${item.stock < 5 ? 'text-destructive' : 'text-foreground'}`}>
                        {item.stock} units
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => openEditDialog(item)}
                    className="bg-primary/5 text-primary text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform cursor-pointer"
                  >
                    Edit Stock
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-[32px] border border-border p-6 shadow-2xl bg-card">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-xl font-bold">
              {editingProduct ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label htmlFor="prodName">Product Name *</Label>
              <Input 
                id="prodName" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Brake Pads - Toyota Camry"
                className="h-12 rounded-xl"
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="prodPrice">Price (₦) *</Label>
                <Input 
                  id="prodPrice" 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  placeholder="e.g. 12500"
                  className="h-12 rounded-xl"
                  required 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="prodStock">Stock Quantity *</Label>
                <Input 
                  id="prodStock" 
                  type="number" 
                  value={stock} 
                  onChange={(e) => setStock(e.target.value)} 
                  placeholder="e.g. 10"
                  className="h-12 rounded-xl"
                  required 
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="prodCategory">Category *</Label>
              <select 
                id="prodCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="prodDesc">Description</Label>
              <Textarea 
                id="prodDesc" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Product specifications, compatibility details, brand name, etc."
                className="min-h-[100px] rounded-xl p-3"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/40">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 rounded-xl h-12 cursor-pointer"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-[2] rounded-xl h-12 font-bold shadow-lg shadow-primary/20 cursor-pointer">
                {editingProduct ? 'Save Changes' : 'Add Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </MobileContainer>
  );
}
