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
    <div>
      <div className="admin-page-header">
        <h1>Attributes</h1>
      </div>

      {/* Tabs */}
      <div className="tabs mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); setNewName(''); setEditingId(null); }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Add form */}
      <div className="flex gap-3 mb-6" style={{ maxWidth: 500 }}>
        <input
          className="input-field"
          placeholder={`New ${activeTab.slice(0, -1).toLowerCase()} name...`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>
          {saving ? <span className="spinner"></span> : 'ADD'}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="loading-screen"><div className="spinner spinner-lg"></div></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: '#999' }}>No {activeTab.toLowerCase()} found</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'monospace' }}>{item.id}</td>
                    <td>
                      {editingId === item.id ? (
                        <input
                          className="input-field"
                          style={{ width: 200, padding: '6px 10px', minHeight: 'auto' }}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdate(item.id)}
                          autoFocus
                        />
                      ) : (
                        <span className="font-bold">{getDisplayName(item)}</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {editingId === item.id ? (
                          <>
                            <button className="btn btn-sm btn-primary" onClick={() => handleUpdate(item.id)}>SAVE</button>
                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>CANCEL</button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => { setEditingId(item.id); setEditName(getDisplayName(item)); }}
                            >
                              EDIT
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>DELETE</button>
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
