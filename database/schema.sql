--
-- PostgreSQL database dump
--

\restrict Keis0AwFpNLzFKiC7v7mzXoDfTomZ1Lof01VYasIwyrXwrTWvw63TOF9UwBDvKt

-- Dumped from database version 17.9 (Debian 17.9-0+deb13u1)
-- Dumped by pg_dump version 17.9 (Debian 17.9-0+deb13u1)

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

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE public.question_category AS ENUM (
    'culture_generale',
    'linux',
    'shell'
);

CREATE TYPE public.question_type AS ENUM (
    'multiple_choice',
    'command',
    'fill_blank',
    'combination',
    'shell_code'
);

CREATE TYPE public.contest_status AS ENUM (
    'waiting',
    'running',
    'finished'
);

CREATE TYPE public.contest_question_status AS ENUM (
    'waiting',
    'opened',
    'closed',
    'results'
);

CREATE TYPE public.answer_type AS ENUM (
    'choice_label',
    'command_text',
    'text',
    'json_structure'
);

SET default_tablespace = '';

SET default_table_access_method = heap;

-- =====================================================
-- ADMIN
-- =====================================================

CREATE TABLE public.admin (
    admin_id integer NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.admin OWNER TO postgres;

CREATE SEQUENCE public.admin_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.admin_admin_id_seq OWNER TO postgres;

ALTER SEQUENCE public.admin_admin_id_seq OWNED BY public.admin.admin_id;

-- =====================================================
-- PLAYER
-- =====================================================

CREATE TABLE public.player (
    player_id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(150),
    password_hash text,
    avatar_url text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT player_username_valid CHECK (char_length(username) >= 3)
);

ALTER TABLE public.player OWNER TO postgres;

CREATE SEQUENCE public.player_player_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.player_player_id_seq OWNER TO postgres;

ALTER SEQUENCE public.player_player_id_seq OWNED BY public.player.player_id;

-- =====================================================
-- QUESTION
-- =====================================================

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
    CONSTRAINT question_duration_positive CHECK (duration > 0),
    CONSTRAINT question_points_positive CHECK (points > 0)
);

ALTER TABLE public.question OWNER TO postgres;

CREATE SEQUENCE public.question_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.question_question_id_seq OWNER TO postgres;

ALTER SEQUENCE public.question_question_id_seq OWNED BY public.question.question_id;

-- =====================================================
-- CHOIX DE REPONSE (QCM)
-- =====================================================

CREATE TABLE public.question_choice (
    choice_id integer NOT NULL,
    question_id integer NOT NULL,
    label text NOT NULL,
    content text NOT NULL,
    is_correct boolean DEFAULT false,
    order_index integer NOT NULL
);

ALTER TABLE public.question_choice OWNER TO postgres;

CREATE SEQUENCE public.question_choice_choice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.question_choice_choice_id_seq OWNER TO postgres;

ALTER SEQUENCE public.question_choice_choice_id_seq OWNED BY public.question_choice.choice_id;

-- =====================================================
-- CONTEST
-- =====================================================

