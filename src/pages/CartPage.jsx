import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../lib/api';
import './CartPage.css';

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
    return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="text-headline-lg mb-8">YOUR CART</h1>

        {items.length === 0 ? (
          <div className="empty-state">
            <p className="text-headline-md">YOUR CART IS EMPTY</p>
            <p className="text-muted mt-2">Explore our collection and find something you love.</p>
            <Link to="/catalog" className="btn btn-primary mt-6">SHOP NOW</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => {
                const variant = item.productVariant;
                const product = variant?.product;
                const photo = product?.productPhotos?.[0]?.url;
                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image" style={{ backgroundColor: '#f0f0f0' }}>
                      {photo ? (
                        <img src={photo} alt={product?.name} />
                      ) : (
                        <div className="pdp-no-image" style={{ fontSize: '12px' }}>NO IMG</div>
                      )}
                    </div>
                    <div className="cart-item-details">
                      <Link to={`/products/${product?.id}`} className="cart-item-name">
                        {product?.name}
                      </Link>
                      <p className="text-label-sm text-muted">
                        {variant?.color?.name} / {variant?.size?.label}
                      </p>
                      <p className="cart-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <div className="cart-item-right">
                      <p className="cart-item-price">
                        Rp {(variant?.price * item.quantity)?.toLocaleString('id-ID')}
                      </p>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(item.id)}>
                        REMOVE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <h3 className="text-headline-md mb-6">ORDER SUMMARY</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span className="font-bold">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="text-muted">Calculated at checkout</span>
              </div>
              <div className="summary-total">
                <span>TOTAL</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/checkout')}>
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
