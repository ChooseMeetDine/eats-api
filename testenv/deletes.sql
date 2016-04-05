-- Insert Users
BEGIN;
DELETE FROM "vote"
  WHERE id = 1118
  OR id = 1128
  OR id = 1138;

DELETE FROM "restaurant_update_categories"
  WHERE restaurant_update_id = 1117;

DELETE FROM "restaurant_update"
  WHERE id = 1117
  OR id = 1127;

DELETE FROM "restaurant_polls"
  WHERE restaurant_id = 1111
  OR restaurant_id = 1121
  OR restaurant_id = 1131
  OR restaurant_id = 1141;

DELETE FROM "rating"
  WHERE id = 1116
  OR id = 1126;

DELETE FROM "poll_users"
  WHERE user_id = 1110
  OR user_id = 1120
  OR user_id = 1130
  OR user_id = 1140;

DELETE FROM "poll"
  WHERE name = 'thetestpoll1'
  OR name = 'thetestpoll2';

DELETE FROM "group_users"
  WHERE user_id = 1110
  OR user_id = 1120
  OR user_id = 1130
  OR user_id = 1140;

DELETE FROM "group"
  WHERE name = 'thetestgroup1'
  OR name = 'thetestgroup2';

DELETE FROM "restaurant_categories"
  WHERE restaurant_id = 1111
  OR restaurant_id = 1121
  OR restaurant_id = 1131
  OR restaurant_id = 1141
  OR restaurant_id = 1151;


DELETE FROM "category" WHERE type = 'testcategory';
DELETE FROM "restaurant" WHERE lat = 123.1;
DELETE FROM "user" WHERE phone = 'testdata';
COMMIT;
-- End of file.
