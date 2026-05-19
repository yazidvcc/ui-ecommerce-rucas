import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../lib/api';

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const result = await cartApi.get();
      setItems(result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async (cartId) => {
    try {
      await cartApi.remove(cartId);
      setItems((prev) => prev.filter((item) => item.id !== cartId));
    } catch (err) {
      console.error(err);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.productVariant?.price || 0) * item.quantity, 0);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="w-full bg-background min-h-screen pt-10 pb-20">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-10 border-b-4 border-primary pb-6">YOUR CART</h1>

        {items.length === 0 ? (
          <div className="border-2 border-dashed border-primary p-20 flex flex-col items-center justify-center text-center bg-surface-container-lowest">
            <p className="text-3xl font-black uppercase tracking-tighter">YOUR CART IS EMPTY</p>
            <p className="text-text-muted font-bold mt-2 uppercase tracking-wide">Explore our collection and find something you love.</p>
            <Link to="/catalog" className="btn btn-primary btn-lg mt-8 text-lg tracking-widest px-8">SHOP NOW</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 flex flex-col gap-6">
              {items.map((item) => {
                const variant = item.productVariant;
                const product = variant?.product;
                const photo = product?.productPhotos?.[0]?.url;
                return (
                  <div key={item.id} className="flex gap-6 p-4 border-2 border-primary bg-surface-container-lowest">
                    <div className="w-24 md:w-32 aspect-[4/5] bg-surface-container relative flex-shrink-0 border-2 border-primary overflow-hidden flex items-center justify-center">
                      {photo ? (
                        <img src={photo} alt={product?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-text-muted font-bold text-xs tracking-widest uppercase">NO IMG</div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 py-2 justify-between">
                      <div>
                        <Link to={`/products/${product?.id}`} className="font-black text-xl uppercase tracking-tighter hover:text-text-muted transition-colors line-clamp-2 mb-1">
                          {product?.name}
                        </Link>
                        <p className="font-bold text-sm tracking-wider uppercase text-text-muted">
                          {variant?.color?.name} / {variant?.size?.label}
                        </p>
                        <p className="font-bold text-sm tracking-wider uppercase mt-2">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end py-2">
                      <p className="font-black text-lg md:text-xl uppercase tracking-tighter">
                        Rp {(variant?.price * item.quantity)?.toLocaleString('id-ID')}
                      </p>
                      <button 
                        className="font-bold text-sm tracking-widest uppercase text-error hover:text-on-primary hover:bg-error border-2 border-transparent hover:border-error px-3 py-1 transition-colors" 
                        onClick={() => handleRemove(item.id)}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-full lg:w-[400px] flex-shrink-0">
              <div className="border-4 border-primary p-6 bg-surface-container-lowest sticky top-24">
                <h3 className="text-2xl font-black uppercase tracking-tighter border-b-2 border-primary pb-4 mb-6">ORDER SUMMARY</h3>
                <div className="flex justify-between items-center mb-4 font-bold text-sm tracking-widest uppercase">
                  <span>Subtotal</span>
                  <span className="text-lg">Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center mb-6 font-bold text-sm tracking-widest uppercase pb-6 border-b-2 border-border">
                  <span>Shipping</span>
                  <span className="text-text-muted text-right">Calculated at checkout</span>
                </div>
                <div className="flex justify-between items-end mb-8">
                  <span className="font-black text-xl tracking-tighter uppercase">TOTAL</span>
                  <span className="font-black text-3xl tracking-tighter uppercase">Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <button 
                  className="btn btn-primary btn-full btn-lg py-5 text-xl tracking-widest border-2 border-primary hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300" 
                  onClick={() => navigate('/checkout')}
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
