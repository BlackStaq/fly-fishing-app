import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, Minus, Trash2, X, Bug, Search, Star } from 'lucide-react';

const FLY_TYPES = ['Dry Fly', 'Nymph', 'Streamer', 'Emerger', 'Wet Fly', 'Terrestrial', 'Egg', 'Other'];

const emptyFly = { name: '', type: 'Dry Fly', size: '', color: '', quantity: 1, notes: '' };

export default function FlyBox() {
  const flies = useLiveQuery(() => db.flies.orderBy('name').toArray());
  const catches = useLiveQuery(() => db.catches.toArray());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyFly);
  const [editId, setEditId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const save = async () => {
    const data = { ...form, quantity: Number(form.quantity) || 1, size: form.size };
    if (editId) {
      await db.flies.update(editId, data);
    } else {
      await db.flies.add(data);
    }
    setForm(emptyFly);
    setShowForm(false);
    setEditId(null);
  };

  const edit = (f) => {
    setForm({ ...emptyFly, ...f });
    setEditId(f.id);
    setShowForm(true);
  };

  const remove = async (id) => {
    if (confirm('Delete this fly?')) await db.flies.delete(id);
  };

  const adjustQty = async (id, delta) => {
    const fly = await db.flies.get(id);
    if (fly) await db.flies.update(id, { quantity: Math.max(0, fly.quantity + delta) });
  };

  const flyUsageCount = (flyName) => {
    if (!catches) return 0;
    return catches.filter(c => c.fly && c.fly.toLowerCase().includes(flyName.toLowerCase())).length;
  };

  const filtered = flies?.filter(f => {
    if (typeFilter && f.type !== typeFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0f4530]">Fly Box</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyFly); }} className="bg-[#1a6b4a] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium hover:bg-[#0f4530] transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Fly'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Fly Name</label>
            <input value={form.name} onChange={set('name')} placeholder="e.g. Elk Hair Caddis" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Type</label>
              <select value={form.type} onChange={set('type')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {FLY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Size</label>
              <input value={form.size} onChange={set('size')} placeholder="e.g. 16" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Color</label>
              <input value={form.color} onChange={set('color')} placeholder="e.g. Olive" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Quantity</label>
              <input type="number" value={form.quantity} onChange={set('quantity')} min="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Tying notes, when to use..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button onClick={save} disabled={!form.name} className="w-full bg-[#e8763a] text-white py-2.5 rounded-lg font-semibold hover:bg-[#d06530] transition-colors disabled:opacity-40">
            {editId ? 'Update Fly' : 'Add to Box'}
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search flies..." className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm bg-white" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
          <option value="">All Types</option>
          {FLY_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {!flies?.length && !showForm && (
        <div className="text-center py-16 text-gray-400">
          <Bug className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Fly box is empty</p>
          <p className="text-sm">Add your first fly pattern!</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered?.map(f => {
          const usage = flyUsageCount(f.name);
          return (
            <div key={f.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0f4530] truncate">{f.name}</span>
                  {f.size && <span className="text-xs text-gray-400">#{f.size}</span>}
                  {usage > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star className="w-3 h-3" />{usage}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 flex gap-2">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded">{f.type}</span>
                  {f.color && <span>{f.color}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => adjustQty(f.id, -1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className={`w-8 text-center font-bold text-sm ${f.quantity === 0 ? 'text-red-500' : 'text-[#0f4530]'}`}>{f.quantity}</span>
                <button onClick={() => adjustQty(f.id, 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="flex gap-1">
                <button onClick={() => edit(f)} className="text-gray-400 hover:text-[#3b82c4] p-1 text-xs transition-colors">Edit</button>
                <button onClick={() => remove(f.id)} className="text-gray-300 hover:text-red-500 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
