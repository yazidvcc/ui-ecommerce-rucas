import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi, orderApi } from '../lib/api';

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
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="w-full bg-background min-h-screen pt-10 pb-20">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-10 border-b-4 border-primary pb-6">CHECKOUT</h1>
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 flex flex-col gap-10">
            {/* Address */}
            <section className="flex flex-col gap-6">
              <h2 className="text-3xl font-black uppercase tracking-tighter border-b-2 border-primary pb-2">SHIPPING ADDRESS</h2>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm tracking-widest uppercase">SPECIFIC ADDRESS</label>
                <textarea
                  className="w-full p-4 border-2 border-primary bg-surface-container-lowest font-bold text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-on-surface transition-colors resize-none h-32"
                  placeholder="Street name, house number, apartment..."
                  value={form.specific_address}
                  onChange={(e) => setForm({ ...form, specific_address: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm tracking-widest uppercase">SEARCH CITY / DISTRICT</label>
                <div className="flex gap-4">
                  <input
                    className="flex-1 p-4 border-2 border-primary bg-surface-container-lowest font-bold text-sm text-on-surface placeholder:text-text-muted focus:outline-none focus:border-on-surface transition-colors"
                    placeholder="Type city or district name..."
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                  />
                  <button type="button" className="btn btn-primary" onClick={searchAddress}>SEARCH</button>
                </div>
              </div>
              {addressResults.length > 0 && (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto border-2 border-primary bg-surface-container-lowest p-2">
                  {addressResults.map((addr, i) => (
                    <button 
                      key={i} 
                      type="button" 
                      className="text-left p-3 font-bold text-sm hover:bg-primary hover:text-on-primary transition-colors" 
                      onClick={() => selectAddress(addr)}
                    >
                      {addr.label || addr.name || JSON.stringify(addr)}
                    </button>
                  ))}
                </div>
              )}
              {selectedAddress && (
                <p className="font-bold text-sm tracking-wider uppercase text-success p-4 border-2 border-success bg-success/10 flex items-center gap-2">
                  <span>✓</span> <span>Selected: {form.full_address}</span>
                </p>
              )}
            </section>

            {/* Shipping */}
            {selectedAddress && (
              <section className="flex flex-col gap-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter border-b-2 border-primary pb-2">SHIPPING METHOD</h2>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm tracking-widest uppercase">SELECT COURIER</label>
                  <select
                    className="w-full p-4 border-2 border-primary bg-surface-container-lowest font-bold text-sm text-on-surface focus:outline-none focus:border-on-surface transition-colors cursor-pointer"
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
                  <div className="flex flex-col gap-3 mt-2">
                    {shippingOptions.map((option, i) => {
                      const cost = Array.isArray(option.cost) ? option.cost[0]?.value : (option.cost || option.price || 0);
                      const isSelected = form.shipping_service === (option.service || option.name);
                      return (
                        <button
                          key={i}
                          type="button"
                          className={`flex items-center justify-between p-4 border-2 transition-all ${isSelected ? 'border-primary bg-primary text-on-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'border-border bg-surface-container-lowest hover:border-primary text-on-surface'}`}
                          onClick={() => selectShipping(option)}
                        >
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-black tracking-widest uppercase">{option.name || option.service}</span>
                            <span className={`font-bold text-xs tracking-wider uppercase ${isSelected ? 'text-on-primary/80' : 'text-text-muted'}`}>
                              {option.type || option.description || ''}
                            </span>
                          </div>
                          <span className="font-black text-lg tracking-tighter uppercase">
                            Rp {(cost).toLocaleString('id-ID')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-bold text-sm tracking-wider uppercase text-text-muted p-4 border-2 border-dashed border-border text-center">
                    No shipping options available for this courier.
                  </p>
                )}
              </section>
            )}

            {error && <div className="p-4 font-bold text-sm tracking-wider uppercase border-2 border-error bg-error/10 text-error">{error}</div>}
          </div>

          {/* Summary */}
          <div className="w-full lg:w-[450px] flex-shrink-0">
            <div className="border-4 border-primary p-6 md:p-8 bg-surface-container-lowest sticky top-24">
              <h3 className="text-2xl font-black uppercase tracking-tighter border-b-2 border-primary pb-4 mb-6">ORDER SUMMARY</h3>
              <div className="flex flex-col gap-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4 font-bold text-sm uppercase">
                    <span className="flex-1 tracking-wider text-text-muted">
                      {item.productVariant?.product?.name} <span className="text-on-surface">× {item.quantity}</span>
                    </span>
                    <span className="flex-shrink-0 tracking-tighter">
                      Rp {((item.productVariant?.price || 0) * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-4 font-bold text-sm tracking-widest uppercase border-t-2 border-border pt-6">
                <span>Subtotal</span>
                <span className="text-lg">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center mb-6 font-bold text-sm tracking-widest uppercase pb-6 border-b-2 border-border">
                <span>Shipping</span>
                <span className="text-lg">
                  {form.shipping_cost > 0 ? `Rp ${form.shipping_cost.toLocaleString('id-ID')}` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-end mb-8">
                <span className="font-black text-xl tracking-tighter uppercase">TOTAL</span>
                <span className="font-black text-3xl tracking-tighter uppercase text-primary">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-full btn-lg py-5 text-xl tracking-widest border-2 border-primary hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed" 
                disabled={submitting}
              >
                {submitting ? <span className="w-6 h-6 border-4 border-on-primary border-t-transparent rounded-full animate-spin inline-block"></span> : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
