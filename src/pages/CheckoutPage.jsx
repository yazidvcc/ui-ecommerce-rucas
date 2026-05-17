import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi, orderApi } from '../lib/api';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    specific_address: '',
    full_address: '',
    shipping_cost: 0,
    shipping_name: '',
    shipping_code: '',
    shipping_service: '',
    shipping_description: '',
    etd: '',
  });

  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState([]);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [courier, setCourier] = useState('jne');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const result = await cartApi.get();
        setCartItems(result.data || []);
        if (!result.data || result.data.length === 0) navigate('/cart');
      } catch {
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const searchAddress = async () => {
    if (!addressQuery.trim()) return;
    try {
      const result = await orderApi.getDestinationAddress(addressQuery);
      setAddressResults(result.data || result || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchShippingOptions = async (address, selectedCourier) => {
    if (!address) return;
    const totalWeight = cartItems.reduce((sum, item) => sum + (item.quantity * item.productVariant.weight), 0);
    const subtotalPrice = cartItems.reduce((sum, item) => sum + (item.productVariant?.price || 0) * item.quantity, 0);

    try {
      const result = await orderApi.getShippingCost({
        destination: address.id || address.destination || address.city_id || '',
        weight: totalWeight,
        courier: selectedCourier,
        price: subtotalPrice
      });
      // Komerce might return options wrapped or directly.
      setShippingOptions(result.data || result || []);
      // Reset selected shipping when address or courier changes
      setForm((prev) => ({
        ...prev,
        shipping_cost: 0,
        shipping_name: '',
        shipping_code: '',
        shipping_service: '',
        shipping_description: '',
        etd: '',
      }));
    } catch (err) {
      console.error(err);
      setShippingOptions([]);
    }
  };

  const selectAddress = async (address) => {
    setSelectedAddress(address);
    setForm((prev) => ({ ...prev, full_address: address.label || address.name || '' }));
    setAddressResults([]);

    fetchShippingOptions(address, courier);
  };

  const handleCourierChange = (e) => {
    const newCourier = e.target.value;
    setCourier(newCourier);
    fetchShippingOptions(selectedAddress, newCourier);
  };

  const selectShipping = (option) => {
    const cost = Array.isArray(option.cost) ? option.cost[0]?.value : (option.cost || option.price || 0);
    const etd = Array.isArray(option.cost) ? (option.cost[0]?.etd || '') : (option.etd || '');
    setForm((prev) => ({
      ...prev,
      shipping_name: courier.toUpperCase(),
      shipping_code: option.service || option.code || option.name || '',
      shipping_service: option.service || option.name || '',
      shipping_description: option.description || option.type || option.service || '',
      shipping_cost: cost,
      etd: etd,
    }));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.productVariant?.price || 0) * item.quantity, 0);
  const total = subtotal + (form.shipping_cost || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.specific_address || !form.full_address || !form.shipping_service) {
      setError('Please complete all fields');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        specific_address: form.specific_address,
        full_address: form.full_address,
        shipping_cost: form.shipping_cost,
        shipping_name: form.shipping_name,
        shipping_code: form.shipping_code,
        shipping_service: form.shipping_service,
        shipping_description: form.shipping_description,
        etd: form.etd || '0',
        product_variant: cartItems.map((item) => ({
          product_variant_id: item.productVariant.id,
          quantity: item.quantity,
        })),
      };
      const result = await orderApi.createTransaction(payload);
      if (result.data?.redirect_url) {
        window.location.href = result.data.redirect_url;
      } else if (result.data?.token) {
        window.snap?.pay(result.data.token);
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setError(err.message || 'Order failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="text-headline-lg mb-8">CHECKOUT</h1>
        <form onSubmit={handleSubmit} className="checkout-layout">
          <div className="checkout-form">
            {/* Address */}
            <section className="checkout-section">
              <h2 className="text-headline-md">SHIPPING ADDRESS</h2>
              <div className="input-group mt-4">
                <label>SPECIFIC ADDRESS</label>
                <textarea
                  className="input-field"
                  placeholder="Street name, house number, apartment..."
                  value={form.specific_address}
                  onChange={(e) => setForm({ ...form, specific_address: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>SEARCH CITY / DISTRICT</label>
                <div className="search-address-row">
                  <input
                    className="input-field"
                    placeholder="Type city or district name..."
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                  />
                  <button type="button" className="btn btn-primary" onClick={searchAddress}>SEARCH</button>
                </div>
              </div>
              {addressResults.length > 0 && (
                <div className="address-results">
                  {addressResults.map((addr, i) => (
                    <button key={i} type="button" className="address-option" onClick={() => selectAddress(addr)}>
                      {addr.label || addr.name || JSON.stringify(addr)}
                    </button>
                  ))}
                </div>
              )}
              {selectedAddress && (
                <p className="text-label-sm mt-2" style={{ color: 'var(--color-success)' }}>
                  ✓ Selected: {form.full_address}
                </p>
              )}
            </section>

            {/* Shipping */}
            {selectedAddress && (
              <section className="checkout-section">
                <h2 className="text-headline-md">SHIPPING METHOD</h2>
                <div className="input-group mt-4">
                  <label>SELECT COURIER</label>
                  <select
                    className="input-field"
                    value={courier}
                    onChange={handleCourierChange}
                  >
                    <option value="jne">JNE</option>
                    <option value="jnt">J&T</option>
                    <option value="sicepat">SiCepat</option>
                    <option value="ninja">Ninja Express</option>
                    <option value="ide">ID Express</option>
                    <option value="sap">SAP Express</option>
                  </select>
                </div>

                {shippingOptions.length > 0 ? (
                  <div className="shipping-options mt-4">
                    {shippingOptions.map((option, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`shipping-option ${form.shipping_service === (option.service || option.name) ? 'active' : ''}`}
                        onClick={() => selectShipping(option)}
                      >
                        <div>
                          <span className="font-bold">{option.name || option.service}</span>
                          <span className="text-muted"> — {option.type || option.description || ''}</span>
                        </div>
                        <span className="font-bold">
                          Rp {(option.cost || option.price || option?.cost?.[0]?.value || 0).toLocaleString('id-ID')}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mt-4 text-label-sm">No shipping options available for this courier.</p>
                )}
              </section>
            )}

            {error && <div className="auth-error">{error}</div>}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3 className="text-headline-md mb-6">ORDER SUMMARY</h3>
            {cartItems.map((item) => (
              <div key={item.id} className="summary-row">
                <span className="text-label-sm" style={{ flex: 1 }}>
                  {item.productVariant?.product?.name} × {item.quantity}
                </span>
                <span className="font-bold" style={{ fontSize: '13px' }}>
                  Rp {((item.productVariant?.price || 0) * item.quantity).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
            <div className="summary-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)' }}>
              <span>Subtotal</span>
              <span className="font-bold">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="font-bold">
                {form.shipping_cost > 0 ? `Rp ${form.shipping_cost.toLocaleString('id-ID')}` : '—'}
              </span>
            </div>
            <div className="summary-total">
              <span>TOTAL</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting}>
              {submitting ? <span className="spinner"></span> : 'PLACE ORDER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
