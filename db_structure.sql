--
-- PostgreSQL database structure dump (no data) 2016-05-09
--

-- sequences
CREATE SEQUENCE public.global_id_seq;

--     NUMBER SIZES:
--     4294967295 (2^32-1)
--     9007199254740992 (javascript 2^53)
--     1125899906842624 (2^50)
--     2147483647 (int postgres)
--     9223372036854775807 (bigint postgres)

-- creates a pseudo_encrypt-function that outputs 2^50-size-values (smaller than Javascripts max int)
CREATE OR REPLACE FUNCTION pseudo_encrypt50(VALUE bigint) returns bigint
 AS $$
DECLARE
  l1 bigint;
  l2 bigint;
  r1 bigint;
  r2 bigint;
  i int:=0;
  b25 int:=(1<<25)-1; -- 25 bits mask for a half-number => 50 bits total
BEGIN
  l1:= (VALUE >> (64-25)) & b25;
  r1:= VALUE & b25;
  WHILE i < 3 LOOP
    l2 := r1;
    r2 := l1 # (((((1366*r1+150889)%714025)/714025.0)*32767*32767)::int & b25);
    l1 := l2;
    r1 := r2;
    i := i + 1;
  END LOOP;
  RETURN ((l1::bigint << 25) + r1);
END;
$$ LANGUAGE plpgsql strict immutable;



SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

--
-- Name: restaurant_status; Type: TYPE; Schema: public; Owner: eats
--

CREATE TYPE restaurant_status AS ENUM (
    'unexamined',
    'accepted',
    'denied'
);


ALTER TYPE public.restaurant_status OWNER TO eats;

--
-- Name: clone_schema(text, text); Type: FUNCTION; Schema: public; Owner: eats
--

