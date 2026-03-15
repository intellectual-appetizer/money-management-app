'use client'

import React, { useEffect, useState } from 'react';
import { fetchFoodEntries, insertFoodEntry, updateFoodEntry, deleteFoodEntry, distinctFoodNames, FoodEntry } from '@/lib/db/food';
import { exportToCsv, parseCsvFile } from '@/lib/csv';

export const FoodPanel: React.FC = () => {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [food, setFood] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 8));
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    load();
    loadSuggestions();
  }, []);

  async function load() {
    const data = await fetchFoodEntries();
    setEntries(data);
  }

  async function loadSuggestions() {
    const s = await distinctFoodNames();
    setSuggestions(s);
  }

  function resetForm() {
    setFood('');
    setQuantity('');
    setDate(new Date().toISOString().slice(0, 10));
    setTime(new Date().toTimeString().slice(0, 8));
    setComment('');
    setEditingId(null);
  }

  async function onSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!food) return alert('Food name is required');

    const datetime = new Date(`${date}T${time}`).toISOString();
    try {
      if (editingId) {
        await updateFoodEntry(editingId, { food, quantity, datetime, comment });
      } else {
        await insertFoodEntry({ food, quantity, datetime, comment: comment || null });
      }
      await load();
      await loadSuggestions();
      resetForm();
    } catch (err: any) {
      console.error('Failed to save food entry', err)
      alert('Failed to save entry: ' + (err?.message || String(err)))
    }
  }

  function onEdit(entry: FoodEntry) {
    setEditingId(entry.id);
    setFood(entry.food);
    setQuantity(entry.quantity ?? '');
    const dt = new Date(entry.datetime);
    setDate(dt.toISOString().slice(0, 10));
    setTime(dt.toTimeString().slice(0, 8));
    setComment(entry.comment ?? '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this entry?')) return;
    await deleteFoodEntry(id);
    await load();
    await loadSuggestions();
  }

  function exportCsv() {
    const rows = entries.map(e => ({
      date: new Date(e.datetime).toISOString().slice(0, 10),
      time: new Date(e.datetime).toTimeString().slice(0, 8),
      food: e.food,
      quantity: e.quantity ?? '',
      comment: e.comment ?? ''
    }));
    exportToCsv('food_entries.csv', rows);
  }

  async function importCsvFile(file: File) {
    try {
      const parsed = await parseCsvFile(file); // headers: date,time,food,quantity,comment
      const inserts = parsed.map(r => ({
        food: r['food'] ?? r['Food'] ?? '',
        quantity: r['quantity'] ?? r['Quantity'] ?? '',
        datetime: new Date(`${r['date'] ?? r['Date'] ?? ''}T${r['time'] ?? r['Time'] ?? '00:00:00'}`).toISOString(),
        comment: r['comment'] ?? r['Comment'] ?? null
      })).filter(r => r.food);
      for (const ins of inserts) {
        await insertFoodEntry(ins as any);
      }
      await load();
      await loadSuggestions();
      alert('Import finished');
    } catch (err) {
      console.error(err);
      alert('Import failed: ' + (err as Error).message);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Add / Edit Food Entry</h2>
      <form onSubmit={onSubmit} className="space-y-2 mb-4">
        <div>
          <label className="block text-sm">Food</label>
          <input
            list="food-suggestions"
            value={food}
            onChange={e => setFood(e.target.value)}
            className="border p-1 w-full"
          />
          <datalist id="food-suggestions">
            {suggestions.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>

        <div>
          <label className="block text-sm">Quantity</label>
          <input value={quantity} onChange={e => setQuantity(e.target.value)} className="border p-1 w-full" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-1 w-full" />
          </div>
          <div>
            <label className="block text-sm">Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="border p-1 w-full" />
          </div>
        </div>

        <div>
          <label className="block text-sm">Comment (optional)</label>
          <input value={comment} onChange={e => setComment(e.target.value)} className="border p-1 w-full" />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary">{editingId ? 'Save' : 'Add'}</button>
          <button type="button" onClick={resetForm} className="btn-secondary">Reset</button>
          <button type="button" onClick={exportCsv} className="btn-outline">Export CSV</button>
          <label className="btn-outline cursor-pointer">
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) await importCsvFile(f);
                e.currentTarget.value = '';
              }}
              className="hidden"
            />
          </label>
        </div>
      </form>

      <h3 className="text-md font-semibold mb-2">Entries</h3>
      <div className="overflow-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Food</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Comment</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => {
              const dt = new Date(e.datetime);
              return (
                <tr key={e.id}>
                  <td className="p-2 border">{dt.toISOString().slice(0, 10)}</td>
                  <td className="p-2 border">{dt.toTimeString().slice(0, 8)}</td>
                  <td className="p-2 border">{e.food}</td>
                  <td className="p-2 border">{e.quantity}</td>
                  <td className="p-2 border">{e.comment}</td>
                  <td className="p-2 border">
                    <button onClick={() => onEdit(e)} className="mr-2 text-blue-600">Edit</button>
                    <button onClick={() => onDelete(e.id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FoodPanel;