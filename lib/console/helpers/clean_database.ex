# \copy (select name, inserted_at from organizations order by name asc) to 'Desktop/test.csv'
#
# delete from memberships where organization_id in (select id from organizations where name like '"%')
# delete from invitations where organization_id in (select id from organizations where name = 'alltechsquad')
# delete from channels_labels where channel_id in (select id from channels where organization_id in (select id from organizations where name like 'aaa%'))
# delete from channels where organization_id in (select id from organizations where name like 'aaa%')
# delete from devices_labels where label_id in (select id from labels where organization_id in (select id from organizations where name like 'aaa%'))
# delete from events where device_id in (select id from devices where organization_id in (select id from organizations where name like 'aaa%'))
# delete from labels where organization_id in (select id from organizations where name like 'aaa%')
# delete from api_keys where organization_id in (select id from organizations where name like 'aaa%')
# delete from organizations where name = 'admin'
#
#
# delete from twofactors where user_id in (select id from users where id not in (select user_id from memberships union select inviter_id from invitations))
# delete from users where id not in (select user_id from memberships union select inviter_id from invitations)
