import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Plus, Trash2, X, Navigation } from 'lucide-react';

// Fix default marker icons for Leaflet + Vite
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
        <h2 className="text-lg font-bold text-[#0f4530]">Fishing Spots</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setAddingPin(!addingPin); setShowForm(false); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors ${
              addingPin ? 'bg-[#e8763a] text-white' : 'bg-[#1a6b4a] text-white hover:bg-[#0f4530]'
            }`}
          >
            {addingPin ? <Navigation className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {addingPin ? 'Tap Map...' : 'Add Spot'}
          </button>
        </div>
      </div>

      {addingPin && (
        <div className="bg-[#e8763a]/10 border border-[#e8763a]/30 rounded-lg p-2 mb-3 text-sm text-[#e8763a] text-center font-medium">
          Tap the map to place a pin
        </div>
      )}

      <div className="h-[350px] rounded-xl overflow-hidden shadow-md mb-4">
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
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-[#0f4530]">{editId ? 'Edit Spot' : 'New Spot'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptySpot); }}>
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Spot Name</label>
            <input value={form.name} onChange={set('name')} placeholder="e.g. Big Thompson Canyon" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Latitude</label>
              <input type="number" step="any" value={form.lat} onChange={set('lat')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Longitude</label>
              <input type="number" step="any" value={form.lng} onChange={set('lng')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Water Type</label>
              <select value={form.waterType} onChange={set('waterType')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                {WATER_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Fish Species</label>
              <input value={form.species} onChange={set('species')} placeholder="e.g. Browns, Rainbows" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Access Notes</label>
            <textarea value={form.accessNotes} onChange={set('accessNotes')} rows={2} placeholder="Parking, trail access, regulations..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button onClick={save} disabled={!form.name || !form.lat || !form.lng} className="w-full bg-[#e8763a] text-white py-2.5 rounded-lg font-semibold hover:bg-[#d06530] transition-colors disabled:opacity-40">
            {editId ? 'Update Spot' : 'Save Spot'}
          </button>
        </div>
      )}

      {spots?.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500">Saved Spots ({spots.length})</h3>
          {spots.map(s => (
            <div key={s.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between">
              <div>
                <span className="font-medium text-[#0f4530]">{s.name}</span>
                <span className="text-xs text-gray-400 ml-2">{s.waterType}</span>
                {s.species && <p className="text-xs text-gray-400">{s.species}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => edit(s)} className="text-gray-400 hover:text-[#3b82c4] p-1 text-xs">Edit</button>
                <button onClick={() => remove(s.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
