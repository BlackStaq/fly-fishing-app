import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Fish, Ruler, Star, MapPin, TrendingUp, Droplets, Bug } from 'lucide-react';

export default function Dashboard() {
  const catches = useLiveQuery(() => db.catches.toArray());
  const flies = useLiveQuery(() => db.flies.toArray());
  const spots = useLiveQuery(() => db.spots.toArray());

  if (!catches) return null;

  const totalCatches = catches.length;
  const biggestFish = catches.reduce((max, c) => (c.lengthInches || 0) > (max?.lengthInches || 0) ? c : max, null);
  const heaviestFish = catches.reduce((max, c) => (c.weightLbs || 0) > (max?.weightLbs || 0) ? c : max, null);

  // Most productive fly
  const flyCounts = {};
  catches.forEach(c => { if (c.fly) flyCounts[c.fly] = (flyCounts[c.fly] || 0) + 1; });
  const topFly = Object.entries(flyCounts).sort((a, b) => b[1] - a[1])[0];

  // Most productive technique
  const techCounts = {};
  catches.forEach(c => { if (c.technique) techCounts[c.technique] = (techCounts[c.technique] || 0) + 1; });
  const topTech = Object.entries(techCounts).sort((a, b) => b[1] - a[1])[0];

  // Species breakdown
  const speciesCounts = {};
  catches.forEach(c => { if (c.species) speciesCounts[c.species] = (speciesCounts[c.species] || 0) + 1; });
  const speciesSorted = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1]);

  // Best conditions
  const weatherCounts = {};
  catches.forEach(c => { if (c.weather) weatherCounts[c.weather] = (weatherCounts[c.weather] || 0) + 1; });
  const topWeather = Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0];

  // Monthly catches chart (last 6 months)
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

  // Top location
  const locCounts = {};
  catches.forEach(c => { if (c.locationName) locCounts[c.locationName] = (locCounts[c.locationName] || 0) + 1; });
  const topLoc = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0];

  // Insights
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
      <h2 className="text-lg font-bold text-[#0f4530] mb-4">Dashboard</h2>

      {totalCatches === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <TrendingUp className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No stats yet</p>
          <p className="text-sm">Log some catches to see your stats!</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard icon={Fish} label="Total Catches" value={totalCatches} color="text-[#1a6b4a]" />
            <StatCard icon={Ruler} label="Biggest Fish" value={biggestFish?.lengthInches ? `${biggestFish.lengthInches}"` : '-'} sub={biggestFish?.species} color="text-[#3b82c4]" />
            <StatCard icon={Star} label="Top Fly" value={topFly ? topFly[0] : '-'} sub={topFly ? `${topFly[1]} catches` : ''} color="text-[#e8763a]" />
            <StatCard icon={MapPin} label="Spots Saved" value={spots?.length || 0} color="text-purple-600" />
          </div>

          {/* Monthly Chart */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Catches (Last 6 Months)</h3>
            <div className="flex items-end gap-2 h-28">
              {monthData.map(([key, val]) => {
                const month = new Date(key + '-01').toLocaleDateString('en', { month: 'short' });
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-[#0f4530]">{val || ''}</span>
                    <div className="w-full bg-[#1a6b4a]/20 rounded-t-md relative" style={{ height: `${Math.max((val / maxMonth) * 80, 4)}px` }}>
                      <div className="absolute inset-0 bg-[#1a6b4a] rounded-t-md" style={{ height: '100%' }} />
                    </div>
                    <span className="text-xs text-gray-400">{month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Species Breakdown */}
          {speciesSorted.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Species Breakdown</h3>
              <div className="space-y-2">
                {speciesSorted.map(([species, count]) => (
                  <div key={species} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-32 truncate">{species}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-[#2d9d6e] h-full rounded-full transition-all" style={{ width: `${(count / totalCatches) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1">
                <Droplets className="w-4 h-4" /> Insights
              </h3>
              <ul className="space-y-2">
                {insights.map((ins, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-[#e8763a] mt-0.5">*</span>
                    {ins}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fly Box Summary */}
          {flies?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1">
                <Bug className="w-4 h-4" /> Fly Box Summary
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-400">Total Patterns:</span> <span className="font-medium">{flies.length}</span></div>
                <div><span className="text-gray-400">Total Flies:</span> <span className="font-medium">{flies.reduce((s, f) => s + f.quantity, 0)}</span></div>
                <div><span className="text-gray-400">Low Stock:</span> <span className="font-medium text-red-500">{flies.filter(f => f.quantity <= 1).length}</span></div>
                <div><span className="text-gray-400">Out of Stock:</span> <span className="font-medium text-red-500">{flies.filter(f => f.quantity === 0).length}</span></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-medium text-gray-400">{label}</span>
      </div>
      <p className={`text-lg font-bold ${color} truncate`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
    </div>
  );
}
