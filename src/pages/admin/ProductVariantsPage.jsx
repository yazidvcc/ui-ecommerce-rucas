import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi, adminProductApi, colorApi, sizeApi } from '../../lib/api';

export default function ProductVariantsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState({ price: '', stock: '' });
  const [addForm, setAddForm] = useState({ color_id: '', size_id: '', price: '', stock: '', weight: '' });

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const result = await productApi.getVariants(id);
      setProduct(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [id]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [colRes, sizeRes] = await Promise.all([
          colorApi.search({ size: 100 }),
          sizeApi.search({ size: 100 }),
        ]);
        setColors(colRes.data || []);
        setSizes(sizeRes.data || []);
      } catch (err) {
        console.error('Failed to fetch metadata', err);
      }
    };
    fetchMeta();
  }, []);

  const handleUpdate = async (variantId) => {
    try {
      await adminProductApi.updateVariant(id, variantId, {
        price: parseInt(editForm.price),
        stock: parseInt(editForm.stock),
      });
      setEditingId(null);
      fetchProduct();
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  const handleAdd = async () => {
    if (!addForm.color_id || !addForm.size_id || !addForm.price || !addForm.stock || !addForm.weight) {
      return alert('All fields are required');
    }
    try {
      await adminProductApi.createVariant(id, {
        color_id: parseInt(addForm.color_id),
        size_id: parseInt(addForm.size_id),
        price: parseInt(addForm.price),
        stock: parseInt(addForm.stock),
        weight: parseInt(addForm.weight),
      });
      setIsAdding(false);
      setAddForm({ color_id: '', size_id: '', price: '', stock: '', weight: '' });
      fetchProduct();
    } catch (err) {
      alert(err.message || 'Add variant failed');
    }
  };

  const handleDelete = async (variantId) => {
    if (!window.confirm('Delete this variant?')) return;
    try {
      await adminProductApi.removeVariant(id, variantId);
      fetchProduct();
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const startEdit = (variant) => {
    setEditingId(variant.id || `${variant.color?.id}-${variant.size?.id}`);
    setEditForm({ price: variant.price, stock: variant.stock });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>;
  }

  if (!product) {
    return <div className="flex justify-center items-center h-64 font-bold tracking-widest uppercase text-error">Product not found.</div>;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b-4 border-primary pb-4">
        <div className="flex flex-col gap-2">
          <Link to="/admin/products" className="font-bold text-sm tracking-widest uppercase text-text-muted hover:text-primary transition-colors hover:underline">
            ← BACK TO PRODUCTS
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase break-all">VARIANTS: {product.name}</h1>
        </div>
        <button className="btn btn-primary py-3 px-6 text-sm font-black tracking-widest uppercase border-2 border-primary hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 whitespace-nowrap" onClick={() => setIsAdding(true)}>
          + ADD VARIANT
        </button>
      </div>

      <div className="overflow-x-auto border-4 border-primary bg-surface-container-lowest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-primary text-on-primary font-black text-sm tracking-widest uppercase">
              <th className="p-4 border-b-4 border-r-4 border-primary/20">COLOR</th>
              <th className="p-4 border-b-4 border-r-4 border-primary/20">SIZE</th>
              <th className="p-4 border-b-4 border-r-4 border-primary/20">PRICE</th>
              <th className="p-4 border-b-4 border-r-4 border-primary/20">STOCK</th>
              <th className="p-4 border-b-4 border-r-4 border-primary/20">WEIGHT</th>
              <th className="p-4 border-b-4 border-primary/20">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {(!product.productVariants || product.productVariants.length === 0) ? (
              <tr>
                <td colSpan="6" className="p-8 text-center font-bold text-lg tracking-widest uppercase text-text-muted border-dashed border-2 border-border m-4">
                  No variants found
                </td>
              </tr>
            ) : (
              product.productVariants.map((variant, idx) => {
                const variantKey = variant.id || `${variant.color?.id}-${variant.size?.id}`;
                const isEditing = editingId === variantKey;
                return (
                  <tr key={idx} className={`border-b-2 border-border ${idx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'} hover:bg-primary/5 transition-colors`}>
                    <td className="p-4 border-r-2 border-border font-black text-sm tracking-widest uppercase">{variant.color?.name}</td>
                    <td className="p-4 border-r-2 border-border font-bold text-sm tracking-wider uppercase">{variant.size?.label}</td>
                    <td className="p-4 border-r-2 border-border font-black tracking-tighter">
                      {isEditing ? (
                        <input className="w-32 p-2 border-2 border-primary bg-surface focus:outline-none" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                      ) : (
                        `Rp ${variant.price?.toLocaleString('id-ID')}`
                      )}
                    </td>
                    <td className="p-4 border-r-2 border-border font-bold text-sm">
                      {isEditing ? (
                        <input className="w-20 p-2 border-2 border-primary bg-surface focus:outline-none" type="number" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} />
                      ) : (
                        variant.stock
                      )}
                    </td>
                    <td className="p-4 border-r-2 border-border font-bold text-sm">
                      {variant.weight ? `${variant.weight}g` : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button className="inline-block px-3 py-1 border-2 border-primary bg-primary text-on-primary font-black text-xs tracking-widest uppercase hover:bg-on-primary hover:text-primary transition-colors" onClick={() => handleUpdate(variant.id)}>SAVE</button>
                            <button className="inline-block px-3 py-1 border-2 border-primary bg-surface font-black text-xs tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-colors" onClick={() => setEditingId(null)}>CANCEL</button>
                          </>
                        ) : (
                          <>
                            <button className="inline-block px-3 py-1 border-2 border-primary bg-surface font-black text-xs tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-colors" onClick={() => startEdit(variant)}>EDIT</button>
                            <button className="inline-block px-3 py-1 border-2 border-error bg-error text-on-primary font-black text-xs tracking-widest uppercase hover:bg-on-primary hover:text-error transition-colors" onClick={() => handleDelete(variant.id)}>DELETE</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            {isAdding && (
              <tr className="bg-primary/10 border-b-2 border-primary">
                <td className="p-4 border-r-2 border-primary/20">
                  <select className="w-full p-2 border-2 border-primary bg-surface font-bold text-xs uppercase cursor-pointer focus:outline-none" value={addForm.color_id} onChange={(e) => setAddForm({ ...addForm, color_id: e.target.value })}>
                    <option value="">Color</option>
                    {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
                <td className="p-4 border-r-2 border-primary/20">
                  <select className="w-full p-2 border-2 border-primary bg-surface font-bold text-xs uppercase cursor-pointer focus:outline-none" value={addForm.size_id} onChange={(e) => setAddForm({ ...addForm, size_id: e.target.value })}>
                    <option value="">Size</option>
                    {sizes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </td>
                <td className="p-4 border-r-2 border-primary/20">
                  <input className="w-full p-2 border-2 border-primary bg-surface font-bold text-xs focus:outline-none" type="number" placeholder="Price" value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} />
                </td>
                <td className="p-4 border-r-2 border-primary/20">
                  <input className="w-full p-2 border-2 border-primary bg-surface font-bold text-xs focus:outline-none" type="number" placeholder="Stock" value={addForm.stock} onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })} />
                </td>
                <td className="p-4 border-r-2 border-primary/20">
                  <input className="w-full p-2 border-2 border-primary bg-surface font-bold text-xs focus:outline-none" type="number" placeholder="Weight" value={addForm.weight} onChange={(e) => setAddForm({ ...addForm, weight: e.target.value })} />
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-block px-3 py-1 border-2 border-primary bg-primary text-on-primary font-black text-xs tracking-widest uppercase hover:bg-on-primary hover:text-primary transition-colors" onClick={handleAdd}>SAVE</button>
                    <button className="inline-block px-3 py-1 border-2 border-primary bg-surface font-black text-xs tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-colors" onClick={() => setIsAdding(false)}>CANCEL</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
