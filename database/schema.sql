--
-- PostgreSQL database dump
--

\restrict bV2LKlfTXXCYPbnlwtsiwfij1f92LYXxYGFPHS9O5gfKT4u9R9F2bcRGTsUnXuI

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- ID GENERATION FUNCTIONS
-- =====================================================

CREATE FUNCTION public.generate_admin_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.admin_id IS NULL THEN
        NEW.admin_id := 'ADM_' || LPAD(NEXTVAL('seq_admin_id')::text, 11, '0');
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.generate_admin_id() OWNER TO pop_quizz_user;

CREATE FUNCTION public.generate_player_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.player_id IS NULL THEN
        NEW.player_id := 'PLR_' || LPAD(NEXTVAL('seq_player_id')::text, 11, '0');
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.generate_player_id() OWNER TO pop_quizz_user;

CREATE FUNCTION public.generate_question_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.question_id IS NULL THEN
        NEW.question_id := 'QST_' || LPAD(NEXTVAL('seq_question_id')::text, 11, '0');
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.generate_question_id() OWNER TO pop_quizz_user;

CREATE FUNCTION public.generate_choice_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.choice_id IS NULL THEN
        NEW.choice_id := 'CHO_' || LPAD(NEXTVAL('seq_choice_id')::text, 11, '0');
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.generate_choice_id() OWNER TO pop_quizz_user;

CREATE FUNCTION public.generate_contest_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.contest_id IS NULL THEN
        NEW.contest_id := 'CNT_' || LPAD(NEXTVAL('seq_contest_id')::text, 11, '0');
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.generate_contest_id() OWNER TO pop_quizz_user;

CREATE FUNCTION public.generate_contest_player_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.contest_player_id IS NULL THEN
        NEW.contest_player_id := 'CPL_' || LPAD(NEXTVAL('seq_contest_player_id')::text, 11, '0');
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.generate_contest_player_id() OWNER TO pop_quizz_user;

CREATE FUNCTION public.generate_contest_question_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.contest_question_id IS NULL THEN
        NEW.contest_question_id := 'CQN_' || LPAD(NEXTVAL('seq_contest_question_id')::text, 11, '0');
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.generate_contest_question_id() OWNER TO pop_quizz_user;

CREATE FUNCTION public.generate_answer_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.answer_id IS NULL THEN
        NEW.answer_id := 'ANS_' || LPAD(NEXTVAL('seq_answer_id')::text, 11, '0');
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.generate_answer_id() OWNER TO pop_quizz_user;

CREATE FUNCTION public.generate_session_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.session_id IS NULL THEN
        NEW.session_id := 'SES_' || LPAD(NEXTVAL('seq_session_id')::text, 11, '0');
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.generate_session_id() OWNER TO pop_quizz_user;

CREATE FUNCTION public.generate_challenge_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.challenge_id IS NULL THEN
        NEW.challenge_id := 'CHL_' || LPAD(NEXTVAL('seq_challenge_id')::text, 11, '0');
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.generate_challenge_id() OWNER TO pop_quizz_user;

-- =====================================================
-- SEQUENCES
-- =====================================================

CREATE SEQUENCE public.seq_admin_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.seq_admin_id OWNER TO pop_quizz_user;

CREATE SEQUENCE public.seq_player_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.seq_player_id OWNER TO pop_quizz_user;

CREATE SEQUENCE public.seq_question_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.seq_question_id OWNER TO pop_quizz_user;

CREATE SEQUENCE public.seq_choice_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.seq_choice_id OWNER TO pop_quizz_user;

CREATE SEQUENCE public.seq_contest_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.seq_contest_id OWNER TO pop_quizz_user;

CREATE SEQUENCE public.seq_contest_player_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.seq_contest_player_id OWNER TO pop_quizz_user;

CREATE SEQUENCE public.seq_contest_question_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.seq_contest_question_id OWNER TO pop_quizz_user;

CREATE SEQUENCE public.seq_answer_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.seq_answer_id OWNER TO pop_quizz_user;

CREATE SEQUENCE public.seq_session_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.seq_session_id OWNER TO pop_quizz_user;

CREATE SEQUENCE public.seq_challenge_id
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.seq_challenge_id OWNER TO pop_quizz_user;

-- =====================================================
-- ADMIN
-- =====================================================

