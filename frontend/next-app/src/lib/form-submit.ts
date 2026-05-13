import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { SITE_TYPE_PRICES, type SiteType } from '@/types/clientRequest';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:8000/api';

export interface FormSubmitData {
  siteType: SiteType;
  businessName: string;
  sector: string;
  siteGoal: string;
  description: string;
  targetAudience: string;
  uniqueValue: string;
  references?: string;
  logoFile?: File | null;
  logoUrl?: string;
  generateLogo?: boolean;
  colors: string[];
  colorTheme: string;
  visualStyle: string;
  pages: string[];
  features: string[];
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
  tagline?: string;
}

export async function submitForm(data: FormSubmitData): Promise<void> {
  let logoUrl = data.logoUrl || '';
  if (data.logoFile) {
    const path = `logos/${Date.now()}_${data.logoFile.name}`;
    const snap = await uploadBytes(storageRef(storage, path), data.logoFile);
    logoUrl = await getDownloadURL(snap.ref);
  }

  const docRef = await addDoc(collection(db, 'client_requests'), {
    status: 'pending',
    createdAt: serverTimestamp(),
    siteType: data.siteType,
    businessName: data.businessName,
    sector: data.sector,
    siteGoal: data.siteGoal,
    tagline: data.tagline || '',
    description: data.description,
    targetAudience: data.targetAudience,
    uniqueValue: data.uniqueValue,
    references: data.references || '',
    logoUrl,
    generateLogo: data.generateLogo || false,
    colors: data.colors,
    colorTheme: data.colorTheme,
    visualStyle: data.visualStyle,
    pages: data.pages,
    features: data.features,
    budget: SITE_TYPE_PRICES[data.siteType].label,
    notes: data.notes || '',
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone || '',
  });

  const portalRes = await fetch(`${API_BASE}/portal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firestore_id: docRef.id,
      client_email: data.clientEmail,
      client_phone: data.clientPhone || '',
      business_name: data.businessName,
      site_type: data.siteType,
    }),
  });

  if (!portalRes.ok) throw new Error('Erreur création portal');
  const { token } = await portalRes.json();

  const checkoutRes = await fetch(`${API_BASE}/checkout/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      portal_token: token,
      business_name: data.businessName,
      site_type: data.siteType,
      client_email: data.clientEmail,
      origin: window.location.origin,
    }),
  });

  if (checkoutRes.ok) {
    const { url } = await checkoutRes.json();
    window.location.href = url;
  } else {
    window.location.href = `/p/${token}`;
  }
}
