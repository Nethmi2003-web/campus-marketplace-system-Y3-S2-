import React, { useState, useEffect } from "react";
import { Package, Clock, CheckCircle2, XCircle, Search, Calendar, ChevronRight } from "lucide-react";

export function UserTransactionsTab() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrders = () => {
      const userInfo = JSON.parse(localStorage.getItem('std_userInfo') || localStorage.getItem('admin_userInfo') || '{}');
      const allOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
      // Filter for orders belonging to the current user
      const userOrders = allOrders.filter(o => o.customerId === (userInfo._id || 'local_user'));
      // Sort by newest first
      setOrders(userOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));
    };
    
    fetchOrders();
    window.addEventListener('storage', fetchOrders);
    return () => window.removeEventListener('storage', fetchOrders);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved': return <CheckCircle2 size={16} />;
      case 'Rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items?.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight mb-2">My Transactions</h1>
          <p className="text-muted-foreground font-medium">Track the status of your campus marketplace orders</p>
        </div>
        
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search orders..." 
            className="w-full pl-9 pr-4 py-2 rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-[3rem] border-2 border-dashed border-muted">
           <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <Package size={40} className="text-muted-foreground/50" />
           </div>
           <div>
              <h3 className="text-xl font-bold text-primary">No transactions yet</h3>
              <p className="text-muted-foreground">Your order history will appear here once you make a purchase.</p>
           </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map(order => (
            <div key={order._id} className="bg-card border rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Order ID</span>
                    <span className="text-sm font-black text-primary">{order._id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Calendar size={14} />
                    {new Date(order.date).toLocaleString()}
                  </div>
                </div>
                
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>

              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-full h-full p-4 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary truncate">{item.title}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity || 1} &times; LKR {Number(item.price).toLocaleString()}</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-black text-primary">LKR {((item.quantity || 1) * item.price).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t flex items-center justify-between">
                <div className="text-sm text-muted-foreground font-bold">
                  Reference: <span className="text-foreground">{order.reference}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-secondary">LKR {Number(order.total).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="py-12 text-center text-muted-foreground font-medium">
              No orders found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
