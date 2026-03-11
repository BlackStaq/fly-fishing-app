import Dexie from 'dexie';

export const db = new Dexie('TightLinesDB');

db.version(1).stores({
  catches: '++id, species, fly, technique, date, spotId, locationName',
  flies: '++id, name, type, size',
  spots: '++id, name, waterType',
});
