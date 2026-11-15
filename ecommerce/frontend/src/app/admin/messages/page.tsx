'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Download, Mail } from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDateTime } from '../../../lib/format';
import { InboxMessage } from '../../../types';
import { PageTitle, Panel, downloadCsv } from '../../../components/admin/ui';
import { ErrorState } from '../../../components/Loading';

export default function AdminMessages() {
  const [rows, setRows] = useState<InboxMessage[]>([]);
  const [tab, setTab] = useState<'CONTACT' | 'NEWSLETTER'>('CONTACT');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setErr('');
    api
      .get('/admin/messages')
      .then((d) => setRows(d.messages ?? []))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Could not load messages'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const contact = useMemo(() => rows.filter((r) => r.kind === 'CONTACT'), [rows]);
  const subs = useMemo(() => rows.filter((r) => r.kind === 'NEWSLETTER'), [rows]);
  const open = contact.filter((m) => !m.handled).length;

  const toggle = async (m: InboxMessage) => {
    setRows((rs) => rs.map((r) => (r._id === m._id ? { ...r, handled: !m.handled } : r)));
    try {
      await api.patch(`/admin/messages/${m._id}`, { handled: !m.handled });
    } catch {
      setRows((rs) => rs.map((r) => (r._id === m._id ? { ...r, handled: m.handled } : r)));
    }
  };

  if (err) return <ErrorState message={err} onRetry={load} />;
  const chip = (on: boolean) => `pill pill-sm ${on ? '!border-accent !bg-accent !text-onaccent before:hidden' : ''}`;

  return (
    <>
      <PageTitle eyebrow="Inbox" title="Messages">
        {tab === 'NEWSLETTER' && (
          <button onClick={() => downloadCsv('subscribers.csv', [['Email', 'Subscribed'], ...subs.map((s) => [s.email, s.createdAt])])} className="pill pill-sm">
            <Download size={13} /> Export subscribers
          </button>
        )}
      </PageTitle>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setTab('CONTACT')} className={chip(tab === 'CONTACT')}>Contact · {contact.length}{open ? ` (${open} open)` : ''}</button>
        <button onClick={() => setTab('NEWSLETTER')} className={chip(tab === 'NEWSLETTER')}>Newsletter · {subs.length}</button>
      </div>

      <Panel pad={false}>
        {loading ? (
          <div className="space-y-3 p-5">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
        ) : tab === 'CONTACT' ? (
          contact.length === 0 ? (
            <p className="px-5 py-16 text-center font-mono text-[13px]">No messages yet.</p>
          ) : (
            <ul className="divide-y divide-dotted divide-fg/30">
              {contact.map((m) => (
                <li key={m._id} className={`p-5 ${m.handled ? 'opacity-60' : ''}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[16px] text-head">{m.subject || 'No subject'}</p>
                      <p className="font-mono text-[12px]">{m.name} · <a href={`mailto:${m.email}`} className="link">{m.email}</a> · {formatDateTime(m.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Your message to ShopEasy'))}`} className="pill pill-sm"><Mail size={12} /> Reply</a>
                      <button onClick={() => toggle(m)} className={`pill pill-sm ${m.handled ? '' : 'pill-accent'}`}><Check size={12} /> {m.handled ? 'Reopen' : 'Mark done'}</button>
                    </div>
                  </div>
                  <p className="mono mt-3 max-w-[80ch] whitespace-pre-line">{m.message}</p>
                </li>
              ))}
            </ul>
          )
        ) : subs.length === 0 ? (
          <p className="px-5 py-16 text-center font-mono text-[13px]">No subscribers yet.</p>
        ) : (
          <ul className="divide-y divide-dotted divide-fg/30">
            {subs.map((s) => (
              <li key={s._id} className="flex items-center justify-between gap-3 px-5 py-3 font-mono text-[13px]">
                <span className="text-head">{s.email}</span>
                <span>{formatDateTime(s.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
