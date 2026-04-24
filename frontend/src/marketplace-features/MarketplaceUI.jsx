import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, PackageSearch, X, Heart, ShoppingCart, Tag, Loader2, Star, MessageSquare, ArrowLeft } from "lucide-react";
import axios from "axios";
import { cn } from "../lib/utils";

// --- INLINE UI COMPONENTS --- //

export const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

function InlineItemCard({
  id,
  title,
  price,
  category,
  condition,
  imageUrl,
  seller,
  status = "Available",
  isFeatured = false,
  onToggleWishlist,
  isLiked: initialLiked = false,
  onClick
}) {
  const [isLiked, setIsLiked] = useState(initialLiked);


  React.useEffect(() => {
    setIsLiked(initialLiked);
  }, [initialLiked]);

  const handleLikeClick = (e) => {
    e.stopPropagation();
    onToggleWishlist(id, !isLiked);
  };

  return (
    <div onClick={onClick} className="group overflow-hidden border-2 hover:border-primary/30 hover:shadow-2xl transition-all duration-500 bg-card rounded-3xl flex flex-col text-card-foreground shadow-sm cursor-pointer">
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=500&auto=format&fit=crop"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           {isFeatured && (
             <Badge className="bg-secondary text-white border-none shadow-lg px-3 py-1">
               🔥 HOT DEAL
             </Badge>
           )}
           <Badge className="bg-primary/80 backdrop-blur-md text-white border-none px-3 py-1">
             {category}
           </Badge>
        </div>

        <Badge 
          variant="outline" 
          className={cn(
            "absolute top-4 right-4 backdrop-blur-md border-none px-3 py-1 font-bold",
            status === "Available" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
          )}
        >
          {status}
        </Badge>

        {/* Action Buttons (Overlay) */}
        <div className="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <Button 
              size="icon" 
              variant="secondary" 
              className={cn("rounded-full w-10 h-10 shadow-xl border bg-white/80 backdrop-blur-sm transition-all", isLiked ? "bg-red-500 text-white border-red-600 shadow-red-500/20" : "text-muted-foreground hover:bg-white hover:text-red-500")}
              onClick={handleLikeClick}
            >
              <Heart size={18} className={cn(isLiked && "fill-current")} />
            </Button>
           <Button 
             size="icon" 
             className="rounded-full w-10 h-10 shadow-xl bg-white text-primary hover:bg-primary hover:text-white"
             onClick={() => onAddToCart(id)}
           >
             <ShoppingCart size={18} />
           </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>

         <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
               <Tag size={12} />
               <span>{condition}</span>
            </div>
         </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Price</p>
            <p className="text-2xl font-black text-primary">LKR {price.toLocaleString()}</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT --- //

const CATEGORIES = [
  { id: "all", name: "All Items" },
  { id: "Books", name: "Books" },
  { id: "Electronics", name: "Electronics" },
  { id: "Lab Equipment", name: "Lab Equipment" },
  { id: "Clothing & Uniforms", name: "Clothing & Uniforms" },
  { id: "Sports & Fitness", name: "Sports & Fitness" },
  { id: "Services & Tutoring", name: "Services & Tutoring" },
  { id: "Other", name: "Other" },
];

