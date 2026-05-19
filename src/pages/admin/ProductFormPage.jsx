import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, categoryApi, colorApi, sizeApi, adminProductApi } from '../../lib/api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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
    return <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-end border-b-4 border-primary pb-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">{isEditing ? 'EDIT PRODUCT' : (createdProductId ? 'UPLOAD PRODUCT IMAGES' : 'ADD NEW PRODUCT')}</h1>
      </div>

      {error && <div className="p-4 border-2 border-error bg-error/10 text-error font-bold text-sm tracking-wider uppercase mb-6">{error}</div>}

      {!createdProductId ? (
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-4xl">
        <div className="border-4 border-primary bg-surface-container-lowest p-8 flex flex-col gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-2xl font-black uppercase tracking-tighter border-b-2 border-border pb-2">BASIC INFORMATION</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm tracking-widest uppercase">PRODUCT NAME</label>
              <input className="w-full p-4 border-2 border-primary bg-surface font-bold text-sm text-on-surface focus:outline-none focus:border-on-surface transition-colors" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm tracking-widest uppercase">CATEGORY</label>
              <select className="w-full p-4 border-2 border-primary bg-surface font-bold text-sm text-on-surface focus:outline-none focus:border-on-surface transition-colors cursor-pointer" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm tracking-widest uppercase">GENDER</label>
              <select className="w-full p-4 border-2 border-primary bg-surface font-bold text-sm text-on-surface focus:outline-none focus:border-on-surface transition-colors cursor-pointer" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} required>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="UNISEX">Unisex</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm tracking-widest uppercase">DESCRIPTION</label>
            <div className="border-2 border-primary bg-surface font-sans [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b-2 [&_.ql-toolbar]:border-primary [&_.ql-container]:border-0 [&_.ql-container]:text-sm [&_.ql-container]:font-bold [&_.ql-container]:text-on-surface [&_.ql-editor]:min-h-[120px]">
              <ReactQuill 
                theme="snow" 
                value={form.description} 
                onChange={(val) => setForm({ ...form, description: val })}
              />
            </div>
          </div>
        </div>

        {/* Variants - only for new products */}
        {!isEditing && (
          <div className="border-4 border-primary bg-surface-container-lowest p-8 flex flex-col gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b-2 border-border pb-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter">PRODUCT VARIANTS</h3>
              <button type="button" className="btn btn-outline border-2 border-primary px-4 py-2 font-black text-xs tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-colors" onClick={addVariant}>+ ADD VARIANT</button>
            </div>
            {variants.map((variant, i) => (
              <div key={i} className="flex flex-wrap gap-4 items-center bg-surface p-4 border-2 border-border">
                <select className="flex-1 min-w-[120px] p-3 border-2 border-primary bg-surface-container-lowest font-bold text-xs focus:outline-none cursor-pointer" value={variant.color_id} onChange={(e) => updateVariant(i, 'color_id', e.target.value)} required>
                  <option value="">Color</option>
                  {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="flex-1 min-w-[100px] p-3 border-2 border-primary bg-surface-container-lowest font-bold text-xs focus:outline-none cursor-pointer" value={variant.size_id} onChange={(e) => updateVariant(i, 'size_id', e.target.value)} required>
                  <option value="">Size</option>
                  {sizes.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <input className="w-24 p-3 border-2 border-primary bg-surface-container-lowest font-bold text-xs focus:outline-none" type="number" placeholder="Price" value={variant.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} required />
                <input className="w-20 p-3 border-2 border-primary bg-surface-container-lowest font-bold text-xs focus:outline-none" type="number" placeholder="Stock" value={variant.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} required />
                <input className="w-24 p-3 border-2 border-primary bg-surface-container-lowest font-bold text-xs focus:outline-none" type="number" placeholder="Weight (g)" value={variant.weight} onChange={(e) => updateVariant(i, 'weight', e.target.value)} required />
                {variants.length > 1 && (
                  <button type="button" className="w-10 h-10 flex items-center justify-center border-2 border-error bg-error text-on-primary font-black text-lg hover:bg-on-primary hover:text-error transition-colors" onClick={() => removeVariant(i)}>×</button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mt-2">
          <button type="submit" className="btn btn-primary py-4 px-8 text-lg font-black tracking-widest uppercase border-2 border-primary hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed" disabled={saving}>
            {saving ? <span className="w-6 h-6 border-4 border-on-primary border-t-transparent rounded-full animate-spin inline-block"></span> : (isEditing ? 'UPDATE PRODUCT' : 'CONTINUE TO IMAGES')}
          </button>
          <button type="button" className="btn btn-outline py-4 px-8 text-lg font-black tracking-widest uppercase border-2 border-primary hover:bg-primary hover:text-on-primary transition-colors" onClick={() => navigate('/admin/products')}>CANCEL</button>
        </div>
      </form>
      ) : (
      <form onSubmit={handleImageSubmit} className="flex flex-col gap-8 max-w-4xl">
        <div className="border-4 border-primary bg-surface-container-lowest p-8 flex flex-col gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-2xl font-black uppercase tracking-tighter border-b-2 border-border pb-2">PRODUCT IMAGES</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm tracking-widest uppercase">MAIN IMAGE</label>
              <input
                type="file"
                className="w-full p-3 border-2 border-primary bg-surface font-bold text-xs text-on-surface cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-primary file:text-on-primary file:font-black file:uppercase file:cursor-pointer hover:file:opacity-90"
                accept="image/*"
                onChange={(e) => setFiles({ ...files, main: e.target.files })}
                required
              />
            </div>

            {selectedColors.map(color => (
              <div key={color} className="flex flex-col gap-2">
                <label className="font-bold text-sm tracking-widest uppercase">{color.toUpperCase()} IMAGE</label>
                <input
                  type="file"
                  className="w-full p-3 border-2 border-primary bg-surface font-bold text-xs text-on-surface cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-primary file:text-on-primary file:font-black file:uppercase file:cursor-pointer hover:file:opacity-90"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, [color]: e.target.files })}
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="font-bold text-sm tracking-widest uppercase">ADDITIONAL IMAGES (OPTIONAL)</label>
            <input
              type="file"
              className="w-full p-3 border-2 border-primary bg-surface font-bold text-xs text-on-surface cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-primary file:text-on-primary file:font-black file:uppercase file:cursor-pointer hover:file:opacity-90"
              multiple
              accept="image/*"
              onChange={(e) => setFiles({ ...files, additional: e.target.files })}
            />
            <p className="font-bold text-xs tracking-wider uppercase text-text-muted mt-1">You can select multiple files</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-2">
          <button type="submit" className="btn btn-primary py-4 px-8 text-lg font-black tracking-widest uppercase border-2 border-primary hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed" disabled={saving}>
            {saving ? <span className="w-6 h-6 border-4 border-on-primary border-t-transparent rounded-full animate-spin inline-block"></span> : 'UPLOAD IMAGES'}
          </button>
          <button type="button" className="btn btn-outline py-4 px-8 text-lg font-black tracking-widest uppercase border-2 border-primary hover:bg-primary hover:text-on-primary transition-colors" onClick={() => navigate('/admin/products')}>SKIP</button>
        </div>
      </form>
      )}
    </div>
  );
}
