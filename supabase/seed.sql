do $$
declare org uuid; direction uuid; goal uuid; team uuid; employee uuid; test_user uuid; qbr uuid;
begin
  insert into public.organizations(name) values('Группа Московская Биржа') returning id into org;
  insert into public.strategic_directions(organization_id,name,description,sort_order) values
    (org,'Развитие рынков капитала','Рост числа эмитентов, инструментов и ликвидности',1),
    (org,'Активное вовлечение конечного клиента','Персональные цифровые сервисы',2),
    (org,'Современные технологии','Надёжная технологическая и data-платформа',3),
    (org,'Международный доступ','Технологические связи и иностранные инструменты',4);
  select id into direction from public.strategic_directions where organization_id=org and name='Активное вовлечение конечного клиента';
  insert into public.strategic_goals(organization_id,direction_id,name,sort_order) values(org,direction,'Увеличить регулярное использование терминала',1) returning id into goal;
  insert into public.metrics(organization_id,goal_id,name,description,category,direction,unit,current_value,source_label) values(org,goal,'Активные пользователи терминала','Уникальные активные клиенты','strategic','increase','тыс.','52,4 тыс.','DWH');
  insert into public.teams(organization_id,name,department) values(org,'AI-агенты','Дирекция цифровых сервисов') returning id into team;
  insert into public.employees(organization_id,full_name,position,email) values(org,'Алексей Иванов','Владелец продукта','a.ivanov@moex.ru') returning id into employee;
  insert into public.team_members(team_id,employee_id,available_fte) values(team,employee,1);
  select id into test_user from auth.users where email='moex_test@qbr.local';
  if test_user is not null then
    insert into public.profiles(user_id,organization_id,display_name) values(test_user,org,'Алексей Иванов');
    insert into public.qbrs(organization_id,name,team_id,owner_employee_id) values(org,'Цифровые решения',team,employee) returning id into qbr;
    insert into public.qbr_access(qbr_id,user_id,access_role) values(qbr,test_user,'owner');
    insert into public.qbr_periods(qbr_id,year,quarter,status) values(qbr,2026,2,'results'),(qbr,2026,3,'preparation');
  end if;
end $$;
