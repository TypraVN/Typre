import { defineSnippets } from '../define'

/** Bài DÀI cho mốc 60s — xem chú thích trong `long/javascript.ts`. */
export const sqlLong = defineSnippets('sql', 'sql-long', [
  `create table scores (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    display_name text not null,
    language text not null,
    time_limit int not null check (time_limit in (15, 30, 60)),
    wpm int not null check (wpm >= 0 and wpm <= 400),
    accuracy int not null check (accuracy between 0 and 100),
    created_at timestamptz not null default now()
);`,
  `with ranked as (
    select
        user_id,
        language,
        wpm,
        row_number() over (
            partition by user_id, language
            order by wpm desc, created_at asc
        ) as position
    from scores
    where time_limit = 60
)
select user_id, language, wpm
from ranked
where position = 1
order by wpm desc
limit 20;`,
  `select
    u.name,
    count(s.id) as runs,
    round(avg(s.wpm), 1) as avg_wpm,
    max(s.wpm) as best_wpm,
    round(avg(s.accuracy), 1) as avg_accuracy
from users u
left join scores s on s.user_id = u.id
group by u.id, u.name
having count(s.id) > 5
order by best_wpm desc;`,
  `create or replace view leaderboard as
select distinct on (user_id, language, time_limit)
    user_id,
    display_name,
    language,
    time_limit,
    wpm,
    accuracy,
    created_at
from scores
order by user_id, language, time_limit, wpm desc, created_at asc;`,
  `begin;

update accounts
set balance = balance - 250
where id = 1 and balance >= 250;

update accounts
set balance = balance + 250
where id = 2;

insert into transfers (from_id, to_id, amount)
values (1, 2, 250);

commit;`,
  `select
    date_trunc('week', created_at) as week,
    language,
    count(*) as runs,
    round(avg(wpm), 1) as avg_wpm
from scores
where created_at > now() - interval '90 days'
group by week, language
having count(*) >= 3
order by week desc, avg_wpm desc;`,
])
