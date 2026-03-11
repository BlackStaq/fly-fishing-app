import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Fish, Ruler, Star, MapPin, TrendingUp, Droplets, Bug, Trophy, Target } from 'lucide-react';

export default function Dashboard() {
  const catches = useLiveQuery(() => db.catches.toArray());
  const flies = useLiveQuery(() => db.flies.toArray());
  const spots = useLiveQuery(() => db.spots.toArray());

  if (!catches) return null;

  const totalCatches = catches.length;
  const biggestFish = catches.reduce((max, c) => (c.lengthInches || 0) > (max?.lengthInches || 0) ? c : max, null);
  const heaviestFish = catches.reduce((max, c) => (c.weightLbs || 0) > (max?.weightLbs || 0) ? c : max, null);

  const flyCounts = {};
  catches.forEach(c => { if (c.fly) flyCounts[c.fly] = (flyCounts[c.fly] || 0) + 1; });
  const topFly = Object.entries(flyCounts).sort((a, b) => b[1] - a[1])[0];

  const techCounts = {};
  catches.forEach(c => { if (c.technique) techCounts[c.technique] = (techCounts[c.technique] || 0) + 1; });
  const topTech = Object.entries(techCounts).sort((a, b) => b[1] - a[1])[0];

  const speciesCounts = {};
  catches.forEach(c => { if (c.species) speciesCounts[c.species] = (speciesCounts[c.species] || 0) + 1; });
  const speciesSorted = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1]);

  const weatherCounts = {};
  catches.forEach(c => { if (c.weather) weatherCounts[c.weather] = (weatherCounts[c.weather] || 0) + 1; });
  const topWeather = Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0];

  const monthCounts = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthCounts[key] = 0;
  }
  catches.forEach(c => {
    if (!c.date) return;
    const d = new Date(c.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in monthCounts) monthCounts[key]++;
  });
  const monthData = Object.entries(monthCounts);
  const maxMonth = Math.max(...monthData.map(([, v]) => v), 1);

  const locCounts = {};
  catches.forEach(c => { if (c.locationName) locCounts[c.locationName] = (locCounts[c.locationName] || 0) + 1; });
  const topLoc = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0];

  const insights = [];
  if (topWeather) insights.push(`You catch the most fish in ${topWeather[0].toLowerCase()} weather (${topWeather[1]} catches).`);
  if (topTech) insights.push(`${topTech[0]} is your most productive technique (${topTech[1]} fish).`);
  if (topFly) insights.push(`Your go-to fly is ${topFly[0]} with ${topFly[1]} fish caught.`);

  const waterTempCatches = catches.filter(c => c.waterTemp);
  if (waterTempCatches.length >= 3) {
    const avgTemp = waterTempCatches.reduce((s, c) => s + c.waterTemp, 0) / waterTempCatches.length;
    insights.push(`Average water temp when you catch fish: ${avgTemp.toFixed(0)}°F.`);
  }

  if (topLoc) insights.push(`Your most fished spot is ${topLoc[0]} (${topLoc[1]} catches).`);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-amber-100 mb-4">Dashboard</h2>

      {totalCatches === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <TrendingUp className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium" style={{ fontFamily: 'Bitter, Georgia, serif' }}>No stats yet</p>
          <p className="text-sm">Log some catches to see your stats!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard icon={Fish} label="Total Catches" value={totalCatches} color="text-green-400" borderColor="border-green-800/50" />
            <StatCard icon={Trophy} label="Biggest Fish" value={biggestFish?.lengthInches ? `${biggestFish.lengthInches}"` : '-'} sub={biggestFish?.species} color="text-amber-400" borderColor="border-amber-800/50" />
            <StatCard icon={Target} label="Top Fly" value={topFly ? topFly[0] : '-'} sub={topFly ? `${topFly[1]} catches` : ''} color="text-orange-400" borderColor="border-orange-800/50" />
            <StatCard icon={MapPin} label="Spots Saved" value={spots?.length || 0} color="text-blue-400" borderColor="border-blue-800/50" />
          </div>

          <div className="card-rugged p-4 mb-4">
            <h3 className="text-xs font-semibold text-stone-400 mb-3 uppercase tracking-wide">Catches (Last 6 Months)</h3>
            <div className="flex items-end gap-2 h-28">
              {monthData.map(([key, val]) => {
                const month = new Date(key + '-01').toLocaleDateString('en', { month: 'short' });
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-amber-400">{val || ''}</span>
                    <div className="w-full rounded-t-md relative" style={{ height: `${Math.max((val / maxMonth) * 80, 4)}px` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-green-700 to-green-500 rounded-t-md" />
                    </div>
                    <span className="text-[10px] text-stone-500 uppercase">{month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {speciesSorted.length > 0 && (
            <div className="card-rugged p-4 mb-4">
              <h3 className="text-xs font-semibold text-stone-400 mb-3 uppercase tracking-wide">Species Breakdown</h3>
              <div className="space-y-2.5">
                {speciesSorted.map(([species, count]) => (
                  <div key={species} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-32 truncate text-stone-300">{species}</span>
                    <div className="flex-1 bg-stone-700 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-600 to-amber-500 h-full rounded-full transition-all" style={{ width: `${(count / totalCatches) * 100}%` }} />
                    </div>
                    <span className="text-xs text-stone-500 w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.length > 0 && (
            <div className="card-rugged p-4 mb-4">
              <h3 className="text-xs font-semibold text-stone-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-400" /> Insights
              </h3>
              <ul className="space-y-2">
                {insights.map((ins, i) => (
                  <li key={i} className="text-sm text-stone-300 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">*</span>
                    {ins}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {flies?.length > 0 && (
            <div className="card-rugged p-4">
              <h3 className="text-xs font-semibold text-stone-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-green-400" /> Fly Box Summary
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-stone-500">Total Patterns:</span> <span className="font-medium text-stone-300">{flies.length}</span></div>
                <div><span className="text-stone-500">Total Flies:</span> <span className="font-medium text-stone-300">{flies.reduce((s, f) => s + f.quantity, 0)}</span></div>
                <div><span className="text-stone-500">Low Stock:</span> <span className="font-medium text-amber-400">{flies.filter(f => f.quantity <= 1).length}</span></div>
                <div><span className="text-stone-500">Out of Stock:</span> <span className="font-medium text-red-400">{flies.filter(f => f.quantity === 0).length}</span></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, borderColor }) {
  return (
    <div className={`card-rugged p-4 border-l-2 ${borderColor}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-lg font-bold ${color} truncate`} style={{ fontFamily: 'Bitter, Georgia, serif' }}>{value}</p>
      {sub && <p className="text-xs text-stone-500 truncate">{sub}</p>}
    </div>
  );
}
