import CampaignDetailLoader from '@/components/campaign/CampaignDetailLoader';

export async function generateStaticParams() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4750';
  try {
    // Utiliser l'endpoint public pour generateStaticParams
    const res = await fetch(`${API_BASE}/public/campaigns?page=1&limit=100`, { cache: 'no-store' });
    const data = await res.json();
    const campaigns = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return campaigns.map((c: any) => ({ id: c.id }));
  } catch (e) {
    // Fallback to known seed ids to satisfy export in local/dev
    return [{ id: 'seed-camp-a' }, { id: 'seed-camp-b' }];
  }
}

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  return <CampaignDetailLoader id={params.id} />;
}