CREATE TABLE public.contest (
    contest_id integer NOT NULL,
    title character varying(255) NOT NULL,
    status public.contest_status DEFAULT 'waiting'::public.contest_status,
    created_by integer,
    total_questions integer DEFAULT 0,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT contest_time_check CHECK (
        (status = 'waiting'::public.contest_status AND start_time IS NULL AND end_time IS NULL) OR
        (status = 'running'::public.contest_status AND start_time IS NOT NULL AND end_time IS NULL) OR
        (status = 'finished'::public.contest_status AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
    ),
    CONSTRAINT contest_total_questions_positive CHECK (total_questions >= 0)
);

ALTER TABLE public.contest OWNER TO postgres;

CREATE SEQUENCE public.contest_contest_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.contest_contest_id_seq OWNER TO postgres;

ALTER SEQUENCE public.contest_contest_id_seq OWNED BY public.contest.contest_id;

-- =====================================================
-- PARTICIPANTS
-- =====================================================

CREATE TABLE public.contest_player (
    contest_player_id integer NOT NULL,
    contest_id integer NOT NULL,
    player_id integer NOT NULL,
    joined_at timestamp without time zone DEFAULT now(),
    is_connected boolean DEFAULT false,
    last_seen timestamp without time zone
);

ALTER TABLE public.contest_player OWNER TO postgres;

CREATE SEQUENCE public.contest_player_contest_player_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.contest_player_contest_player_id_seq OWNER TO postgres;

ALTER SEQUENCE public.contest_player_contest_player_id_seq OWNED BY public.contest_player.contest_player_id;

-- =====================================================
-- QUESTIONS DU CONTEST
-- =====================================================

CREATE TABLE public.contest_question (
    contest_question_id integer NOT NULL,
    contest_id integer NOT NULL,
    question_id integer NOT NULL,
    round_number integer NOT NULL,
    order_index integer NOT NULL,
    status public.contest_question_status DEFAULT 'waiting'::public.contest_question_status,
    opened_at timestamp without time zone,
    closed_at timestamp without time zone,
    CONSTRAINT contest_question_time_check CHECK (
        (status = 'waiting'::public.contest_question_status AND opened_at IS NULL AND closed_at IS NULL) OR
        (status = 'opened'::public.contest_question_status AND opened_at IS NOT NULL AND closed_at IS NULL) OR
        (status = 'closed'::public.contest_question_status AND opened_at IS NOT NULL AND closed_at IS NOT NULL AND closed_at >= opened_at) OR
        (status = 'results'::public.contest_question_status AND opened_at IS NOT NULL AND closed_at IS NOT NULL)
    )
);

ALTER TABLE public.contest_question OWNER TO postgres;

CREATE SEQUENCE public.contest_question_contest_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.contest_question_contest_question_id_seq OWNER TO postgres;

ALTER SEQUENCE public.contest_question_contest_question_id_seq OWNED BY public.contest_question.contest_question_id;

-- =====================================================
-- REPONSES (flexible avec JSONB)
-- =====================================================

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
    CONSTRAINT answer_response_time_positive CHECK (response_time >= 0),
    CONSTRAINT answer_earned_points_positive CHECK (earned_points >= 0),
    CONSTRAINT answer_value_valid CHECK (
        (answer_type = 'choice_label'::public.answer_type AND jsonb_typeof(answer_value) = 'string') OR
        (answer_type = 'command_text'::public.answer_type AND jsonb_typeof(answer_value) = 'string') OR
        (answer_type = 'text'::public.answer_type AND jsonb_typeof(answer_value) = 'string') OR
        (answer_type = 'json_structure'::public.answer_type AND jsonb_typeof(answer_value) = 'object')
    )
);

ALTER TABLE public.answer OWNER TO postgres;

CREATE SEQUENCE public.answer_answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.answer_answer_id_seq OWNER TO postgres;

ALTER SEQUENCE public.answer_answer_id_seq OWNED BY public.answer.answer_id;

-- =====================================================
-- SESSION SOCKET
-- =====================================================

CREATE TABLE public.contest_session (
    session_id integer NOT NULL,
    contest_id integer NOT NULL,
    player_id integer NOT NULL,
    socket_id character varying(255) NOT NULL,
    connected_at timestamp without time zone DEFAULT now(),
    disconnected_at timestamp without time zone,
    CONSTRAINT session_time_check CHECK (disconnected_at IS NULL OR disconnected_at >= connected_at)
);

ALTER TABLE public.contest_session OWNER TO postgres;

CREATE SEQUENCE public.contest_session_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.contest_session_session_id_seq OWNER TO postgres;

ALTER SEQUENCE public.contest_session_session_id_seq OWNED BY public.contest_session.session_id;

-- =====================================================
-- 2FA POUR LE CLASSEMENT FINAL
-- =====================================================

CREATE TABLE public.two_factor_challenge (
    challenge_id integer NOT NULL,
    player_id integer NOT NULL,
    command text NOT NULL,
    expected_answer text NOT NULL,
    validated boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL,
    CONSTRAINT challenge_expiration_check CHECK (expires_at > created_at)
);

ALTER TABLE public.two_factor_challenge OWNER TO postgres;

CREATE SEQUENCE public.two_factor_challenge_challenge_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.two_factor_challenge_challenge_id_seq OWNER TO postgres;

ALTER SEQUENCE public.two_factor_challenge_challenge_id_seq OWNED BY public.two_factor_challenge.challenge_id;

-- =====================================================
-- EVENT LOG (audit simplifié)
-- =====================================================