CREATE TABLE public.admin (
    admin_id character varying(15) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.admin OWNER TO pop_quizz_user;

-- =====================================================
-- PLAYER
-- =====================================================

CREATE TABLE public.player (
    player_id character varying(15) NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(150),
    password_hash text,
    avatar_url text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT player_username_valid CHECK (char_length(username) >= 3)
);

ALTER TABLE public.player OWNER TO pop_quizz_user;

-- =====================================================
-- QUESTION
-- =====================================================

CREATE TABLE public.question (
    question_id character varying(15) NOT NULL,
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

ALTER TABLE public.question OWNER TO pop_quizz_user;

-- =====================================================
-- CHOIX DE REPONSE (QCM)
-- =====================================================

CREATE TABLE public.question_choice (
    choice_id character varying(15) NOT NULL,
    question_id character varying(15) NOT NULL,
    label text NOT NULL,
    content text NOT NULL,
    is_correct boolean DEFAULT false,
    order_index integer NOT NULL
);

ALTER TABLE public.question_choice OWNER TO pop_quizz_user;

-- =====================================================
-- CONTEST
-- =====================================================

CREATE TABLE public.contest (
    contest_id character varying(15) NOT NULL,
    title character varying(255) NOT NULL,
    status public.contest_status DEFAULT 'waiting'::public.contest_status,
    created_by character varying(15),
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

ALTER TABLE public.contest OWNER TO pop_quizz_user;

-- =====================================================
-- PARTICIPANTS
-- =====================================================

CREATE TABLE public.contest_player (
    contest_player_id character varying(15) NOT NULL,
    contest_id character varying(15) NOT NULL,
    player_id character varying(15) NOT NULL,
    joined_at timestamp without time zone DEFAULT now(),
    is_connected boolean DEFAULT false,
    last_seen timestamp without time zone
);

ALTER TABLE public.contest_player OWNER TO pop_quizz_user;

-- =====================================================
-- QUESTIONS DU CONTEST
-- =====================================================

CREATE TABLE public.contest_question (
    contest_question_id character varying(15) NOT NULL,
    contest_id character varying(15) NOT NULL,
    question_id character varying(15) NOT NULL,
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

ALTER TABLE public.contest_question OWNER TO pop_quizz_user;

-- =====================================================
-- REPONSES (flexible avec JSONB)
-- =====================================================

CREATE TABLE public.answer (
    answer_id character varying(15) NOT NULL,
    contest_question_id character varying(15) NOT NULL,
    player_id character varying(15) NOT NULL,
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

ALTER TABLE public.answer OWNER TO pop_quizz_user;

-- =====================================================
-- SESSION SOCKET
-- =====================================================

CREATE TABLE public.contest_session (
    session_id character varying(15) NOT NULL,
    contest_id character varying(15) NOT NULL,
    player_id character varying(15) NOT NULL,
    socket_id character varying(255) NOT NULL,
    connected_at timestamp without time zone DEFAULT now(),
    disconnected_at timestamp without time zone,
    CONSTRAINT session_time_check CHECK (disconnected_at IS NULL OR disconnected_at >= connected_at)
);

ALTER TABLE public.contest_session OWNER TO pop_quizz_user;

-- =====================================================
-- 2FA POUR LE CLASSEMENT FINAL
-- =====================================================

CREATE TABLE public.two_factor_challenge (
    challenge_id character varying(15) NOT NULL,
    player_id character varying(15) NOT NULL,
    command text NOT NULL,
    expected_answer text NOT NULL,
    validated boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL,
    CONSTRAINT challenge_expiration_check CHECK (expires_at > created_at)
);

ALTER TABLE public.two_factor_challenge OWNER TO pop_quizz_user;

-- =====================================================
-- EVENT LOG (audit simplifié)
-- =====================================================

CREATE TABLE public.game_event_log (
    event_id bigserial NOT NULL,
    contest_id character varying(15) NOT NULL,
    event_type character varying(50) NOT NULL,
    event_data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.game_event_log OWNER TO pop_quizz_user;

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

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_unique UNIQUE (contest_question_id, player_id);

-- Unique index for first_blood
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
-- INDEXES
-- =====================================================

CREATE INDEX idx_question_category ON public.question(category);
CREATE INDEX idx_question_type ON public.question(type);
CREATE INDEX idx_question_choice_question ON public.question_choice(question_id);
CREATE INDEX idx_contest_status ON public.contest(status);
CREATE INDEX idx_contest_player_contest ON public.contest_player(contest_id);
CREATE INDEX idx_contest_player_player ON public.contest_player(player_id);
CREATE INDEX idx_contest_question_contest ON public.contest_question(contest_id);
CREATE INDEX idx_contest_question_status ON public.contest_question(status);
CREATE INDEX idx_contest_question_order ON public.contest_question(order_index);
CREATE INDEX idx_answer_contest_question ON public.answer(contest_question_id);
CREATE INDEX idx_answer_player ON public.answer(player_id);
CREATE INDEX idx_answer_submitted ON public.answer(submitted_at);
CREATE INDEX idx_answer_contest_question_player ON public.answer(contest_question_id, player_id);
CREATE INDEX idx_contest_session_contest ON public.contest_session(contest_id);
CREATE INDEX idx_two_factor_challenge_player ON public.two_factor_challenge(player_id);
CREATE INDEX idx_two_factor_challenge_expires ON public.two_factor_challenge(expires_at);
CREATE INDEX idx_game_event_log_contest ON public.game_event_log(contest_id);
CREATE INDEX idx_game_event_log_created ON public.game_event_log(created_at);

-- =====================================================
-- TRIGGERS FOR ID GENERATION
-- =====================================================

CREATE TRIGGER tg_admin_id BEFORE INSERT ON public.admin 
    FOR EACH ROW EXECUTE FUNCTION public.generate_admin_id();

CREATE TRIGGER tg_player_id BEFORE INSERT ON public.player 
    FOR EACH ROW EXECUTE FUNCTION public.generate_player_id();

CREATE TRIGGER tg_question_id BEFORE INSERT ON public.question 
    FOR EACH ROW EXECUTE FUNCTION public.generate_question_id();

CREATE TRIGGER tg_choice_id BEFORE INSERT ON public.question_choice 
    FOR EACH ROW EXECUTE FUNCTION public.generate_choice_id();

CREATE TRIGGER tg_contest_id BEFORE INSERT ON public.contest 
    FOR EACH ROW EXECUTE FUNCTION public.generate_contest_id();

CREATE TRIGGER tg_contest_player_id BEFORE INSERT ON public.contest_player 
    FOR EACH ROW EXECUTE FUNCTION public.generate_contest_player_id();

CREATE TRIGGER tg_contest_question_id BEFORE INSERT ON public.contest_question 
    FOR EACH ROW EXECUTE FUNCTION public.generate_contest_question_id();

CREATE TRIGGER tg_answer_id BEFORE INSERT ON public.answer 
    FOR EACH ROW EXECUTE FUNCTION public.generate_answer_id();

CREATE TRIGGER tg_session_id BEFORE INSERT ON public.contest_session 
    FOR EACH ROW EXECUTE FUNCTION public.generate_session_id();

CREATE TRIGGER tg_challenge_id BEFORE INSERT ON public.two_factor_challenge 
    FOR EACH ROW EXECUTE FUNCTION public.generate_challenge_id();

-- =====================================================
-- VIEWS
-- =====================================================

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
-- TRIGGER FUNCTIONS FOR BUSINESS LOGIC
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

ALTER FUNCTION public.validate_question_open() OWNER TO pop_quizz_user;

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

ALTER FUNCTION public.validate_timeout() OWNER TO pop_quizz_user;

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

ALTER FUNCTION public.log_answer_event() OWNER TO pop_quizz_user;

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

ALTER FUNCTION public.auto_close_expired_questions() OWNER TO pop_quizz_user;

CREATE OR REPLACE FUNCTION public.clean_expired_challenges()
RETURNS void AS $$
BEGIN
    DELETE FROM public.two_factor_challenge
    WHERE expires_at < NOW()
    AND validated = false;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.clean_expired_challenges() OWNER TO pop_quizz_user;

-- =====================================================
-- BUSINESS LOGIC TRIGGERS
-- =====================================================

CREATE TRIGGER trigger_validate_question_open
    BEFORE INSERT ON public.answer
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_question_open();

CREATE TRIGGER trigger_validate_timeout
    BEFORE INSERT ON public.answer
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_timeout();

CREATE TRIGGER trigger_log_answer_event
    AFTER INSERT ON public.answer
    FOR EACH ROW
    EXECUTE FUNCTION public.log_answer_event();

-- =====================================================
-- SEQUENCE RESET
-- =====================================================

SELECT pg_catalog.setval('public.seq_admin_id', 1, false);
SELECT pg_catalog.setval('public.seq_player_id', 1, false);
SELECT pg_catalog.setval('public.seq_question_id', 1, false);
SELECT pg_catalog.setval('public.seq_choice_id', 1, false);
SELECT pg_catalog.setval('public.seq_contest_id', 1, false);
SELECT pg_catalog.setval('public.seq_contest_player_id', 1, false);
SELECT pg_catalog.setval('public.seq_contest_question_id', 1, false);
SELECT pg_catalog.setval('public.seq_answer_id', 1, false);
SELECT pg_catalog.setval('public.seq_session_id', 1, false);
SELECT pg_catalog.setval('public.seq_challenge_id', 1, false);

--
-- PostgreSQL database dump complete
--

\unrestrict bV2LKlfTXXCYPbnlwtsiwfij1f92LYXxYGFPHS9O5gfKT4u9R9F2bcRGTsUnXuI