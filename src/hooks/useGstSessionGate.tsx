import { useCallback, useRef, useState, type ReactNode } from 'react';
import { GstSessionDialog } from '@/components/GstSessionDialog/GstSessionDialog';
import { isGstSessionRequired } from '@/lib/gst-session.api';

type Pending = {
  action: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (err: unknown) => void;
};

/**
 * Wraps GST API actions (sync, submit) so that a "GST session required" (HTTP 428) answer
 * opens the OTP dialog and, once connected, re-runs the action automatically.
 *
 *   const gate = useGstSessionGate(companyGstId, gstin);
 *   const result = await gate.run(() => api.sync(...)); // undefined if the user cancels the OTP
 *   ...
 *   {gate.dialog}
 */
export function useGstSessionGate(companyGstId: number | null | undefined, gstin?: string) {
  const [open, setOpen] = useState(false);
  const pending = useRef<Pending | null>(null);

  const run = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
      try {
        return await action();
      } catch (err) {
        if (!isGstSessionRequired(err) || !companyGstId) throw err;
        return new Promise<T | undefined>((resolve, reject) => {
          pending.current = {
            action,
            resolve: resolve as (v: unknown) => void,
            reject,
          };
          setOpen(true);
        });
      }
    },
    [companyGstId],
  );

  const handleConnected = useCallback(async () => {
    setOpen(false);
    const p = pending.current;
    pending.current = null;
    if (!p) return;
    try {
      p.resolve(await p.action());
    } catch (err) {
      p.reject(err);
    }
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    pending.current?.resolve(undefined);
    pending.current = null;
  }, []);

  /** Open the dialog directly (e.g. a "Connect to GST portal" button). */
  const connect = useCallback(() => setOpen(true), []);

  const dialog: ReactNode =
    open && companyGstId ? (
      <GstSessionDialog
        companyGstId={companyGstId}
        gstin={gstin}
        onConnected={handleConnected}
        onClose={handleClose}
      />
    ) : null;

  return { run, connect, dialog };
}
