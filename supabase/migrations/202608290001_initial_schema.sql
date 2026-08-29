create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.qbr_status as enum ('preparation','review','results');
create type public.initiative_status as enum ('not_started','in_progress','paused','completed');
create type public.metric_direction as enum ('increase','decrease');
create type public.metric_category as enum ('strategic','operational','control');
create type public.metric_source_type as enum ('manual','integration');
create type public.risk_level as enum ('low','medium','high');
create type public.ai_analysis_type as enum ('review','results');

create table public.organizations (id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz not null default now());
create table public.profiles (user_id uuid primary key references auth.users on delete cascade, organization_id uuid not null references public.organizations, display_name text not null, role text not null default 'user');
create table public.strategic_directions (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, name text not null, description text not null default '', sort_order int not null default 0);
create table public.strategic_goals (id uuid primary key default gen_random_uuid(), direction_id uuid not null references public.strategic_directions on delete cascade, organization_id uuid not null references public.organizations on delete cascade, name text not null, description text not null default '', sort_order int not null default 0);
create table public.metrics (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, goal_id uuid not null references public.strategic_goals, name citext not null, description text not null default '', category metric_category not null, direction metric_direction not null, unit text not null default '', current_value text, source_type metric_source_type not null default 'manual', source_label text, integration_config jsonb not null default '{}'::jsonb, is_active boolean not null default true, unique(organization_id,name));
create table public.teams (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, name text not null, department text not null, unique(organization_id,name));
create table public.employees (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, full_name text not null, position text not null, email citext not null, is_active boolean not null default true, unique(organization_id,email));
create table public.team_members (team_id uuid references public.teams on delete cascade, employee_id uuid references public.employees on delete cascade, available_fte numeric(3,2) not null default 1 check(available_fte between 0 and 1), joined_at date, left_at date, primary key(team_id,employee_id));
create table public.initiatives (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, code text not null, name text not null, goal_id uuid not null references public.strategic_goals, owner_employee_id uuid not null references public.employees, team_id uuid not null references public.teams, tracker_url text, default_status initiative_status not null default 'not_started', is_active boolean not null default true, unique(organization_id,code));
create table public.initiative_metrics (initiative_id uuid references public.initiatives on delete cascade, metric_id uuid references public.metrics on delete cascade, primary key(initiative_id,metric_id));
create table public.initiative_members (initiative_id uuid references public.initiatives on delete cascade, employee_id uuid references public.employees on delete cascade, allocation_fte numeric(3,2) not null check(allocation_fte between .1 and 1), primary key(initiative_id,employee_id));
create table public.qbrs (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, name text not null, team_id uuid not null references public.teams, owner_employee_id uuid not null references public.employees, is_active boolean not null default true);
create table public.qbr_access (qbr_id uuid references public.qbrs on delete cascade, user_id uuid references auth.users on delete cascade, access_role text not null check(access_role in ('owner','editor','viewer')), primary key(qbr_id,user_id));
create table public.qbr_periods (id uuid primary key default gen_random_uuid(), qbr_id uuid not null references public.qbrs on delete cascade, year smallint not null, quarter smallint not null check(quarter between 1 and 4), status qbr_status not null default 'preparation', readiness_percent smallint not null default 0 check(readiness_percent between 0 and 100), connectivity_percent smallint not null default 0 check(connectivity_percent between 0 and 100), strategic_impact_percent smallint not null default 0 check(strategic_impact_percent between 0 and 100), review_started_at timestamptz, review_completed_at timestamptz, locked_at timestamptz, unique(qbr_id,year,quarter));
create table public.qbr_initiatives (id uuid primary key default gen_random_uuid(), qbr_period_id uuid not null references public.qbr_periods on delete cascade, initiative_id uuid not null references public.initiatives, name_snapshot text not null, goal_name_snapshot text not null, owner_employee_id uuid not null references public.employees, team_id uuid not null references public.teams, status initiative_status not null, target_numeric numeric, target_display text, actual_numeric numeric, actual_display text, progress_percent int check(progress_percent between 0 and 100), comment text, unique(qbr_period_id,initiative_id));
create table public.qbr_initiative_members (qbr_initiative_id uuid references public.qbr_initiatives on delete cascade, employee_id uuid references public.employees, allocation_fte numeric(3,2) not null check(allocation_fte between .1 and 1), primary key(qbr_initiative_id,employee_id));
create table public.qbr_initiative_risks (id uuid primary key default gen_random_uuid(), qbr_initiative_id uuid not null references public.qbr_initiatives on delete cascade, level risk_level not null, name text not null, description text not null, is_active boolean not null default true, resolved_at timestamptz);
create table public.qbr_metrics (id uuid primary key default gen_random_uuid(), qbr_period_id uuid not null references public.qbr_periods on delete cascade, metric_id uuid not null references public.metrics, name_snapshot text not null, goal_name_snapshot text not null, unit_snapshot text not null, direction_snapshot metric_direction not null, target_numeric numeric, target_display text, actual_numeric numeric, actual_display text, progress_percent int, status text, source_type metric_source_type not null, updated_at timestamptz not null default now(), unique(qbr_period_id,metric_id));
create table public.qbr_metric_initiatives (qbr_metric_id uuid references public.qbr_metrics on delete cascade, qbr_initiative_id uuid references public.qbr_initiatives on delete cascade, primary key(qbr_metric_id,qbr_initiative_id));
create table public.qbr_questions (id uuid primary key default gen_random_uuid(), qbr_period_id uuid not null references public.qbr_periods on delete cascade, title text not null, question text not null, sort_order int not null default 0);
create table public.qbr_decisions (id uuid primary key default gen_random_uuid(), qbr_period_id uuid not null references public.qbr_periods on delete cascade, question_id uuid references public.qbr_questions on delete cascade, title text not null, decision text not null, decided_by uuid not null references auth.users, decided_at timestamptz not null default now());
create unique index qbr_decision_question_unique on public.qbr_decisions(question_id) where question_id is not null;
create table public.ai_analyses (id uuid primary key default gen_random_uuid(), qbr_period_id uuid not null references public.qbr_periods on delete cascade, analysis_type ai_analysis_type not null, model text not null, input_hash text not null, result jsonb not null, created_by uuid not null references auth.users, created_at timestamptz not null default now());
create table public.qbr_app_state (user_id uuid primary key references auth.users on delete cascade, state jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());

