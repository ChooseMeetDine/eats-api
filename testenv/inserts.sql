-- Insert Users
BEGIN;
INSERT INTO public."user" (id, name, email, password, last_login, registration_date, admin, phone, anon)
VALUES(1110, 'konny', 'konny@mail.se', 'password123', now(), now(), false, 'testdata', false),
      (1120, 'jenny', 'jenny@mail.se', 'password123', now(), now(), true, 'testdata', false),
      (1130, 'benny', 'benny@mail.se', 'password123', now(), now(), false, 'testdata', false),
      (1140, 'kenny', 'kenny@mail.se', 'password123', now(), now(), true, 'testdata', false),
      (1150, 'admin', 'admin@admin.se', 'password123', now(), now(), true, 'testdata', false),
      (1160, 'anon', 'anon@mail.se', 'password123', now(), now(), false, 'testdata', true);

INSERT INTO public.restaurant (id, name, lat, lng, creator_id, created, price_rate, temporary, status)
VALUES(1111, 'Tusen och 22', 123.1, 124.5, 1110, now(), 1, false, 'accepted'),
      (1121, 'Surf chakk', 123.1, 124.5, 1130, now(), 2, false, 'accepted'),
      (1131, 'Kaffestället', 123.1, 124.5, 1130, now(), 5, false, 'accepted'),
      (1141, 'Det där stället med bra mat!', 123.1, 125.6, 1140, now(), 2, false, 'accepted'),
      (1151, 'Wiggos bar', 123.1, 125.6, 1120, now(), 3, false, 'accepted');


INSERT INTO public.category (id, type)
VALUES(1113, 'testcategory'),
      (1123, 'testcategory'),
      (1133, 'testcategory'),
      (1143, 'testcategory'),
      (1153, 'testcategory');

INSERT INTO public.restaurant_categories (category_id, restaurant_id)
VALUES(1113,1111),
      (1113,1121),
      (1123,1131),
      (1133,1141),
      (1143,1151),
      (1153,1151);

INSERT INTO public."group" (id, creator_id, created, name)
VALUES(1114, 1110, now(), 'thetestgroup1'),
      (1124, 1130, now(), 'thetestgroup2');

INSERT INTO public.group_users (group_id, user_id)
VALUES(1114, 1110),
      (1114, 1120),
      (1124, 1120),
      (1124, 1110),
      (1124, 1140);

INSERT INTO public.poll (id, creator_id, name, created, expires, group_id, allow_new_restaurants)
VALUES(1115, 1110, 'thetestpoll1', now(), now(), null, false),
      (1125, 1130, 'thetestpoll2', now(), now(), 1124, false);


INSERT INTO public.poll_users (user_id, poll_id, joined)
VALUES(1110, 1115, now()),
      (1120, 1115, now()),
      (1120, 1125, now()),
      (1130, 1125, now()),
      (1140, 1125, now());


INSERT INTO public.rating (id, rating, restaurant_id, rater_id, created)
VALUES(1116, 5,1111,1110,now()),
      (1126, 1,1141,1120,now());

INSERT INTO public.restaurant_polls (restaurant_id, poll_id)
VALUES(1111,1115),
      (1121,1115),
      (1141,1125),
      (1131,1125);

INSERT INTO public.restaurant_update (id, restaurant_id, user_id, name, reason, status, created, status_changed)
VALUES(1117, 1111, 1110, 'Tusen och 23', 'testupdate', 'PENDING', now(), now()),
      (1127, 1121, 1110, 'Turf Smack', 'testuppdate', 'PENDING', now(), now());


INSERT INTO public.restaurant_update_categories (restaurant_update_id, category_id)
VALUES(1117, 1133);

INSERT INTO public.vote (id, user_id, poll_id, restaurant_id, created, updated)
VALUES(1118, 1110,1115,1111,now(),now()),
      (1128, 1120,1115,1121,now(),now()),
      (1138, 1130,1125,1141,now(),now());
COMMIT;
-- End of file.
