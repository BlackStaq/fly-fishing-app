import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, Trash2, ChevronDown, ChevronUp, MapPin, Ruler, Weight, Calendar, X, Thermometer, Cloud } from 'lucide-react';

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
        <h2 className="text-lg font-bold text-amber-100">Catch Log</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }} className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-all ${showForm ? 'bg-stone-700 text-stone-300 border border-stone-600' : 'btn-forest'}`}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Log Catch'}
        </button>
      </div>

      {showForm && (
        <div className="card-rugged p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Species</label>
              <select value={form.species} onChange={set('species')} className="w-full input-rugged">
                <option value="">Select...</option>
                {SPECIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Technique</label>
              <select value={form.technique} onChange={set('technique')} className="w-full input-rugged">
                <option value="">Select...</option>
                {TECHNIQUES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Length (in)</label>
              <input type="number" value={form.lengthInches} onChange={set('lengthInches')} placeholder="e.g. 18" className="w-full input-rugged" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Weight (lbs)</label>
              <input type="number" step="0.1" value={form.weightLbs} onChange={set('weightLbs')} placeholder="e.g. 2.5" className="w-full input-rugged" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Fly Used</label>
            <input list="fly-list" value={form.fly} onChange={set('fly')} placeholder="e.g. Elk Hair Caddis #16" className="w-full input-rugged" />
            <datalist id="fly-list">
              {flies?.map(f => <option key={f.id} value={`${f.name} #${f.size}`} />)}
            </datalist>
          </div>
          <div>
            <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Date & Time</label>
            <input type="datetime-local" value={form.date} onChange={set('date')} className="w-full input-rugged" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Location</label>
            <div className="flex gap-2">
              <input value={form.locationName} onChange={set('locationName')} placeholder="e.g. Blue River Mile 3" className="flex-1 input-rugged" />
              <button onClick={getLocation} className="bg-stone-700 text-amber-400 px-2.5 py-2 rounded-lg border border-stone-600 hover:bg-stone-600 transition-colors" title="Get GPS">
                <MapPin className="w-4 h-4" />
              </button>
            </div>
            {form.lat && <p className="text-xs text-stone-500 mt-1">GPS: {form.lat}, {form.lng}</p>}
          </div>
          <div>
            <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Photo</label>
            <input type="file" accept="image/*" onChange={handlePhoto} className="w-full text-sm text-stone-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-stone-600 file:bg-stone-700 file:text-stone-300 file:text-sm hover:file:bg-stone-600" />
            {form.photo && <img src={form.photo} alt="catch" className="mt-2 rounded-lg max-h-40 object-cover border border-stone-700" />}
          </div>
          <div>
            <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Any notes..." className="w-full input-rugged" />
          </div>

          <button onClick={() => setShowConditions(!showConditions)} className="text-sm text-amber-500 flex items-center gap-1.5 font-medium hover:text-amber-400 transition-colors">
            {showConditions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <Cloud className="w-3.5 h-3.5" />
            Conditions & Weather
          </button>

          {showConditions && (
            <div className="space-y-3 border-t border-stone-700 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Water Temp (F)</label>
                  <input type="number" value={form.waterTemp} onChange={set('waterTemp')} className="w-full input-rugged" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Air Temp (F)</label>
                  <input type="number" value={form.airTemp} onChange={set('airTemp')} className="w-full input-rugged" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Weather</label>
                  <select value={form.weather} onChange={set('weather')} className="w-full input-rugged">
                    <option value="">Select...</option>
                    {WEATHER_OPTIONS.map(w => <option key={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Water Clarity</label>
                  <select value={form.waterClarity} onChange={set('waterClarity')} className="w-full input-rugged">
                    <option value="">Select...</option>
                    {WATER_CLARITY.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">Hatch Activity</label>
                <input value={form.hatchActivity} onChange={set('hatchActivity')} placeholder="e.g. BWO hatch around 2pm" className="w-full input-rugged" />
              </div>
            </div>
          )}

          <button onClick={save} disabled={!form.species} className="w-full btn-warm py-2.5 rounded-lg font-semibold text-sm">
            {editId ? 'Update Catch' : 'Save Catch'}
          </button>
        </div>
      )}

      {catches?.length > 0 && (
        <div className="mb-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-rugged">
            <option value="">All Species</option>
            {[...new Set(catches.map(c => c.species))].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      )}

      {!catches?.length && !showForm && (
        <div className="text-center py-16 text-stone-500">
          <FishIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium" style={{ fontFamily: 'Bitter, Georgia, serif' }}>No catches yet</p>
          <p className="text-sm">Tap "Log Catch" to record your first fish!</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered?.map(c => (
          <div key={c.id} className="card-rugged p-4 hover:border-stone-500 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-amber-100" style={{ fontFamily: 'Bitter, Georgia, serif' }}>{c.species}</span>
                  {c.lengthInches && <span className="badge-rugged"><Ruler className="w-3 h-3 text-amber-500" />{c.lengthInches}"</span>}
                  {c.weightLbs && <span className="badge-rugged"><Weight className="w-3 h-3 text-amber-500" />{c.weightLbs}lb</span>}
                </div>
                <div className="text-sm text-stone-400 mt-1.5 space-y-0.5">
                  {c.fly && <p className="flex items-center gap-1.5">Fly: <span className="text-amber-500/80">{c.fly}</span></p>}
                  {c.technique && <p>Technique: {c.technique}</p>}
                  {c.locationName && <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-green-500" />{c.locationName}</p>}
                  <p className="flex items-center gap-1 text-stone-500"><Calendar className="w-3 h-3" />{new Date(c.date).toLocaleDateString()} {new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  {(c.weather || c.waterTemp) && (
                    <div className="flex items-center gap-3 mt-1 pt-1 border-t border-stone-700/50">
                      {c.weather && <span className="flex items-center gap-1 text-xs"><Cloud className="w-3 h-3 text-blue-400" />{c.weather}</span>}
                      {c.waterTemp && <span className="flex items-center gap-1 text-xs"><Thermometer className="w-3 h-3 text-blue-400" />{c.waterTemp}°F</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => edit(c)} className="text-stone-500 hover:text-amber-400 p-1 transition-colors text-xs">Edit</button>
                <button onClick={() => remove(c.id)} className="text-stone-600 hover:text-red-400 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {c.photo && <img src={c.photo} alt="catch" className="mt-3 rounded-lg max-h-48 object-cover w-full border border-stone-700" />}
            {c.notes && <p className="mt-2 text-sm text-stone-500 italic border-t border-stone-700/50 pt-2">{c.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function FishIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6-3.56 0-7.56-2.54-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5 .23 6.5C5.58 18.03 7 16 7 13.33"/></svg>;
}
