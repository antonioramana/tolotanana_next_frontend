import EditCampaignClient from './EditCampaignClient';

export const revalidate = 0;

export async function generateStaticParams() {
  // Try to fetch some campaign IDs to satisfy Next.js static export crawling
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
    const res = await fetch(`${apiBase}/campaigns?page=1&limit=20`, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error('fail');
    const data = await res.json();
    const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    const ids = items.slice(0, 10).map((c: any) => ({ id: c.id }));
    if (ids.length > 0) return ids;
  } catch {}
  // Fallback to a couple of seed ids so export doesn't fail
  return [{ id: 'seed-camp-a' }, { id: 'seed-camp-b' }];
}

export default function Page() {
  return <EditCampaignClient />;
}


