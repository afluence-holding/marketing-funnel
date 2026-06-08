'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

/**
 * Subscribes to launch_ops.task changes for a launch and invokes onChange
 * (debounced) so the page can refresh. RLS-aware (anon client + user session).
 * Degrades silently if Realtime is not enabled on the project.
 */
export function LaunchRealtime({ launchId, onChange }: { launchId: string; onChange: () => void }) {
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const ping = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => cb.current(), 400);
    };

    const channel = supabase
      .channel(`launch_ops:task:${launchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'launch_ops', table: 'task', filter: `launch_id=eq.${launchId}` },
        ping,
      )
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [launchId]);

  return null;
}
