import { Listing, Review, HistorySnapshot } from '../types';

// Unified time point returned to charts
export interface TimePoint {
  date: string; // label (YYYY-MM-DD or HH:00)
  listingDaily: number;
  reviewDaily: number;
  listingCumulative: number;
  reviewCumulative: number;
  viewsDelta: number;
  viewsCumulative: number;
}

// Build per-day aggregates (including cumulative + view deltas)
export function buildDailySeries(listings: Listing[], reviews: Review[], history: HistorySnapshot[]): TimePoint[] {
  const map: Record<string, { l:number; r:number; v:number }> = {};
  const norm = (ts?: string) => ts ? new Date(ts).toISOString().slice(0,10) : undefined;
  listings.forEach(l => { const d = norm(l.createdAt || l.updatedAt); if(!d) return; (map[d] ||= { l:0,r:0,v:0 }).l++; });
  reviews.forEach(r => { const d = norm(r.createdAt); if(!d) return; (map[d] ||= { l:0,r:0,v:0 }).r++; });
  history.forEach(h => { const d = new Date(h.ts).toISOString().slice(0,10); (map[d] ||= { l:0,r:0,v:0 }).v += h.dViews; });
  let lc=0, rc=0, vc=0;
  return Object.keys(map).sort().map(d => {
    const m = map[d]; lc += m.l; rc += m.r; vc += m.v;
    return { date:d, listingDaily:m.l, reviewDaily:m.r, listingCumulative:lc, reviewCumulative:rc, viewsDelta:m.v, viewsCumulative:vc };
  });
}

// Build last 24h per-hour aggregates
export function buildHourlySeries24h(listings: Listing[], reviews: Review[], history: HistorySnapshot[], now: number = Date.now()): TimePoint[] {
  let lc=0, rc=0, vc=0; const out: TimePoint[] = [];
  for (let i=23;i>=0;i--) {
    const anchor = new Date(now - i*60*60*1000);
    const hourStart = new Date(anchor); hourStart.setMinutes(0,0,0);
    const hourEnd = new Date(hourStart.getTime()+60*60*1000);
    const label = hourStart.toISOString().slice(11,13)+':00';
    const ld = listings.filter(l => { const ct = new Date(l.createdAt || l.updatedAt || 0); return ct>=hourStart && ct<hourEnd; }).length;
    const rd = reviews.filter(r => { const rt = new Date(r.createdAt); return rt>=hourStart && rt<hourEnd; }).length;
    const vd = history.filter(h => h.ts>=hourStart.getTime() && h.ts<hourEnd.getTime()).reduce((s,h)=> s + h.dViews,0);
    lc += ld; rc += rd; vc += vd;
    out.push({ date: label, listingDaily: ld, reviewDaily: rd, listingCumulative: lc, reviewCumulative: rc, viewsDelta: vd, viewsCumulative: vc });
  }
  return out;
}
