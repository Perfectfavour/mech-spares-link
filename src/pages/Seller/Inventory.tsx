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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const categories = ['Brakes', 'Engine','Transmission', 'Suspension', 'Electrical', 'Body', 'Filters'];

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
  const [image, setImage] = useState('');

  // Add character limit constants
  const MAX_NAME_LENGTH = 100;
  const MAX_DESCRIPTION_LENGTH = 1000;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImage(dataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

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
    setImage('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category || 'Brakes');
    setPrice(String(product.price));
    setStock(String(product.stock));
    setDescription(product.description || '');
    setImage(product.image || product.image_url || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Add validation for character limits
    if (name.length > MAX_NAME_LENGTH) {
      toast.error(`Product name must be ${MAX_NAME_LENGTH} characters or less.`);
      return;
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      toast.error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less.`);
      return;
    }

    const payload = {
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      description,
      image: image || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
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

       {/* Category Tabs - Clean Grid Structure Layout */}
<div className="w-full">
  <div className="grid grid-cols-4 gap-2">
    {['All', ...categories].map((cat) => (
      <button 
        key={cat}
        className={`px-2 py-3 rounded-2xl font-bold text-xs text-center transition-all cursor-pointer select-none truncate ${
          activeCategory === cat
            ? 'bg-primary text-white shadow-lg shadow-primary/20'
            : 'bg-card border border-border text-muted-foreground hover:bg-muted'
        }`}
        onClick={() => setActiveCategory(cat)}
        title={cat}
      >
        {cat}
      </button>
    ))}
  </div>
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

                {/* Add product image display */}
                {item.image || item.image_url ? (
                  <div className="mb-4">
                    <div className="w-full h-40 rounded-xl overflow-hidden border border-border bg-muted">
                      <img
                        src={item.image || item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80';
                }}
              />
                    </div>
                  </div>
                ) : null}

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
  <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto no-scrollbar rounded-[32px] border border-border p-6 shadow-2xl bg-card">
    <DialogHeader className="border-b border-border pb-3">
      <DialogTitle className="text-xl font-bold">
        {editingProduct ? 'Edit Inventory Item' : 'Add New Inventory Item'}
      </DialogTitle>
      {/* Radix expects DialogDescription directly inside the component scope */}
      <DialogDescription className="text-sm text-muted-foreground mt-1">
        {editingProduct
          ? 'Update the details for this inventory item. Fields marked with * are required.'
          : 'Fill in the information below to add a new product to your inventory.'}
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-1">
        <Label htmlFor="prodName">Product Name *</Label>
        <Input
          id="prodName"
          value={name}
          onChange={(e) => {
            if (e.target.value.length <= MAX_NAME_LENGTH) {
              setName(e.target.value);
            }
          }}
          placeholder="e.g. Brake Pads - Toyota Camry"
          className="h-12 rounded-xl"
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          {name.length}/{MAX_NAME_LENGTH}
        </p>
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
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Product Image</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="relative flex-1 h-12 rounded-xl cursor-pointer text-xs"
          >
            <span>Device / Camera</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </Button>
          <div className="flex-[2]">
            <Input
              value={image.startsWith('data:') ? 'Custom Photo Uploaded' : image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Or enter Image URL"
              className="h-12 rounded-xl"
            />
          </div>
        </div>
        {image && (
          <div className="flex items-center gap-3 mt-1 bg-muted/20 p-2 rounded-2xl border border-border/30">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-card shrink-0">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium truncate flex-1">
              {image.startsWith('data:') ? 'Image uploaded from device/camera' : image}
            </span>
            <button
              type="button"
              onClick={() => setImage('')}
              className="text-xs font-bold text-destructive px-2 py-1 hover:bg-destructive/10 rounded-lg active:scale-95 transition-all"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="prodDesc">Description</Label>
        <Textarea
          id="prodDesc"
          value={description}
          onChange={(e) => {
            if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
              setDescription(e.target.value);
            }
          }}
          placeholder="Product specifications, compatibility details, brand name, etc."
          className="min-h-[100px] rounded-xl p-3"
        />
        <p className="text-xs text-muted-foreground text-right">
          {description.length}/{MAX_DESCRIPTION_LENGTH}
        </p>
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
        <Button
          type="submit"
          className="flex-[2] rounded-xl h-12 font-bold shadow-lg shadow-primary/20 cursor-pointer"
        >
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