CREATE FUNCTION clone_schema(source_schema text, dest_schema text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE 
  objeto text;
  buffer text;
BEGIN
    EXECUTE 'CREATE SCHEMA ' || dest_schema ;
 
    FOR objeto IN
        SELECT TABLE_NAME::text FROM information_schema.TABLES WHERE table_schema = source_schema
    LOOP        
        buffer := dest_schema || '.' || objeto;
        EXECUTE 'CREATE TABLE ' || buffer || ' (LIKE ' || source_schema || '.' || objeto || ' INCLUDING CONSTRAINTS INCLUDING INDEXES INCLUDING DEFAULTS)';
    END LOOP;
 
END;
$$;


ALTER FUNCTION public.clone_schema(source_schema text, dest_schema text) OWNER TO eats;

--
-- Name: pseudo_encrypt50(bigint); Type: FUNCTION; Schema: public; Owner: eats
--

CREATE FUNCTION pseudo_encrypt50(value bigint) RETURNS bigint
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
  l1 bigint;
  l2 bigint;
  r1 bigint;
  r2 bigint;
  i int:=0;
  b25 int:=(1<<25)-1; -- 25 bits mask for a half-number => 50 bits total
BEGIN
  l1:= (VALUE >> (64-25)) & b25;
  r1:= VALUE & b25;
  WHILE i < 3 LOOP
    l2 := r1;
    r2 := l1 # (((((1366*r1+150889)%714025)/714025.0)*32767*32767)::int & b25);
    l1 := l2;
    r1 := r2;
    i := i + 1;
  END LOOP;
  RETURN ((l1::bigint << 25) + r1);
END;
$$;


ALTER FUNCTION public.pseudo_encrypt50(value bigint) OWNER TO eats;

--
-- Name: global_id_seq; Type: SEQUENCE; Schema: public; Owner: eats
--

CREATE SEQUENCE global_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.global_id_seq OWNER TO eats;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: category; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE category (
    id bigint DEFAULT pseudo_encrypt50(nextval('global_id_seq'::regclass)) NOT NULL,
    type character varying(255) NOT NULL
);


ALTER TABLE public.category OWNER TO eats;

--
-- Name: group; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE "group" (
    id bigint DEFAULT pseudo_encrypt50(nextval('global_id_seq'::regclass)) NOT NULL,
    creator_id bigint NOT NULL,
    created timestamp with time zone NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public."group" OWNER TO eats;

--
-- Name: group_users; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE group_users (
    user_id bigint NOT NULL,
    group_id bigint NOT NULL
);


ALTER TABLE public.group_users OWNER TO eats;

--
-- Name: poll; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE poll (
    id bigint DEFAULT pseudo_encrypt50(nextval('global_id_seq'::regclass)) NOT NULL,
    creator_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    created timestamp with time zone NOT NULL,
    expires timestamp with time zone NOT NULL,
    group_id bigint,
    allow_new_restaurants boolean DEFAULT true NOT NULL
);


ALTER TABLE public.poll OWNER TO eats;

--
-- Name: poll_users; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE poll_users (
    user_id bigint NOT NULL,
    poll_id bigint NOT NULL,
    joined timestamp with time zone NOT NULL
);


ALTER TABLE public.poll_users OWNER TO eats;

--
-- Name: rating; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE rating (
    id bigint DEFAULT pseudo_encrypt50(nextval('global_id_seq'::regclass)) NOT NULL,
    rating smallint NOT NULL,
    restaurant_id bigint NOT NULL,
    rater_id bigint NOT NULL,
    created timestamp with time zone NOT NULL
);


ALTER TABLE public.rating OWNER TO eats;

--
-- Name: restaurant; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE restaurant (
    id bigint DEFAULT pseudo_encrypt50(nextval('global_id_seq'::regclass)) NOT NULL,
    name character varying(255) NOT NULL,
    lng numeric(10,7),
    info text,
    photo character varying(1000),
    number_votes integer DEFAULT 0 NOT NULL,
    number_won_votes integer DEFAULT 0 NOT NULL,
    creator_id bigint NOT NULL,
    temporary boolean NOT NULL,
    created timestamp with time zone NOT NULL,
    price_rate integer,
    lat numeric(10,7),
    status restaurant_status DEFAULT 'unexamined'::restaurant_status
);


ALTER TABLE public.restaurant OWNER TO eats;

--
-- Name: restaurant_categories; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE restaurant_categories (
    category_id bigint NOT NULL,
    restaurant_id bigint NOT NULL
);


ALTER TABLE public.restaurant_categories OWNER TO eats;

--
-- Name: restaurant_polls; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE restaurant_polls (
    restaurant_id bigint NOT NULL,
    poll_id bigint NOT NULL
);


ALTER TABLE public.restaurant_polls OWNER TO eats;

--
-- Name: restaurant_update; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE restaurant_update (
    id bigint DEFAULT pseudo_encrypt50(nextval('global_id_seq'::regclass)) NOT NULL,
    restaurant_id bigint NOT NULL,
    user_id bigint NOT NULL,
    name character varying(255),
    lat numeric(53,50),
    lng numeric(53,50),
    reason text NOT NULL,
    status character varying(255),
    created timestamp with time zone NOT NULL,
    status_changed timestamp with time zone NOT NULL
);


ALTER TABLE public.restaurant_update OWNER TO eats;

--
-- Name: restaurant_update_categories; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE restaurant_update_categories (
    restaurant_update_id bigint NOT NULL,
    category_id bigint NOT NULL
);


ALTER TABLE public.restaurant_update_categories OWNER TO eats;

--
-- Name: status; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE status (
    status character varying(255) NOT NULL
);


ALTER TABLE public.status OWNER TO eats;

--
-- Name: user; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE "user" (
    id bigint DEFAULT pseudo_encrypt50(nextval('global_id_seq'::regclass)) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    photo character varying(1000),
    password character varying(1000),
    last_login timestamp with time zone NOT NULL,
    registration_date timestamp with time zone NOT NULL,
    admin boolean DEFAULT false NOT NULL,
    phone character varying(30),
    anon boolean DEFAULT false NOT NULL
);


ALTER TABLE public."user" OWNER TO eats;

--
-- Name: vote; Type: TABLE; Schema: public; Owner: eats; Tablespace: 
--

CREATE TABLE vote (
    id bigint DEFAULT pseudo_encrypt50(nextval('global_id_seq'::regclass)) NOT NULL,
    user_id bigint NOT NULL,
    poll_id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    created timestamp with time zone NOT NULL,
    updated timestamp with time zone NOT NULL
);


ALTER TABLE public.vote OWNER TO eats;

--
-- Name: category_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY category
    ADD CONSTRAINT category_pk PRIMARY KEY (id);


--
-- Name: group_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY "group"
    ADD CONSTRAINT group_pk PRIMARY KEY (id);


--
-- Name: group_users_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY group_users
    ADD CONSTRAINT group_users_pk PRIMARY KEY (user_id, group_id);


--
-- Name: poll_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY poll
    ADD CONSTRAINT poll_pk PRIMARY KEY (id);


--
-- Name: poll_users_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY poll_users
    ADD CONSTRAINT poll_users_pk PRIMARY KEY (user_id, poll_id);


--
-- Name: rating_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY rating
    ADD CONSTRAINT rating_pk PRIMARY KEY (id);


--
-- Name: restaurant_categories_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY restaurant_categories
    ADD CONSTRAINT restaurant_categories_pk PRIMARY KEY (category_id, restaurant_id);


--
-- Name: restaurant_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY restaurant
    ADD CONSTRAINT restaurant_pk PRIMARY KEY (id);


--
-- Name: restaurant_polls_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY restaurant_polls
    ADD CONSTRAINT restaurant_polls_pk PRIMARY KEY (restaurant_id, poll_id);


--
-- Name: restaurant_update_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY restaurant_update
    ADD CONSTRAINT restaurant_update_pk PRIMARY KEY (id);


--
-- Name: status_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY status
    ADD CONSTRAINT status_pk PRIMARY KEY (status);


--
-- Name: user_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY "user"
    ADD CONSTRAINT user_pk PRIMARY KEY (id);


--
-- Name: vote_pk; Type: CONSTRAINT; Schema: public; Owner: eats; Tablespace: 
--

ALTER TABLE ONLY vote
    ADD CONSTRAINT vote_pk PRIMARY KEY (id);


--
-- Name: category_map_category; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY restaurant_categories
    ADD CONSTRAINT category_map_category FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE;


--
-- Name: category_map_restaurant; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY restaurant_categories
    ADD CONSTRAINT category_map_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) ON DELETE CASCADE;


--
-- Name: copy_of_restaurant_categories_category; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY restaurant_update_categories
    ADD CONSTRAINT copy_of_restaurant_categories_category FOREIGN KEY (category_id) REFERENCES category(id);


--
-- Name: copy_of_restaurant_categories_restaurant_updates; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY restaurant_update_categories
    ADD CONSTRAINT copy_of_restaurant_categories_restaurant_updates FOREIGN KEY (restaurant_update_id) REFERENCES restaurant_update(id);


--
-- Name: group_user; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY "group"
    ADD CONSTRAINT group_user FOREIGN KEY (creator_id) REFERENCES "user"(id);


--
-- Name: group_users_group; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY group_users
    ADD CONSTRAINT group_users_group FOREIGN KEY (group_id) REFERENCES "group"(id) ON DELETE CASCADE;


--
-- Name: group_users_user; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY group_users
    ADD CONSTRAINT group_users_user FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: poll_group; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY poll
    ADD CONSTRAINT poll_group FOREIGN KEY (group_id) REFERENCES "group"(id);


--
-- Name: poll_user; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY poll
    ADD CONSTRAINT poll_user FOREIGN KEY (creator_id) REFERENCES "user"(id);


--
-- Name: poll_users_poll; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY poll_users
    ADD CONSTRAINT poll_users_poll FOREIGN KEY (poll_id) REFERENCES poll(id) ON DELETE CASCADE;


--
-- Name: poll_users_user; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY poll_users
    ADD CONSTRAINT poll_users_user FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: rate_restaurant; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY rating
    ADD CONSTRAINT rate_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rate_user; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY rating
    ADD CONSTRAINT rate_user FOREIGN KEY (rater_id) REFERENCES "user"(id);


--
-- Name: restaurant_polls_poll; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY restaurant_polls
    ADD CONSTRAINT restaurant_polls_poll FOREIGN KEY (poll_id) REFERENCES poll(id) ON DELETE CASCADE;


--
-- Name: restaurant_polls_restaurant; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY restaurant_polls
    ADD CONSTRAINT restaurant_polls_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) ON DELETE CASCADE;


--
-- Name: restaurant_updates_restaurant; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY restaurant_update
    ADD CONSTRAINT restaurant_updates_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurant(id);


--
-- Name: restaurant_updates_status; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY restaurant_update
    ADD CONSTRAINT restaurant_updates_status FOREIGN KEY (status) REFERENCES status(status);


--
-- Name: restaurant_updates_user; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY restaurant_update
    ADD CONSTRAINT restaurant_updates_user FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- Name: restaurant_user; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY restaurant
    ADD CONSTRAINT restaurant_user FOREIGN KEY (creator_id) REFERENCES "user"(id);


--
-- Name: vote_poll; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY vote
    ADD CONSTRAINT vote_poll FOREIGN KEY (poll_id) REFERENCES poll(id);


--
-- Name: vote_restaurant; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY vote
    ADD CONSTRAINT vote_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurant(id);


--
-- Name: vote_user; Type: FK CONSTRAINT; Schema: public; Owner: eats
--

ALTER TABLE ONLY vote
    ADD CONSTRAINT vote_user FOREIGN KEY (user_id) REFERENCES "user"(id);


--
-- PostgreSQL database dump complete
--


