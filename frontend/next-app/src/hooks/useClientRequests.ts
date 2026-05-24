'use client';

import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, doc, updateDoc, deleteDoc,
  query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClientRequest, RequestStatus } from '@/types/clientRequest';

interface UseClientRequestsReturn {
  requests: ClientRequest[];
  loading: boolean;
  error: string | null;
  updateStatus: (id: string, status: RequestStatus) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}

export function useClientRequests(): UseClientRequestsReturn {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'client_requests'), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data: ClientRequest[] = snapshot.docs.map((d) => {
          const raw = d.data();
          return {
            id:               d.id,
            createdAt:        raw.createdAt instanceof Timestamp ? raw.createdAt.toDate() : new Date(),
            status:           raw.status ?? 'pending',
            siteType:         raw.siteType ?? 'standard',
            businessName:     raw.businessName ?? '',
            sector:           raw.sector ?? '',
            siteGoal:         raw.siteGoal ?? '',
            tagline:          raw.tagline ?? '',
            description:      raw.description ?? '',
            targetAudience:   raw.targetAudience ?? '',
            uniqueValue:      raw.uniqueValue ?? '',
            references:       raw.references ?? raw.inspirationSites ?? '',
            logoUrl:          raw.logoUrl ?? '',
            primaryColor:     (Array.isArray(raw.colors) && raw.colors[0]) ? raw.colors[0] : (raw.primaryColor ?? '#6366f1'),
            colors:           raw.colors ?? [],
            colorTheme:       raw.colorTheme ?? 'light',
            visualStyle:      raw.visualStyle ?? '',
            pages:            raw.pages ?? [],
            features:         raw.features ?? [],
            budget:           raw.budget ?? '',
            notes:            raw.notes ?? '',
            projectId:        raw.projectId ?? undefined,
            suggestedPrice:   raw.suggestedPrice ?? undefined,
            clientEmail:      raw.clientEmail ?? raw.email ?? '',
            clientPhone:      raw.clientPhone ?? raw.phone ?? '',
          } satisfies ClientRequest;
        });
        setRequests(data);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError('Impossible de charger les demandes. Vérifiez la configuration Firebase.');
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const updateStatus = async (id: string, status: RequestStatus) => {
    await updateDoc(doc(db, 'client_requests', id), { status });

    // Synchroniser le statut portal si le projet est lié
    const request = requests.find(r => r.id === id);
    if (request?.projectId) {
      const API = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api`
        : '/api';
      const PORTAL_STATUS_MAP: Partial<Record<RequestStatus, string>> = {
        validated:   'validated',
        in_progress: 'in_progress',
        completed:   'completed',
      };
      const portalStatus = PORTAL_STATUS_MAP[status];
      if (portalStatus) {
        fetch(`${API}/projects/${request.projectId}/portal-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: portalStatus }),
        }).catch(() => {});
      }
    }
  };

  const deleteRequest = async (id: string) => {
    // Supprimer d'abord le projet SQLite lié (tâches, logs, guardian, portal_orders, workspace)
    const request = requests.find(r => r.id === id);
    if (request?.projectId) {
      const API = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api`
        : '/api';
      await fetch(`${API}/projects/${request.projectId}`, { method: 'DELETE' }).catch(() => {});
    }
    // Puis supprimer le doc Firestore
    await deleteDoc(doc(db, 'client_requests', id));
  };

  return { requests, loading, error, updateStatus, deleteRequest };
}