// Demo items used when backend /api/items is not available yet
const DEMO_ITEMS = [
  { _id:"d1", title:"Engineering Mathematics Textbook", price:1800, category:"Books", condition:"Good", isFeatured:true, status:"Available", imageUrl:"https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop" },
  { _id:"d2", title:"Scientific Calculator (Casio fx-991)", price:2500, category:"Electronics", condition:"Like New", isFeatured:true, status:"Available", imageUrl:"https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=500&auto=format&fit=crop" },
  { _id:"d3", title:"Lab Coat – Size M", price:600, category:"Clothing & Uniforms", condition:"New", isFeatured:false, status:"Available", imageUrl:"https://images.unsplash.com/photo-1581093803997-e6a74e4e7bd1?w=500&auto=format&fit=crop" },
  { _id:"d4", title:"Data Structures & Algorithms Book", price:1200, category:"Books", condition:"Good", isFeatured:false, status:"Available", imageUrl:"https://images.unsplash.com/photo-1589998059171-988d887df646?w=500&auto=format&fit=crop" },
  { _id:"d5", title:"USB-C Hub (7-in-1)", price:3500, category:"Electronics", condition:"Like New", isFeatured:true, status:"Available", imageUrl:"https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&auto=format&fit=crop" },
  { _id:"d6", title:"Python Programming – 2nd Edition", price:950, category:"Books", condition:"Good", isFeatured:false, status:"Available", imageUrl:"https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop" },
  { _id:"d7", title:"Badminton Racket Set", price:2200, category:"Sports & Fitness", condition:"Good", isFeatured:false, status:"Available", imageUrl:"https://images.unsplash.com/photo-1618355776464-8666794d2520?w=500&auto=format&fit=crop" },
  { _id:"d8", title:"Breadboard & Electronics Kit", price:1500, category:"Lab Equipment", condition:"New", isFeatured:false, status:"Available", imageUrl:"https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=500&auto=format&fit=crop" },
  { _id:"d9", title:"Java Programming Tutoring (1hr)", price:800, category:"Services & Tutoring", condition:"Service", isFeatured:false, status:"Available", imageUrl:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop" },
  { _id:"d10", title:"SLIIT Hoodie (Size L)", price:1800, category:"Clothing & Uniforms", condition:"New", isFeatured:false, status:"Available", imageUrl:"https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&auto=format&fit=crop" },
  { _id:"d11", title:"Wireless Mouse – Logitech M190", price:2000, category:"Electronics", condition:"Like New", isFeatured:false, status:"Available", imageUrl:"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop" },
  { _id:"d12", title:"Digital Systems Lab Manual", price:400, category:"Lab Equipment", condition:"Good", isFeatured:false, status:"Available", imageUrl:"https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop" },
];

export default function MarketplaceUI({ onNavigate }) {
  const [items, setItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [editingUserReview, setEditingUserReview] = useState(null);

  useEffect(() => {
    if (selectedItem) {
      const allReviews = JSON.parse(localStorage.getItem('item_reviews') || '{}');
      setReviews(allReviews[selectedItem._id] || []);
    }
  }, [selectedItem]);

  const submitReview = (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    
    const allReviews = JSON.parse(localStorage.getItem('item_reviews') || '{}');
    const itemRevs = allReviews[selectedItem._id] || [];
    
    const userInfo = JSON.parse(localStorage.getItem("std_userInfo") || localStorage.getItem("admin_userInfo") || "{}");
    const authorName = userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : "Anonymous Student";
    const authorId = userInfo?._id || 'local_user';
    
    const revObj = {
      id: Date.now().toString(),
      authorId: authorId,
      author: authorName,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString()
    };
    
    const updatedRevs = [revObj, ...itemRevs];
    allReviews[selectedItem._id] = updatedRevs;
    localStorage.setItem('item_reviews', JSON.stringify(allReviews));
    
    setReviews(updatedRevs);
    setNewReview({ rating: 5, comment: '' });
  };

  const deleteReview = (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    const allReviews = JSON.parse(localStorage.getItem('item_reviews') || '{}');
    const itemRevs = allReviews[selectedItem._id] || [];
    const updatedRevs = itemRevs.filter(r => r.id !== reviewId);
    allReviews[selectedItem._id] = updatedRevs;
    localStorage.setItem('item_reviews', JSON.stringify(allReviews));
    setReviews(updatedRevs);
  };

  const saveEditedUserReview = () => {
    if (!editingUserReview.comment.trim()) return;
    const allReviews = JSON.parse(localStorage.getItem('item_reviews') || '{}');
    const itemRevs = allReviews[selectedItem._id] || [];
    const updated = itemRevs.map(r => r.id === editingUserReview.id ? { ...r, rating: editingUserReview.rating, comment: editingUserReview.comment } : r);
    allReviews[selectedItem._id] = updated;
    localStorage.setItem('item_reviews', JSON.stringify(allReviews));
    setReviews(updated);
    setEditingUserReview(null);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(
        localStorage.getItem("std_userInfo") || localStorage.getItem("admin_userInfo") || "{}"
      );

      // Try real backend first, fall back to demo data
      const itemsRes = await axios.get("http://localhost:5001/api/items", {
        headers: userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {}
      }).catch(() => null);

      const userListingsRaw = localStorage.getItem('user_listings') || '[]';
      let userListings = [];
      try {
        userListings = JSON.parse(userListingsRaw);
      } catch {}

      if (itemsRes?.data?.success && itemsRes.data.data?.length > 0) {
        setItems([...userListings, ...itemsRes.data.data]);
      } else {
        // Use demo data until backend /api/items is ready
        setItems([...userListings, ...DEMO_ITEMS]);
      }

      // Fetch wishlist
      if (userInfo.token) {
        const wishlistRes = await axios.get("http://localhost:5001/api/wishlist", {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        }).catch(() => null);
        if (wishlistRes?.data?.success) {
          const ids = new Set((wishlistRes.data.data?.products || []).map(p => p._id || p));
          setWishlistIds(ids);
        }
      }
      setLoading(false);
      // Load existing wishlist from localStorage to show hearts correctly
      try {
        const stored = JSON.parse(localStorage.getItem('user_wishlist') || '[]');
        setWishlistIds(new Set(stored.map(i => i._id)));
      } catch {}
    } catch (err) {
      const userListingsRaw = localStorage.getItem('user_listings') || '[]';
      let userListings = [];
      try { userListings = JSON.parse(userListingsRaw); } catch {}
      setItems([...userListings, ...DEMO_ITEMS]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleWishlist = (productId, isLiked) => {
    const item = items.find(i => i._id === productId);
    if (!item) return;
    try {
      const raw = localStorage.getItem('user_wishlist') || '[]';
      let wishlist = JSON.parse(raw);
      if (isLiked) {
        // Add if not already there
        if (!wishlist.find(w => w._id === productId)) {
          wishlist.push(item);
        }
        setWishlistIds(prev => new Set(prev).add(productId));
      } else {
        wishlist = wishlist.filter(w => w._id !== productId);
        setWishlistIds(prev => { const s = new Set(prev); s.delete(productId); return s; });
      }
      localStorage.setItem('user_wishlist', JSON.stringify(wishlist));
      // Auto-navigate to wishlist tab
      if (isLiked && onNavigate) onNavigate('wishlist');
    } catch (err) { console.error('Wishlist error:', err); }
  };

  const handleAddToCart = (productId) => {
    const item = items.find(i => i._id === productId);
    if (!item) return;
    try {
      const raw = localStorage.getItem('user_cart') || '[]';
      let cart = JSON.parse(raw);
      const existing = cart.find(c => c._id === productId);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        cart.push({ ...item, quantity: 1 });
      }
      localStorage.setItem('user_cart', JSON.stringify(cart));
      // Auto-navigate to cart tab
      if (onNavigate) onNavigate('cart');
    } catch (err) { console.error('Cart error:', err); }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold animate-pulse">Fetching campus deals...</p>
      </div>
    );
  }

  if (selectedItem) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-24 px-4 pt-4">
        <button onClick={() => setSelectedItem(null)} className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><ArrowLeft size={16} /></div>
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-card border rounded-[3rem] p-4 md:p-8 shadow-2xl">
          <div className="rounded-[2rem] overflow-hidden bg-muted h-[300px] md:h-[500px]">
            <img src={selectedItem.imageUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800"} alt={selectedItem.title} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-6 flex flex-col justify-center">
             <div>
               <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-xs font-black tracking-widest uppercase mb-4">{selectedItem.category}</div>
               <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight tracking-tight mb-2">{selectedItem.title}</h1>
               <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
                 <div className="flex items-center gap-1"><Tag size={16} /> {selectedItem.condition}</div>
                 <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                 <div>Seller: {selectedItem.seller?.firstName ? `${selectedItem.seller.firstName} ${selectedItem.seller.lastName}` : "Student"}</div>
               </div>
             </div>
             
             <p className="text-muted-foreground leading-relaxed text-lg">{selectedItem.description || "No description provided for this item."}</p>
             
             <div className="pt-6 border-t flex items-end justify-between">
               <div>
                 <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Price</p>
                 <p className="text-4xl font-black text-secondary">LKR {Number(selectedItem.price).toLocaleString()}</p>
               </div>
             </div>
             
             <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => handleAddToCart(selectedItem._id)}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} /> Add to Cart
                </button>
                <button 
                  onClick={() => handleToggleWishlist(selectedItem._id, !wishlistIds.has(selectedItem._id))}
                  className={cn("w-16 flex flex-shrink-0 items-center justify-center rounded-2xl border-2 transition-all", wishlistIds.has(selectedItem._id) ? "bg-red-500 border-red-500 text-white" : "border-muted text-muted-foreground hover:border-red-500 hover:text-red-500")}
                >
                  <Heart size={24} className={cn(wishlistIds.has(selectedItem._id) && "fill-current")} />
                </button>
             </div>
          </div>
        </div>

        {/* FEEDBACK SECTION */}
        <div className="bg-card border rounded-[3rem] p-8 md:p-12 shadow-xl space-y-10">
           <div className="flex items-center gap-4 border-b pb-6">
             <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><MessageSquare size={24} /></div>
             <div>
               <h2 className="text-2xl font-black text-primary">Item Feedback & Ratings</h2>
               <p className="text-muted-foreground font-medium">Read what others think or leave your own review</p>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             {/* Read Reviews */}
             <div className="space-y-6">
               <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground">Community Reviews</h3>
               {reviews.length === 0 ? (
                 <div className="p-8 text-center border-2 border-dashed rounded-3xl text-muted-foreground">No feedback yet. Be the first to review!</div>
               ) : (
                 <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                   {reviews.map(rev => (
                     <div key={rev.id} className="p-5 bg-muted/30 rounded-2xl space-y-3 relative group">
                       {editingUserReview?.id === rev.id ? (
                         <div className="space-y-4">
                           <div className="flex items-center gap-2">
                             <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rating</label>
                             <div className="flex gap-1">
                               {[1,2,3,4,5].map(star => (
                                 <button type="button" key={star} onClick={() => setEditingUserReview({...editingUserReview, rating: star})} className="text-amber-500">
                                   <Star size={18} className={star <= editingUserReview.rating ? "fill-current" : "text-muted-foreground/30"} />
                                 </button>
                               ))}
                             </div>
                           </div>
                           <textarea 
                             value={editingUserReview.comment} 
                             onChange={e => setEditingUserReview({...editingUserReview, comment: e.target.value})} 
                             className="w-full px-3 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-primary outline-none resize-none" 
                             rows="3"
                           />
                           <div className="flex items-center gap-2 justify-end">
                             <button onClick={() => setEditingUserReview(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted">Cancel</button>
                             <button onClick={saveEditedUserReview} className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white shadow-md">Save Changes</button>
                           </div>
                         </div>
                       ) : (
                         <>
                           <div className="flex items-center justify-between">
                             <p className="font-bold text-sm">{rev.author}</p>
                             <div className="flex text-amber-500">
                               {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < rev.rating ? "fill-current" : "text-muted"} />)}
                             </div>
                           </div>
                           <p className="text-sm text-muted-foreground">{rev.comment}</p>
                           <div className="flex items-center justify-between">
                             <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest">{new Date(rev.date).toLocaleDateString()}</p>
                             {rev.authorId === (JSON.parse(localStorage.getItem("std_userInfo") || localStorage.getItem("admin_userInfo") || "{}")?._id || 'local_user') && (
                               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => setEditingUserReview(rev)} 
                                   className="text-xs font-bold text-primary hover:underline"
                                 >
                                   Edit
                                 </button>
                                 <button 
                                   onClick={() => deleteReview(rev.id)} 
                                   className="text-xs font-bold text-red-500 hover:underline"
                                 >
                                   Delete
                                 </button>
                               </div>
                             )}
                           </div>
                         </>
                       )}
                     </div>
                   ))}
                 </div>
               )}
             </div>

             {/* Write Review */}
             {(selectedItem.seller?._id === (JSON.parse(localStorage.getItem("std_userInfo") || localStorage.getItem("admin_userInfo") || "{}")?._id || 'local_user')) || (selectedItem._id?.startsWith('lst_')) ? (
               <div className="space-y-6 bg-muted/20 p-8 rounded-[2rem] border border-dashed border-muted h-fit flex flex-col items-center justify-center text-center">
                 <PackageSearch className="w-12 h-12 text-muted-foreground/30 mb-2" />
                 <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground">Your Listing</h3>
                 <p className="text-sm text-muted-foreground font-medium">You cannot review your own listings. You can view the feedback left by other students here.</p>
               </div>
             ) : (
               <form onSubmit={submitReview} className="space-y-6 bg-primary/5 p-8 rounded-[2rem] border border-primary/10 h-fit">
                 <h3 className="text-lg font-black uppercase tracking-widest text-primary">Leave Feedback</h3>
                 <div className="space-y-2">
                   <label className="text-sm font-bold">Rating</label>
                   <div className="flex gap-2">
                     {[1,2,3,4,5].map(star => (
                       <button type="button" key={star} onClick={() => setNewReview({...newReview, rating: star})} className="text-amber-500 transition-transform hover:scale-110">
                         <Star size={28} className={star <= newReview.rating ? "fill-current" : "text-muted-foreground/30"} />
                       </button>
                     ))}
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-bold">Your Review</label>
                   <textarea required rows="4" value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none shadow-sm" placeholder="Tell others about the condition, seller, etc..." />
                 </div>
                 <button type="submit" className="w-full py-3 bg-secondary text-white rounded-xl font-bold shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all">Submit Feedback</button>
               </form>
             )}
           </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <X className="w-12 h-12 text-red-500" />
        <p className="text-red-500 font-bold">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-6 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight mb-2">Campus Marketplace</h1>
          <p className="text-muted-foreground font-medium">Showing {filteredItems.length} items currently available</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search items..." 
                className="pl-9 rounded-xl border-muted focus:border-primary transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                  <X size={14} />
                </button>
              )}
           </div>
           <Button variant="outline" className="rounded-xl gap-2 border-muted hover:border-primary/30">
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
           </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-5 py-2 rounded-full text-xs font-bold transition-all border-2 whitespace-nowrap",
              selectedCategory === cat.id
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-muted/50 text-muted-foreground border-transparent hover:border-muted hover:text-primary"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map(item => (
            <InlineItemCard 
              key={item._id} 
              id={item._id}
              {...item} 
              seller={item.seller?.firstName ? `${item.seller.firstName} ${item.seller.lastName}` : "Student"}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isLiked={wishlistIds.has(item._id)}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-[3rem] border-2 border-dashed border-muted">
           <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <PackageSearch size={40} className="text-muted-foreground" />
           </div>
           <div>
              <h3 className="text-xl font-bold text-primary">No items found</h3>
              <p className="text-muted-foreground">Try adjusting your search or category filters</p>
           </div>
           <Button variant="link" onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}>
              Clear all filters
           </Button>
        </div>
      )}
    </div>
  );
}