create or replace function public.has_org_access(p_org uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from profiles where user_id=auth.uid() and organization_id=p_org) $$;
create or replace function public.has_qbr_access(p_qbr uuid, p_write boolean default false) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from qbr_access where qbr_id=p_qbr and user_id=auth.uid() and (not p_write or access_role in ('owner','editor'))) $$;
create or replace function public.assert_preparation(p_period uuid) returns void language plpgsql security definer set search_path=public as $$ begin if not exists(select 1 from qbr_periods p where p.id=p_period and p.status='preparation' and has_qbr_access(p.qbr_id,true)) then raise exception 'Период недоступен для редактирования'; end if; end $$;

create or replace function public.recalculate_qbr_scores(p_period uuid) returns void language plpgsql security definer set search_path=public as $$
declare i int; m int; q int; readiness int; connectivity int; impact int;
begin
 select count(*) into i from qbr_initiatives where qbr_period_id=p_period;
 select count(*) into m from qbr_metrics where qbr_period_id=p_period;
 select count(*) into q from qbr_questions where qbr_period_id=p_period;
 readiness := round(100.0*((i>0)::int+(m>0)::int+(q>0)::int+(not exists(select 1 from qbr_metrics where qbr_period_id=p_period and (target_numeric is null or actual_numeric is null)))::int+(not exists(select 1 from qbr_initiatives where qbr_period_id=p_period and status='paused'))::int)/5);
 connectivity := case when i=0 then 0 else round(100.0*(select count(distinct qmi.qbr_initiative_id) from qbr_metric_initiatives qmi join qbr_metrics qm on qm.id=qmi.qbr_metric_id where qm.qbr_period_id=p_period)/i) end;
 impact := case when m=0 then 0 else least(100,round((select coalesce(avg(progress_percent),0) from qbr_metrics where qbr_period_id=p_period))) end;
 update qbr_periods set readiness_percent=readiness,connectivity_percent=connectivity,strategic_impact_percent=impact where id=p_period;
end $$;

