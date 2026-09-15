// High-Performance In-Memory Cache and Data Export Utility for Neubofy Admin
// Mitigates excessive Firestore reads as applicant pool and audit logs grow.

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class AdminDataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 60 * 1000; // 60 seconds TTL

  get<T>(key: string, ttl: number = this.defaultTTL): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  getTimestamp(key: string): number | null {
    const entry = this.cache.get(key);
    return entry ? entry.timestamp : null;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

export const adminCache = new AdminDataCache();

/**
 * Downloads a data array as a CSV file in the browser
 */
export function exportToCsv<T extends Record<string, any>>(data: T[], filename: string): void {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Extract unique headers
  const headers = Array.from(
    new Set(
      data.flatMap((row) => Object.keys(row))
    )
  );

  const csvRows: string[] = [];
  // Add header row
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      if (typeof val === "object") {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\r\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads arbitrary data as a JSON file in the browser
 */
export function exportToJson(data: any, filename: string): void {
  if (!data) {
    alert("No data available to export.");
    return;
  }

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".json") ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
