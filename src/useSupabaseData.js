import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

export function useSupabaseTable(table) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setData(data);
    setLoading(false);
  }, [table]);

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table, fetch]);

  const add = useCallback(async (row) => {
    const { error } = await supabase.from(table).insert(row);
    if (error) throw error;
    await fetch();
  }, [table, fetch]);

  const update = useCallback(async (id, updates) => {
    const { error } = await supabase.from(table).update(updates).eq('id', id);
    if (error) throw error;
    await fetch();
  }, [table, fetch]);

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    await fetch();
  }, [table, fetch]);

  return { data, loading, add, update, remove, refresh: fetch };
}