create or replace function public.add_initiative_to_qbr(p_period_id uuid,p_initiative_id uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare qi uuid; yr int; qt int; init initiatives%rowtype;
begin
 perform assert_preparation(p_period_id); select year,quarter into yr,qt from qbr_periods where id=p_period_id;
 if exists(select 1 from qbr_initiatives x join qbr_periods p on p.id=x.qbr_period_id where x.initiative_id=p_initiative_id and p.year=yr and p.quarter=qt and p.id<>p_period_id) then raise exception 'Инициатива уже включена в QBR этого квартала'; end if;
 select * into init from initiatives where id=p_initiative_id;
 insert into qbr_initiatives(qbr_period_id,initiative_id,name_snapshot,goal_name_snapshot,owner_employee_id,team_id,status)
 select p_period_id,init.id,init.name,g.name,init.owner_employee_id,init.team_id,init.default_status from strategic_goals g where g.id=init.goal_id returning id into qi;
 insert into qbr_initiative_members select qi,employee_id,allocation_fte from initiative_members where initiative_id=init.id;
 insert into qbr_metrics(qbr_period_id,metric_id,name_snapshot,goal_name_snapshot,unit_snapshot,direction_snapshot,source_type)
 select p_period_id,m.id,m.name,g.name,m.unit,m.direction,m.source_type from initiative_metrics im join metrics m on m.id=im.metric_id join strategic_goals g on g.id=m.goal_id where im.initiative_id=init.id on conflict(qbr_period_id,metric_id) do nothing;
 insert into qbr_metric_initiatives select qm.id,qi from qbr_metrics qm join initiative_metrics im on im.metric_id=qm.metric_id where qm.qbr_period_id=p_period_id and im.initiative_id=init.id on conflict do nothing;
 perform recalculate_qbr_scores(p_period_id); return qi;
end $$;

create or replace function public.remove_initiative_from_qbr(p_period_id uuid,p_qbr_initiative_id uuid) returns void language plpgsql security definer set search_path=public as $$ begin perform assert_preparation(p_period_id); delete from qbr_initiatives where id=p_qbr_initiative_id and qbr_period_id=p_period_id; delete from qbr_metrics qm where qm.qbr_period_id=p_period_id and not exists(select 1 from qbr_metric_initiatives x where x.qbr_metric_id=qm.id); perform recalculate_qbr_scores(p_period_id); end $$;

create or replace function public.update_qbr_metric_values(p_qbr_metric_id uuid,p_target numeric,p_actual numeric,p_source metric_source_type) returns qbr_metrics language plpgsql security definer set search_path=public as $$
declare row qbr_metrics%rowtype; pct int;
begin select * into row from qbr_metrics where id=p_qbr_metric_id; perform assert_preparation(row.qbr_period_id); if p_target is null or p_actual is null or p_target<=0 then pct:=null; elsif row.direction_snapshot='decrease' then pct:=round(100*p_target/nullif(p_actual,0)); else pct:=round(100*p_actual/p_target); end if; update qbr_metrics set target_numeric=p_target,actual_numeric=p_actual,progress_percent=pct,status=case when pct>=100 then 'green' when pct>=85 then 'yellow' else 'red' end,source_type=p_source,updated_at=now() where id=p_qbr_metric_id returning * into row; perform recalculate_qbr_scores(row.qbr_period_id); return row; end $$;

create or replace function public.transition_qbr_status(p_period_id uuid,p_target qbr_status) returns qbr_periods language plpgsql security definer set search_path=public as $$
declare row qbr_periods%rowtype;
begin select * into row from qbr_periods where id=p_period_id for update; if not has_qbr_access(row.qbr_id,true) then raise exception 'Нет доступа'; end if; perform recalculate_qbr_scores(p_period_id); select * into row from qbr_periods where id=p_period_id;
 if row.status='preparation' and p_target='review' then if row.readiness_percent<70 then raise exception 'Готовность должна быть не ниже 70%%'; end if; update qbr_periods set status='review',review_started_at=now() where id=p_period_id;
 elsif row.status='review' and p_target='preparation' then update qbr_periods set status='preparation' where id=p_period_id;
 elsif row.status='review' and p_target='results' then if exists(select 1 from qbr_questions q where q.qbr_period_id=p_period_id and not exists(select 1 from qbr_decisions d where d.question_id=q.id)) then raise exception 'Не все вопросы имеют решение'; end if; update qbr_periods set status='results',review_completed_at=now(),locked_at=now() where id=p_period_id;
 else raise exception 'Недопустимый переход статуса'; end if; select * into row from qbr_periods where id=p_period_id; return row; end $$;

create or replace function public.create_future_qbr_period(p_qbr_id uuid,p_year int,p_quarter int) returns qbr_periods language plpgsql security definer set search_path=public as $$ declare row qbr_periods%rowtype; begin if not has_qbr_access(p_qbr_id,true) then raise exception 'Нет доступа'; end if; insert into qbr_periods(qbr_id,year,quarter) values(p_qbr_id,p_year,p_quarter) on conflict(qbr_id,year,quarter) do update set qbr_id=excluded.qbr_id returning * into row; return row; end $$;

create or replace function public.get_qbr_ai_snapshot(p_period_id uuid) returns jsonb language sql stable security definer set search_path=public as $$ select case when has_qbr_access(p.qbr_id,false) then jsonb_build_object('period',to_jsonb(p),'metrics',(select coalesce(jsonb_agg(to_jsonb(m)),'[]') from qbr_metrics m where m.qbr_period_id=p.id),'initiatives',(select coalesce(jsonb_agg(to_jsonb(i)),'[]') from qbr_initiatives i where i.qbr_period_id=p.id),'risks',(select coalesce(jsonb_agg(to_jsonb(r)),'[]') from qbr_initiative_risks r join qbr_initiatives i on i.id=r.qbr_initiative_id where i.qbr_period_id=p.id),'questions',(select coalesce(jsonb_agg(to_jsonb(q)),'[]') from qbr_questions q where q.qbr_period_id=p.id),'decisions',(select coalesce(jsonb_agg(to_jsonb(d)),'[]') from qbr_decisions d where d.qbr_period_id=p.id)) else null end from qbr_periods p where p.id=p_period_id $$;

do $$ declare t text; begin foreach t in array array['organizations','profiles','strategic_directions','strategic_goals','metrics','teams','employees','team_members','initiatives','initiative_metrics','initiative_members','qbrs','qbr_access','qbr_periods','qbr_initiatives','qbr_initiative_members','qbr_initiative_risks','qbr_metrics','qbr_metric_initiatives','qbr_questions','qbr_decisions','ai_analyses','qbr_app_state'] loop execute format('alter table public.%I enable row level security',t); end loop; end $$;

create policy app_state_own on public.qbr_app_state for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy profiles_own_org on public.profiles for select to authenticated using(user_id=auth.uid());
create policy org_read on public.organizations for select to authenticated using(has_org_access(id));
create policy directions_org on public.strategic_directions for all to authenticated using(has_org_access(organization_id)) with check(has_org_access(organization_id));
create policy goals_org on public.strategic_goals for all to authenticated using(has_org_access(organization_id)) with check(has_org_access(organization_id));
create policy metrics_org on public.metrics for all to authenticated using(has_org_access(organization_id)) with check(has_org_access(organization_id));
create policy teams_org on public.teams for all to authenticated using(has_org_access(organization_id)) with check(has_org_access(organization_id));
create policy employees_org on public.employees for all to authenticated using(has_org_access(organization_id)) with check(has_org_access(organization_id));
create policy initiatives_org on public.initiatives for all to authenticated using(has_org_access(organization_id)) with check(has_org_access(organization_id));
create policy qbr_read on public.qbrs for select to authenticated using(has_qbr_access(id,false));
create policy qbr_write on public.qbrs for update to authenticated using(has_qbr_access(id,true));
create policy qbr_access_self on public.qbr_access for select to authenticated using(user_id=auth.uid());
create policy periods_access on public.qbr_periods for select to authenticated using(has_qbr_access(qbr_id,false));

do $$ declare t text; begin foreach t in array array['team_members','initiative_metrics','initiative_members','qbr_initiatives','qbr_initiative_members','qbr_initiative_risks','qbr_metrics','qbr_metric_initiatives','qbr_questions','qbr_decisions','ai_analyses'] loop execute format('create policy %I_authenticated on public.%I for select to authenticated using(true)',t,t); end loop; end $$;
grant execute on function public.add_initiative_to_qbr(uuid,uuid),public.remove_initiative_from_qbr(uuid,uuid),public.update_qbr_metric_values(uuid,numeric,numeric,metric_source_type),public.transition_qbr_status(uuid,qbr_status),public.create_future_qbr_period(uuid,int,int),public.get_qbr_ai_snapshot(uuid) to authenticated;
