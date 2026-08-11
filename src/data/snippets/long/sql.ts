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
  `create index scores_language_time_idx
    on scores (language, time_limit, wpm desc);

create index scores_recent_idx
    on scores (created_at desc)
    where accuracy >= 50;

create unique index profiles_username_idx
    on profiles (lower(username))
    where username is not null;`,
  `alter table scores enable row level security;

create policy "scores are readable by everyone"
    on scores for select
    to anon, authenticated
    using (true);

create policy "insert own score"
    on scores for insert
    to authenticated
    with check (
        auth.uid() = user_id and wpm between 1 and 300
    );`,
  `insert into profiles (id, display_name, username, avatar_url)
values ($1, $2, $3, $4)
on conflict (id) do update
set
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    updated_at = now()
returning id, display_name, username;`,
  `update scores s
set
    display_name = p.display_name,
    avatar_url = p.avatar_url
from profiles p
where p.id = s.user_id
    and (
        s.display_name is distinct from p.display_name
        or s.avatar_url is distinct from p.avatar_url
    );`,
  `delete from scores s
using profiles p
where s.user_id = p.id
    and p.username is null
    and s.created_at < now() - interval '1 year';

delete from friendships
where status = 'pending'
    and created_at < now() - interval '30 days';`,
  `with recursive tree as (
    select id, parent_id, name, 1 as depth
    from categories
    where parent_id is null

    union all

    select c.id, c.parent_id, c.name, t.depth + 1
    from categories c
    join tree t on c.parent_id = t.id
)
select repeat('  ', depth - 1) || name as label, depth
from tree
order by depth, name;`,
  `select
    created_at::date as day,
    wpm,
    lag(wpm) over (order by created_at) as previous_wpm,
    wpm - lag(wpm) over (order by created_at) as delta,
    lead(wpm) over (order by created_at) as next_wpm
from scores
where user_id = $1
order by created_at desc
limit 30;`,
  `select
    created_at::date as day,
    count(*) as runs,
    sum(count(*)) over (
        order by created_at::date
    ) as running_total,
    round(avg(wpm), 1) as avg_wpm
from scores
group by created_at::date
order by day;`,
  `select
    display_name,
    wpm,
    rank() over (order by wpm desc) as position,
    dense_rank() over (order by wpm desc) as dense,
    percent_rank() over (order by wpm) as percentile
from leaderboard
where language = 'javascript' and time_limit = 60
order by wpm desc
limit 25;`,
  `with buckets as (
    select
        display_name,
        wpm,
        ntile(4) over (order by wpm) as quartile
    from leaderboard
    where language = 'python'
)
select
    quartile,
    count(*) as players,
    min(wpm) as slowest,
    max(wpm) as fastest
from buckets
group by quartile
order by quartile;`,
  `select
    p.username,
    json_agg(
        json_build_object(
            'language', s.language,
            'wpm', s.wpm,
            'at', s.created_at
        )
        order by s.wpm desc
    ) as bests
from profiles p
join scores s on s.user_id = p.id
group by p.username;`,
  `select
    id,
    payload ->> 'language' as language,
    (payload -> 'stats' ->> 'wpm')::int as wpm
from events
where payload @> '{"type": "submit"}'
    and payload ? 'stats'
    and (payload -> 'stats' ->> 'wpm')::int > 60
order by wpm desc;`,
  `select
    language,
    array_agg(
        distinct display_name order by display_name
    ) as players
from scores
group by language;

select unnest(string_to_array('js,ts,py', ',')) as language;`,
  `with days as (
    select generate_series(
        current_date - interval '29 days',
        current_date,
        interval '1 day'
    )::date as day
)
select
    d.day,
    coalesce(count(s.id), 0) as runs
from days d
left join scores s on s.created_at::date = d.day
group by d.day
order by d.day;`,
  `select
    p.username,
    recent.language,
    recent.wpm
from profiles p
cross join lateral (
    select language, wpm
    from scores s
    where s.user_id = p.id
    order by s.created_at desc
    limit 3
) as recent
order by p.username;`,
  `select p.username, p.display_name
from profiles p
where exists (
    select 1
    from scores s
    where s.user_id = p.id and s.wpm >= 80
)
and not exists (
    select 1
    from friendships f
    where f.requester_id = p.id
);`,
  `select display_name, language, wpm
from scores
where language in ('rust', 'cpp', 'go')
    and time_limit = any (array[30, 60])
    and wpm > all (
        select avg(wpm)
        from scores
        where language = 'rust'
    )
order by wpm desc;`,
  `select user_id
from scores
where language = 'javascript'
intersect
select user_id
from scores
where language = 'typescript';

select user_id from scores where language = 'rust'
except
select user_id from scores where language = 'go';`,
  `select
    display_name,
    max(case when time_limit = 15 then wpm end) as best_15,
    max(case when time_limit = 30 then wpm end) as best_30,
    max(case when time_limit = 60 then wpm end) as best_60
from scores
group by display_name
order by best_60 desc nulls last;`,
  `select
    coalesce(nullif(trim(display_name), ''), 'anonymous') as player,
    coalesce(raw_wpm, wpm) as raw,
    coalesce(consistency, 0) as consistency,
    case
        when accuracy >= 98 then 'clean'
        when accuracy >= 90 then 'ok'
        else 'messy'
    end as quality
from scores;`,
  `select
    split_part(email, '@', 1) as local_part,
    split_part(email, '@', 2) as domain,
    upper(left(display_name, 1))
        || lower(substr(display_name, 2)) as pretty_name,
    length(display_name) as name_length
from profiles
where email like '%@gmail.com';`,
  `select
    display_name,
    regexp_replace(
        lower(display_name), '[^a-z0-9]+', '-', 'g'
    ) as slug
from profiles
where display_name ~ '^[A-Za-z]'
    and display_name !~* 'test|demo';`,
  `select
    extract(year from created_at) as year,
    extract(month from created_at) as month,
    date_part('dow', created_at) as weekday,
    count(*) as runs,
    max(age(now(), created_at)) as oldest
from scores
group by year, month, weekday
order by year desc, month desc;`,
  `select
    now() - interval '7 days' as a_week_ago,
    date_trunc('month', now()) as month_start,
    (
        date_trunc('month', now())
        + interval '1 month'
        - interval '1 day'
    )::date as month_end,
    justify_interval(interval '90 days') as tidy;`,
  `create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_updated_at
    before update on profiles
    for each row
    execute function set_updated_at();`,
  `create or replace function best_wpm(
    p_user uuid,
    p_language text
)
returns int
language plpgsql
stable
as $$
declare
    result int;
begin
    select max(wpm) into result
    from scores
    where user_id = p_user and language = p_language;

    return coalesce(result, 0);
end;
$$;`,
  `create materialized view leaderboard_daily as
select
    created_at::date as day,
    language,
    max(wpm) as best_wpm,
    count(*) as runs
from scores
group by created_at::date, language
with no data;

create unique index leaderboard_daily_idx
    on leaderboard_daily (day, language);

refresh materialized view concurrently leaderboard_daily;`,
  `explain (analyze, buffers, format text)
select display_name, wpm
from scores
where language = 'javascript'
    and time_limit = 60
    and accuracy >= 50
order by wpm desc
limit 10;`,
  `begin;

savepoint before_cleanup;

delete from scores where accuracy < 50;

rollback to savepoint before_cleanup;

update scores
set accuracy = 50
where accuracy between 45 and 49;

commit;`,
  `create role app_reader noinherit;
create role app_writer noinherit;

grant usage on schema public to app_reader, app_writer;

grant select on all tables in schema public to app_reader;

grant insert, update (display_name, avatar_url) on scores
    to app_writer;

revoke delete on scores from app_writer;`,
  `alter table scores
    add column if not exists raw_wpm int,
    add column if not exists consistency int,
    alter column display_name set default 'anonymous',
    alter column created_at set not null;

comment on column scores.raw_wpm is
    'speed counting every keystroke, including mistakes';`,
  `alter table scores
    drop constraint if exists scores_language_check;

alter table scores
    add constraint scores_language_check check (
        language in (
            'javascript', 'typescript', 'csharp', 'python',
            'java', 'go', 'sql', 'bash', 'cpp', 'rust',
            'html', 'css', 'json', 'text'
        )
    );`,
  `create type friendship_status as enum ('pending', 'accepted');

alter table friendships
    alter column status type friendship_status
    using status::friendship_status;

alter type friendship_status
    add value 'blocked' after 'accepted';`,
  `create table events (
    id bigserial,
    happened_at timestamptz not null,
    payload jsonb not null
) partition by range (happened_at);

create table events_2026_q1 partition of events
    for values from ('2026-01-01') to ('2026-04-01');

create table events_2026_q2 partition of events
    for values from ('2026-04-01') to ('2026-07-01');`,
  `select
    coalesce(language, 'all languages') as language,
    coalesce(time_limit::text, 'all') as time_limit,
    count(*) as runs,
    round(avg(wpm), 1) as avg_wpm
from scores
group by grouping sets (
    (language, time_limit),
    (language),
    ()
)
order by language, time_limit;`,
  `select distinct on (created_at::date)
    created_at::date as day,
    display_name,
    wpm
from scores
where user_id = $1
order by created_at::date desc, wpm desc;

select count(distinct user_id) as players
from scores
where created_at > now() - interval '7 days';`,
  `select id, display_name, wpm, created_at
from scores
where language = $1
    and (wpm, id) < ($2, $3)
order by wpm desc, id desc
limit 10;

select count(*) as total
from scores
where language = $1;`,
  `select
    staff.name as employee,
    boss.name as manager,
    staff.salary,
    boss.salary - staff.salary as gap
from employees staff
join employees boss on staff.manager_id = boss.id
where staff.salary > boss.salary * 0.8
order by gap;`,
  `select
    coalesce(a.language, b.language) as language,
    a.runs as this_month,
    b.runs as last_month
from monthly_runs a
full outer join monthly_runs_prev b
    on a.language = b.language
order by language;`,
  `create temporary table slow_players as
select user_id, max(wpm) as best
from scores
group by user_id
having max(wpm) < 40;

analyze slow_players;

select count(*) from slow_players;

drop table if exists slow_players;`,
  `copy scores (display_name, language, time_limit, wpm, accuracy)
from '/tmp/scores.csv'
with (format csv, header true, delimiter ',');

copy (
    select display_name, wpm
    from leaderboard
    order by wpm desc
) to '/tmp/top.csv' with (format csv, header true);`,
  `vacuum (analyze, verbose) scores;

select
    relname as table_name,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    last_autovacuum
from pg_stat_user_tables
order by n_dead_tup desc
limit 10;`,
  `create table invoices (
    id bigint generated always as identity primary key,
    number text not null unique,
    total numeric(12, 2) not null default 0
);

select setval('invoices_id_seq', coalesce(max(id), 1))
from invoices;

alter table invoices alter column id restart with 1000;`,
  `with removed as (
    delete from scores
    where accuracy < 50
    returning user_id, wpm
),
totals as (
    select user_id, count(*) as dropped
    from removed
    group by user_id
)
insert into audit_log (user_id, action, details)
select user_id, 'scores_pruned', dropped::text
from totals;`,
  `select
    s.language,
    count(*) as runs,
    count(*) filter (where s.wpm >= 60) as fast_runs,
    round(
        100.0 * count(*) filter (where s.wpm >= 60) / count(*),
        1
    ) as fast_share
from scores s
group by s.language
having count(*) >= 5
order by fast_share desc;`,
])