CREATE TABLE public.game_event_log (
    event_id bigserial NOT NULL,
    contest_id integer NOT NULL,
    event_type character varying(50) NOT NULL,
    event_data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.game_event_log OWNER TO postgres;

-- =====================================================
-- DEFAULT VALUES
-- =====================================================

ALTER TABLE ONLY public.admin ALTER COLUMN admin_id SET DEFAULT nextval('public.admin_admin_id_seq'::regclass);
ALTER TABLE ONLY public.player ALTER COLUMN player_id SET DEFAULT nextval('public.player_player_id_seq'::regclass);
ALTER TABLE ONLY public.question ALTER COLUMN question_id SET DEFAULT nextval('public.question_question_id_seq'::regclass);
ALTER TABLE ONLY public.question_choice ALTER COLUMN choice_id SET DEFAULT nextval('public.question_choice_choice_id_seq'::regclass);
ALTER TABLE ONLY public.contest ALTER COLUMN contest_id SET DEFAULT nextval('public.contest_contest_id_seq'::regclass);
ALTER TABLE ONLY public.contest_player ALTER COLUMN contest_player_id SET DEFAULT nextval('public.contest_player_contest_player_id_seq'::regclass);
ALTER TABLE ONLY public.contest_question ALTER COLUMN contest_question_id SET DEFAULT nextval('public.contest_question_contest_question_id_seq'::regclass);
ALTER TABLE ONLY public.answer ALTER COLUMN answer_id SET DEFAULT nextval('public.answer_answer_id_seq'::regclass);
ALTER TABLE ONLY public.contest_session ALTER COLUMN session_id SET DEFAULT nextval('public.contest_session_session_id_seq'::regclass);
ALTER TABLE ONLY public.two_factor_challenge ALTER COLUMN challenge_id SET DEFAULT nextval('public.two_factor_challenge_challenge_id_seq'::regclass);

-- =====================================================
-- CONSTRAINTS
-- =====================================================

-- Admin
ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_email_key UNIQUE (email);

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (admin_id);

-- Player
ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_username_key UNIQUE (username);

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_email_key UNIQUE (email);

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_pkey PRIMARY KEY (player_id);

-- Question
ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (question_id);

-- Question Choice
ALTER TABLE ONLY public.question_choice
    ADD CONSTRAINT question_choice_pkey PRIMARY KEY (choice_id);

-- Contest
ALTER TABLE ONLY public.contest
    ADD CONSTRAINT contest_pkey PRIMARY KEY (contest_id);

-- Contest Player
ALTER TABLE ONLY public.contest_player
    ADD CONSTRAINT contest_player_pkey PRIMARY KEY (contest_player_id);

ALTER TABLE ONLY public.contest_player
    ADD CONSTRAINT contest_player_unique UNIQUE (contest_id, player_id);

-- Contest Question
ALTER TABLE ONLY public.contest_question
    ADD CONSTRAINT contest_question_pkey PRIMARY KEY (contest_question_id);

-- Answer
ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_pkey PRIMARY KEY (answer_id);

-- UNIQUE constraint prevents duplicate answers (concurrency-safe)
ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_unique UNIQUE (contest_question_id, player_id);

-- Unique index for first_blood (concurrency-safe)
CREATE UNIQUE INDEX unique_first_blood_per_question
    ON public.answer(contest_question_id)
    WHERE first_blood = true;

-- Contest Session
ALTER TABLE ONLY public.contest_session
    ADD CONSTRAINT contest_session_pkey PRIMARY KEY (session_id);

-- Two Factor Challenge
ALTER TABLE ONLY public.two_factor_challenge
    ADD CONSTRAINT two_factor_challenge_pkey PRIMARY KEY (challenge_id);

-- =====================================================
-- FOREIGN KEYS
-- =====================================================

ALTER TABLE ONLY public.question_choice
    ADD CONSTRAINT fk_question_choice_question FOREIGN KEY (question_id)
    REFERENCES public.question(question_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.contest
    ADD CONSTRAINT fk_contest_admin FOREIGN KEY (created_by)
    REFERENCES public.admin(admin_id);

ALTER TABLE ONLY public.contest_player
    ADD CONSTRAINT fk_contest_player_contest FOREIGN KEY (contest_id)
    REFERENCES public.contest(contest_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.contest_player
    ADD CONSTRAINT fk_contest_player_player FOREIGN KEY (player_id)
    REFERENCES public.player(player_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.contest_question
    ADD CONSTRAINT fk_contest_question_contest FOREIGN KEY (contest_id)
    REFERENCES public.contest(contest_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.contest_question
    ADD CONSTRAINT fk_contest_question_question FOREIGN KEY (question_id)
    REFERENCES public.question(question_id);

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT fk_answer_contest_question FOREIGN KEY (contest_question_id)
    REFERENCES public.contest_question(contest_question_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT fk_answer_player FOREIGN KEY (player_id)
    REFERENCES public.player(player_id) ON DELETE CASCADE;

ALTER TABLE ONLY public.contest_session
    ADD CONSTRAINT fk_contest_session_contest FOREIGN KEY (contest_id)
    REFERENCES public.contest(contest_id);

ALTER TABLE ONLY public.contest_session
    ADD CONSTRAINT fk_contest_session_player FOREIGN KEY (player_id)
    REFERENCES public.player(player_id);

ALTER TABLE ONLY public.two_factor_challenge
    ADD CONSTRAINT fk_two_factor_challenge_player FOREIGN KEY (player_id)
    REFERENCES public.player(player_id);

ALTER TABLE ONLY public.game_event_log
    ADD CONSTRAINT fk_game_event_log_contest FOREIGN KEY (contest_id)
    REFERENCES public.contest(contest_id) ON DELETE CASCADE;

-- =====================================================
-- INDEXES (optimisés pour production)
-- =====================================================

-- Question
CREATE INDEX idx_question_category ON public.question(category);
CREATE INDEX idx_question_type ON public.question(type);

-- Question Choice
CREATE INDEX idx_question_choice_question ON public.question_choice(question_id);

-- Contest
CREATE INDEX idx_contest_status ON public.contest(status);

-- Contest Player
CREATE INDEX idx_contest_player_contest ON public.contest_player(contest_id);
CREATE INDEX idx_contest_player_player ON public.contest_player(player_id);

-- Contest Question
CREATE INDEX idx_contest_question_contest ON public.contest_question(contest_id);
CREATE INDEX idx_contest_question_status ON public.contest_question(status);
CREATE INDEX idx_contest_question_order ON public.contest_question(order_index);

-- Answer (indexes pour les views)
CREATE INDEX idx_answer_contest_question ON public.answer(contest_question_id);
CREATE INDEX idx_answer_player ON public.answer(player_id);
CREATE INDEX idx_answer_submitted ON public.answer(submitted_at);
CREATE INDEX idx_answer_contest_question_player ON public.answer(contest_question_id, player_id);

-- Contest Session
CREATE INDEX idx_contest_session_contest ON public.contest_session(contest_id);

-- Two Factor Challenge
CREATE INDEX idx_two_factor_challenge_player ON public.two_factor_challenge(player_id);
CREATE INDEX idx_two_factor_challenge_expires ON public.two_factor_challenge(expires_at);

-- Game Event Log
CREATE INDEX idx_game_event_log_contest ON public.game_event_log(contest_id);
CREATE INDEX idx_game_event_log_created ON public.game_event_log(created_at);

-- =====================================================
-- VIEWS (source de vérité - calculs déterministes)
-- =====================================================

-- View: Player total score (computed from answers)
CREATE OR REPLACE VIEW public.v_player_score AS
SELECT 
    p.player_id,
    p.username,
    p.email,
    p.avatar_url,
    COALESCE(SUM(a.earned_points), 0) AS score_total,
    COALESCE(COUNT(CASE WHEN a.is_correct THEN 1 END), 0) AS total_correct,
    COALESCE(COUNT(CASE WHEN NOT a.is_correct THEN 1 END), 0) AS total_wrong,
    COALESCE(AVG(a.response_time), 0) AS avg_response_time,
    COALESCE(COUNT(a.answer_id), 0) AS total_answers
FROM public.player p
LEFT JOIN public.answer a ON p.player_id = a.player_id
GROUP BY p.player_id, p.username, p.email, p.avatar_url;

-- View: Contest player scores (computed from answers)
CREATE OR REPLACE VIEW public.v_contest_player_score AS
SELECT 
    cp.contest_id,
    cp.player_id,
    p.username,
    p.avatar_url,
    COALESCE(SUM(a.earned_points), 0) AS score,
    COALESCE(COUNT(CASE WHEN a.is_correct THEN 1 END), 0) AS correct_answers,
    COALESCE(COUNT(CASE WHEN NOT a.is_correct THEN 1 END), 0) AS wrong_answers,
    COALESCE(COUNT(CASE WHEN a.first_blood THEN 1 END), 0) AS first_blood_count,
    COALESCE(AVG(a.response_time), 0) AS avg_response_time,
    RANK() OVER (
        PARTITION BY cp.contest_id 
        ORDER BY COALESCE(SUM(a.earned_points), 0) DESC, 
                 COALESCE(AVG(a.response_time), 0) ASC
    ) AS rank
FROM public.contest_player cp
JOIN public.player p ON cp.player_id = p.player_id
LEFT JOIN public.answer a ON cp.player_id = a.player_id
    AND a.contest_question_id IN (
        SELECT cq.contest_question_id 
        FROM public.contest_question cq 
        WHERE cq.contest_id = cp.contest_id
    )
GROUP BY cp.contest_id, cp.player_id, p.username, p.avatar_url;

-- View: Contest question statistics
CREATE OR REPLACE VIEW public.v_contest_question_stats AS
SELECT 
    cq.contest_question_id,
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
    COALESCE(COUNT(a.answer_id), 0) AS total_answers,
    COALESCE(COUNT(CASE WHEN a.is_correct THEN 1 END), 0) AS correct_answers,
    COALESCE(COUNT(CASE WHEN a.first_blood THEN 1 END), 0) AS first_blood_count,
    COALESCE(AVG(a.response_time), 0) AS avg_response_time
FROM public.contest_question cq
JOIN public.question q ON cq.question_id = q.question_id
LEFT JOIN public.answer a ON cq.contest_question_id = a.contest_question_id
GROUP BY cq.contest_question_id, cq.contest_id, cq.question_id, cq.round_number, 
         cq.order_index, cq.status, cq.opened_at, cq.closed_at, q.statement, q.points, q.duration;

-- =====================================================
-- TRIGGERS (simplifiés - uniquement validation et logging)
-- =====================================================

-- =====================================================
-- 1. Validate question is open before answer
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_question_open()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.validate_question_open() OWNER TO postgres;

CREATE TRIGGER trigger_validate_question_open
    BEFORE INSERT ON public.answer
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_question_open();

-- =====================================================
-- 2. Validate answer is within timeout
-- =====================================================

CREATE OR REPLACE FUNCTION public.validate_timeout()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.validate_timeout() OWNER TO postgres;

CREATE TRIGGER trigger_validate_timeout
    BEFORE INSERT ON public.answer
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_timeout();

-- =====================================================
-- 3. Log answer event (audit only)
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_answer_event()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.log_answer_event() OWNER TO postgres;

CREATE TRIGGER trigger_log_answer_event
    AFTER INSERT ON public.answer
    FOR EACH ROW
    EXECUTE FUNCTION public.log_answer_event();

-- =====================================================
-- 4. Auto-close question on timeout (cron job function)
-- =====================================================

CREATE OR REPLACE FUNCTION public.auto_close_expired_questions()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.auto_close_expired_questions() OWNER TO postgres;

-- =====================================================
-- 5. Clean expired 2FA challenges
-- =====================================================

CREATE OR REPLACE FUNCTION public.clean_expired_challenges()
RETURNS void AS $$
BEGIN
    DELETE FROM public.two_factor_challenge
    WHERE expires_at < NOW()
    AND validated = false;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.clean_expired_challenges() OWNER TO postgres;

-- =====================================================
-- SEQUENCE RESET
-- =====================================================

SELECT pg_catalog.setval('public.admin_admin_id_seq', 1, false);
SELECT pg_catalog.setval('public.player_player_id_seq', 1, false);
SELECT pg_catalog.setval('public.question_question_id_seq', 1, false);
SELECT pg_catalog.setval('public.question_choice_choice_id_seq', 1, false);
SELECT pg_catalog.setval('public.contest_contest_id_seq', 1, false);
SELECT pg_catalog.setval('public.contest_player_contest_player_id_seq', 1, false);
SELECT pg_catalog.setval('public.contest_question_contest_question_id_seq', 1, false);
SELECT pg_catalog.setval('public.answer_answer_id_seq', 1, false);
SELECT pg_catalog.setval('public.contest_session_session_id_seq', 1, false);
SELECT pg_catalog.setval('public.two_factor_challenge_challenge_id_seq', 1, false);
SELECT pg_catalog.setval('public.game_event_log_event_id_seq', 1, false);

--
-- PostgreSQL database dump complete
--

\unrestrict Keis0AwFpNLzFKiC7v7mzXoDfTomZ1Lof01VYasIwyrXwrTWvw63TOF9UwBDvKt