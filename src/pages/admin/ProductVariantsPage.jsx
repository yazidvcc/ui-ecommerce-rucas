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
    return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;
  }

  if (!product) {
    return <div className="loading-screen"><p>Product not found.</p></div>;
  }

  return (
    <div>
      <div className="admin-page-header flex justify-between items-center">
        <div>
          <Link to="/admin/products" className="text-label-sm text-muted" style={{ textDecoration: 'underline' }}>
            ← Back to Products
          </Link>
          <h1 style={{ marginTop: '8px' }}>VARIANTS: {product.name}</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>+ ADD VARIANT</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>COLOR</th>
              <th>SIZE</th>
              <th>PRICE</th>
              <th>STOCK</th>
              <th>WEIGHT</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {(!product.productVariants || product.productVariants.length === 0) ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#999' }}>No variants found</td></tr>
            ) : (
              product.productVariants.map((variant, idx) => {
                const variantKey = variant.id || `${variant.color?.id}-${variant.size?.id}`;
                const isEditing = editingId === variantKey;
                return (
                  <tr key={idx}>
                    <td className="font-bold">{variant.color?.name}</td>
                    <td>{variant.size?.label}</td>
                    <td>
                      {isEditing ? (
                        <input className="input-field" type="number" style={{ width: 120, padding: '6px 10px', minHeight: 'auto' }} value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                      ) : (
                        `Rp ${variant.price?.toLocaleString('id-ID')}`
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input className="input-field" type="number" style={{ width: 80, padding: '6px 10px', minHeight: 'auto' }} value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} />
                      ) : (
                        variant.stock
                      )}
                    </td>
                    <td>{variant.weight ? `${variant.weight}g` : '-'}</td>
                    <td>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(variant.id)}>SAVE</button>
                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>CANCEL</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-sm btn-secondary" onClick={() => startEdit(variant)}>EDIT</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(variant.id)}>DELETE</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            {isAdding && (
              <tr>
                <td>
                  <select className="input-field" style={{ width: '100%', minHeight: 'auto', padding: '6px 10px' }} value={addForm.color_id} onChange={(e) => setAddForm({ ...addForm, color_id: e.target.value })}>
                    <option value="">Color</option>
                    {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
                <td>
                  <select className="input-field" style={{ width: '100%', minHeight: 'auto', padding: '6px 10px' }} value={addForm.size_id} onChange={(e) => setAddForm({ ...addForm, size_id: e.target.value })}>
                    <option value="">Size</option>
                    {sizes.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </td>
                <td>
                  <input className="input-field" type="number" placeholder="Price" style={{ width: 120, minHeight: 'auto', padding: '6px 10px' }} value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} />
                </td>
                <td>
                  <input className="input-field" type="number" placeholder="Stock" style={{ width: 80, minHeight: 'auto', padding: '6px 10px' }} value={addForm.stock} onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })} />
                </td>
                <td>
                  <input className="input-field" type="number" placeholder="Weight" style={{ width: 80, minHeight: 'auto', padding: '6px 10px' }} value={addForm.weight} onChange={(e) => setAddForm({ ...addForm, weight: e.target.value })} />
                </td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-primary" onClick={handleAdd}>SAVE</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setIsAdding(false)}>CANCEL</button>
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
