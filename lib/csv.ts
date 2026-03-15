// Minimal CSV utils: export and parse. No external deps.

export function exportToCsv(filename: string, rows: Record<string, any>[]) {
    if (!rows || !rows.length) {
      return;
    }
    const keys = Object.keys(rows[0]);
    const csv = [
      keys.join(','),
      ...rows.map(r =>
        keys
          .map(k => {
            const val = r[k] ?? '';
            if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return String(val);
          })
          .join(',')
      )
    ].join('\n');
  
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  export async function parseCsvFile(file: File): Promise<Record<string, string>[]> {
    const text = await file.text();
    return parseCsv(text);
  }
  
  export function parseCsv(text: string): Record<string, string>[] {
    // Very small CSV parser for simple, well-formed files (no support for multiline fields)
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = splitCsvLine(lines[i]);
      const row: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = cols[j] ?? '';
      }
      rows.push(row);
    }
    return rows;
  }
  
  function splitCsvLine(line: string): string[] {
    const res: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        res.push(cur);
        cur = '';
        continue;
      }
      cur += ch;
    }
    res.push(cur);
    return res;
  }