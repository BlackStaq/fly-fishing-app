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
        <h2 className="text-lg font-bold text-amber-100">Fly Box</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyFly); }} className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-all ${showForm ? 'bg-stone-700 text-stone-300 border border-stone-600' : 'btn-forest'}`}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Fly'}
        </button>
      </div>

      {showForm && (
        <div className="card-rugged p-4 mb-4 space-y-3">
          <div>
            <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Fly Name</label>
            <input value={form.name} onChange={set('name')} placeholder="e.g. Elk Hair Caddis" className="w-full input-rugged" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Type</label>
              <select value={form.type} onChange={set('type')} className="w-full input-rugged">
                {FLY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Size</label>
              <input value={form.size} onChange={set('size')} placeholder="e.g. 16" className="w-full input-rugged" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Color</label>
              <input value={form.color} onChange={set('color')} placeholder="e.g. Olive" className="w-full input-rugged" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Quantity</label>
              <input type="number" value={form.quantity} onChange={set('quantity')} min="0" className="w-full input-rugged" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Tying notes, when to use..." className="w-full input-rugged" />
          </div>
          <button onClick={save} disabled={!form.name} className="w-full btn-warm py-2.5 rounded-lg font-semibold text-sm">
            {editId ? 'Update Fly' : 'Add to Box'}
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search flies..." className="w-full input-rugged pl-9" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-rugged">
          <option value="">All Types</option>
          {FLY_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {!flies?.length && !showForm && (
        <div className="text-center py-16 text-stone-500">
          <Bug className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium" style={{ fontFamily: 'Bitter, Georgia, serif' }}>Fly box is empty</p>
          <p className="text-sm">Add your first fly pattern!</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered?.map(f => {
          const usage = flyUsageCount(f.name);
          return (
            <div key={f.id} className="card-rugged p-3 flex items-center gap-3 hover:border-stone-500 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-amber-100 truncate">{f.name}</span>
                  {f.size && <span className="text-xs text-stone-500">#{f.size}</span>}
                  {usage > 0 && (
                    <span className="text-xs bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-amber-700/30">
                      <Star className="w-3 h-3" />{usage}
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-500 flex gap-2 mt-0.5">
                  <span className="bg-stone-700/60 px-1.5 py-0.5 rounded border border-stone-600/50">{f.type}</span>
                  {f.color && <span>{f.color}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => adjustQty(f.id, -1)} className="w-7 h-7 rounded-full bg-stone-700 border border-stone-600 flex items-center justify-center hover:bg-stone-600 transition-colors text-stone-300">
                  <Minus className="w-3 h-3" />
                </button>
                <span className={`w-8 text-center font-bold text-sm ${f.quantity === 0 ? 'text-red-400' : 'text-amber-100'}`}>{f.quantity}</span>
                <button onClick={() => adjustQty(f.id, 1)} className="w-7 h-7 rounded-full bg-stone-700 border border-stone-600 flex items-center justify-center hover:bg-stone-600 transition-colors text-stone-300">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="flex gap-1">
                <button onClick={() => edit(f)} className="text-stone-500 hover:text-amber-400 p-1 text-xs transition-colors">Edit</button>
                <button onClick={() => remove(f.id)} className="text-stone-600 hover:text-red-400 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
