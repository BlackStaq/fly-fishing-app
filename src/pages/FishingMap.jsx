import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Plus, Trash2, X, Navigation, MapPin } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const WATER_TYPES = ['River', 'Creek', 'Lake', 'Pond', 'Reservoir', 'Tailwater', 'Spring Creek'];
const emptySpot = { name: '', lat: '', lng: '', waterType: 'River', accessNotes: '', species: '', notes: '' };

function ClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

export default function FishingMap() {
  const spots = useLiveQuery(() => db.spots.toArray());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptySpot);
  const [editId, setEditId] = useState(null);
  const [center, setCenter] = useState([39.7392, -104.9903]);
  const [addingPin, setAddingPin] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleMapClick = (latlng) => {
    if (!addingPin) return;
    setForm({ ...form, lat: latlng.lat.toFixed(5), lng: latlng.lng.toFixed(5) });
    setShowForm(true);
    setAddingPin(false);
  };

  const save = async () => {
    const data = { ...form, lat: Number(form.lat), lng: Number(form.lng) };
    if (editId) {
      await db.spots.update(editId, data);
    } else {
      await db.spots.add(data);
    }
    setForm(emptySpot);
    setShowForm(false);
    setEditId(null);
  };

  const edit = (s) => {
    setForm({ ...emptySpot, ...s, lat: String(s.lat), lng: String(s.lng) });
    setEditId(s.id);
    setShowForm(true);
  };

  const remove = async (id) => {
    if (confirm('Delete this spot?')) await db.spots.delete(id);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-amber-100">Fishing Spots</h2>
        <button
          onClick={() => { setAddingPin(!addingPin); setShowForm(false); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-all ${
            addingPin ? 'btn-warm' : 'btn-forest'
          }`}
        >
          {addingPin ? <Navigation className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {addingPin ? 'Tap Map...' : 'Add Spot'}
        </button>
      </div>

      {addingPin && (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-2.5 mb-3 text-sm text-amber-400 text-center font-medium">
          Tap the map to place a pin
        </div>
      )}

      <div className="h-[350px] rounded-xl overflow-hidden shadow-lg mb-4 border border-stone-700">
        <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMapClick={handleMapClick} />
          {spots?.map(s => (
            <Marker key={s.id} position={[s.lat, s.lng]}>
              <Popup>
                <div className="text-sm">
                  <strong>{s.name}</strong>
                  <br />{s.waterType}
                  {s.species && <><br />Fish: {s.species}</>}
                  {s.accessNotes && <><br />Access: {s.accessNotes}</>}
                  <br />
                  <button onClick={() => edit(s)} className="text-blue-500 mr-2 text-xs">Edit</button>
                  <button onClick={() => remove(s.id)} className="text-red-500 text-xs">Delete</button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {showForm && (
        <div className="card-rugged p-4 mb-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-amber-100" style={{ fontFamily: 'Bitter, Georgia, serif' }}>{editId ? 'Edit Spot' : 'New Spot'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptySpot); }}>
              <X className="w-5 h-5 text-stone-500 hover:text-stone-300" />
            </button>
          </div>
          <div>
            <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Spot Name</label>
            <input value={form.name} onChange={set('name')} placeholder="e.g. Big Thompson Canyon" className="w-full input-rugged" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Latitude</label>
              <input type="number" step="any" value={form.lat} onChange={set('lat')} className="w-full input-rugged" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Longitude</label>
              <input type="number" step="any" value={form.lng} onChange={set('lng')} className="w-full input-rugged" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Water Type</label>
              <select value={form.waterType} onChange={set('waterType')} className="w-full input-rugged">
                {WATER_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Fish Species</label>
              <input value={form.species} onChange={set('species')} placeholder="e.g. Browns, Rainbows" className="w-full input-rugged" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Access Notes</label>
            <textarea value={form.accessNotes} onChange={set('accessNotes')} rows={2} placeholder="Parking, trail access, regulations..." className="w-full input-rugged" />
          </div>
          <button onClick={save} disabled={!form.name || !form.lat || !form.lng} className="w-full btn-warm py-2.5 rounded-lg font-semibold text-sm">
            {editId ? 'Update Spot' : 'Save Spot'}
          </button>
        </div>
      )}

      {spots?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Saved Spots ({spots.length})</h3>
          {spots.map(s => (
            <div key={s.id} className="card-rugged p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-green-500" />
                  <span className="font-medium text-amber-100">{s.name}</span>
                  <span className="text-xs text-stone-500">{s.waterType}</span>
                </div>
                {s.species && <p className="text-xs text-stone-500 ml-5.5">{s.species}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => edit(s)} className="text-stone-500 hover:text-amber-400 p-1 text-xs transition-colors">Edit</button>
                <button onClick={() => remove(s.id)} className="text-stone-600 hover:text-red-400 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
