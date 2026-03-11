import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, Trash2, ChevronDown, ChevronUp, MapPin, Ruler, Weight, Calendar, X } from 'lucide-react';

const SPECIES = ['Rainbow Trout', 'Brown Trout', 'Brook Trout', 'Cutthroat Trout', 'Steelhead', 'Salmon', 'Bass', 'Pike', 'Walleye', 'Panfish', 'Carp', 'Other'];
const TECHNIQUES = ['Dry Fly', 'Nymph', 'Streamer', 'Euro Nymph', 'Wet Fly', 'Indicator', 'Hopper Dropper', 'Sight Fishing', 'Swing', 'Other'];
const WEATHER_OPTIONS = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Snow', 'Windy', 'Foggy'];
const WATER_CLARITY = ['Crystal Clear', 'Clear', 'Slightly Stained', 'Stained', 'Muddy'];

const emptyForm = {
  species: '', lengthInches: '', weightLbs: '', fly: '', technique: '',
  date: new Date().toISOString().slice(0, 16), locationName: '', lat: '', lng: '',
  notes: '', photo: '', waterTemp: '', airTemp: '', weather: '', wind: '',
  waterLevel: '', waterClarity: '', hatchActivity: '',
};

export default function CatchLog() {
  const catches = useLiveQuery(() => db.catches.orderBy('date').reverse().toArray());
  const flies = useLiveQuery(() => db.flies.toArray());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showConditions, setShowConditions] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState('');

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm({ ...form, photo: ev.target.result });
    reader.readAsDataURL(file);
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm({ ...form, lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) }),
      () => alert('Could not get location')
    );
  };

  const save = async () => {
    const data = { ...form, lengthInches: form.lengthInches ? Number(form.lengthInches) : null, weightLbs: form.weightLbs ? Number(form.weightLbs) : null, waterTemp: form.waterTemp ? Number(form.waterTemp) : null, airTemp: form.airTemp ? Number(form.airTemp) : null };
    if (editId) {
      await db.catches.update(editId, data);
    } else {
      await db.catches.add(data);
    }
    setForm(emptyForm);
    setShowForm(false);
    setEditId(null);
    setShowConditions(false);
  };

  const edit = (c) => {
    setForm({ ...emptyForm, ...c, lengthInches: c.lengthInches ?? '', weightLbs: c.weightLbs ?? '', waterTemp: c.waterTemp ?? '', airTemp: c.airTemp ?? '' });
    setEditId(c.id);
    setShowForm(true);
    if (c.waterTemp || c.weather || c.waterClarity) setShowConditions(true);
  };

  const remove = async (id) => {
    if (confirm('Delete this catch?')) await db.catches.delete(id);
  };

  const filtered = catches?.filter(c => !filter || c.species === filter);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0f4530]">Catch Log</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }} className="bg-[#1a6b4a] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium hover:bg-[#0f4530] transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Log Catch'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Species</label>
              <select value={form.species} onChange={set('species')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">Select...</option>
                {SPECIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Technique</label>
              <select value={form.technique} onChange={set('technique')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">Select...</option>
                {TECHNIQUES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Length (inches)</label>
              <input type="number" value={form.lengthInches} onChange={set('lengthInches')} placeholder="e.g. 18" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Weight (lbs)</label>
              <input type="number" step="0.1" value={form.weightLbs} onChange={set('weightLbs')} placeholder="e.g. 2.5" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Fly Used</label>
            <div className="flex gap-2">
              <input list="fly-list" value={form.fly} onChange={set('fly')} placeholder="e.g. Elk Hair Caddis #16" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <datalist id="fly-list">
                {flies?.map(f => <option key={f.id} value={`${f.name} #${f.size}`} />)}
              </datalist>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Date & Time</label>
            <input type="datetime-local" value={form.date} onChange={set('date')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Location</label>
            <div className="flex gap-2">
              <input value={form.locationName} onChange={set('locationName')} placeholder="e.g. Blue River Mile 3" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <button onClick={getLocation} className="bg-[#3b82c4] text-white px-2 py-2 rounded-lg hover:bg-[#2a6ba3] transition-colors" title="Get GPS">
                <MapPin className="w-4 h-4" />
              </button>
            </div>
            {form.lat && <p className="text-xs text-gray-400 mt-1">GPS: {form.lat}, {form.lng}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Photo</label>
            <input type="file" accept="image/*" onChange={handlePhoto} className="w-full text-sm" />
            {form.photo && <img src={form.photo} alt="catch" className="mt-2 rounded-lg max-h-40 object-cover" />}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Any notes..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>

          <button onClick={() => setShowConditions(!showConditions)} className="text-sm text-[#3b82c4] flex items-center gap-1 font-medium">
            {showConditions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Conditions & Weather
          </button>

          {showConditions && (
            <div className="space-y-3 border-t border-gray-100 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Water Temp (F)</label>
                  <input type="number" value={form.waterTemp} onChange={set('waterTemp')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Air Temp (F)</label>
                  <input type="number" value={form.airTemp} onChange={set('airTemp')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Weather</label>
                  <select value={form.weather} onChange={set('weather')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Select...</option>
                    {WEATHER_OPTIONS.map(w => <option key={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Water Clarity</label>
                  <select value={form.waterClarity} onChange={set('waterClarity')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Select...</option>
                    {WATER_CLARITY.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Hatch Activity</label>
                <input value={form.hatchActivity} onChange={set('hatchActivity')} placeholder="e.g. BWO hatch around 2pm" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          )}

          <button onClick={save} disabled={!form.species} className="w-full bg-[#e8763a] text-white py-2.5 rounded-lg font-semibold hover:bg-[#d06530] transition-colors disabled:opacity-40">
            {editId ? 'Update Catch' : 'Save Catch'}
          </button>
        </div>
      )}

      {catches?.length > 0 && (
        <div className="mb-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
            <option value="">All Species</option>
            {[...new Set(catches.map(c => c.species))].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      )}

      {!catches?.length && !showForm && (
        <div className="text-center py-16 text-gray-400">
          <Fish className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No catches yet</p>
          <p className="text-sm">Tap "Log Catch" to record your first fish!</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered?.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0f4530]">{c.species}</span>
                  {c.lengthInches && <span className="text-xs bg-[#e8dfd2] text-[#0f4530] px-2 py-0.5 rounded-full flex items-center gap-0.5"><Ruler className="w-3 h-3" />{c.lengthInches}"</span>}
                  {c.weightLbs && <span className="text-xs bg-[#e8dfd2] text-[#0f4530] px-2 py-0.5 rounded-full flex items-center gap-0.5"><Weight className="w-3 h-3" />{c.weightLbs}lb</span>}
                </div>
                <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                  {c.fly && <p>Fly: {c.fly}</p>}
                  {c.technique && <p>Technique: {c.technique}</p>}
                  {c.locationName && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.locationName}</p>}
                  <p className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(c.date).toLocaleDateString()} {new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  {c.weather && <p>Weather: {c.weather}{c.airTemp ? ` ${c.airTemp}F` : ''}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => edit(c)} className="text-gray-400 hover:text-[#3b82c4] p-1 transition-colors text-xs">Edit</button>
                <button onClick={() => remove(c.id)} className="text-gray-300 hover:text-red-500 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {c.photo && <img src={c.photo} alt="catch" className="mt-3 rounded-lg max-h-48 object-cover w-full" />}
            {c.notes && <p className="mt-2 text-sm text-gray-500 italic">{c.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Fish(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6-3.56 0-7.56-2.54-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5 .23 6.5C5.58 18.03 7 16 7 13.33"/></svg>;
}
