import { defineSnippets } from '../define'

/** Bài TRUNG BÌNH cho mốc 30s — xem chú thích trong `medium/javascript.ts`. */
export const sqlMedium = defineSnippets('sql', 'sql-med', [
  `select language, count(*) as runs, round(avg(wpm), 1) as avg_wpm
from scores
group by language
order by avg_wpm desc;`,
  `select u.name, s.wpm, s.accuracy
from scores s
join users u on u.id = s.user_id
where s.time_limit = 60
order by s.wpm desc
limit 10;`,
  `update panels
set weight = round(volume * 2400, 1),
    updated_at = now()
where job_id = $1;`,
  `insert into scores (user_id, language, wpm, accuracy)
values ($1, $2, $3, $4)
on conflict (user_id, language) do update
set wpm = excluded.wpm;`,
  `create table jobs (
    id serial primary key,
    code text not null unique,
    created_at timestamptz not null default now()
);`,
  `select mark, weight,
    rank() over (order by weight desc) as heaviest
from panels
where job_id = 42;`,
  `delete from sessions
where expires_at < now() - interval '7 days';`,
  `select date_trunc('day', created_at) as day, count(*)
from scores
group by day
order by day desc;`,
  `with best as (
    select user_id, max(wpm) as wpm
    from scores
    group by user_id
)
select * from best where wpm > 80;`,
  `alter table profiles
add column if not exists username text unique;`,
])
