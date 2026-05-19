import { useState, useEffect } from 'react';
import {
  categoryApi, colorApi, sizeApi,
  adminCategoryApi, adminColorApi, adminSizeApi,
} from '../../lib/api';

const TABS = ['Categories', 'Colors', 'Sizes'];

export default function AttributesPage() {
  const [activeTab, setActiveTab] = useState('Categories');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let result;
      if (activeTab === 'Categories') result = await categoryApi.search({ size: 100 });
      else if (activeTab === 'Colors') result = await colorApi.search({ size: 100 });
      else result = await sizeApi.search({ size: 100 });
      setItems(result.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [activeTab]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const payload = activeTab === 'Sizes' ? { label: newName.trim() } : { name: newName.trim() };
      if (activeTab === 'Categories') await adminCategoryApi.create(payload);
      else if (activeTab === 'Colors') await adminColorApi.create(payload);
      else await adminSizeApi.create(payload);
      setNewName('');
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    try {
      const payload = activeTab === 'Sizes' ? { label: editName.trim() } : { name: editName.trim() };
      if (activeTab === 'Categories') await adminCategoryApi.update(id, payload);
      else if (activeTab === 'Colors') await adminColorApi.update(id, payload);
      else await adminSizeApi.update(id, payload);
      setEditingId(null);
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${activeTab.slice(0, -1).toLowerCase()}?`)) return;
    try {
      if (activeTab === 'Categories') await adminCategoryApi.remove(id);
      else if (activeTab === 'Colors') await adminColorApi.remove(id);
      else await adminSizeApi.remove(id);
      fetchItems();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const getDisplayName = (item) => activeTab === 'Sizes' ? item.label : item.name;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-end border-b-4 border-primary pb-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Attributes</h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`px-6 py-3 font-black text-sm tracking-widest uppercase border-4 border-primary transition-all duration-300 ${activeTab === tab ? 'bg-primary text-on-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'bg-surface text-on-surface hover:bg-primary/10'}`}
            onClick={() => { setActiveTab(tab); setNewName(''); setEditingId(null); }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Add form */}
      <div className="flex flex-wrap gap-4 items-stretch max-w-2xl bg-surface-container-lowest p-6 border-4 border-primary shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <input
          className="flex-1 min-w-[200px] p-4 border-2 border-primary bg-surface font-bold text-sm text-on-surface focus:outline-none focus:border-on-surface transition-colors"
          placeholder={`New ${activeTab.slice(0, -1).toLowerCase()} name...`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary py-4 px-8 text-sm font-black tracking-widest uppercase border-2 border-primary hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed" onClick={handleAdd} disabled={saving}>
          {saving ? <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin inline-block"></span> : 'ADD'}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>
      ) : (
        <div className="overflow-x-auto border-4 border-primary bg-surface-container-lowest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-primary text-on-primary font-black text-sm tracking-widest uppercase">
                <th className="p-4 border-b-4 border-r-4 border-primary/20 w-24">ID</th>
                <th className="p-4 border-b-4 border-r-4 border-primary/20">NAME</th>
                <th className="p-4 border-b-4 border-primary/20 w-48">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center font-bold text-lg tracking-widest uppercase text-text-muted border-dashed border-2 border-border m-4">
                    No {activeTab.toLowerCase()} found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id} className={`border-b-2 border-border ${index % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'} hover:bg-primary/5 transition-colors`}>
                    <td className="p-4 border-r-2 border-border font-mono text-xs font-bold text-text-muted">{item.id}</td>
                    <td className="p-4 border-r-2 border-border">
                      {editingId === item.id ? (
                        <input
                          className="w-full max-w-[300px] p-2 border-2 border-primary bg-surface font-bold text-sm text-on-surface focus:outline-none"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdate(item.id)}
                          autoFocus
                        />
                      ) : (
                        <span className="font-black text-sm tracking-widest uppercase">{getDisplayName(item)}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {editingId === item.id ? (
                          <>
                            <button className="inline-block px-3 py-1 border-2 border-primary bg-primary text-on-primary font-black text-xs tracking-widest uppercase hover:bg-on-primary hover:text-primary transition-colors" onClick={() => handleUpdate(item.id)}>SAVE</button>
                            <button className="inline-block px-3 py-1 border-2 border-primary bg-surface font-black text-xs tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-colors" onClick={() => setEditingId(null)}>CANCEL</button>
                          </>
                        ) : (
                          <>
                            <button
                              className="inline-block px-3 py-1 border-2 border-primary bg-surface font-black text-xs tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-colors"
                              onClick={() => { setEditingId(item.id); setEditName(getDisplayName(item)); }}
                            >
                              EDIT
                            </button>
                            <button className="inline-block px-3 py-1 border-2 border-error bg-error text-on-primary font-black text-xs tracking-widest uppercase hover:bg-on-primary hover:text-error transition-colors" onClick={() => handleDelete(item.id)}>DELETE</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
