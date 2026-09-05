--
-- PostgreSQL database dump
--

\restrict 363sa6g0dWwLGVjnxBYEcHbB4iaXrs48A3Ypd2xQcWcpAvSDZdSrc6gyG98jVbz

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: answer_type; Type: TYPE; Schema: public; Owner: pop_quizz_user
--

CREATE TYPE public.answer_type AS ENUM (
    'choice_label',
    'command_text',
    'text',
    'json_structure'
);


ALTER TYPE public.answer_type OWNER TO pop_quizz_user;

--
-- Name: contest_question_status; Type: TYPE; Schema: public; Owner: pop_quizz_user
--

CREATE TYPE public.contest_question_status AS ENUM (
    'waiting',
    'opened',
    'closed',
    'results'
);


ALTER TYPE public.contest_question_status OWNER TO pop_quizz_user;

--
-- Name: contest_status; Type: TYPE; Schema: public; Owner: pop_quizz_user
--

CREATE TYPE public.contest_status AS ENUM (
    'waiting',
    'running',
    'finished'
);


ALTER TYPE public.contest_status OWNER TO pop_quizz_user;

--
-- Name: question_category; Type: TYPE; Schema: public; Owner: pop_quizz_user
--

CREATE TYPE public.question_category AS ENUM (
    'culture_generale',
    'linux_command',
    'shell'
);


ALTER TYPE public.question_category OWNER TO pop_quizz_user;

--
-- Name: question_type; Type: TYPE; Schema: public; Owner: pop_quizz_user
--

CREATE TYPE public.question_type AS ENUM (
    'multiple_choice',
    'command',
    'fill_blank',
    'combination',
    'shell_code'
);


ALTER TYPE public.question_type OWNER TO pop_quizz_user;

--
-- Name: auto_close_expired_questions(); Type: FUNCTION; Schema: public; Owner: pop_quizz_user
--

CREATE FUNCTION public.auto_close_expired_questions() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE public.contest_question cq
    SET status = 'closed'::public.contest_question_status,
        closed_at = NOW()
    FROM public.question q
    WHERE cq.question_id = q.question_id
    AND cq.status = 'opened'::public.contest_question_status
    AND cq.opened_at IS NOT NULL
    AND EXTRACT(EPOCH FROM (NOW() - cq.opened_at)) > q.duration;
END;
$$;


ALTER FUNCTION public.auto_close_expired_questions() OWNER TO pop_quizz_user;

--
-- Name: clean_expired_challenges(); Type: FUNCTION; Schema: public; Owner: pop_quizz_user
--

CREATE FUNCTION public.clean_expired_challenges() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM public.two_factor_challenge
    WHERE expires_at < NOW()
    AND validated = false;
END;
$$;


ALTER FUNCTION public.clean_expired_challenges() OWNER TO pop_quizz_user;

--
-- Name: log_answer_event(); Type: FUNCTION; Schema: public; Owner: pop_quizz_user
--

CREATE FUNCTION public.log_answer_event() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO public.game_event_log (contest_id, event_type, event_data)
    SELECT 
        cq.contest_id,
        'answer_submitted',
        jsonb_build_object(
            'answer_id', NEW.answer_id,
            'player_id', NEW.player_id,
            'contest_question_id', NEW.contest_question_id,
            'is_correct', NEW.is_correct,
            'earned_points', NEW.earned_points,
            'first_blood', NEW.first_blood,
            'response_time', NEW.response_time
        )
    FROM public.contest_question cq
    WHERE cq.contest_question_id = NEW.contest_question_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_answer_event() OWNER TO pop_quizz_user;

--
-- Name: validate_question_open(); Type: FUNCTION; Schema: public; Owner: pop_quizz_user
--

CREATE FUNCTION public.validate_question_open() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_status public.contest_question_status;
BEGIN
    SELECT status INTO v_status
    FROM public.contest_question
    WHERE contest_question_id = NEW.contest_question_id;
    
    IF v_status != 'opened'::public.contest_question_status THEN
        RAISE EXCEPTION 'Question is not open (current status: %)', v_status;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_question_open() OWNER TO pop_quizz_user;

--
-- Name: validate_timeout(); Type: FUNCTION; Schema: public; Owner: pop_quizz_user
--

CREATE FUNCTION public.validate_timeout() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_opened_at timestamp without time zone;
    v_duration integer;
