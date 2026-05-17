import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, categoryApi, colorApi, sizeApi, adminProductApi } from '../../lib/api';
import './ProductFormPage.css';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    name: '', gender: 'UNISEX', description: '', category_id: '',
  });
  const [variants, setVariants] = useState([{ color_id: '', size_id: '', price: '', stock: '', weight: '' }]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [files, setFiles] = useState({});
  const [createdProductId, setCreatedProductId] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMeta = async () => {
      const [catRes, colRes, sizeRes] = await Promise.all([
        categoryApi.search({ size: 100 }),
        colorApi.search({ size: 100 }),
        sizeApi.search({ size: 100 }),
      ]);
      setCategories(catRes.data || []);
      setColors(colRes.data || []);
      setSizes(sizeRes.data || []);
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      productApi.get(id).then((result) => {
        const product = result.data;
        setForm({
          name: product.name || '',
          gender: product.gender || 'UNISEX',
          description: product.description || '',
          category_id: product.category?.id || '',
        });
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        gender: form.gender,
        description: form.description,
        category_id: parseInt(form.category_id),
      };

      if (isEditing) {
        await adminProductApi.update(id, payload);
        navigate('/admin/products');
      } else {
        payload.product_variants = variants
          .filter((v) => v.color_id && v.size_id && v.price && v.stock && v.weight)
          .map((v) => ({
            color_id: parseInt(v.color_id),
            size_id: parseInt(v.size_id),
            price: parseInt(v.price),
            stock: parseInt(v.stock),
            weight: parseInt(v.weight),
          }));

        if (payload.product_variants.length === 0) {
          setError('Add at least one variant');
          setSaving(false);
          return;
        }

        const result = await adminProductApi.create(payload);
        const newProductId = result.data?.id;

        if (newProductId) {
          setCreatedProductId(newProductId);
          const colorIds = [...new Set(payload.product_variants.map(v => v.color_id))];
          const colorNames = colorIds.map(cid => colors.find(c => c.id === cid)?.name).filter(Boolean);
          setSelectedColors(colorNames);
          setSaving(false);
          return;
        }
      }
    } catch (err) {
      setError(err.message || 'Save failed');
      setSaving(false);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const formData = new FormData();
      if (files.main && files.main[0]) {
        formData.append('main', files.main[0]);
      }
      selectedColors.forEach(color => {
        if (files[color] && files[color][0]) {
          formData.append(color, files[color][0]);
        }
      });
      if (files.additional) {
        Array.from(files.additional).forEach(file => {
          formData.append('additional', file);
        });
      }

      await adminProductApi.uploadImages(createdProductId, formData);
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setSaving(false);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { color_id: '', size_id: '', price: '', stock: '', weight: '' }]);
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>{isEditing ? 'EDIT PRODUCT' : (createdProductId ? 'UPLOAD PRODUCT IMAGES' : 'ADD NEW PRODUCT')}</h1>
      </div>

      {error && <div className="auth-error mb-6">{error}</div>}

      {!createdProductId ? (
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-card">
          <h3 className="text-label-bold mb-4">BASIC INFORMATION</h3>
          <div className="form-grid">
            <div className="input-group">
              <label>PRODUCT NAME</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>CATEGORY</label>
              <select className="input-field" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>GENDER</label>
              <select className="input-field" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} required>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="UNISEX">Unisex</option>
              </select>
            </div>
          </div>
          <div className="input-group mt-4">
            <label>DESCRIPTION</label>
            <textarea className="input-field" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
        </div>

        {/* Variants - only for new products */}
        {!isEditing && (
          <div className="form-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-label-bold">PRODUCT VARIANTS</h3>
              <button type="button" className="btn btn-sm btn-secondary" onClick={addVariant}>+ ADD VARIANT</button>
            </div>
            {variants.map((variant, i) => (
              <div key={i} className="variant-row">
                <select className="input-field" value={variant.color_id} onChange={(e) => updateVariant(i, 'color_id', e.target.value)} required>
                  <option value="">Color</option>
                  {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="input-field" value={variant.size_id} onChange={(e) => updateVariant(i, 'size_id', e.target.value)} required>
                  <option value="">Size</option>
                  {sizes.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <input className="input-field" type="number" placeholder="Price" value={variant.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} required />
                <input className="input-field" type="number" placeholder="Stock" value={variant.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} required />
                <input className="input-field" type="number" placeholder="Weight (g)" value={variant.weight} onChange={(e) => updateVariant(i, 'weight', e.target.value)} required />
                {variants.length > 1 && (
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => removeVariant(i)}>×</button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? <span className="spinner"></span> : (isEditing ? 'UPDATE PRODUCT' : 'CONTINUE TO IMAGES')}
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/admin/products')}>CANCEL</button>
        </div>
      </form>
      ) : (
      <form onSubmit={handleImageSubmit} className="product-form">
        <div className="form-card">
          <h3 className="text-label-bold mb-4">PRODUCT IMAGES</h3>
          
          <div className="form-grid">
            <div className="input-group">
              <label>MAIN IMAGE</label>
              <input
                type="file"
                className="input-field bg-white"
                accept="image/*"
                onChange={(e) => setFiles({ ...files, main: e.target.files })}
                required
              />
            </div>

            {selectedColors.map(color => (
              <div key={color} className="input-group">
                <label>{color.toUpperCase()} IMAGE</label>
                <input
                  type="file"
                  className="input-field bg-white"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, [color]: e.target.files })}
                  required
                />
              </div>
            ))}
          </div>

          <div className="input-group mt-4">
            <label>ADDITIONAL IMAGES (OPTIONAL)</label>
            <input
              type="file"
              className="input-field bg-white"
              multiple
              accept="image/*"
              onChange={(e) => setFiles({ ...files, additional: e.target.files })}
            />
            <p className="text-label-sm text-muted mt-2">You can select multiple files</p>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? <span className="spinner"></span> : 'UPLOAD IMAGES'}
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/admin/products')}>SKIP</button>
        </div>
      </form>
      )}
    </div>
  );
}
