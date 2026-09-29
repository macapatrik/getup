-- Indexy na cizí klíče, které používají statistiky (počty zpráv/nahlášení podle uživatele) a mazání účtů.
create index messages_sender_idx on public.messages (sender_id);
create index reports_reporter_idx on public.reports (reporter_id);
create index reports_resolved_by_idx on public.reports (resolved_by);
create index events_created_by_idx on public.events (created_by);
create index bans_banned_by_idx on public.bans (banned_by);