BEGIN
    SELECT q.duration, cq.opened_at
    INTO v_duration, v_opened_at
    FROM public.contest_question cq
    JOIN public.question q ON cq.question_id = q.question_id
    WHERE cq.contest_question_id = NEW.contest_question_id;
    
    IF v_opened_at IS NOT NULL AND EXTRACT(EPOCH FROM (NOW() - v_opened_at)) > v_duration THEN
        RAISE EXCEPTION 'Question timeout exceeded (duration: % seconds)', v_duration;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_timeout() OWNER TO pop_quizz_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: pop_quizz_user
--

CREATE TABLE public.admin (
    admin_id integer NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin OWNER TO pop_quizz_user;

--
-- Name: admin_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: pop_quizz_user
--

CREATE SEQUENCE public.admin_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_admin_id_seq OWNER TO pop_quizz_user;

--
-- Name: admin_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pop_quizz_user
--

ALTER SEQUENCE public.admin_admin_id_seq OWNED BY public.admin.admin_id;


--
-- Name: answer; Type: TABLE; Schema: public; Owner: pop_quizz_user
--

CREATE TABLE public.answer (
    answer_id integer NOT NULL,
    contest_question_id integer NOT NULL,
    player_id integer NOT NULL,
    answer_value jsonb NOT NULL,
    answer_type public.answer_type NOT NULL,
    is_correct boolean DEFAULT false,
    response_time numeric(6,2),
    first_blood boolean DEFAULT false,
    earned_points integer DEFAULT 0,
    submitted_at timestamp without time zone DEFAULT now(),
    CONSTRAINT answer_earned_points_positive CHECK ((earned_points >= 0)),
    CONSTRAINT answer_response_time_positive CHECK ((response_time >= (0)::numeric)),
    CONSTRAINT answer_value_valid CHECK ((((answer_type = 'choice_label'::public.answer_type) AND (jsonb_typeof(answer_value) = 'string'::text)) OR ((answer_type = 'command_text'::public.answer_type) AND (jsonb_typeof(answer_value) = 'string'::text)) OR ((answer_type = 'text'::public.answer_type) AND (jsonb_typeof(answer_value) = 'string'::text)) OR ((answer_type = 'json_structure'::public.answer_type) AND (jsonb_typeof(answer_value) = 'object'::text))))
);


ALTER TABLE public.answer OWNER TO pop_quizz_user;

--
-- Name: answer_answer_id_seq; Type: SEQUENCE; Schema: public; Owner: pop_quizz_user
--

CREATE SEQUENCE public.answer_answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.answer_answer_id_seq OWNER TO pop_quizz_user;

--
-- Name: answer_answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pop_quizz_user
--

ALTER SEQUENCE public.answer_answer_id_seq OWNED BY public.answer.answer_id;


--
-- Name: contest; Type: TABLE; Schema: public; Owner: pop_quizz_user
--

CREATE TABLE public.contest (
    contest_id integer NOT NULL,
    title character varying(255) NOT NULL,
    status public.contest_status DEFAULT 'waiting'::public.contest_status,
    created_by integer,
    total_questions integer DEFAULT 0,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT contest_time_check CHECK ((((status = 'waiting'::public.contest_status) AND (start_time IS NULL) AND (end_time IS NULL)) OR ((status = 'running'::public.contest_status) AND (start_time IS NOT NULL) AND (end_time IS NULL)) OR ((status = 'finished'::public.contest_status) AND (start_time IS NOT NULL) AND (end_time IS NOT NULL) AND (end_time > start_time)))),
    CONSTRAINT contest_total_questions_positive CHECK ((total_questions >= 0))
);


ALTER TABLE public.contest OWNER TO pop_quizz_user;

--
-- Name: contest_contest_id_seq; Type: SEQUENCE; Schema: public; Owner: pop_quizz_user
--

CREATE SEQUENCE public.contest_contest_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contest_contest_id_seq OWNER TO pop_quizz_user;

--
-- Name: contest_contest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pop_quizz_user
--

ALTER SEQUENCE public.contest_contest_id_seq OWNED BY public.contest.contest_id;


--
-- Name: contest_player; Type: TABLE; Schema: public; Owner: pop_quizz_user
--

CREATE TABLE public.contest_player (
    contest_player_id integer NOT NULL,
    contest_id integer NOT NULL,
    player_id integer NOT NULL,
    joined_at timestamp without time zone DEFAULT now(),
    is_connected boolean DEFAULT false,
    last_seen timestamp without time zone
);


ALTER TABLE public.contest_player OWNER TO pop_quizz_user;

--
-- Name: contest_player_contest_player_id_seq; Type: SEQUENCE; Schema: public; Owner: pop_quizz_user
--

CREATE SEQUENCE public.contest_player_contest_player_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contest_player_contest_player_id_seq OWNER TO pop_quizz_user;

--
-- Name: contest_player_contest_player_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pop_quizz_user
--

ALTER SEQUENCE public.contest_player_contest_player_id_seq OWNED BY public.contest_player.contest_player_id;


--
-- Name: contest_question; Type: TABLE; Schema: public; Owner: pop_quizz_user
--

CREATE TABLE public.contest_question (
    contest_question_id integer NOT NULL,
    contest_id integer NOT NULL,
    question_id integer NOT NULL,
    round_number integer NOT NULL,
    order_index integer NOT NULL,
    status public.contest_question_status DEFAULT 'waiting'::public.contest_question_status,
    opened_at timestamp without time zone,
    closed_at timestamp without time zone,
    CONSTRAINT contest_question_time_check CHECK ((((status = 'waiting'::public.contest_question_status) AND (opened_at IS NULL) AND (closed_at IS NULL)) OR ((status = 'opened'::public.contest_question_status) AND (opened_at IS NOT NULL) AND (closed_at IS NULL)) OR ((status = 'closed'::public.contest_question_status) AND (opened_at IS NOT NULL) AND (closed_at IS NOT NULL) AND (closed_at >= opened_at)) OR ((status = 'results'::public.contest_question_status) AND (opened_at IS NOT NULL) AND (closed_at IS NOT NULL))))
);


ALTER TABLE public.contest_question OWNER TO pop_quizz_user;

--
-- Name: contest_question_contest_question_id_seq; Type: SEQUENCE; Schema: public; Owner: pop_quizz_user
--

CREATE SEQUENCE public.contest_question_contest_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contest_question_contest_question_id_seq OWNER TO pop_quizz_user;

--
-- Name: contest_question_contest_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pop_quizz_user
--

ALTER SEQUENCE public.contest_question_contest_question_id_seq OWNED BY public.contest_question.contest_question_id;


--
-- Name: contest_session; Type: TABLE; Schema: public; Owner: pop_quizz_user
--

CREATE TABLE public.contest_session (
    session_id integer NOT NULL,
    contest_id integer NOT NULL,
    player_id integer NOT NULL,
    socket_id character varying(255) NOT NULL,
    connected_at timestamp without time zone DEFAULT now(),
    disconnected_at timestamp without time zone,
    CONSTRAINT session_time_check CHECK (((disconnected_at IS NULL) OR (disconnected_at >= connected_at)))
);


ALTER TABLE public.contest_session OWNER TO pop_quizz_user;

--
-- Name: contest_session_session_id_seq; Type: SEQUENCE; Schema: public; Owner: pop_quizz_user
--

CREATE SEQUENCE public.contest_session_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contest_session_session_id_seq OWNER TO pop_quizz_user;

--
-- Name: contest_session_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pop_quizz_user
--

ALTER SEQUENCE public.contest_session_session_id_seq OWNED BY public.contest_session.session_id;


--
-- Name: game_event_log; Type: TABLE; Schema: public; Owner: pop_quizz_user
--

CREATE TABLE public.game_event_log (
    event_id bigint NOT NULL,
    contest_id integer NOT NULL,
    event_type character varying(50) NOT NULL,
    event_data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.game_event_log OWNER TO pop_quizz_user;

--
-- Name: game_event_log_event_id_seq; Type: SEQUENCE; Schema: public; Owner: pop_quizz_user
--

CREATE SEQUENCE public.game_event_log_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_event_log_event_id_seq OWNER TO pop_quizz_user;

--
-- Name: game_event_log_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pop_quizz_user
--

ALTER SEQUENCE public.game_event_log_event_id_seq OWNED BY public.game_event_log.event_id;


--
-- Name: player; Type: TABLE; Schema: public; Owner: pop_quizz_user
--

CREATE TABLE public.player (
    player_id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(150),
    password_hash text,
    avatar_url text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT player_username_valid CHECK ((char_length((username)::text) >= 3))
);


ALTER TABLE public.player OWNER TO pop_quizz_user;

--
-- Name: player_player_id_seq; Type: SEQUENCE; Schema: public; Owner: pop_quizz_user
--

CREATE SEQUENCE public.player_player_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.player_player_id_seq OWNER TO pop_quizz_user;

--
-- Name: player_player_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pop_quizz_user
--

ALTER SEQUENCE public.player_player_id_seq OWNED BY public.player.player_id;


--
-- Name: question; Type: TABLE; Schema: public; Owner: pop_quizz_user
--

CREATE TABLE public.question (
    question_id integer NOT NULL,
    statement text NOT NULL,
    category public.question_category NOT NULL,
    type public.question_type NOT NULL,
    duration integer NOT NULL,
    points integer NOT NULL,
    explanation text,
    difficulty character varying(20) DEFAULT 'medium'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT question_duration_positive CHECK ((duration > 0)),
    CONSTRAINT question_points_positive CHECK ((points > 0))
);


ALTER TABLE public.question OWNER TO pop_quizz_user;

--
-- Name: question_choice; Type: TABLE; Schema: public; Owner: pop_quizz_user
--

CREATE TABLE public.question_choice (
    choice_id integer NOT NULL,
    question_id integer NOT NULL,
    label text NOT NULL,
    content text NOT NULL,
    is_correct boolean DEFAULT false,
    order_index integer NOT NULL
);


ALTER TABLE public.question_choice OWNER TO pop_quizz_user;

--
-- Name: question_choice_choice_id_seq; Type: SEQUENCE; Schema: public; Owner: pop_quizz_user
--

CREATE SEQUENCE public.question_choice_choice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_choice_choice_id_seq OWNER TO pop_quizz_user;

--
-- Name: question_choice_choice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pop_quizz_user
--

ALTER SEQUENCE public.question_choice_choice_id_seq OWNED BY public.question_choice.choice_id;


--
-- Name: question_question_id_seq; Type: SEQUENCE; Schema: public; Owner: pop_quizz_user
--

CREATE SEQUENCE public.question_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_question_id_seq OWNER TO pop_quizz_user;

--
-- Name: question_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pop_quizz_user
--

ALTER SEQUENCE public.question_question_id_seq OWNED BY public.question.question_id;


--
-- Name: two_factor_challenge; Type: TABLE; Schema: public; Owner: pop_quizz_user
--

CREATE TABLE public.two_factor_challenge (
    challenge_id integer NOT NULL,
    player_id integer NOT NULL,
    command text NOT NULL,
    expected_answer text NOT NULL,
    validated boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL,
    CONSTRAINT challenge_expiration_check CHECK ((expires_at > created_at))
);


ALTER TABLE public.two_factor_challenge OWNER TO pop_quizz_user;

--
-- Name: two_factor_challenge_challenge_id_seq; Type: SEQUENCE; Schema: public; Owner: pop_quizz_user
--

CREATE SEQUENCE public.two_factor_challenge_challenge_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.two_factor_challenge_challenge_id_seq OWNER TO pop_quizz_user;

--
-- Name: two_factor_challenge_challenge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pop_quizz_user
--

ALTER SEQUENCE public.two_factor_challenge_challenge_id_seq OWNED BY public.two_factor_challenge.challenge_id;


--
-- Name: v_contest_player_score; Type: VIEW; Schema: public; Owner: pop_quizz_user
--

CREATE VIEW public.v_contest_player_score AS
 SELECT cp.contest_id,
    cp.player_id,
    p.username,
    p.avatar_url,
    COALESCE(sum(a.earned_points), (0)::bigint) AS score,
    COALESCE(count(
        CASE
            WHEN a.is_correct THEN 1
            ELSE NULL::integer
        END), (0)::bigint) AS correct_answers,
    COALESCE(count(
        CASE
            WHEN (NOT a.is_correct) THEN 1
            ELSE NULL::integer
        END), (0)::bigint) AS wrong_answers,
    COALESCE(count(
        CASE
            WHEN a.first_blood THEN 1
            ELSE NULL::integer
        END), (0)::bigint) AS first_blood_count,
    COALESCE(avg(a.response_time), (0)::numeric) AS avg_response_time,
    rank() OVER (PARTITION BY cp.contest_id ORDER BY COALESCE(sum(a.earned_points), (0)::bigint) DESC, COALESCE(avg(a.response_time), (0)::numeric)) AS rank
   FROM ((public.contest_player cp
     JOIN public.player p ON ((cp.player_id = p.player_id)))
     LEFT JOIN public.answer a ON (((cp.player_id = a.player_id) AND (a.contest_question_id IN ( SELECT cq.contest_question_id
           FROM public.contest_question cq
          WHERE (cq.contest_id = cp.contest_id))))))
  GROUP BY cp.contest_id, cp.player_id, p.username, p.avatar_url;


ALTER VIEW public.v_contest_player_score OWNER TO pop_quizz_user;

--
-- Name: v_contest_question_stats; Type: VIEW; Schema: public; Owner: pop_quizz_user
--

CREATE VIEW public.v_contest_question_stats AS
 SELECT cq.contest_question_id,
    cq.contest_id,
    cq.question_id,
    cq.round_number,
    cq.order_index,
    cq.status,
    cq.opened_at,
    cq.closed_at,
    q.statement,
    q.points,
    q.duration,
    COALESCE(count(a.answer_id), (0)::bigint) AS total_answers,
    COALESCE(count(
        CASE
            WHEN a.is_correct THEN 1
            ELSE NULL::integer
        END), (0)::bigint) AS correct_answers,
    COALESCE(count(
        CASE
            WHEN a.first_blood THEN 1
            ELSE NULL::integer
        END), (0)::bigint) AS first_blood_count,
    COALESCE(avg(a.response_time), (0)::numeric) AS avg_response_time
   FROM ((public.contest_question cq
     JOIN public.question q ON ((cq.question_id = q.question_id)))
     LEFT JOIN public.answer a ON ((cq.contest_question_id = a.contest_question_id)))
  GROUP BY cq.contest_question_id, cq.contest_id, cq.question_id, cq.round_number, cq.order_index, cq.status, cq.opened_at, cq.closed_at, q.statement, q.points, q.duration;


ALTER VIEW public.v_contest_question_stats OWNER TO pop_quizz_user;

--
-- Name: v_player_score; Type: VIEW; Schema: public; Owner: pop_quizz_user
--

CREATE VIEW public.v_player_score AS
 SELECT p.player_id,
    p.username,
    p.email,
    p.avatar_url,
    COALESCE(sum(a.earned_points), (0)::bigint) AS score_total,
    COALESCE(count(
        CASE
            WHEN a.is_correct THEN 1
            ELSE NULL::integer
        END), (0)::bigint) AS total_correct,
    COALESCE(count(
        CASE
            WHEN (NOT a.is_correct) THEN 1
            ELSE NULL::integer
        END), (0)::bigint) AS total_wrong,
    COALESCE(avg(a.response_time), (0)::numeric) AS avg_response_time,
    COALESCE(count(a.answer_id), (0)::bigint) AS total_answers
   FROM (public.player p
     LEFT JOIN public.answer a ON ((p.player_id = a.player_id)))
  GROUP BY p.player_id, p.username, p.email, p.avatar_url;


ALTER VIEW public.v_player_score OWNER TO pop_quizz_user;

--
-- Name: admin admin_id; Type: DEFAULT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.admin ALTER COLUMN admin_id SET DEFAULT nextval('public.admin_admin_id_seq'::regclass);


--
-- Name: answer answer_id; Type: DEFAULT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.answer ALTER COLUMN answer_id SET DEFAULT nextval('public.answer_answer_id_seq'::regclass);


--
-- Name: contest contest_id; Type: DEFAULT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest ALTER COLUMN contest_id SET DEFAULT nextval('public.contest_contest_id_seq'::regclass);


--
-- Name: contest_player contest_player_id; Type: DEFAULT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_player ALTER COLUMN contest_player_id SET DEFAULT nextval('public.contest_player_contest_player_id_seq'::regclass);


--
-- Name: contest_question contest_question_id; Type: DEFAULT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_question ALTER COLUMN contest_question_id SET DEFAULT nextval('public.contest_question_contest_question_id_seq'::regclass);


--
-- Name: contest_session session_id; Type: DEFAULT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_session ALTER COLUMN session_id SET DEFAULT nextval('public.contest_session_session_id_seq'::regclass);


--
-- Name: game_event_log event_id; Type: DEFAULT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.game_event_log ALTER COLUMN event_id SET DEFAULT nextval('public.game_event_log_event_id_seq'::regclass);


--
-- Name: player player_id; Type: DEFAULT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.player ALTER COLUMN player_id SET DEFAULT nextval('public.player_player_id_seq'::regclass);


--
-- Name: question question_id; Type: DEFAULT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.question ALTER COLUMN question_id SET DEFAULT nextval('public.question_question_id_seq'::regclass);


--
-- Name: question_choice choice_id; Type: DEFAULT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.question_choice ALTER COLUMN choice_id SET DEFAULT nextval('public.question_choice_choice_id_seq'::regclass);


--
-- Name: two_factor_challenge challenge_id; Type: DEFAULT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.two_factor_challenge ALTER COLUMN challenge_id SET DEFAULT nextval('public.two_factor_challenge_challenge_id_seq'::regclass);


--
-- Name: admin admin_email_key; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_email_key UNIQUE (email);


--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (admin_id);


--
-- Name: answer answer_pkey; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_pkey PRIMARY KEY (answer_id);


--
-- Name: answer answer_unique; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_unique UNIQUE (contest_question_id, player_id);


--
-- Name: contest contest_pkey; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest
    ADD CONSTRAINT contest_pkey PRIMARY KEY (contest_id);


--
-- Name: contest_player contest_player_pkey; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_player
    ADD CONSTRAINT contest_player_pkey PRIMARY KEY (contest_player_id);


--
-- Name: contest_player contest_player_unique; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_player
    ADD CONSTRAINT contest_player_unique UNIQUE (contest_id, player_id);


--
-- Name: contest_question contest_question_pkey; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_question
    ADD CONSTRAINT contest_question_pkey PRIMARY KEY (contest_question_id);


--
-- Name: contest_session contest_session_pkey; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_session
    ADD CONSTRAINT contest_session_pkey PRIMARY KEY (session_id);


--
-- Name: player player_email_key; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_email_key UNIQUE (email);


--
-- Name: player player_pkey; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_pkey PRIMARY KEY (player_id);


--
-- Name: player player_username_key; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_username_key UNIQUE (username);


--
-- Name: question_choice question_choice_pkey; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.question_choice
    ADD CONSTRAINT question_choice_pkey PRIMARY KEY (choice_id);


--
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (question_id);


--
-- Name: two_factor_challenge two_factor_challenge_pkey; Type: CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.two_factor_challenge
    ADD CONSTRAINT two_factor_challenge_pkey PRIMARY KEY (challenge_id);


--
-- Name: idx_answer_contest_question; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_answer_contest_question ON public.answer USING btree (contest_question_id);


--
-- Name: idx_answer_contest_question_player; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_answer_contest_question_player ON public.answer USING btree (contest_question_id, player_id);


--
-- Name: idx_answer_player; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_answer_player ON public.answer USING btree (player_id);


--
-- Name: idx_answer_submitted; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_answer_submitted ON public.answer USING btree (submitted_at);


--
-- Name: idx_contest_player_contest; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_contest_player_contest ON public.contest_player USING btree (contest_id);


--
-- Name: idx_contest_player_player; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_contest_player_player ON public.contest_player USING btree (player_id);


--
-- Name: idx_contest_question_contest; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_contest_question_contest ON public.contest_question USING btree (contest_id);


--
-- Name: idx_contest_question_order; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_contest_question_order ON public.contest_question USING btree (order_index);


--
-- Name: idx_contest_question_status; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_contest_question_status ON public.contest_question USING btree (status);


--
-- Name: idx_contest_session_contest; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_contest_session_contest ON public.contest_session USING btree (contest_id);


--
-- Name: idx_contest_status; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_contest_status ON public.contest USING btree (status);


--
-- Name: idx_game_event_log_contest; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_game_event_log_contest ON public.game_event_log USING btree (contest_id);


--
-- Name: idx_game_event_log_created; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_game_event_log_created ON public.game_event_log USING btree (created_at);


--
-- Name: idx_question_category; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_question_category ON public.question USING btree (category);


--
-- Name: idx_question_choice_question; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_question_choice_question ON public.question_choice USING btree (question_id);


--
-- Name: idx_question_type; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_question_type ON public.question USING btree (type);


--
-- Name: idx_two_factor_challenge_expires; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_two_factor_challenge_expires ON public.two_factor_challenge USING btree (expires_at);


--
-- Name: idx_two_factor_challenge_player; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE INDEX idx_two_factor_challenge_player ON public.two_factor_challenge USING btree (player_id);


--
-- Name: unique_first_blood_per_question; Type: INDEX; Schema: public; Owner: pop_quizz_user
--

CREATE UNIQUE INDEX unique_first_blood_per_question ON public.answer USING btree (contest_question_id) WHERE (first_blood = true);


--
-- Name: answer trigger_log_answer_event; Type: TRIGGER; Schema: public; Owner: pop_quizz_user
--

CREATE TRIGGER trigger_log_answer_event AFTER INSERT ON public.answer FOR EACH ROW EXECUTE FUNCTION public.log_answer_event();


--
-- Name: answer trigger_validate_question_open; Type: TRIGGER; Schema: public; Owner: pop_quizz_user
--

CREATE TRIGGER trigger_validate_question_open BEFORE INSERT ON public.answer FOR EACH ROW EXECUTE FUNCTION public.validate_question_open();


--
-- Name: answer trigger_validate_timeout; Type: TRIGGER; Schema: public; Owner: pop_quizz_user
--

CREATE TRIGGER trigger_validate_timeout BEFORE INSERT ON public.answer FOR EACH ROW EXECUTE FUNCTION public.validate_timeout();


--
-- Name: answer fk_answer_contest_question; Type: FK CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT fk_answer_contest_question FOREIGN KEY (contest_question_id) REFERENCES public.contest_question(contest_question_id) ON DELETE CASCADE;


--
-- Name: answer fk_answer_player; Type: FK CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT fk_answer_player FOREIGN KEY (player_id) REFERENCES public.player(player_id) ON DELETE CASCADE;


--
-- Name: contest fk_contest_admin; Type: FK CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest
    ADD CONSTRAINT fk_contest_admin FOREIGN KEY (created_by) REFERENCES public.admin(admin_id);


--
-- Name: contest_player fk_contest_player_contest; Type: FK CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_player
    ADD CONSTRAINT fk_contest_player_contest FOREIGN KEY (contest_id) REFERENCES public.contest(contest_id) ON DELETE CASCADE;


--
-- Name: contest_player fk_contest_player_player; Type: FK CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_player
    ADD CONSTRAINT fk_contest_player_player FOREIGN KEY (player_id) REFERENCES public.player(player_id) ON DELETE CASCADE;


--
-- Name: contest_question fk_contest_question_contest; Type: FK CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_question
    ADD CONSTRAINT fk_contest_question_contest FOREIGN KEY (contest_id) REFERENCES public.contest(contest_id) ON DELETE CASCADE;


--
-- Name: contest_question fk_contest_question_question; Type: FK CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_question
    ADD CONSTRAINT fk_contest_question_question FOREIGN KEY (question_id) REFERENCES public.question(question_id);


--
-- Name: contest_session fk_contest_session_contest; Type: FK CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_session
    ADD CONSTRAINT fk_contest_session_contest FOREIGN KEY (contest_id) REFERENCES public.contest(contest_id);


--
-- Name: contest_session fk_contest_session_player; Type: FK CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.contest_session
    ADD CONSTRAINT fk_contest_session_player FOREIGN KEY (player_id) REFERENCES public.player(player_id);


--
-- Name: game_event_log fk_game_event_log_contest; Type: FK CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.game_event_log
    ADD CONSTRAINT fk_game_event_log_contest FOREIGN KEY (contest_id) REFERENCES public.contest(contest_id) ON DELETE CASCADE;


--
-- Name: question_choice fk_question_choice_question; Type: FK CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.question_choice
    ADD CONSTRAINT fk_question_choice_question FOREIGN KEY (question_id) REFERENCES public.question(question_id) ON DELETE CASCADE;


--
-- Name: two_factor_challenge fk_two_factor_challenge_player; Type: FK CONSTRAINT; Schema: public; Owner: pop_quizz_user
--

ALTER TABLE ONLY public.two_factor_challenge
    ADD CONSTRAINT fk_two_factor_challenge_player FOREIGN KEY (player_id) REFERENCES public.player(player_id);


--
-- PostgreSQL database dump complete
--

\unrestrict 363sa6g0dWwLGVjnxBYEcHbB4iaXrs48A3Ypd2xQcWcpAvSDZdSrc6gyG98jVbz

