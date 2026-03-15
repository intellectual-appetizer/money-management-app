'use client'

import React, { useEffect, useState } from 'react';
import { fetchGymEntries, insertGymEntry, updateGymEntry, deleteGymEntry, distinctExercises, GymEntry } from '@/lib/db/gym';
import { exportToCsv, parseCsvFile } from '@/lib/csv';

function nowISODateTime(): string {
  const d = new Date();
  // combine date + time to local ISO (no timezone offset issues)
  const isoDate = d.toISOString().slice(0, 10);
  const isoTime = d.toTimeString().slice(0, 8);
  return `${isoDate}T${isoTime}`;
}

export const GymPanel: React.FC = () => {
  const [entries, setEntries] = useState<GymEntry[]>([]);
  const [exercise, setExercise] = useState('');
  const [reps, setReps] = useState<number | ''>('');
  const [sets, setSets] = useState<number | ''>('');
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
    const data = await fetchGymEntries();
    setEntries(data);
  }

  async function loadSuggestions() {
    const s = await distinctExercises();
    setSuggestions(s);
  }

  function resetForm() {
    setExercise('');
    setReps('');
    setSets('');
    setDate(new Date().toISOString().slice(0, 10));
    setTime(new Date().toTimeString().slice(0, 8));
    setComment('');
    setEditingId(null);
  }

  async function onSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!exercise || !reps || !sets) return alert('Exercise, reps and sets are required');

    const datetime = new Date(`${date}T${time}`).toISOString();
    try {
      if (editingId) {
        await updateGymEntry(editingId, { exercise, reps: Number(reps), sets: Number(sets), datetime, comment });
      } else {
        await insertGymEntry({ exercise, reps: Number(reps), sets: Number(sets), datetime, comment: comment || null });
      }
      await load();
      await loadSuggestions();
      resetForm();
    } catch (err: any) {
      console.error('Failed to save gym entry', err)
      alert('Failed to save entry: ' + (err?.message || String(err)))
    }
  }

  function onEdit(entry: GymEntry) {
    setEditingId(entry.id);
    setExercise(entry.exercise);
    setReps(entry.reps);
    setSets((entry as any).sets ?? '');
    const dt = new Date(entry.datetime);
    setDate(dt.toISOString().slice(0, 10));
    setTime(dt.toTimeString().slice(0, 8));
    setComment(entry.comment || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this entry?')) return;
    await deleteGymEntry(id);
    await load();
    await loadSuggestions();
  }

  function exportCsv() {
    const rows = entries.map(e => ({
      date: new Date(e.datetime).toISOString().slice(0, 10),
      time: new Date(e.datetime).toTimeString().slice(0, 8),
      exercise: e.exercise,
      reps: e.reps,
      sets: (e as any).sets ?? '',
      comment: e.comment || ''
    }));
    exportToCsv('gym_entries.csv', rows);
  }

  async function importCsvFile(file: File) {
    try {
      const parsed = await parseCsvFile(file); // array of objects keyed by header
      // Expecting headers: date,time,exercise,reps,comment
      const inserts = parsed.map(r => ({
        exercise: r['exercise'] ?? r['Exercise'] ?? '',
        reps: Number(r['reps'] ?? r['Reps'] ?? 0),
        sets: Number(r['sets'] ?? r['Sets'] ?? 0),
        datetime: new Date(`${r['date'] ?? r['Date'] ?? ''}T${r['time'] ?? r['Time'] ?? '00:00:00'}`).toISOString(),
        comment: r['comment'] ?? r['Comment'] ?? null
      })).filter(r => r.exercise && r.reps && r.sets);
      // bulk insert by calling insert for each row (simple)
      for (const ins of inserts) {
        await insertGymEntry(ins as any);
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
      <h2 className="text-lg font-semibold mb-2">Add / Edit Gym Entry</h2>
      <form onSubmit={onSubmit} className="space-y-2 mb-4">
        <div>
          <label className="block text-sm">Exercise</label>
          <input
            list="exercise-suggestions"
            value={exercise}
            onChange={e => setExercise(e.target.value)}
            className="border p-1 w-full"
          />
          <datalist id="exercise-suggestions">
            {suggestions.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">Reps</label>
            <input
              type="number"
              value={reps}
              onChange={e => setReps(e.target.value === '' ? '' : Number(e.target.value))}
              className="border p-1 w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Sets</label>
            <input
              type="number"
              value={sets}
              onChange={e => setSets(e.target.value === '' ? '' : Number(e.target.value))}
              className="border p-1 w-full"
            />
          </div>
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
          <button type="submit" className="btn-primary">
            {editingId ? 'Save' : 'Add'}
          </button>
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
              <th className="p-2 border">Exercise</th>
              <th className="p-2 border">Reps</th>
              <th className="p-2 border">Sets</th>
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
                  <td className="p-2 border">{e.exercise}</td>
                    <td className="p-2 border">{e.reps}</td>
                    <td className="p-2 border">{(e as any).sets}</td>
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

export default GymPanel;