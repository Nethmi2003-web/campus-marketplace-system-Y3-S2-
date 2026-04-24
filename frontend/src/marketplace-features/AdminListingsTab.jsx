import React, { useState, useEffect } from "react";
import { cn } from '../lib/utils';
import { 
  ShoppingBag, Search, Filter, MoreVertical, 
  Trash2, Edit3, Eye, CheckCircle, XCircle,
  AlertCircle, Loader2, ArrowUpRight, Tag,
  X, MessageSquare, Star
} from "lucide-react";

export function AdminListingsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [selectedItemReviews, setSelectedItemReviews] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);

  const fetchItems = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('user_listings') || '[]');
      setItems(stored);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this listing?")) {
      const updated = items.filter(item => item._id !== id);
      setItems(updated);
      localStorage.setItem('user_listings', JSON.stringify(updated));
    }
  };

  const openReviews = (item) => {
    setSelectedItemReviews(item);
    const allReviews = JSON.parse(localStorage.getItem('item_reviews') || '{}');
    setReviews(allReviews[item._id] || []);
  };

  const deleteReview = (reviewId) => {
    if (window.confirm("Are you sure you want to permanently delete this user's review?")) {
      const allReviews = JSON.parse(localStorage.getItem('item_reviews') || '{}');
      const itemRevs = allReviews[selectedItemReviews._id] || [];
      const updated = itemRevs.filter(r => r.id !== reviewId);
      allReviews[selectedItemReviews._id] = updated;
      localStorage.setItem('item_reviews', JSON.stringify(allReviews));
      setReviews(updated);
    }
  };

  const saveEditedReview = () => {
    if (!editingReview.comment.trim()) return;
    const allReviews = JSON.parse(localStorage.getItem('item_reviews') || '{}');
    const itemRevs = allReviews[selectedItemReviews._id] || [];
    const updated = itemRevs.map(r => r.id === editingReview.id ? { ...r, rating: editingReview.rating, comment: editingReview.comment } : r);
    allReviews[selectedItemReviews._id] = updated;
    localStorage.setItem('item_reviews', JSON.stringify(allReviews));
    setReviews(updated);
    setEditingReview(null);
  };

  const filteredItems = items.filter(item => 
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item._id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Active Listings</h1>
          <p className="text-muted-foreground font-medium">Monitor and moderate all marketplace listings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search listings..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Listings", value: items.length, icon: ShoppingBag, color: "bg-primary/10 text-primary" },
          { label: "Total Value", value: `LKR ${items.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString()}`, icon: Tag, color: "bg-secondary/10 text-secondary" },
          { label: "Flagged Items", value: "0", icon: AlertCircle, color: "bg-red-100 text-red-600" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border bg-card p-6 shadow-xl flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", s.color)}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
              <h3 className="text-2xl font-black text-primary">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Listings Table */}
      <div className="rounded-3xl border bg-card shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Item</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Price</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Condition</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border cursor-pointer hover:opacity-80 transition-opacity bg-muted"
                        onClick={() => setSelectedImage(item.imageUrl)}
                      >
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-full h-full p-2 text-muted-foreground/50" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-primary line-clamp-1">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">ID: {String(item._id).slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-sm text-foreground">
                    LKR {(item.price||0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-foreground">
                      {item.condition}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      item.status === 'Available' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {item.status === 'Available' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {item.status || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => setSelectedImage(item.imageUrl)}
                         disabled={!item.imageUrl}
                         className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all disabled:opacity-50"
                         title="View Item Photo"
                       >
                         <Eye size={18} />
                       </button>
                       <button 
                         onClick={() => openReviews(item)}
                         className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                         title="Manage Reviews"
                       >
                         <MessageSquare size={18} />
                       </button>
                       <button 
                         onClick={() => handleDelete(item._id)}
                         className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-all shadow hover:shadow-md"
                         title="Delete Listing"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No listings found. Students haven't added any items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <div className="bg-card p-2 rounded-3xl shadow-2xl max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 p-2 bg-white rounded-full text-black hover:scale-110 transition-transform">
              <X size={24} />
            </button>
            <div className="rounded-2xl overflow-hidden bg-muted flex items-center justify-center min-h-[300px]">
              <img src={selectedImage} alt="Listing Photo" className="w-full h-auto max-h-[80vh] object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Reviews Management Modal */}
      {selectedItemReviews && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedItemReviews(null)}>
          <div className="bg-card rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between bg-muted/30">
              <div>
                <h3 className="text-xl font-black text-primary">Manage Reviews</h3>
                <p className="text-xs font-bold text-muted-foreground mt-1 line-clamp-1">{selectedItemReviews.title}</p>
              </div>
              <button onClick={() => setSelectedItemReviews(null)} className="p-2 bg-white border rounded-full text-muted-foreground hover:text-black hover:scale-110 transition-transform">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-muted/10">
              {reviews.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-bold">No reviews for this item yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div key={rev.id} className="p-5 bg-card border rounded-2xl shadow-sm relative group">
                      {editingReview?.id === rev.id ? (
                        <div className="space-y-4">
                           <div className="flex items-center gap-2">
                             <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rating</label>
                             <div className="flex gap-1">
                               {[1,2,3,4,5].map(star => (
                                 <button type="button" key={star} onClick={() => setEditingReview({...editingReview, rating: star})} className="text-amber-500">
                                   <Star size={18} className={star <= editingReview.rating ? "fill-current" : "text-muted-foreground/30"} />
                                 </button>
                               ))}
                             </div>
                           </div>
                           <textarea 
                             value={editingReview.comment} 
                             onChange={e => setEditingReview({...editingReview, comment: e.target.value})} 
                             className="w-full px-3 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-primary outline-none resize-none" 
                             rows="3"
                           />
                           <div className="flex items-center gap-2 justify-end">
                             <button onClick={() => setEditingReview(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted">Cancel</button>
                             <button onClick={saveEditedReview} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white shadow-md">Save Changes</button>
                           </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-bold text-sm text-primary">{rev.author}</p>
                              <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">{new Date(rev.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex text-amber-500">
                              {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < rev.rating ? "fill-current" : "text-muted"} />)}
                            </div>
                          </div>
                          <p className="text-sm text-foreground mb-4">{rev.comment}</p>
                          
                          <div className="flex items-center gap-2 pt-3 border-t">
                             <button 
                               onClick={() => setEditingReview(rev)} 
                               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                             >
                               <Edit3 size={14} /> Edit Review
                             </button>
                             <button 
                               onClick={() => deleteReview(rev.id)} 
                               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 transition-colors"
                             >
                               <Trash2 size={14} /> Delete
                             </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
