import React, { useState, useEffect } from "react";
import { cn } from '../lib/utils';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, Tag, Info } from "lucide-react";

const CART_KEY = 'user_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function UserCartTab({ onNavigate }) {
  const [items, setItems] = useState(getCart);
  const [step, setStep] = useState("cart"); // cart | checkout | success
  const [checkoutForm, setCheckoutForm] = useState({ name: '', reference: '', receiptImage: '' });

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCheckoutForm({ ...checkoutForm, receiptImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Keep in sync if updated elsewhere
  useEffect(() => { setItems(getCart()); }, []);

  const updateQty = (id, delta) => {
    const updated = items.map(item =>
      item._id === id ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } : item
    );
    setItems(updated); saveCart(updated);
  };

  const removeItem = (id) => {
    const updated = items.filter(item => item._id !== id);
    setItems(updated); saveCart(updated);
  };

  const subtotal = items.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);
  const platformFee = Math.round(subtotal * 0.05);
  const total = subtotal + platformFee;

  if (items.length === 0) return (
    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground/40">
        <ShoppingBag size={48} />
      </div>
      <div className="space-y-2 max-w-sm">
        <h1 className="text-3xl font-black text-primary mb-2">Your bag is empty</h1>
        <p className="text-muted-foreground font-medium">Explore the marketplace to find great campus deals!</p>
      </div>
      <button
        onClick={() => onNavigate?.('marketplace')}
        className="px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
      >
        Browse Marketplace
      </button>
    </div>
  );

  if (step === "success") return (
    <div className="max-w-2xl mx-auto py-12 text-center space-y-8 animate-in fade-in zoom-in duration-700">
      <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-200">
        <ShieldCheck size={48} />
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-primary">Order Placed!</h2>
        <p className="text-muted-foreground font-medium">Your order has been successfully placed. The seller will contact you soon!</p>
      </div>
      <button onClick={() => { saveCart([]); setItems([]); setStep("cart"); onNavigate?.('transactions'); }}
        className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20">
        View My Transactions
      </button>
    </div>
  );

  if (step === "checkout") return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <button onClick={() => setStep("cart")} className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowRight size={16} className="rotate-180" />
          </div>
          Back to Cart
        </button>
        <h2 className="text-2xl font-black text-primary">Checkout</h2>
        <div className="w-24" />
      </div>
      <form onSubmit={(e) => { 
        e.preventDefault(); 
        const userInfo = JSON.parse(localStorage.getItem('std_userInfo') || localStorage.getItem('admin_userInfo') || '{}');
        const newOrder = {
          _id: 'ORD-' + Date.now(),
          customerId: userInfo._id || 'local_user',
          customerName: checkoutForm.name,
          reference: checkoutForm.reference,
          receiptImage: checkoutForm.receiptImage,
          items: items,
          total: items.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0) * 1.05, // Including platform fee
          date: new Date().toISOString(),
          status: 'Pending Verification'
        };
        const orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        orders.push(newOrder);
        localStorage.setItem('admin_orders', JSON.stringify(orders));

        // Create notification for admin
        const newNotif = {
          id: 'notif_' + Date.now(),
          target: 'admin',
          title: 'New Order Pending Verification',
          description: `${checkoutForm.name} placed an order for LKR ${newOrder.total.toLocaleString()}.`,
          date: new Date().toISOString()
        };
        const notifs = JSON.parse(localStorage.getItem('app_notifications') || '[]');
        notifs.push(newNotif);
        localStorage.setItem('app_notifications', JSON.stringify(notifs));
        window.dispatchEvent(new Event('storage'));

        saveCart([]); setItems([]); setStep("success"); 
      }}>
        <div className="bg-card border rounded-[2.5rem] p-8 mb-8 space-y-6 shadow-xl">
          <h3 className="text-xl font-black text-primary">Payment Details</h3>
          <p className="text-muted-foreground text-sm">Please transfer the total amount to Account No: 123456789 (BOC) and upload the receipt.</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-foreground">Your Name</label>
              <input required type="text" value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="John Doe" />
            </div>
            <div>
              <label className="text-sm font-bold text-foreground">Payment Reference No.</label>
              <input required type="text" value={checkoutForm.reference} onChange={e => setCheckoutForm({...checkoutForm, reference: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="e.g. REF-00123" />
            </div>
            <div>
              <label className="text-sm font-bold text-foreground">Upload Receipt</label>
              <div className="flex items-center gap-4 mt-1">
                {checkoutForm.receiptImage && (
                  <div className="w-16 h-16 rounded-lg border overflow-hidden flex-shrink-0 bg-muted">
                    <img src={checkoutForm.receiptImage} alt="Receipt Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <input required type="file" accept="image/*" onChange={handleReceiptUpload} className="w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#001f5c] rounded-[2.5rem] p-8 text-white shadow-2xl">
          <h3 className="text-xl font-black mb-6">Order Summary</h3>
          <div className="space-y-3 mb-6">
            {items.map(i => (
              <div key={i._id} className="flex justify-between text-sm text-white/70">
                <span>{i.title} × {i.quantity || 1}</span>
                <span>LKR {(i.price * (i.quantity || 1)).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-white/10 flex justify-between items-end">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Grand Total</p>
            <p className="text-4xl font-black">LKR {total.toLocaleString()}</p>
          </div>
          <button
            type="submit"
            className="w-full mt-8 py-5 bg-secondary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            Confirm Order <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="xl:col-span-2 space-y-4">
        <h1 className="text-3xl font-black text-primary mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground font-medium mb-6">You have {items.length} item{items.length !== 1 ? 's' : ''} in your bag</p>
        {items.map(item => (
          <div key={item._id} className="group bg-card border rounded-3xl p-4 md:p-6 transition-all hover:border-primary/20 hover:shadow-xl flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
              <img src={item.imageUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400"} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1 block">{item.category}</span>
                  <h3 className="font-bold text-lg text-primary leading-tight">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Condition: {item.condition}</p>
                </div>
                <p className="font-black text-xl text-primary whitespace-nowrap">LKR {item.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border">
                  <button onClick={() => updateQty(item._id, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-primary transition-all text-muted-foreground">
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{item.quantity || 1}</span>
                  <button onClick={() => updateQty(item._id, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-primary transition-all text-muted-foreground">
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={() => removeItem(item._id)} className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors p-2">
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="bg-[#001f5c] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          <h3 className="text-xl font-black mb-6 relative">Order Summary</h3>
          <div className="space-y-4 relative">
            <div className="flex justify-between text-sm font-medium text-white/70"><span>Subtotal</span><span>LKR {subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm font-medium text-white/70"><span>Platform Fee (5%)</span><span>LKR {platformFee.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm font-medium text-white/70"><span>Delivery</span><span className="text-secondary font-bold">FREE (On-Campus)</span></div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between items-end">
                <div><p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total</p><p className="text-3xl font-black">LKR {total.toLocaleString()}</p></div>
              </div>
            </div>
          </div>
          <button onClick={() => setStep("checkout")} className="w-full mt-8 py-4 bg-secondary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 group">
            Proceed to Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-[10px] font-bold text-white/50 uppercase tracking-wider"><ShieldCheck size={14} className="text-secondary" /> Secure Campus Payment</div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-white/50 uppercase tracking-wider"><Truck size={14} className="text-secondary" /> Instant Handover or Delivery</div>
          </div>
        </div>
      </div>
    </div>
  );
}
