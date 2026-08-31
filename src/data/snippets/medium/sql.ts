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
  `select distinct language, time_limit
from scores
where accuracy >= 50
order by language, time_limit;`,
  `select display_name, wpm
from scores
where language in ('rust', 'go')
    and display_name like 'nhat%'
order by wpm desc;`,
  `select display_name, raw_wpm
from scores
order by raw_wpm desc nulls last
limit 10 offset 20;`,
  `select
    language,
    count(*) as runs,
    count(*) filter (where wpm >= 60) as fast_runs
from scores
group by language;`,
  `select
    language,
    min(wpm) as slowest,
    max(wpm) as fastest,
    sum(wpm) as total
from scores
group by language;`,
  `select user_id, count(*) as runs
from scores
group by user_id
having count(*) >= 10
order by runs desc;`,
  `select p.username
from profiles p
left join scores s on s.user_id = p.id
where s.id is null;`,
  `select display_name
from profiles p
where exists (
    select 1 from scores s where s.user_id = p.id
);`,
  `select 'score' as source, created_at from scores
union all
select 'friend' as source, created_at from friendships
order by created_at desc
limit 20;`,
  `select
    display_name,
    case
        when wpm >= 90 then 'fast'
        when wpm >= 50 then 'steady'
        else 'learning'
    end as tier
from scores;`,
  `select
    coalesce(nullif(trim(display_name), ''), 'anonymous') as player,
    coalesce(consistency, 0) as consistency
from scores;`,
  `select
    (payload ->> 'wpm')::int as wpm,
    created_at::date as day,
    accuracy::numeric(5, 1) as accuracy
from events;`,
  `insert into profiles (id, display_name)
values ($1, $2)
on conflict (id) do update
set display_name = excluded.display_name;`,
  `update scores s
set display_name = p.display_name
from profiles p
where p.id = s.user_id;`,
  `delete from scores s
using profiles p
where s.user_id = p.id and p.username is null;`,
  `create index if not exists scores_wpm_idx
    on scores (language, time_limit, wpm desc);`,
  `create unique index profiles_username_lower_idx
    on profiles (lower(username))
    where username is not null;`,
  `alter table scores
    drop constraint if exists scores_wpm_check;

alter table scores
    add constraint scores_wpm_check check (wpm between 1 and 300);`,
  `create or replace view fast_runs as
select display_name, language, wpm
from scores
where wpm >= 80 and accuracy >= 95;`,
  `select
    display_name,
    wpm,
    row_number() over (order by wpm desc) as position
from scores
where language = 'rust';`,
  `select
    display_name,
    rank() over (partition by language order by wpm desc) as rank
from scores;`,
  `select
    created_at::date as day,
    wpm,
    wpm - lag(wpm) over (order by created_at) as delta
from scores
where user_id = $1;`,
  `select json_build_object(
    'player', display_name,
    'wpm', wpm,
    'language', language
) as row
from scores
limit 5;`,
  `select array_agg(distinct language order by language) as languages
from scores
where user_id = $1;`,
  `select generate_series(
    current_date - interval '6 days',
    current_date,
    interval '1 day'
)::date as day;`,
  `select count(*) as recent_runs
from scores
where created_at > now() - interval '24 hours'
    and accuracy >= 50;`,
  `select
    split_part(email, '@', 2) as domain,
    upper(left(display_name, 1)) as initial,
    length(display_name) as name_length
from profiles;`,
  `select display_name
from profiles
where display_name ~* '^[a-z]{3,}$'
    and display_name !~ '[0-9]';`,
  `begin;

update scores set accuracy = 50 where accuracy between 45 and 49;
delete from scores where wpm > 300;

commit;`,
  `explain (analyze, buffers)
select display_name, wpm
from scores
where language = 'rust'
order by wpm desc
limit 10;`,
  `grant select on all tables in schema public to app_reader;
grant insert, update (display_name) on scores to app_writer;

revoke delete on scores from app_writer;`,
  `create type friendship_status as enum ('pending', 'accepted');

alter table friendships
    alter column status type friendship_status
    using status::friendship_status;`,
  `create policy "insert own score"
    on scores for insert
    to authenticated
    with check (auth.uid() = user_id);`,
  `select distinct on (user_id)
    user_id,
    display_name,
    wpm
from scores
order by user_id, wpm desc;`,
  `select
    staff.name as employee,
    boss.name as manager
from employees staff
join employees boss on staff.manager_id = boss.id;`,
  `select id, wpm
from scores
where language = $1 and (wpm, id) < ($2, $3)
order by wpm desc, id desc
limit 10;`,
  `refresh materialized view concurrently leaderboard_daily;

select count(*) as rows_now from leaderboard_daily;`,

  `select language,
    percentile_cont(0.5) within group (order by wpm) as median_wpm
from scores
group by language;`,
  `select display_name, wpm,
    wpm - lag(wpm) over (partition by user_id order by created_at) as delta
from scores;`,
  `select language, count(*) filter (where wpm >= 60) as fast,
    count(*) as total
from scores
group by language;`,
  `update scores
set accuracy = least(accuracy, 100)
where accuracy > 100
returning id, accuracy;`,
  `select coalesce(s.language, 'total') as language, sum(s.wpm)
from scores s
group by rollup (s.language);`,
  `select * from scores
where created_at >= current_date - interval '7 days'
order by wpm desc
fetch first 10 rows only;`,
  `insert into profiles (id, username)
values ($1, $2)
on conflict (id) do update set username = excluded.username;`,
  `select jsonb_array_elements_text(payload -> 'tags') as tag
from events
where payload ? 'tags';`,
  `create index scores_recent_idx on scores (created_at desc)
where created_at > now() - interval '30 days';`,
  `select u.display_name, count(f.*) as friends
from profiles u
left join lateral (
    select 1 from friendships f where f.user_id = u.id
) f on true
group by u.display_name;`,
])
