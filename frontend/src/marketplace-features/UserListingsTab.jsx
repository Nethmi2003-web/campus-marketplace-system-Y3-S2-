import React, { useState, useEffect, useRef } from "react";
import { cn } from '../lib/utils';
import { Package, PlusCircle, Edit, Trash2, Image as ImageIcon, X, ArrowLeft, CheckCircle2, Download } from "lucide-react";

const LISTINGS_KEY = 'user_listings';

function getListings() {
  try { return JSON.parse(localStorage.getItem(LISTINGS_KEY) || '[]'); } catch { return []; }
}
function saveListings(listings) {
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
}

export function UserListingsTab({ onNavigate }) {
  const [listings, setListings] = useState(getListings);
  const [view, setView] = useState('list'); // 'list' | 'form' | 'poster'
  const [currentItem, setCurrentItem] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', price: '', category: 'Electronics', condition: 'New', description: '', imageUrl: ''
  });

  const categories = ["Books", "Electronics", "Lab Equipment", "Clothing & Uniforms", "Sports & Fitness", "Services & Tutoring", "Other"];
  const conditions = ["New", "Like New", "Good", "Fair", "Service"];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (currentItem) {
      // Edit
      const updated = listings.map(l => l._id === currentItem._id ? { ...formData, _id: currentItem._id, price: Number(formData.price) } : l);
      setListings(updated);
      saveListings(updated);
    } else {
      // Add
      const userInfo = JSON.parse(localStorage.getItem('std_userInfo') || localStorage.getItem('admin_userInfo') || '{}');
      const newItem = {
        ...formData,
        _id: 'lst_' + Date.now(),
        price: Number(formData.price),
        status: "Available",
        seller: {
          _id: userInfo._id || 'local_user',
          firstName: userInfo.firstName || 'Student',
          lastName: userInfo.lastName || ''
        }
      };
      const updated = [newItem, ...listings];
      setListings(updated);
      saveListings(updated);
    }
    setView('list');
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this listing?")) {
      const updated = listings.filter(l => l._id !== id);
      setListings(updated);
      saveListings(updated);
    }
  };

  const openForm = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData(item);
    } else {
      setCurrentItem(null);
      setFormData({ title: '', price: '', category: 'Electronics', condition: 'New', description: '', imageUrl: '' });
    }
    setView('form');
  };

  const openPoster = (item) => {
    setCurrentItem(item);
    setView('poster');
  };

  // ---------------- LIST VIEW ----------------
  if (view === 'list') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">My Listings</h1>
            <p className="text-muted-foreground font-medium">Manage the items you are selling</p>
          </div>
          <button 
            onClick={() => openForm()}
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold shadow-lg shadow-secondary/20 hover:scale-105 transition-all"
          >
            <PlusCircle size={18} /> Add New Item
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-[3rem] border-2 border-dashed border-muted">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-primary">
              <Package size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary">No listings yet</h3>
              <p className="text-muted-foreground">You haven't listed any items for sale.</p>
            </div>
            <button onClick={() => openForm()} className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all">
              Create First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(item => (
              <div key={item._id} className="group bg-card border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <div className="relative h-48 bg-muted">
                  <img src={item.imageUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400"} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={() => openForm(item)} className="p-2 bg-white/90 backdrop-blur rounded-full text-primary shadow hover:bg-primary hover:text-white transition-all">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 bg-white/90 backdrop-blur rounded-full text-red-500 shadow hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="absolute top-3 left-3 bg-primary/90 text-white px-2 py-1 rounded-lg text-xs font-bold">
                    {item.status}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-foreground line-clamp-1 mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mb-4">Condition: {item.condition}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-primary">LKR {Number(item.price).toLocaleString()}</p>
                    <button 
                      onClick={() => openPoster(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-xs font-bold hover:bg-secondary hover:text-white transition-colors"
                    >
                      <ImageIcon size={14} /> Poster
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------------- FORM VIEW ----------------
  if (view === 'form') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setView('list')} className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-primary">{currentItem ? 'Edit Listing' : 'Create New Listing'}</h2>
            <p className="text-muted-foreground font-medium">Fill in the details for your marketplace item</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-card border rounded-[2.5rem] p-8 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-foreground">Item Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="e.g. Engineering Mathematics Textbook" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Price (LKR)</label>
              <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="e.g. 1500" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Condition</label>
              <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Upload Image</label>
              <div className="flex items-center gap-4">
                {formData.imageUrl && (
                  <div className="w-16 h-16 rounded-lg border overflow-hidden flex-shrink-0 bg-muted">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer text-sm" 
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-foreground">Description</label>
              <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Describe the item..." />
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end gap-4">
            <button type="button" onClick={() => setView('list')} className="px-6 py-3 font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 bg-secondary text-white font-bold rounded-xl shadow-lg hover:bg-secondary/90 hover:scale-105 transition-all">
              {currentItem ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---------------- POSTER VIEW ----------------
  if (view === 'poster' && currentItem) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowLeft size={16} />
            </div>
            Back to Listings
          </button>
          <button onClick={() => alert("In a real app, this would download the poster as an image!")} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Download size={16} /> Download
          </button>
        </div>

        {/* POSTER DESIGN */}
        <div id="item-poster" className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#001f5c] to-[#002a7a] text-white shadow-2xl border-8 border-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/40 rounded-full blur-[80px]" />
          
          <div className="relative z-10 p-10 flex flex-col h-full min-h-[600px]">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#001f5c] font-black text-2xl">S</div>
                <div>
                  <h2 className="font-black leading-tight tracking-tight text-lg">SLIIT MARKETPLACE</h2>
                  <p className="text-[10px] text-secondary tracking-widest font-bold uppercase">Campus Deal</p>
                </div>
              </div>
              <div className="px-4 py-1.5 bg-secondary text-white font-black rounded-full text-sm shadow-lg shadow-secondary/20">
                {currentItem.condition}
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 w-full rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl relative mb-8 min-h-[250px]">
              <img src={currentItem.imageUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800"} alt={currentItem.title} className="w-full h-full object-cover absolute inset-0" />
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur rounded-lg text-xs font-bold tracking-wider uppercase text-secondary">
                {currentItem.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                {currentItem.title}
              </h1>
              <p className="text-white/70 line-clamp-2 max-w-lg">
                {currentItem.description}
              </p>
            </div>

            {/* Footer / Price */}
            <div className="mt-auto pt-8 flex items-end justify-between border-t border-white/10">
              <div>
                <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-1">Asking Price</p>
                <p className="text-5xl font-black text-secondary">LKR {Number(currentItem.price).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <span className="text-[8px] font-bold text-black opacity-50">QR CODE</span>
                </div>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Scan to view</p>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm text-muted-foreground font-medium">
          Share this poster on your WhatsApp groups or campus forums to find a buyer quickly!
        </p>
      </div>
    );
  }

  return null;
}
