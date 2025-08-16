--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_log (
    id bigint NOT NULL,
    log_name character varying(255),
    description text NOT NULL,
    subject_type character varying(255),
    subject_id bigint,
    causer_type character varying(255),
    causer_id bigint,
    properties json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    event character varying(255),
    batch_uuid uuid,
    ip_address character varying(255),
    user_agent character varying(255),
    url character varying(255),
    method character varying(255)
);


ALTER TABLE public.activity_log OWNER TO postgres;

--
-- Name: activity_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activity_log_id_seq OWNER TO postgres;

--
-- Name: activity_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_log_id_seq OWNED BY public.activity_log.id;


--
-- Name: backlinks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backlinks (
    id bigint NOT NULL,
    source_url character varying(255) NOT NULL,
    target_url character varying(255) NOT NULL,
    anchor_text character varying(255),
    link_type character varying(255) NOT NULL,
    domain_authority integer,
    page_authority integer,
    is_active boolean DEFAULT true NOT NULL,
    first_detected timestamp(0) without time zone NOT NULL,
    last_checked timestamp(0) without time zone NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.backlinks OWNER TO postgres;

--
-- Name: backlinks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.backlinks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.backlinks_id_seq OWNER TO postgres;

--
-- Name: backlinks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.backlinks_id_seq OWNED BY public.backlinks.id;


--
-- Name: banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banners (
    id bigint NOT NULL,
    title character varying(255),
    subtitle character varying(255),
    link character varying(255),
    cta json,
    width bigint,
    height bigint,
    is_active boolean DEFAULT true NOT NULL,
    published_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.banners OWNER TO postgres;

--
-- Name: banners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.banners_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.banners_id_seq OWNER TO postgres;

--
-- Name: banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.banners_id_seq OWNED BY public.banners.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: core_web_vitals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.core_web_vitals (
    id bigint NOT NULL,
    url character varying(255) NOT NULL,
    lcp numeric(8,2),
    fid numeric(8,2),
    cls numeric(8,4),
    fcp numeric(8,2),
    ttfb numeric(8,2),
    device_type character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.core_web_vitals OWNER TO postgres;

--
-- Name: core_web_vitals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.core_web_vitals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.core_web_vitals_id_seq OWNER TO postgres;

--
-- Name: core_web_vitals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.core_web_vitals_id_seq OWNED BY public.core_web_vitals.id;


--
-- Name: domains; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.domains (
    id integer NOT NULL,
    domain character varying(255) NOT NULL,
    tenant_id character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.domains OWNER TO postgres;

--
-- Name: domains_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.domains_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.domains_id_seq OWNER TO postgres;

--
-- Name: domains_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.domains_id_seq OWNED BY public.domains.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.failed_jobs_id_seq OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: footers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.footers (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    template character varying(255) NOT NULL,
    content json NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    logo_path character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.footers OWNER TO postgres;

--
-- Name: footers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.footers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.footers_id_seq OWNER TO postgres;

--
-- Name: footers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.footers_id_seq OWNED BY public.footers.id;


--
-- Name: invoice_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_usage (
    id bigint NOT NULL,
    total_invoices integer DEFAULT 0 NOT NULL,
    monthly_invoices integer DEFAULT 0 NOT NULL,
    "limit" integer DEFAULT 0 NOT NULL,
    last_reset timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.invoice_usage OWNER TO postgres;

--
-- Name: invoice_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_usage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invoice_usage_id_seq OWNER TO postgres;

--
-- Name: invoice_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_usage_id_seq OWNED BY public.invoice_usage.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL,
    uuid uuid,
    collection_name character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    mime_type character varying(255),
    disk character varying(255) NOT NULL,
    conversions_disk character varying(255),
    size bigint NOT NULL,
    manipulations json NOT NULL,
    custom_properties json NOT NULL,
    generated_conversions json NOT NULL,
    responsive_images json NOT NULL,
    order_column integer,
    deleted_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.media OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.media_id_seq OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_items (
    id bigint NOT NULL,
    menu_id bigint NOT NULL,
    label character varying(255) NOT NULL,
    url character varying(255),
    type character varying(255) DEFAULT 'custom'::character varying NOT NULL,
    object_id bigint,
    target character varying(255) DEFAULT '_self'::character varying NOT NULL,
    css_class character varying(255),
    "order" integer DEFAULT 0 NOT NULL,
    parent_id bigint,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT menu_items_target_check CHECK (((target)::text = ANY ((ARRAY['_self'::character varying, '_blank'::character varying])::text[]))),
    CONSTRAINT menu_items_type_check CHECK (((type)::text = ANY ((ARRAY['custom'::character varying, 'page'::character varying, 'post'::character varying, 'category'::character varying, 'external'::character varying])::text[])))
);


ALTER TABLE public.menu_items OWNER TO postgres;

--
-- Name: menu_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.menu_items_id_seq OWNER TO postgres;

--
-- Name: menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_items_id_seq OWNED BY public.menu_items.id;


--
-- Name: menus; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menus (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    location character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.menus OWNER TO postgres;

--
-- Name: menus_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menus_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.menus_id_seq OWNER TO postgres;

--
-- Name: menus_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menus_id_seq OWNED BY public.menus.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: model_has_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_has_permissions (
    permission_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_permissions OWNER TO postgres;

--
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_roles OWNER TO postgres;

--
-- Name: news; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.news (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    excerpt text,
    content text,
    published_at timestamp(0) without time zone,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.news OWNER TO postgres;

--
-- Name: news_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.news_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.news_id_seq OWNER TO postgres;

--
-- Name: news_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.news_id_seq OWNED BY public.news.id;


--
-- Name: page_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page_views (
    id bigint NOT NULL,
    url character varying(255) NOT NULL,
    referer character varying(255),
    user_agent character varying(255),
    title character varying(255),
    meta_description text,
    meta_keywords json,
    time_on_page integer DEFAULT 0 NOT NULL,
    is_bounce boolean DEFAULT false NOT NULL,
    exit_page character varying(255),
    device_type character varying(255),
    browser character varying(255),
    os character varying(255),
    screen_resolution character varying(255),
    country character varying(255),
    city character varying(255),
    utm_source character varying(255),
    utm_medium character varying(255),
    utm_campaign character varying(255),
    utm_term character varying(255),
    utm_content character varying(255),
    is_conversion boolean DEFAULT false NOT NULL,
    conversion_type character varying(255),
    conversion_value numeric(10,2),
    session_id character varying(255),
    is_new_visitor boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.page_views OWNER TO postgres;

--
-- Name: page_views_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.page_views_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.page_views_id_seq OWNER TO postgres;

--
-- Name: page_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.page_views_id_seq OWNED BY public.page_views.id;


--
-- Name: pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    content text,
    template character varying(255) DEFAULT 'default'::character varying NOT NULL,
    template_data json,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    meta_title character varying(255),
    meta_description character varying(255),
    meta_image character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.pages OWNER TO postgres;

--
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pages_id_seq OWNER TO postgres;

--
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pages_id_seq OWNED BY public.pages.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    tenant_id character varying(255) NOT NULL,
    subscription_plan_id bigint,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(255) NOT NULL,
    payment_date timestamp(0) without time zone NOT NULL,
    billing_period character varying(255) DEFAULT 'monthly'::character varying NOT NULL,
    subscription_starts_at timestamp(0) without time zone NOT NULL,
    subscription_ends_at timestamp(0) without time zone,
    status character varying(255) DEFAULT 'completed'::character varying NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.personal_access_tokens_id_seq OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: role_has_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.role_has_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: seo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seo (
    id bigint NOT NULL,
    model_id bigint,
    model_type character varying(255),
    description text,
    route character varying(255) NOT NULL,
    title character varying(255),
    image character varying(255),
    author character varying(255),
    robots character varying(255),
    keywords character varying(255),
    canonical_url character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.seo OWNER TO postgres;

--
-- Name: seo_errors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seo_errors (
    id bigint NOT NULL,
    url character varying(255) NOT NULL,
    status_code integer NOT NULL,
    error_type character varying(255) NOT NULL,
    error_message text,
    referer character varying(255),
    user_agent character varying(255),
    count integer DEFAULT 1 NOT NULL,
    first_seen timestamp(0) without time zone NOT NULL,
    last_seen timestamp(0) without time zone NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.seo_errors OWNER TO postgres;

--
-- Name: seo_errors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seo_errors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.seo_errors_id_seq OWNER TO postgres;

--
-- Name: seo_errors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.seo_errors_id_seq OWNED BY public.seo_errors.id;


--
-- Name: seo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.seo_id_seq OWNER TO postgres;

--
-- Name: seo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.seo_id_seq OWNED BY public.seo.id;


--
-- Name: seo_keywords; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seo_keywords (
    id bigint NOT NULL,
    keyword character varying(255) NOT NULL,
    url character varying(255) NOT NULL,
    "position" integer,
    clicks integer DEFAULT 0 NOT NULL,
    impressions integer DEFAULT 0 NOT NULL,
    ctr numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    avg_position numeric(5,2),
    date date NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.seo_keywords OWNER TO postgres;

--
-- Name: seo_keywords_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seo_keywords_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.seo_keywords_id_seq OWNER TO postgres;

--
-- Name: seo_keywords_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.seo_keywords_id_seq OWNED BY public.seo_keywords.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    id bigint NOT NULL,
    site_name character varying(255) NOT NULL,
    logo_path character varying(255),
    favicon_path character varying(255),
    primary_color character varying(255) DEFAULT '#3b82f6'::character varying NOT NULL,
    secondary_color character varying(255) DEFAULT '#10b981'::character varying NOT NULL,
    social_links json,
    contact_email character varying(255),
    contact_phone character varying(255),
    support_email character varying(255),
    support_phone character varying(255),
    address text,
    site_description text,
    meta_description character varying(255),
    meta_keywords character varying(255),
    analytics_data json,
    seo_title character varying(255),
    seo_keywords character varying(255),
    seo_description character varying(255),
    seo_metadata json,
    social_network json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.site_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.site_settings_id_seq OWNER TO postgres;

--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: sris; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sris (
    identification character varying(13) NOT NULL,
    business_name character varying(255),
    legal_name character varying(255),
    commercial_name character varying(255),
    status character varying(255),
    taxpayer_type character varying(255),
    taxpayer_status character varying(255),
    taxpayer_class character varying(255),
    regime character varying(255) DEFAULT 'GENERAL'::character varying,
    main_activity text,
    start_date character varying(255),
    cessation_date character varying(255),
    restart_date character varying(255),
    update_date character varying(255),
    accounting_required character varying(255) DEFAULT 'NO'::character varying,
    withholding_agent character varying(255) DEFAULT 'NO'::character varying,
    special_taxpayer character varying(255) DEFAULT 'NO'::character varying,
    ghost_taxpayer character varying(255) DEFAULT 'NO'::character varying,
    nonexistent_transactions character varying(255) DEFAULT 'NO'::character varying,
    legal_representatives json,
    cancellation_reason character varying(255),
    head_office_address text,
    debt_amount numeric(10,2),
    debt_description character varying(255),
    establishments json,
    challenge json,
    remission json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.sris OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    stripe_plan_id character varying(255),
    price numeric(8,2) DEFAULT '0'::numeric NOT NULL,
    billing_period character varying(255) DEFAULT 'monthly'::character varying NOT NULL,
    invoice_limit integer DEFAULT 0 NOT NULL,
    features json,
    is_active boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscription_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscription_plans_id_seq OWNER TO postgres;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscription_plans_id_seq OWNED BY public.subscription_plans.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id bigint NOT NULL,
    tenant_id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    stripe_id character varying(255),
    stripe_status character varying(255),
    stripe_price character varying(255),
    plan_type character varying(255) DEFAULT 'basic'::character varying NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    trial_ends_at timestamp(0) without time zone,
    ends_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    subscription_plan_id bigint
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscriptions_id_seq OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id character varying(255) NOT NULL,
    data json,
    subscription_plan_id bigint,
    trial_ends_at timestamp(0) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    subscription_active boolean DEFAULT false NOT NULL,
    subscription_ends_at timestamp(0) without time zone,
    billing_period character varying(255) DEFAULT 'monthly'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testimonials (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    "position" character varying(255),
    message text NOT NULL,
    photo character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.testimonials OWNER TO postgres;

--
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.testimonials_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.testimonials_id_seq OWNER TO postgres;

--
-- Name: testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;


--
-- Name: themes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.themes (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    colors json NOT NULL,
    styles json NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT themes_type_check CHECK (((type)::text = ANY ((ARRAY['web'::character varying, 'dashboard'::character varying])::text[])))
);


ALTER TABLE public.themes OWNER TO postgres;

--
-- Name: themes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.themes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.themes_id_seq OWNER TO postgres;

--
-- Name: themes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.themes_id_seq OWNED BY public.themes.id;


--
-- Name: unattached_media_containers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unattached_media_containers (
    id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.unattached_media_containers OWNER TO postgres;

--
-- Name: unattached_media_containers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.unattached_media_containers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.unattached_media_containers_id_seq OWNER TO postgres;

--
-- Name: unattached_media_containers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.unattached_media_containers_id_seq OWNED BY public.unattached_media_containers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    tenant_id character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: activity_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_log ALTER COLUMN id SET DEFAULT nextval('public.activity_log_id_seq'::regclass);


--
-- Name: backlinks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backlinks ALTER COLUMN id SET DEFAULT nextval('public.backlinks_id_seq'::regclass);


--
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: core_web_vitals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.core_web_vitals ALTER COLUMN id SET DEFAULT nextval('public.core_web_vitals_id_seq'::regclass);


--
-- Name: domains id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domains ALTER COLUMN id SET DEFAULT nextval('public.domains_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: footers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footers ALTER COLUMN id SET DEFAULT nextval('public.footers_id_seq'::regclass);


--
-- Name: invoice_usage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_usage ALTER COLUMN id SET DEFAULT nextval('public.invoice_usage_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: menu_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);


--
-- Name: menus id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus ALTER COLUMN id SET DEFAULT nextval('public.menus_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: news id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news ALTER COLUMN id SET DEFAULT nextval('public.news_id_seq'::regclass);


--
-- Name: page_views id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_views ALTER COLUMN id SET DEFAULT nextval('public.page_views_id_seq'::regclass);


--
-- Name: pages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: seo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo ALTER COLUMN id SET DEFAULT nextval('public.seo_id_seq'::regclass);


--
-- Name: seo_errors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_errors ALTER COLUMN id SET DEFAULT nextval('public.seo_errors_id_seq'::regclass);


--
-- Name: seo_keywords id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_keywords ALTER COLUMN id SET DEFAULT nextval('public.seo_keywords_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: subscription_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN id SET DEFAULT nextval('public.subscription_plans_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: testimonials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);


--
-- Name: themes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.themes ALTER COLUMN id SET DEFAULT nextval('public.themes_id_seq'::regclass);


--
-- Name: unattached_media_containers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unattached_media_containers ALTER COLUMN id SET DEFAULT nextval('public.unattached_media_containers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_log (id, log_name, description, subject_type, subject_id, causer_type, causer_id, properties, created_at, updated_at, event, batch_uuid, ip_address, user_agent, url, method) FROM stdin;
\.


--
-- Data for Name: backlinks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backlinks (id, source_url, target_url, anchor_text, link_type, domain_authority, page_authority, is_active, first_detected, last_checked, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banners (id, title, subtitle, link, cta, width, height, is_active, published_at, created_at, updated_at) FROM stdin;
1	aa	aaa	https://facturacion.test/admin/banners/create	{"cta_1":{"name":"aa","url":"a"},"cta_2":{"name":"a","url":"a"}}	1920	1080	t	2025-07-29 01:26:00	2025-07-30 06:29:10	2025-07-30 06:29:10
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
fact_cachesri_data_c9452af894a4a03ace35b87d22eedcc4	TzoxODoiQXBwXE1vZGVsc1xTUklcU3JpIjozMzp7czoxMzoiACoAY29ubmVjdGlvbiI7czo1OiJwZ3NxbCI7czo4OiIAKgB0YWJsZSI7czo0OiJzcmlzIjtzOjEzOiIAKgBwcmltYXJ5S2V5IjtzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMDoiACoAa2V5VHlwZSI7czo2OiJzdHJpbmciO3M6MTI6ImluY3JlbWVudGluZyI7YjowO3M6NzoiACoAd2l0aCI7YTowOnt9czoxMjoiACoAd2l0aENvdW50IjthOjA6e31zOjE5OiJwcmV2ZW50c0xhenlMb2FkaW5nIjtiOjA7czoxMDoiACoAcGVyUGFnZSI7aToxNTtzOjY6ImV4aXN0cyI7YjoxO3M6MTg6Indhc1JlY2VudGx5Q3JlYXRlZCI7YjowO3M6Mjg6IgAqAGVzY2FwZVdoZW5DYXN0aW5nVG9TdHJpbmciO2I6MDtzOjEzOiIAKgBhdHRyaWJ1dGVzIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMDk0MDQ0MDE2NzAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoyNDoiVkVMRVogUEXDkUEgQUxMQU4gU1RVQVJUIjtzOjEwOiJsZWdhbF9uYW1lIjtzOjI0OiJWRUxFWiBQRcORQSBBTExBTiBTVFVBUlQiO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7TjtzOjY6InN0YXR1cyI7TjtzOjEzOiJ0YXhwYXllcl90eXBlIjtzOjE1OiJQRVJTT05BIE5BVFVSQUwiO3M6MTU6InRheHBheWVyX3N0YXR1cyI7TjtzOjE0OiJ0YXhwYXllcl9jbGFzcyI7TjtzOjY6InJlZ2ltZSI7czo3OiJHRU5FUkFMIjtzOjEzOiJtYWluX2FjdGl2aXR5IjtzOjM2NToiQUNUSVZJREFERVMgREUgRElTRcORTyBERSBMQSBFU1RSVUNUVVJBIFkgRUwgQ09OVEVOSURPIERFIExPUyBFTEVNRU5UT1MgU0lHVUlFTlRFUyAoWS9PIEVTQ1JJVFVSQSBERUwgQ8OTRElHTyBJTkZPUk3DgVRJQ08gTkVDRVNBUklPIFBBUkEgU1UgQ1JFQUNJw5NOIFkgQVBMSUNBQ0nDk04pOiBQUk9HUkFNQVMgREUgU0lTVEVNQVMgT1BFUkFUSVZPUyAoSU5DTFVJREFTIEFDVFVBTElaQUNJT05FUyBZIFBBUkNIRVMgREUgQ09SUkVDQ0nDk04pLCBBUExJQ0FDSU9ORVMgSU5GT1JNw4FUSUNBUyAoSU5DTFVJREFTIEFDVFVBTElaQUNJT05FUyBZIFBBUkNIRVMgREUgQ09SUkVDQ0nDk04pLCBCQVNFUyBERSBEQVRPUyBZIFDDgUdJTkFTIFdFQi4iO3M6MTA6InN0YXJ0X2RhdGUiO047czoxNDoiY2Vzc2F0aW9uX2RhdGUiO047czoxMjoicmVzdGFydF9kYXRlIjtOO3M6MTE6InVwZGF0ZV9kYXRlIjtOO3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO3M6MjoiTk8iO3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtzOjI6Ik5PIjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtzOjI6Ik5PIjtzOjE0OiJnaG9zdF90YXhwYXllciI7czoyOiJOTyI7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtzOjI6Ik5PIjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6MjoiW10iO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO047czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7czo0NzoiR1VBWUFTIC8gRFVSQU4gLyBFTE9ZIEFMRkFSTyAoRFVSQU4pIC8gIFNPTEFSIDQiO3M6MTE6ImRlYnRfYW1vdW50IjtOO3M6MTY6ImRlYnRfZGVzY3JpcHRpb24iO047czoxNDoiZXN0YWJsaXNobWVudHMiO3M6Mjc4OiJbeyJlc3RhYmxpc2htZW50X251bWJlciI6IjAwMSIsImNvbW1lcmNpYWxfbmFtZSI6bnVsbCwiZXN0YWJsaXNobWVudF90eXBlIjoiTUFUIiwiY29tcGxldGVfYWRkcmVzcyI6IkdVQVlBUyBcLyBEVVJBTiBcLyBFTE9ZIEFMRkFSTyAoRFVSQU4pIFwvICBTT0xBUiA0IiwiZXN0YWJsaXNobWVudF9zdGF0dXMiOiJBQklFUlRPIiwiaXNfaGVhZHF1YXJ0ZXJzIjp0cnVlLCJwcm92aW5jZSI6IkdVQVlBUyIsImNhbnRvbiI6IkRVUkFOIiwicGFyaXNoIjoiRUxPWSBBTEZBUk8gKERVUkFOKSJ9XSI7czo5OiJjaGFsbGVuZ2UiO047czo5OiJyZW1pc3Npb24iO047czoxMDoiY3JlYXRlZF9hdCI7czoxOToiMjAyNS0wNy0yMiAyMzo1NzoyMSI7czoxMDoidXBkYXRlZF9hdCI7czoxOToiMjAyNS0wNy0yMiAyMzo1NzoyMSI7fXM6MTE6IgAqAG9yaWdpbmFsIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMDk0MDQ0MDE2NzAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoyNDoiVkVMRVogUEXDkUEgQUxMQU4gU1RVQVJUIjtzOjEwOiJsZWdhbF9uYW1lIjtzOjI0OiJWRUxFWiBQRcORQSBBTExBTiBTVFVBUlQiO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7TjtzOjY6InN0YXR1cyI7TjtzOjEzOiJ0YXhwYXllcl90eXBlIjtzOjE1OiJQRVJTT05BIE5BVFVSQUwiO3M6MTU6InRheHBheWVyX3N0YXR1cyI7TjtzOjE0OiJ0YXhwYXllcl9jbGFzcyI7TjtzOjY6InJlZ2ltZSI7czo3OiJHRU5FUkFMIjtzOjEzOiJtYWluX2FjdGl2aXR5IjtzOjM2NToiQUNUSVZJREFERVMgREUgRElTRcORTyBERSBMQSBFU1RSVUNUVVJBIFkgRUwgQ09OVEVOSURPIERFIExPUyBFTEVNRU5UT1MgU0lHVUlFTlRFUyAoWS9PIEVTQ1JJVFVSQSBERUwgQ8OTRElHTyBJTkZPUk3DgVRJQ08gTkVDRVNBUklPIFBBUkEgU1UgQ1JFQUNJw5NOIFkgQVBMSUNBQ0nDk04pOiBQUk9HUkFNQVMgREUgU0lTVEVNQVMgT1BFUkFUSVZPUyAoSU5DTFVJREFTIEFDVFVBTElaQUNJT05FUyBZIFBBUkNIRVMgREUgQ09SUkVDQ0nDk04pLCBBUExJQ0FDSU9ORVMgSU5GT1JNw4FUSUNBUyAoSU5DTFVJREFTIEFDVFVBTElaQUNJT05FUyBZIFBBUkNIRVMgREUgQ09SUkVDQ0nDk04pLCBCQVNFUyBERSBEQVRPUyBZIFDDgUdJTkFTIFdFQi4iO3M6MTA6InN0YXJ0X2RhdGUiO047czoxNDoiY2Vzc2F0aW9uX2RhdGUiO047czoxMjoicmVzdGFydF9kYXRlIjtOO3M6MTE6InVwZGF0ZV9kYXRlIjtOO3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO3M6MjoiTk8iO3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtzOjI6Ik5PIjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtzOjI6Ik5PIjtzOjE0OiJnaG9zdF90YXhwYXllciI7czoyOiJOTyI7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtzOjI6Ik5PIjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6MjoiW10iO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO047czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7czo0NzoiR1VBWUFTIC8gRFVSQU4gLyBFTE9ZIEFMRkFSTyAoRFVSQU4pIC8gIFNPTEFSIDQiO3M6MTE6ImRlYnRfYW1vdW50IjtOO3M6MTY6ImRlYnRfZGVzY3JpcHRpb24iO047czoxNDoiZXN0YWJsaXNobWVudHMiO3M6Mjc4OiJbeyJlc3RhYmxpc2htZW50X251bWJlciI6IjAwMSIsImNvbW1lcmNpYWxfbmFtZSI6bnVsbCwiZXN0YWJsaXNobWVudF90eXBlIjoiTUFUIiwiY29tcGxldGVfYWRkcmVzcyI6IkdVQVlBUyBcLyBEVVJBTiBcLyBFTE9ZIEFMRkFSTyAoRFVSQU4pIFwvICBTT0xBUiA0IiwiZXN0YWJsaXNobWVudF9zdGF0dXMiOiJBQklFUlRPIiwiaXNfaGVhZHF1YXJ0ZXJzIjp0cnVlLCJwcm92aW5jZSI6IkdVQVlBUyIsImNhbnRvbiI6IkRVUkFOIiwicGFyaXNoIjoiRUxPWSBBTEZBUk8gKERVUkFOKSJ9XSI7czo5OiJjaGFsbGVuZ2UiO047czo5OiJyZW1pc3Npb24iO047czoxMDoiY3JlYXRlZF9hdCI7czoxOToiMjAyNS0wNy0yMiAyMzo1NzoyMSI7czoxMDoidXBkYXRlZF9hdCI7czoxOToiMjAyNS0wNy0yMiAyMzo1NzoyMSI7fXM6MTA6IgAqAGNoYW5nZXMiO2E6MDp7fXM6MTE6IgAqAHByZXZpb3VzIjthOjA6e31zOjg6IgAqAGNhc3RzIjthOjQ6e3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtzOjU6ImFycmF5IjtzOjk6ImNoYWxsZW5nZSI7czo1OiJhcnJheSI7czo5OiJyZW1pc3Npb24iO3M6NToiYXJyYXkiO3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7czo1OiJhcnJheSI7fXM6MTc6IgAqAGNsYXNzQ2FzdENhY2hlIjthOjA6e31zOjIxOiIAKgBhdHRyaWJ1dGVDYXN0Q2FjaGUiO2E6MDp7fXM6MTM6IgAqAGRhdGVGb3JtYXQiO047czoxMDoiACoAYXBwZW5kcyI7YTowOnt9czoxOToiACoAZGlzcGF0Y2hlc0V2ZW50cyI7YTowOnt9czoxNDoiACoAb2JzZXJ2YWJsZXMiO2E6MDp7fXM6MTI6IgAqAHJlbGF0aW9ucyI7YTowOnt9czoxMDoiACoAdG91Y2hlcyI7YTowOnt9czoyNzoiACoAcmVsYXRpb25BdXRvbG9hZENhbGxiYWNrIjtOO3M6MjY6IgAqAHJlbGF0aW9uQXV0b2xvYWRDb250ZXh0IjtOO3M6MTA6InRpbWVzdGFtcHMiO2I6MTtzOjEzOiJ1c2VzVW5pcXVlSWRzIjtiOjA7czo5OiIAKgBoaWRkZW4iO2E6MDp7fXM6MTA6IgAqAHZpc2libGUiO2E6MDp7fXM6MTE6IgAqAGZpbGxhYmxlIjthOjI3OntpOjA7czoxNDoiaWRlbnRpZmljYXRpb24iO2k6MTtzOjEzOiJidXNpbmVzc19uYW1lIjtpOjI7czoxMDoibGVnYWxfbmFtZSI7aTozO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7aTo0O3M6Njoic3RhdHVzIjtpOjU7czoxMzoidGF4cGF5ZXJfdHlwZSI7aTo2O3M6MTU6InRheHBheWVyX3N0YXR1cyI7aTo3O3M6MTQ6InRheHBheWVyX2NsYXNzIjtpOjg7czo2OiJyZWdpbWUiO2k6OTtzOjEzOiJtYWluX2FjdGl2aXR5IjtpOjEwO3M6MTA6InN0YXJ0X2RhdGUiO2k6MTE7czoxNDoiY2Vzc2F0aW9uX2RhdGUiO2k6MTI7czoxMjoicmVzdGFydF9kYXRlIjtpOjEzO3M6MTE6InVwZGF0ZV9kYXRlIjtpOjE0O3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO2k6MTU7czoxNzoid2l0aGhvbGRpbmdfYWdlbnQiO2k6MTY7czoxNjoic3BlY2lhbF90YXhwYXllciI7aToxNztzOjE0OiJnaG9zdF90YXhwYXllciI7aToxODtzOjI0OiJub25leGlzdGVudF90cmFuc2FjdGlvbnMiO2k6MTk7czoyMToibGVnYWxfcmVwcmVzZW50YXRpdmVzIjtpOjIwO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO2k6MjE7czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7aToyMjtzOjExOiJkZWJ0X2Ftb3VudCI7aToyMztzOjE2OiJkZWJ0X2Rlc2NyaXB0aW9uIjtpOjI0O3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtpOjI1O3M6OToiY2hhbGxlbmdlIjtpOjI2O3M6OToicmVtaXNzaW9uIjt9czoxMDoiACoAZ3VhcmRlZCI7YToxOntpOjA7czoxOiIqIjt9fQ==	1754464121
fact_cachef1f70ec40aaa556905d4a030501c0ba4	i:3;	1754453984
fact_cachesri_data_cb8671667f3acc5f8f2d6c0337970cf0	TzoxODoiQXBwXE1vZGVsc1xTUklcU3JpIjozMzp7czoxMzoiACoAY29ubmVjdGlvbiI7czo1OiJwZ3NxbCI7czo4OiIAKgB0YWJsZSI7czo0OiJzcmlzIjtzOjEzOiIAKgBwcmltYXJ5S2V5IjtzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMDoiACoAa2V5VHlwZSI7czo2OiJzdHJpbmciO3M6MTI6ImluY3JlbWVudGluZyI7YjowO3M6NzoiACoAd2l0aCI7YTowOnt9czoxMjoiACoAd2l0aENvdW50IjthOjA6e31zOjE5OiJwcmV2ZW50c0xhenlMb2FkaW5nIjtiOjA7czoxMDoiACoAcGVyUGFnZSI7aToxNTtzOjY6ImV4aXN0cyI7YjoxO3M6MTg6Indhc1JlY2VudGx5Q3JlYXRlZCI7YjoxO3M6Mjg6IgAqAGVzY2FwZVdoZW5DYXN0aW5nVG9TdHJpbmciO2I6MDtzOjEzOiIAKgBhdHRyaWJ1dGVzIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMDk5MjU2Nzg4MDAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoxMjoiM0ZBU0lDTyBTLkEuIjtzOjEwOiJsZWdhbF9uYW1lIjtzOjEyOiIzRkFTSUNPIFMuQS4iO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7TjtzOjY6InN0YXR1cyI7TjtzOjEzOiJ0YXhwYXllcl90eXBlIjtzOjg6IlNPQ0lFREFEIjtzOjE1OiJ0YXhwYXllcl9zdGF0dXMiO047czoxNDoidGF4cGF5ZXJfY2xhc3MiO047czo2OiJyZWdpbWUiO3M6NzoiR0VORVJBTCI7czoxMzoibWFpbl9hY3Rpdml0eSI7czozNDoiQUNUSVZJREFERVMgREUgU0VSVklDSU9TIERJVkVSU09TLiI7czoxMDoic3RhcnRfZGF0ZSI7TjtzOjE0OiJjZXNzYXRpb25fZGF0ZSI7TjtzOjEyOiJyZXN0YXJ0X2RhdGUiO047czoxMToidXBkYXRlX2RhdGUiO047czoxOToiYWNjb3VudGluZ19yZXF1aXJlZCI7czoyOiJTSSI7czoxNzoid2l0aGhvbGRpbmdfYWdlbnQiO3M6MjoiTk8iO3M6MTY6InNwZWNpYWxfdGF4cGF5ZXIiO3M6MjoiTk8iO3M6MTQ6Imdob3N0X3RheHBheWVyIjtzOjI6Ik5PIjtzOjI0OiJub25leGlzdGVudF90cmFuc2FjdGlvbnMiO3M6MjoiTk8iO3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7czo3NjoiW3siaWRlbnRpZmljYWNpb24iOiIwOTE0MDIwNjU2Iiwibm9tYnJlIjoiU0FOVEFNQVJJQSBTQUxBWkFSIFJBVUwgRVJORVNUTyJ9XSI7czoxOToiY2FuY2VsbGF0aW9uX3JlYXNvbiI7TjtzOjE5OiJoZWFkX29mZmljZV9hZGRyZXNzIjtzOjU1OiJTQU5UQSBFTEVOQSAvIFNBTlRBIEVMRU5BIC8gU0FOVEEgRUxFTkEgLyAxIFMvTiBZIEFOQ09OIjtzOjExOiJkZWJ0X2Ftb3VudCI7TjtzOjE2OiJkZWJ0X2Rlc2NyaXB0aW9uIjtOO3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtzOjMwMDoiW3siZXN0YWJsaXNobWVudF9udW1iZXIiOiIwMDEiLCJjb21tZXJjaWFsX25hbWUiOiIzRkFTSUNPIFMuQS4iLCJlc3RhYmxpc2htZW50X3R5cGUiOiJNQVQiLCJjb21wbGV0ZV9hZGRyZXNzIjoiU0FOVEEgRUxFTkEgXC8gU0FOVEEgRUxFTkEgXC8gU0FOVEEgRUxFTkEgXC8gMSBTXC9OIFkgQU5DT04iLCJlc3RhYmxpc2htZW50X3N0YXR1cyI6IkFCSUVSVE8iLCJpc19oZWFkcXVhcnRlcnMiOnRydWUsInByb3ZpbmNlIjoiU0FOVEEgRUxFTkEiLCJjYW50b24iOiJTQU5UQSBFTEVOQSIsInBhcmlzaCI6IlNBTlRBIEVMRU5BIn1dIjtzOjk6ImNoYWxsZW5nZSI7TjtzOjk6InJlbWlzc2lvbiI7TjtzOjEwOiJ1cGRhdGVkX2F0IjtzOjE5OiIyMDI1LTA4LTAyIDA0OjQ3OjM4IjtzOjEwOiJjcmVhdGVkX2F0IjtzOjE5OiIyMDI1LTA4LTAyIDA0OjQ3OjM4Ijt9czoxMToiACoAb3JpZ2luYWwiO2E6Mjk6e3M6MTQ6ImlkZW50aWZpY2F0aW9uIjtzOjEzOiIwOTkyNTY3ODgwMDAxIjtzOjEzOiJidXNpbmVzc19uYW1lIjtzOjEyOiIzRkFTSUNPIFMuQS4iO3M6MTA6ImxlZ2FsX25hbWUiO3M6MTI6IjNGQVNJQ08gUy5BLiI7czoxNToiY29tbWVyY2lhbF9uYW1lIjtOO3M6Njoic3RhdHVzIjtOO3M6MTM6InRheHBheWVyX3R5cGUiO3M6ODoiU09DSUVEQUQiO3M6MTU6InRheHBheWVyX3N0YXR1cyI7TjtzOjE0OiJ0YXhwYXllcl9jbGFzcyI7TjtzOjY6InJlZ2ltZSI7czo3OiJHRU5FUkFMIjtzOjEzOiJtYWluX2FjdGl2aXR5IjtzOjM0OiJBQ1RJVklEQURFUyBERSBTRVJWSUNJT1MgRElWRVJTT1MuIjtzOjEwOiJzdGFydF9kYXRlIjtOO3M6MTQ6ImNlc3NhdGlvbl9kYXRlIjtOO3M6MTI6InJlc3RhcnRfZGF0ZSI7TjtzOjExOiJ1cGRhdGVfZGF0ZSI7TjtzOjE5OiJhY2NvdW50aW5nX3JlcXVpcmVkIjtzOjI6IlNJIjtzOjE3OiJ3aXRoaG9sZGluZ19hZ2VudCI7czoyOiJOTyI7czoxNjoic3BlY2lhbF90YXhwYXllciI7czoyOiJOTyI7czoxNDoiZ2hvc3RfdGF4cGF5ZXIiO3M6MjoiTk8iO3M6MjQ6Im5vbmV4aXN0ZW50X3RyYW5zYWN0aW9ucyI7czoyOiJOTyI7czoyMToibGVnYWxfcmVwcmVzZW50YXRpdmVzIjtzOjc2OiJbeyJpZGVudGlmaWNhY2lvbiI6IjA5MTQwMjA2NTYiLCJub21icmUiOiJTQU5UQU1BUklBIFNBTEFaQVIgUkFVTCBFUk5FU1RPIn1dIjtzOjE5OiJjYW5jZWxsYXRpb25fcmVhc29uIjtOO3M6MTk6ImhlYWRfb2ZmaWNlX2FkZHJlc3MiO3M6NTU6IlNBTlRBIEVMRU5BIC8gU0FOVEEgRUxFTkEgLyBTQU5UQSBFTEVOQSAvIDEgUy9OIFkgQU5DT04iO3M6MTE6ImRlYnRfYW1vdW50IjtOO3M6MTY6ImRlYnRfZGVzY3JpcHRpb24iO047czoxNDoiZXN0YWJsaXNobWVudHMiO3M6MzAwOiJbeyJlc3RhYmxpc2htZW50X251bWJlciI6IjAwMSIsImNvbW1lcmNpYWxfbmFtZSI6IjNGQVNJQ08gUy5BLiIsImVzdGFibGlzaG1lbnRfdHlwZSI6Ik1BVCIsImNvbXBsZXRlX2FkZHJlc3MiOiJTQU5UQSBFTEVOQSBcLyBTQU5UQSBFTEVOQSBcLyBTQU5UQSBFTEVOQSBcLyAxIFNcL04gWSBBTkNPTiIsImVzdGFibGlzaG1lbnRfc3RhdHVzIjoiQUJJRVJUTyIsImlzX2hlYWRxdWFydGVycyI6dHJ1ZSwicHJvdmluY2UiOiJTQU5UQSBFTEVOQSIsImNhbnRvbiI6IlNBTlRBIEVMRU5BIiwicGFyaXNoIjoiU0FOVEEgRUxFTkEifV0iO3M6OToiY2hhbGxlbmdlIjtOO3M6OToicmVtaXNzaW9uIjtOO3M6MTA6InVwZGF0ZWRfYXQiO3M6MTk6IjIwMjUtMDgtMDIgMDQ6NDc6MzgiO3M6MTA6ImNyZWF0ZWRfYXQiO3M6MTk6IjIwMjUtMDgtMDIgMDQ6NDc6MzgiO31zOjEwOiIAKgBjaGFuZ2VzIjthOjA6e31zOjExOiIAKgBwcmV2aW91cyI7YTowOnt9czo4OiIAKgBjYXN0cyI7YTo0OntzOjE0OiJlc3RhYmxpc2htZW50cyI7czo1OiJhcnJheSI7czo5OiJjaGFsbGVuZ2UiO3M6NToiYXJyYXkiO3M6OToicmVtaXNzaW9uIjtzOjU6ImFycmF5IjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6NToiYXJyYXkiO31zOjE3OiIAKgBjbGFzc0Nhc3RDYWNoZSI7YTowOnt9czoyMToiACoAYXR0cmlidXRlQ2FzdENhY2hlIjthOjA6e31zOjEzOiIAKgBkYXRlRm9ybWF0IjtOO3M6MTA6IgAqAGFwcGVuZHMiO2E6MDp7fXM6MTk6IgAqAGRpc3BhdGNoZXNFdmVudHMiO2E6MDp7fXM6MTQ6IgAqAG9ic2VydmFibGVzIjthOjA6e31zOjEyOiIAKgByZWxhdGlvbnMiO2E6MDp7fXM6MTA6IgAqAHRvdWNoZXMiO2E6MDp7fXM6Mjc6IgAqAHJlbGF0aW9uQXV0b2xvYWRDYWxsYmFjayI7TjtzOjI2OiIAKgByZWxhdGlvbkF1dG9sb2FkQ29udGV4dCI7TjtzOjEwOiJ0aW1lc3RhbXBzIjtiOjE7czoxMzoidXNlc1VuaXF1ZUlkcyI7YjowO3M6OToiACoAaGlkZGVuIjthOjA6e31zOjEwOiIAKgB2aXNpYmxlIjthOjA6e31zOjExOiIAKgBmaWxsYWJsZSI7YToyNzp7aTowO3M6MTQ6ImlkZW50aWZpY2F0aW9uIjtpOjE7czoxMzoiYnVzaW5lc3NfbmFtZSI7aToyO3M6MTA6ImxlZ2FsX25hbWUiO2k6MztzOjE1OiJjb21tZXJjaWFsX25hbWUiO2k6NDtzOjY6InN0YXR1cyI7aTo1O3M6MTM6InRheHBheWVyX3R5cGUiO2k6NjtzOjE1OiJ0YXhwYXllcl9zdGF0dXMiO2k6NztzOjE0OiJ0YXhwYXllcl9jbGFzcyI7aTo4O3M6NjoicmVnaW1lIjtpOjk7czoxMzoibWFpbl9hY3Rpdml0eSI7aToxMDtzOjEwOiJzdGFydF9kYXRlIjtpOjExO3M6MTQ6ImNlc3NhdGlvbl9kYXRlIjtpOjEyO3M6MTI6InJlc3RhcnRfZGF0ZSI7aToxMztzOjExOiJ1cGRhdGVfZGF0ZSI7aToxNDtzOjE5OiJhY2NvdW50aW5nX3JlcXVpcmVkIjtpOjE1O3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtpOjE2O3M6MTY6InNwZWNpYWxfdGF4cGF5ZXIiO2k6MTc7czoxNDoiZ2hvc3RfdGF4cGF5ZXIiO2k6MTg7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtpOjE5O3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7aToyMDtzOjE5OiJjYW5jZWxsYXRpb25fcmVhc29uIjtpOjIxO3M6MTk6ImhlYWRfb2ZmaWNlX2FkZHJlc3MiO2k6MjI7czoxMToiZGVidF9hbW91bnQiO2k6MjM7czoxNjoiZGVidF9kZXNjcmlwdGlvbiI7aToyNDtzOjE0OiJlc3RhYmxpc2htZW50cyI7aToyNTtzOjk6ImNoYWxsZW5nZSI7aToyNjtzOjk6InJlbWlzc2lvbiI7fXM6MTA6IgAqAGd1YXJkZWQiO2E6MTp7aTowO3M6MToiKiI7fX0=	1754131646
fact_cachesri_data_266105592631a3cc79476ecc6fe5bc43	TzoxODoiQXBwXE1vZGVsc1xTUklcU3JpIjozMzp7czoxMzoiACoAY29ubmVjdGlvbiI7czo1OiJwZ3NxbCI7czo4OiIAKgB0YWJsZSI7czo0OiJzcmlzIjtzOjEzOiIAKgBwcmltYXJ5S2V5IjtzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMDoiACoAa2V5VHlwZSI7czo2OiJzdHJpbmciO3M6MTI6ImluY3JlbWVudGluZyI7YjowO3M6NzoiACoAd2l0aCI7YTowOnt9czoxMjoiACoAd2l0aENvdW50IjthOjA6e31zOjE5OiJwcmV2ZW50c0xhenlMb2FkaW5nIjtiOjA7czoxMDoiACoAcGVyUGFnZSI7aToxNTtzOjY6ImV4aXN0cyI7YjoxO3M6MTg6Indhc1JlY2VudGx5Q3JlYXRlZCI7YjoxO3M6Mjg6IgAqAGVzY2FwZVdoZW5DYXN0aW5nVG9TdHJpbmciO2I6MDtzOjEzOiIAKgBhdHRyaWJ1dGVzIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMDE5NTEyMDEwMjAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoyMDoiR0VORVNJUyBETyZETCBTLkEuUy4iO3M6MTA6ImxlZ2FsX25hbWUiO3M6MjA6IkdFTkVTSVMgRE8mREwgUy5BLlMuIjtzOjE1OiJjb21tZXJjaWFsX25hbWUiO047czo2OiJzdGF0dXMiO047czoxMzoidGF4cGF5ZXJfdHlwZSI7czo4OiJTT0NJRURBRCI7czoxNToidGF4cGF5ZXJfc3RhdHVzIjtOO3M6MTQ6InRheHBheWVyX2NsYXNzIjtOO3M6NjoicmVnaW1lIjtzOjU6IlJJTVBFIjtzOjEzOiJtYWluX2FjdGl2aXR5IjtzOjM2OiJTRVJWSUNJT1MgREUgVEFTQUNJw5NOIElOTU9CSUxJQVJJQS4iO3M6MTA6InN0YXJ0X2RhdGUiO047czoxNDoiY2Vzc2F0aW9uX2RhdGUiO047czoxMjoicmVzdGFydF9kYXRlIjtOO3M6MTE6InVwZGF0ZV9kYXRlIjtOO3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO3M6MjoiU0kiO3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtzOjI6Ik5PIjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtzOjI6Ik5PIjtzOjE0OiJnaG9zdF90YXhwYXllciI7czoyOiJOTyI7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtzOjI6Ik5PIjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6NjU6Ilt7ImlkZW50aWZpY2FjaW9uIjoiMDE1MjM5MDYyMSIsIm5vbWJyZSI6Ik9OVUZGRVIgREFMRSBSSUNIQVJEIn1dIjtzOjE5OiJjYW5jZWxsYXRpb25fcmVhc29uIjtOO3M6MTk6ImhlYWRfb2ZmaWNlX2FkZHJlc3MiO3M6NzU6IkFaVUFZIC8gQ1VFTkNBIC8gU0FOIFNFQkFTVElBTiAvIFZJQ1RPUiBNQU5VRUwgQUxCT1JOT1ogUy9OIFkgREFOSUVMIE1Vw5FPWiI7czoxMToiZGVidF9hbW91bnQiO047czoxNjoiZGVidF9kZXNjcmlwdGlvbiI7TjtzOjE0OiJlc3RhYmxpc2htZW50cyI7czozMDU6Ilt7ImVzdGFibGlzaG1lbnRfbnVtYmVyIjoiMDAxIiwiY29tbWVyY2lhbF9uYW1lIjpudWxsLCJlc3RhYmxpc2htZW50X3R5cGUiOiJNQVQiLCJjb21wbGV0ZV9hZGRyZXNzIjoiQVpVQVkgXC8gQ1VFTkNBIFwvIFNBTiBTRUJBU1RJQU4gXC8gVklDVE9SIE1BTlVFTCBBTEJPUk5PWiBTXC9OIFkgREFOSUVMIE1VXHUwMGQxT1oiLCJlc3RhYmxpc2htZW50X3N0YXR1cyI6IkFCSUVSVE8iLCJpc19oZWFkcXVhcnRlcnMiOnRydWUsInByb3ZpbmNlIjoiQVpVQVkiLCJjYW50b24iOiJDVUVOQ0EiLCJwYXJpc2giOiJTQU4gU0VCQVNUSUFOIn1dIjtzOjk6ImNoYWxsZW5nZSI7TjtzOjk6InJlbWlzc2lvbiI7TjtzOjEwOiJ1cGRhdGVkX2F0IjtzOjE5OiIyMDI1LTA4LTAyIDAzOjQxOjE4IjtzOjEwOiJjcmVhdGVkX2F0IjtzOjE5OiIyMDI1LTA4LTAyIDAzOjQxOjE4Ijt9czoxMToiACoAb3JpZ2luYWwiO2E6Mjk6e3M6MTQ6ImlkZW50aWZpY2F0aW9uIjtzOjEzOiIwMTk1MTIwMTAyMDAxIjtzOjEzOiJidXNpbmVzc19uYW1lIjtzOjIwOiJHRU5FU0lTIERPJkRMIFMuQS5TLiI7czoxMDoibGVnYWxfbmFtZSI7czoyMDoiR0VORVNJUyBETyZETCBTLkEuUy4iO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7TjtzOjY6InN0YXR1cyI7TjtzOjEzOiJ0YXhwYXllcl90eXBlIjtzOjg6IlNPQ0lFREFEIjtzOjE1OiJ0YXhwYXllcl9zdGF0dXMiO047czoxNDoidGF4cGF5ZXJfY2xhc3MiO047czo2OiJyZWdpbWUiO3M6NToiUklNUEUiO3M6MTM6Im1haW5fYWN0aXZpdHkiO3M6MzY6IlNFUlZJQ0lPUyBERSBUQVNBQ0nDk04gSU5NT0JJTElBUklBLiI7czoxMDoic3RhcnRfZGF0ZSI7TjtzOjE0OiJjZXNzYXRpb25fZGF0ZSI7TjtzOjEyOiJyZXN0YXJ0X2RhdGUiO047czoxMToidXBkYXRlX2RhdGUiO047czoxOToiYWNjb3VudGluZ19yZXF1aXJlZCI7czoyOiJTSSI7czoxNzoid2l0aGhvbGRpbmdfYWdlbnQiO3M6MjoiTk8iO3M6MTY6InNwZWNpYWxfdGF4cGF5ZXIiO3M6MjoiTk8iO3M6MTQ6Imdob3N0X3RheHBheWVyIjtzOjI6Ik5PIjtzOjI0OiJub25leGlzdGVudF90cmFuc2FjdGlvbnMiO3M6MjoiTk8iO3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7czo2NToiW3siaWRlbnRpZmljYWNpb24iOiIwMTUyMzkwNjIxIiwibm9tYnJlIjoiT05VRkZFUiBEQUxFIFJJQ0hBUkQifV0iO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO047czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7czo3NToiQVpVQVkgLyBDVUVOQ0EgLyBTQU4gU0VCQVNUSUFOIC8gVklDVE9SIE1BTlVFTCBBTEJPUk5PWiBTL04gWSBEQU5JRUwgTVXDkU9aIjtzOjExOiJkZWJ0X2Ftb3VudCI7TjtzOjE2OiJkZWJ0X2Rlc2NyaXB0aW9uIjtOO3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtzOjMwNToiW3siZXN0YWJsaXNobWVudF9udW1iZXIiOiIwMDEiLCJjb21tZXJjaWFsX25hbWUiOm51bGwsImVzdGFibGlzaG1lbnRfdHlwZSI6Ik1BVCIsImNvbXBsZXRlX2FkZHJlc3MiOiJBWlVBWSBcLyBDVUVOQ0EgXC8gU0FOIFNFQkFTVElBTiBcLyBWSUNUT1IgTUFOVUVMIEFMQk9STk9aIFNcL04gWSBEQU5JRUwgTVVcdTAwZDFPWiIsImVzdGFibGlzaG1lbnRfc3RhdHVzIjoiQUJJRVJUTyIsImlzX2hlYWRxdWFydGVycyI6dHJ1ZSwicHJvdmluY2UiOiJBWlVBWSIsImNhbnRvbiI6IkNVRU5DQSIsInBhcmlzaCI6IlNBTiBTRUJBU1RJQU4ifV0iO3M6OToiY2hhbGxlbmdlIjtOO3M6OToicmVtaXNzaW9uIjtOO3M6MTA6InVwZGF0ZWRfYXQiO3M6MTk6IjIwMjUtMDgtMDIgMDM6NDE6MTgiO3M6MTA6ImNyZWF0ZWRfYXQiO3M6MTk6IjIwMjUtMDgtMDIgMDM6NDE6MTgiO31zOjEwOiIAKgBjaGFuZ2VzIjthOjA6e31zOjExOiIAKgBwcmV2aW91cyI7YTowOnt9czo4OiIAKgBjYXN0cyI7YTo0OntzOjE0OiJlc3RhYmxpc2htZW50cyI7czo1OiJhcnJheSI7czo5OiJjaGFsbGVuZ2UiO3M6NToiYXJyYXkiO3M6OToicmVtaXNzaW9uIjtzOjU6ImFycmF5IjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6NToiYXJyYXkiO31zOjE3OiIAKgBjbGFzc0Nhc3RDYWNoZSI7YTowOnt9czoyMToiACoAYXR0cmlidXRlQ2FzdENhY2hlIjthOjA6e31zOjEzOiIAKgBkYXRlRm9ybWF0IjtOO3M6MTA6IgAqAGFwcGVuZHMiO2E6MDp7fXM6MTk6IgAqAGRpc3BhdGNoZXNFdmVudHMiO2E6MDp7fXM6MTQ6IgAqAG9ic2VydmFibGVzIjthOjA6e31zOjEyOiIAKgByZWxhdGlvbnMiO2E6MDp7fXM6MTA6IgAqAHRvdWNoZXMiO2E6MDp7fXM6Mjc6IgAqAHJlbGF0aW9uQXV0b2xvYWRDYWxsYmFjayI7TjtzOjI2OiIAKgByZWxhdGlvbkF1dG9sb2FkQ29udGV4dCI7TjtzOjEwOiJ0aW1lc3RhbXBzIjtiOjE7czoxMzoidXNlc1VuaXF1ZUlkcyI7YjowO3M6OToiACoAaGlkZGVuIjthOjA6e31zOjEwOiIAKgB2aXNpYmxlIjthOjA6e31zOjExOiIAKgBmaWxsYWJsZSI7YToyNzp7aTowO3M6MTQ6ImlkZW50aWZpY2F0aW9uIjtpOjE7czoxMzoiYnVzaW5lc3NfbmFtZSI7aToyO3M6MTA6ImxlZ2FsX25hbWUiO2k6MztzOjE1OiJjb21tZXJjaWFsX25hbWUiO2k6NDtzOjY6InN0YXR1cyI7aTo1O3M6MTM6InRheHBheWVyX3R5cGUiO2k6NjtzOjE1OiJ0YXhwYXllcl9zdGF0dXMiO2k6NztzOjE0OiJ0YXhwYXllcl9jbGFzcyI7aTo4O3M6NjoicmVnaW1lIjtpOjk7czoxMzoibWFpbl9hY3Rpdml0eSI7aToxMDtzOjEwOiJzdGFydF9kYXRlIjtpOjExO3M6MTQ6ImNlc3NhdGlvbl9kYXRlIjtpOjEyO3M6MTI6InJlc3RhcnRfZGF0ZSI7aToxMztzOjExOiJ1cGRhdGVfZGF0ZSI7aToxNDtzOjE5OiJhY2NvdW50aW5nX3JlcXVpcmVkIjtpOjE1O3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtpOjE2O3M6MTY6InNwZWNpYWxfdGF4cGF5ZXIiO2k6MTc7czoxNDoiZ2hvc3RfdGF4cGF5ZXIiO2k6MTg7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtpOjE5O3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7aToyMDtzOjE5OiJjYW5jZWxsYXRpb25fcmVhc29uIjtpOjIxO3M6MTk6ImhlYWRfb2ZmaWNlX2FkZHJlc3MiO2k6MjI7czoxMToiZGVidF9hbW91bnQiO2k6MjM7czoxNjoiZGVidF9kZXNjcmlwdGlvbiI7aToyNDtzOjE0OiJlc3RhYmxpc2htZW50cyI7aToyNTtzOjk6ImNoYWxsZW5nZSI7aToyNjtzOjk6InJlbWlzc2lvbiI7fXM6MTA6IgAqAGd1YXJkZWQiO2E6MTp7aTowO3M6MToiKiI7fX0=	1754127678
fact_cachef1f70ec40aaa556905d4a030501c0ba4:timer	i:1754453984;	1754453984
fact_cachesri_data_598278875f7afc871981341510b59786	TzoxODoiQXBwXE1vZGVsc1xTUklcU3JpIjozMzp7czoxMzoiACoAY29ubmVjdGlvbiI7czo1OiJwZ3NxbCI7czo4OiIAKgB0YWJsZSI7czo0OiJzcmlzIjtzOjEzOiIAKgBwcmltYXJ5S2V5IjtzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMDoiACoAa2V5VHlwZSI7czo2OiJzdHJpbmciO3M6MTI6ImluY3JlbWVudGluZyI7YjowO3M6NzoiACoAd2l0aCI7YTowOnt9czoxMjoiACoAd2l0aENvdW50IjthOjA6e31zOjE5OiJwcmV2ZW50c0xhenlMb2FkaW5nIjtiOjA7czoxMDoiACoAcGVyUGFnZSI7aToxNTtzOjY6ImV4aXN0cyI7YjoxO3M6MTg6Indhc1JlY2VudGx5Q3JlYXRlZCI7YjoxO3M6Mjg6IgAqAGVzY2FwZVdoZW5DYXN0aW5nVG9TdHJpbmciO2I6MDtzOjEzOiIAKgBhdHRyaWJ1dGVzIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMTc5MTc2NzM1NzAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czo0OToiR0VORVNJUyBDT01NVU5JQ0FUSU9OIExBVElOT0FNRVJJQ0FOQSBHRUNPTEEgUy5BLiI7czoxMDoibGVnYWxfbmFtZSI7czo0OToiR0VORVNJUyBDT01NVU5JQ0FUSU9OIExBVElOT0FNRVJJQ0FOQSBHRUNPTEEgUy5BLiI7czoxNToiY29tbWVyY2lhbF9uYW1lIjtOO3M6Njoic3RhdHVzIjtOO3M6MTM6InRheHBheWVyX3R5cGUiO3M6ODoiU09DSUVEQUQiO3M6MTU6InRheHBheWVyX3N0YXR1cyI7TjtzOjE0OiJ0YXhwYXllcl9jbGFzcyI7TjtzOjY6InJlZ2ltZSI7czo3OiJHRU5FUkFMIjtzOjEzOiJtYWluX2FjdGl2aXR5IjtzOjYyNjoiQUNUSVZJREFERVMgREUgQ1JFQUNJw5NOIERFTCBQUk9HUkFNQSBDT01QTEVUTyBERSBVTkEgQ0FERU5BIERFIFRFTEVWSVNJw5NOIFBBUkEgVU4gQ0FOQUwsIERFU0RFIExBIENPTVBSQSBERSBMT1MgQ09NUE9ORU5URVMgREVMIFBST0dSQU1BIChQRUzDjUNVTEFTLCBET0NVTUVOVEFMRVMsIEVUQ8OJVEVSQS4pIEhBU1RBIExBIFBST0RVQ0NJw5NOIFBST1BJQSBERSBMT1MgQ09NUE9ORU5URVMgREVMIFBST0dSQU1BIEFVVE8gUFJPRFVDSURPUyAoTk9USUNJQVMgTE9DQUxFUywgUkVQT1JUQUpFUyBFTiBWSVZPKSBPIFVOQSBDT01CSU5BQ0nDk04gREUgTEFTIERPUyBPUENJT05FUy4gRUwgUFJPR1JBTUEgQ09NUExFVE8gREUgVEVMRVZJU0nDk04gUFVFREUgU0VSIEVNSVRJRE8gUE9SIExBUyBVTklEQURFUyBERSBQUk9EVUNDScOTTiBPIEJJRU4gUFJPRFVDSVJTRSBQQVJBIFNVIFRSQU5TTUlTScOTTiBQT1IgVEVSQ0VST1MgRElTVFJJQlVJRE9SRVMsIENPTU8gQ09NUEHDkcONQVMgREUgRU1JU0nDk04gUE9SIENBQkxFIE8gUFJPVkVFRE9SRVMgREUgVEVMRVZJU0nDk04gUE9SIFNBVMOJTElURSwgSU5DTFVZRSBMQSBQUk9HUkFNQUNJw5NOIERFIENBTkFMRVMgREUgVklERU8gQSBMQSBDQVJUQS4iO3M6MTA6InN0YXJ0X2RhdGUiO047czoxNDoiY2Vzc2F0aW9uX2RhdGUiO047czoxMjoicmVzdGFydF9kYXRlIjtOO3M6MTE6InVwZGF0ZV9kYXRlIjtOO3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO3M6MjoiU0kiO3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtzOjI6Ik5PIjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtzOjI6Ik5PIjtzOjE0OiJnaG9zdF90YXhwYXllciI7czoyOiJOTyI7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtzOjI6Ik5PIjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6NzM6Ilt7ImlkZW50aWZpY2FjaW9uIjoiMTcwMDIwNjE4NiIsIm5vbWJyZSI6IkZMT1JFUyBCRVJNRU8gTkVTVE9SIE9TV0FMRE8ifV0iO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO3M6OToiRVhUSU5DSU9OIjtzOjE5OiJoZWFkX29mZmljZV9hZGRyZXNzIjtzOjg2OiJQSUNISU5DSEEgLyBRVUlUTyAvIFFVSVRPIERJU1RSSVRPIE1FVFJPUE9MSVRBTk8gLyBBVi4gQlJBU0lMIDk0MSBZIE1BUklBTk8gRUNIRVZFUlJJQSI7czoxMToiZGVidF9hbW91bnQiO047czoxNjoiZGVidF9kZXNjcmlwdGlvbiI7TjtzOjE0OiJlc3RhYmxpc2htZW50cyI7czozMjk6Ilt7ImVzdGFibGlzaG1lbnRfbnVtYmVyIjoiMDAxIiwiY29tbWVyY2lhbF9uYW1lIjpudWxsLCJlc3RhYmxpc2htZW50X3R5cGUiOiJNQVQiLCJjb21wbGV0ZV9hZGRyZXNzIjoiUElDSElOQ0hBIFwvIFFVSVRPIFwvIFFVSVRPIERJU1RSSVRPIE1FVFJPUE9MSVRBTk8gXC8gQVYuIEJSQVNJTCA5NDEgWSBNQVJJQU5PIEVDSEVWRVJSSUEiLCJlc3RhYmxpc2htZW50X3N0YXR1cyI6IkNFUlJBRE8iLCJpc19oZWFkcXVhcnRlcnMiOnRydWUsInByb3ZpbmNlIjoiUElDSElOQ0hBIiwiY2FudG9uIjoiUVVJVE8iLCJwYXJpc2giOiJRVUlUTyBESVNUUklUTyBNRVRST1BPTElUQU5PIn1dIjtzOjk6ImNoYWxsZW5nZSI7TjtzOjk6InJlbWlzc2lvbiI7TjtzOjEwOiJ1cGRhdGVkX2F0IjtzOjE5OiIyMDI1LTA4LTAyIDAzOjMxOjMyIjtzOjEwOiJjcmVhdGVkX2F0IjtzOjE5OiIyMDI1LTA4LTAyIDAzOjMxOjMyIjt9czoxMToiACoAb3JpZ2luYWwiO2E6Mjk6e3M6MTQ6ImlkZW50aWZpY2F0aW9uIjtzOjEzOiIxNzkxNzY3MzU3MDAxIjtzOjEzOiJidXNpbmVzc19uYW1lIjtzOjQ5OiJHRU5FU0lTIENPTU1VTklDQVRJT04gTEFUSU5PQU1FUklDQU5BIEdFQ09MQSBTLkEuIjtzOjEwOiJsZWdhbF9uYW1lIjtzOjQ5OiJHRU5FU0lTIENPTU1VTklDQVRJT04gTEFUSU5PQU1FUklDQU5BIEdFQ09MQSBTLkEuIjtzOjE1OiJjb21tZXJjaWFsX25hbWUiO047czo2OiJzdGF0dXMiO047czoxMzoidGF4cGF5ZXJfdHlwZSI7czo4OiJTT0NJRURBRCI7czoxNToidGF4cGF5ZXJfc3RhdHVzIjtOO3M6MTQ6InRheHBheWVyX2NsYXNzIjtOO3M6NjoicmVnaW1lIjtzOjc6IkdFTkVSQUwiO3M6MTM6Im1haW5fYWN0aXZpdHkiO3M6NjI2OiJBQ1RJVklEQURFUyBERSBDUkVBQ0nDk04gREVMIFBST0dSQU1BIENPTVBMRVRPIERFIFVOQSBDQURFTkEgREUgVEVMRVZJU0nDk04gUEFSQSBVTiBDQU5BTCwgREVTREUgTEEgQ09NUFJBIERFIExPUyBDT01QT05FTlRFUyBERUwgUFJPR1JBTUEgKFBFTMONQ1VMQVMsIERPQ1VNRU5UQUxFUywgRVRDw4lURVJBLikgSEFTVEEgTEEgUFJPRFVDQ0nDk04gUFJPUElBIERFIExPUyBDT01QT05FTlRFUyBERUwgUFJPR1JBTUEgQVVUTyBQUk9EVUNJRE9TIChOT1RJQ0lBUyBMT0NBTEVTLCBSRVBPUlRBSkVTIEVOIFZJVk8pIE8gVU5BIENPTUJJTkFDScOTTiBERSBMQVMgRE9TIE9QQ0lPTkVTLiBFTCBQUk9HUkFNQSBDT01QTEVUTyBERSBURUxFVklTScOTTiBQVUVERSBTRVIgRU1JVElETyBQT1IgTEFTIFVOSURBREVTIERFIFBST0RVQ0NJw5NOIE8gQklFTiBQUk9EVUNJUlNFIFBBUkEgU1UgVFJBTlNNSVNJw5NOIFBPUiBURVJDRVJPUyBESVNUUklCVUlET1JFUywgQ09NTyBDT01QQcORw41BUyBERSBFTUlTScOTTiBQT1IgQ0FCTEUgTyBQUk9WRUVET1JFUyBERSBURUxFVklTScOTTiBQT1IgU0FUw4lMSVRFLCBJTkNMVVlFIExBIFBST0dSQU1BQ0nDk04gREUgQ0FOQUxFUyBERSBWSURFTyBBIExBIENBUlRBLiI7czoxMDoic3RhcnRfZGF0ZSI7TjtzOjE0OiJjZXNzYXRpb25fZGF0ZSI7TjtzOjEyOiJyZXN0YXJ0X2RhdGUiO047czoxMToidXBkYXRlX2RhdGUiO047czoxOToiYWNjb3VudGluZ19yZXF1aXJlZCI7czoyOiJTSSI7czoxNzoid2l0aGhvbGRpbmdfYWdlbnQiO3M6MjoiTk8iO3M6MTY6InNwZWNpYWxfdGF4cGF5ZXIiO3M6MjoiTk8iO3M6MTQ6Imdob3N0X3RheHBheWVyIjtzOjI6Ik5PIjtzOjI0OiJub25leGlzdGVudF90cmFuc2FjdGlvbnMiO3M6MjoiTk8iO3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7czo3MzoiW3siaWRlbnRpZmljYWNpb24iOiIxNzAwMjA2MTg2Iiwibm9tYnJlIjoiRkxPUkVTIEJFUk1FTyBORVNUT1IgT1NXQUxETyJ9XSI7czoxOToiY2FuY2VsbGF0aW9uX3JlYXNvbiI7czo5OiJFWFRJTkNJT04iO3M6MTk6ImhlYWRfb2ZmaWNlX2FkZHJlc3MiO3M6ODY6IlBJQ0hJTkNIQSAvIFFVSVRPIC8gUVVJVE8gRElTVFJJVE8gTUVUUk9QT0xJVEFOTyAvIEFWLiBCUkFTSUwgOTQxIFkgTUFSSUFOTyBFQ0hFVkVSUklBIjtzOjExOiJkZWJ0X2Ftb3VudCI7TjtzOjE2OiJkZWJ0X2Rlc2NyaXB0aW9uIjtOO3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtzOjMyOToiW3siZXN0YWJsaXNobWVudF9udW1iZXIiOiIwMDEiLCJjb21tZXJjaWFsX25hbWUiOm51bGwsImVzdGFibGlzaG1lbnRfdHlwZSI6Ik1BVCIsImNvbXBsZXRlX2FkZHJlc3MiOiJQSUNISU5DSEEgXC8gUVVJVE8gXC8gUVVJVE8gRElTVFJJVE8gTUVUUk9QT0xJVEFOTyBcLyBBVi4gQlJBU0lMIDk0MSBZIE1BUklBTk8gRUNIRVZFUlJJQSIsImVzdGFibGlzaG1lbnRfc3RhdHVzIjoiQ0VSUkFETyIsImlzX2hlYWRxdWFydGVycyI6dHJ1ZSwicHJvdmluY2UiOiJQSUNISU5DSEEiLCJjYW50b24iOiJRVUlUTyIsInBhcmlzaCI6IlFVSVRPIERJU1RSSVRPIE1FVFJPUE9MSVRBTk8ifV0iO3M6OToiY2hhbGxlbmdlIjtOO3M6OToicmVtaXNzaW9uIjtOO3M6MTA6InVwZGF0ZWRfYXQiO3M6MTk6IjIwMjUtMDgtMDIgMDM6MzE6MzIiO3M6MTA6ImNyZWF0ZWRfYXQiO3M6MTk6IjIwMjUtMDgtMDIgMDM6MzE6MzIiO31zOjEwOiIAKgBjaGFuZ2VzIjthOjA6e31zOjExOiIAKgBwcmV2aW91cyI7YTowOnt9czo4OiIAKgBjYXN0cyI7YTo0OntzOjE0OiJlc3RhYmxpc2htZW50cyI7czo1OiJhcnJheSI7czo5OiJjaGFsbGVuZ2UiO3M6NToiYXJyYXkiO3M6OToicmVtaXNzaW9uIjtzOjU6ImFycmF5IjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6NToiYXJyYXkiO31zOjE3OiIAKgBjbGFzc0Nhc3RDYWNoZSI7YTowOnt9czoyMToiACoAYXR0cmlidXRlQ2FzdENhY2hlIjthOjA6e31zOjEzOiIAKgBkYXRlRm9ybWF0IjtOO3M6MTA6IgAqAGFwcGVuZHMiO2E6MDp7fXM6MTk6IgAqAGRpc3BhdGNoZXNFdmVudHMiO2E6MDp7fXM6MTQ6IgAqAG9ic2VydmFibGVzIjthOjA6e31zOjEyOiIAKgByZWxhdGlvbnMiO2E6MDp7fXM6MTA6IgAqAHRvdWNoZXMiO2E6MDp7fXM6Mjc6IgAqAHJlbGF0aW9uQXV0b2xvYWRDYWxsYmFjayI7TjtzOjI2OiIAKgByZWxhdGlvbkF1dG9sb2FkQ29udGV4dCI7TjtzOjEwOiJ0aW1lc3RhbXBzIjtiOjE7czoxMzoidXNlc1VuaXF1ZUlkcyI7YjowO3M6OToiACoAaGlkZGVuIjthOjA6e31zOjEwOiIAKgB2aXNpYmxlIjthOjA6e31zOjExOiIAKgBmaWxsYWJsZSI7YToyNzp7aTowO3M6MTQ6ImlkZW50aWZpY2F0aW9uIjtpOjE7czoxMzoiYnVzaW5lc3NfbmFtZSI7aToyO3M6MTA6ImxlZ2FsX25hbWUiO2k6MztzOjE1OiJjb21tZXJjaWFsX25hbWUiO2k6NDtzOjY6InN0YXR1cyI7aTo1O3M6MTM6InRheHBheWVyX3R5cGUiO2k6NjtzOjE1OiJ0YXhwYXllcl9zdGF0dXMiO2k6NztzOjE0OiJ0YXhwYXllcl9jbGFzcyI7aTo4O3M6NjoicmVnaW1lIjtpOjk7czoxMzoibWFpbl9hY3Rpdml0eSI7aToxMDtzOjEwOiJzdGFydF9kYXRlIjtpOjExO3M6MTQ6ImNlc3NhdGlvbl9kYXRlIjtpOjEyO3M6MTI6InJlc3RhcnRfZGF0ZSI7aToxMztzOjExOiJ1cGRhdGVfZGF0ZSI7aToxNDtzOjE5OiJhY2NvdW50aW5nX3JlcXVpcmVkIjtpOjE1O3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtpOjE2O3M6MTY6InNwZWNpYWxfdGF4cGF5ZXIiO2k6MTc7czoxNDoiZ2hvc3RfdGF4cGF5ZXIiO2k6MTg7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtpOjE5O3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7aToyMDtzOjE5OiJjYW5jZWxsYXRpb25fcmVhc29uIjtpOjIxO3M6MTk6ImhlYWRfb2ZmaWNlX2FkZHJlc3MiO2k6MjI7czoxMToiZGVidF9hbW91bnQiO2k6MjM7czoxNjoiZGVidF9kZXNjcmlwdGlvbiI7aToyNDtzOjE0OiJlc3RhYmxpc2htZW50cyI7aToyNTtzOjk6ImNoYWxsZW5nZSI7aToyNjtzOjk6InJlbWlzc2lvbiI7fXM6MTA6IgAqAGd1YXJkZWQiO2E6MTp7aTowO3M6MToiKiI7fX0=	1754127092
fact_cachesri_data_0caec17cffd372e612ff1f36fa123e66	TzoxODoiQXBwXE1vZGVsc1xTUklcU3JpIjozMzp7czoxMzoiACoAY29ubmVjdGlvbiI7czo1OiJwZ3NxbCI7czo4OiIAKgB0YWJsZSI7czo0OiJzcmlzIjtzOjEzOiIAKgBwcmltYXJ5S2V5IjtzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMDoiACoAa2V5VHlwZSI7czo2OiJzdHJpbmciO3M6MTI6ImluY3JlbWVudGluZyI7YjowO3M6NzoiACoAd2l0aCI7YTowOnt9czoxMjoiACoAd2l0aENvdW50IjthOjA6e31zOjE5OiJwcmV2ZW50c0xhenlMb2FkaW5nIjtiOjA7czoxMDoiACoAcGVyUGFnZSI7aToxNTtzOjY6ImV4aXN0cyI7YjoxO3M6MTg6Indhc1JlY2VudGx5Q3JlYXRlZCI7YjoxO3M6Mjg6IgAqAGVzY2FwZVdoZW5DYXN0aW5nVG9TdHJpbmciO2I6MDtzOjEzOiIAKgBhdHRyaWJ1dGVzIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMTc5MjE2MjcyNjAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoxMjoiQUtERU1PUyBTLkEuIjtzOjEwOiJsZWdhbF9uYW1lIjtzOjEyOiJBS0RFTU9TIFMuQS4iO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7TjtzOjY6InN0YXR1cyI7TjtzOjEzOiJ0YXhwYXllcl90eXBlIjtzOjg6IlNPQ0lFREFEIjtzOjE1OiJ0YXhwYXllcl9zdGF0dXMiO047czoxNDoidGF4cGF5ZXJfY2xhc3MiO047czo2OiJyZWdpbWUiO3M6NzoiR0VORVJBTCI7czoxMzoibWFpbl9hY3Rpdml0eSI7czozMjoiT1RST1MgVElQT1MgREUgRU5TRcORQU5aQSBOLkMuUC4iO3M6MTA6InN0YXJ0X2RhdGUiO047czoxNDoiY2Vzc2F0aW9uX2RhdGUiO047czoxMjoicmVzdGFydF9kYXRlIjtOO3M6MTE6InVwZGF0ZV9kYXRlIjtOO3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO3M6MjoiU0kiO3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtzOjI6Ik5PIjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtzOjI6Ik5PIjtzOjE0OiJnaG9zdF90YXhwYXllciI7czoyOiJOTyI7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtzOjI6Ik5PIjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6NzM6Ilt7ImlkZW50aWZpY2FjaW9uIjoiMTcxNzcyMTU0MCIsIm5vbWJyZSI6IkNIQU5BQkEgT1JURUdBIERBVklEIEFSTUFORE8ifV0iO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO047czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7czo1OToiUElDSElOQ0hBIC8gUVVJVE8gLyBTQU4gSlVBTiAvIFVMUElBTk8gUEFFWiBOMTktMjYgWSBQQVRSSUEiO3M6MTE6ImRlYnRfYW1vdW50IjtOO3M6MTY6ImRlYnRfZGVzY3JpcHRpb24iO047czoxNDoiZXN0YWJsaXNobWVudHMiO3M6Mjg3OiJbeyJlc3RhYmxpc2htZW50X251bWJlciI6IjAwMSIsImNvbW1lcmNpYWxfbmFtZSI6IkFLREVNT1MiLCJlc3RhYmxpc2htZW50X3R5cGUiOiJNQVQiLCJjb21wbGV0ZV9hZGRyZXNzIjoiUElDSElOQ0hBIFwvIFFVSVRPIFwvIFNBTiBKVUFOIFwvIFVMUElBTk8gUEFFWiBOMTktMjYgWSBQQVRSSUEiLCJlc3RhYmxpc2htZW50X3N0YXR1cyI6IkFCSUVSVE8iLCJpc19oZWFkcXVhcnRlcnMiOnRydWUsInByb3ZpbmNlIjoiUElDSElOQ0hBIiwiY2FudG9uIjoiUVVJVE8iLCJwYXJpc2giOiJTQU4gSlVBTiJ9XSI7czo5OiJjaGFsbGVuZ2UiO047czo5OiJyZW1pc3Npb24iO047czoxMDoidXBkYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwNDozMzoyMyI7czoxMDoiY3JlYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwNDozMzoyMyI7fXM6MTE6IgAqAG9yaWdpbmFsIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMTc5MjE2MjcyNjAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoxMjoiQUtERU1PUyBTLkEuIjtzOjEwOiJsZWdhbF9uYW1lIjtzOjEyOiJBS0RFTU9TIFMuQS4iO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7TjtzOjY6InN0YXR1cyI7TjtzOjEzOiJ0YXhwYXllcl90eXBlIjtzOjg6IlNPQ0lFREFEIjtzOjE1OiJ0YXhwYXllcl9zdGF0dXMiO047czoxNDoidGF4cGF5ZXJfY2xhc3MiO047czo2OiJyZWdpbWUiO3M6NzoiR0VORVJBTCI7czoxMzoibWFpbl9hY3Rpdml0eSI7czozMjoiT1RST1MgVElQT1MgREUgRU5TRcORQU5aQSBOLkMuUC4iO3M6MTA6InN0YXJ0X2RhdGUiO047czoxNDoiY2Vzc2F0aW9uX2RhdGUiO047czoxMjoicmVzdGFydF9kYXRlIjtOO3M6MTE6InVwZGF0ZV9kYXRlIjtOO3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO3M6MjoiU0kiO3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtzOjI6Ik5PIjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtzOjI6Ik5PIjtzOjE0OiJnaG9zdF90YXhwYXllciI7czoyOiJOTyI7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtzOjI6Ik5PIjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6NzM6Ilt7ImlkZW50aWZpY2FjaW9uIjoiMTcxNzcyMTU0MCIsIm5vbWJyZSI6IkNIQU5BQkEgT1JURUdBIERBVklEIEFSTUFORE8ifV0iO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO047czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7czo1OToiUElDSElOQ0hBIC8gUVVJVE8gLyBTQU4gSlVBTiAvIFVMUElBTk8gUEFFWiBOMTktMjYgWSBQQVRSSUEiO3M6MTE6ImRlYnRfYW1vdW50IjtOO3M6MTY6ImRlYnRfZGVzY3JpcHRpb24iO047czoxNDoiZXN0YWJsaXNobWVudHMiO3M6Mjg3OiJbeyJlc3RhYmxpc2htZW50X251bWJlciI6IjAwMSIsImNvbW1lcmNpYWxfbmFtZSI6IkFLREVNT1MiLCJlc3RhYmxpc2htZW50X3R5cGUiOiJNQVQiLCJjb21wbGV0ZV9hZGRyZXNzIjoiUElDSElOQ0hBIFwvIFFVSVRPIFwvIFNBTiBKVUFOIFwvIFVMUElBTk8gUEFFWiBOMTktMjYgWSBQQVRSSUEiLCJlc3RhYmxpc2htZW50X3N0YXR1cyI6IkFCSUVSVE8iLCJpc19oZWFkcXVhcnRlcnMiOnRydWUsInByb3ZpbmNlIjoiUElDSElOQ0hBIiwiY2FudG9uIjoiUVVJVE8iLCJwYXJpc2giOiJTQU4gSlVBTiJ9XSI7czo5OiJjaGFsbGVuZ2UiO047czo5OiJyZW1pc3Npb24iO047czoxMDoidXBkYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwNDozMzoyMyI7czoxMDoiY3JlYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwNDozMzoyMyI7fXM6MTA6IgAqAGNoYW5nZXMiO2E6MDp7fXM6MTE6IgAqAHByZXZpb3VzIjthOjA6e31zOjg6IgAqAGNhc3RzIjthOjQ6e3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtzOjU6ImFycmF5IjtzOjk6ImNoYWxsZW5nZSI7czo1OiJhcnJheSI7czo5OiJyZW1pc3Npb24iO3M6NToiYXJyYXkiO3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7czo1OiJhcnJheSI7fXM6MTc6IgAqAGNsYXNzQ2FzdENhY2hlIjthOjA6e31zOjIxOiIAKgBhdHRyaWJ1dGVDYXN0Q2FjaGUiO2E6MDp7fXM6MTM6IgAqAGRhdGVGb3JtYXQiO047czoxMDoiACoAYXBwZW5kcyI7YTowOnt9czoxOToiACoAZGlzcGF0Y2hlc0V2ZW50cyI7YTowOnt9czoxNDoiACoAb2JzZXJ2YWJsZXMiO2E6MDp7fXM6MTI6IgAqAHJlbGF0aW9ucyI7YTowOnt9czoxMDoiACoAdG91Y2hlcyI7YTowOnt9czoyNzoiACoAcmVsYXRpb25BdXRvbG9hZENhbGxiYWNrIjtOO3M6MjY6IgAqAHJlbGF0aW9uQXV0b2xvYWRDb250ZXh0IjtOO3M6MTA6InRpbWVzdGFtcHMiO2I6MTtzOjEzOiJ1c2VzVW5pcXVlSWRzIjtiOjA7czo5OiIAKgBoaWRkZW4iO2E6MDp7fXM6MTA6IgAqAHZpc2libGUiO2E6MDp7fXM6MTE6IgAqAGZpbGxhYmxlIjthOjI3OntpOjA7czoxNDoiaWRlbnRpZmljYXRpb24iO2k6MTtzOjEzOiJidXNpbmVzc19uYW1lIjtpOjI7czoxMDoibGVnYWxfbmFtZSI7aTozO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7aTo0O3M6Njoic3RhdHVzIjtpOjU7czoxMzoidGF4cGF5ZXJfdHlwZSI7aTo2O3M6MTU6InRheHBheWVyX3N0YXR1cyI7aTo3O3M6MTQ6InRheHBheWVyX2NsYXNzIjtpOjg7czo2OiJyZWdpbWUiO2k6OTtzOjEzOiJtYWluX2FjdGl2aXR5IjtpOjEwO3M6MTA6InN0YXJ0X2RhdGUiO2k6MTE7czoxNDoiY2Vzc2F0aW9uX2RhdGUiO2k6MTI7czoxMjoicmVzdGFydF9kYXRlIjtpOjEzO3M6MTE6InVwZGF0ZV9kYXRlIjtpOjE0O3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO2k6MTU7czoxNzoid2l0aGhvbGRpbmdfYWdlbnQiO2k6MTY7czoxNjoic3BlY2lhbF90YXhwYXllciI7aToxNztzOjE0OiJnaG9zdF90YXhwYXllciI7aToxODtzOjI0OiJub25leGlzdGVudF90cmFuc2FjdGlvbnMiO2k6MTk7czoyMToibGVnYWxfcmVwcmVzZW50YXRpdmVzIjtpOjIwO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO2k6MjE7czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7aToyMjtzOjExOiJkZWJ0X2Ftb3VudCI7aToyMztzOjE2OiJkZWJ0X2Rlc2NyaXB0aW9uIjtpOjI0O3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtpOjI1O3M6OToiY2hhbGxlbmdlIjtpOjI2O3M6OToicmVtaXNzaW9uIjt9czoxMDoiACoAZ3VhcmRlZCI7YToxOntpOjA7czoxOiIqIjt9fQ==	1754130802
fact_cachesri_data_e87a13f155089924b77002b2e899e360	TzoxODoiQXBwXE1vZGVsc1xTUklcU3JpIjozMzp7czoxMzoiACoAY29ubmVjdGlvbiI7czo1OiJwZ3NxbCI7czo4OiIAKgB0YWJsZSI7czo0OiJzcmlzIjtzOjEzOiIAKgBwcmltYXJ5S2V5IjtzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMDoiACoAa2V5VHlwZSI7czo2OiJzdHJpbmciO3M6MTI6ImluY3JlbWVudGluZyI7YjowO3M6NzoiACoAd2l0aCI7YTowOnt9czoxMjoiACoAd2l0aENvdW50IjthOjA6e31zOjE5OiJwcmV2ZW50c0xhenlMb2FkaW5nIjtiOjA7czoxMDoiACoAcGVyUGFnZSI7aToxNTtzOjY6ImV4aXN0cyI7YjoxO3M6MTg6Indhc1JlY2VudGx5Q3JlYXRlZCI7YjoxO3M6Mjg6IgAqAGVzY2FwZVdoZW5DYXN0aW5nVG9TdHJpbmciO2I6MDtzOjEzOiIAKgBhdHRyaWJ1dGVzIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMDk5MjIxOTQwODAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoxMjoiQUJPTElORSBTLkEuIjtzOjEwOiJsZWdhbF9uYW1lIjtzOjEyOiJBQk9MSU5FIFMuQS4iO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7TjtzOjY6InN0YXR1cyI7TjtzOjEzOiJ0YXhwYXllcl90eXBlIjtzOjg6IlNPQ0lFREFEIjtzOjE1OiJ0YXhwYXllcl9zdGF0dXMiO047czoxNDoidGF4cGF5ZXJfY2xhc3MiO047czo2OiJyZWdpbWUiO3M6NzoiR0VORVJBTCI7czoxMzoibWFpbl9hY3Rpdml0eSI7czo2NDoiRkFCUklDQUNJw5NOIERFIFBST0RVQ1RPUyBRVcONTUlDT1MgSU5PUkfDgU5JQ09TIELDgVNJQ09TIE4uQy5QLiI7czoxMDoic3RhcnRfZGF0ZSI7TjtzOjE0OiJjZXNzYXRpb25fZGF0ZSI7TjtzOjEyOiJyZXN0YXJ0X2RhdGUiO047czoxMToidXBkYXRlX2RhdGUiO047czoxOToiYWNjb3VudGluZ19yZXF1aXJlZCI7czoyOiJTSSI7czoxNzoid2l0aGhvbGRpbmdfYWdlbnQiO3M6MjoiU0kiO3M6MTY6InNwZWNpYWxfdGF4cGF5ZXIiO3M6MjoiTk8iO3M6MTQ6Imdob3N0X3RheHBheWVyIjtzOjI6Ik5PIjtzOjI0OiJub25leGlzdGVudF90cmFuc2FjdGlvbnMiO3M6MjoiTk8iO3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7czo4MDoiW3siaWRlbnRpZmljYWNpb24iOiIwOTI1NDYwOTMzIiwibm9tYnJlIjoiU09UT01BWU9SIFNPVE9NQVlPUiBKT05BVEhBTiBJU01BRUwifV0iO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO047czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7czo2MzoiR1VBWUFTIC8gR1VBWUFRVUlMIC8gVEFSUVVJIC8gNiBQSkUgMzggRCBOTyBTTCAxQiBZIDIgQ0ogMThJIE5PIjtzOjExOiJkZWJ0X2Ftb3VudCI7TjtzOjE2OiJkZWJ0X2Rlc2NyaXB0aW9uIjtOO3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtzOjI5NToiW3siZXN0YWJsaXNobWVudF9udW1iZXIiOiIwMDEiLCJjb21tZXJjaWFsX25hbWUiOiJBQk9MSU5FIFMuQS4iLCJlc3RhYmxpc2htZW50X3R5cGUiOiJNQVQiLCJjb21wbGV0ZV9hZGRyZXNzIjoiR1VBWUFTIFwvIEdVQVlBUVVJTCBcLyBUQVJRVUkgXC8gNiBQSkUgMzggRCBOTyBTTCAxQiBZIDIgQ0ogMThJIE5PIiwiZXN0YWJsaXNobWVudF9zdGF0dXMiOiJBQklFUlRPIiwiaXNfaGVhZHF1YXJ0ZXJzIjp0cnVlLCJwcm92aW5jZSI6IkdVQVlBUyIsImNhbnRvbiI6IkdVQVlBUVVJTCIsInBhcmlzaCI6IlRBUlFVSSJ9XSI7czo5OiJjaGFsbGVuZ2UiO047czo5OiJyZW1pc3Npb24iO047czoxMDoidXBkYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwMzo1MDo1OCI7czoxMDoiY3JlYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwMzo1MDo1OCI7fXM6MTE6IgAqAG9yaWdpbmFsIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMDk5MjIxOTQwODAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoxMjoiQUJPTElORSBTLkEuIjtzOjEwOiJsZWdhbF9uYW1lIjtzOjEyOiJBQk9MSU5FIFMuQS4iO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7TjtzOjY6InN0YXR1cyI7TjtzOjEzOiJ0YXhwYXllcl90eXBlIjtzOjg6IlNPQ0lFREFEIjtzOjE1OiJ0YXhwYXllcl9zdGF0dXMiO047czoxNDoidGF4cGF5ZXJfY2xhc3MiO047czo2OiJyZWdpbWUiO3M6NzoiR0VORVJBTCI7czoxMzoibWFpbl9hY3Rpdml0eSI7czo2NDoiRkFCUklDQUNJw5NOIERFIFBST0RVQ1RPUyBRVcONTUlDT1MgSU5PUkfDgU5JQ09TIELDgVNJQ09TIE4uQy5QLiI7czoxMDoic3RhcnRfZGF0ZSI7TjtzOjE0OiJjZXNzYXRpb25fZGF0ZSI7TjtzOjEyOiJyZXN0YXJ0X2RhdGUiO047czoxMToidXBkYXRlX2RhdGUiO047czoxOToiYWNjb3VudGluZ19yZXF1aXJlZCI7czoyOiJTSSI7czoxNzoid2l0aGhvbGRpbmdfYWdlbnQiO3M6MjoiU0kiO3M6MTY6InNwZWNpYWxfdGF4cGF5ZXIiO3M6MjoiTk8iO3M6MTQ6Imdob3N0X3RheHBheWVyIjtzOjI6Ik5PIjtzOjI0OiJub25leGlzdGVudF90cmFuc2FjdGlvbnMiO3M6MjoiTk8iO3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7czo4MDoiW3siaWRlbnRpZmljYWNpb24iOiIwOTI1NDYwOTMzIiwibm9tYnJlIjoiU09UT01BWU9SIFNPVE9NQVlPUiBKT05BVEhBTiBJU01BRUwifV0iO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO047czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7czo2MzoiR1VBWUFTIC8gR1VBWUFRVUlMIC8gVEFSUVVJIC8gNiBQSkUgMzggRCBOTyBTTCAxQiBZIDIgQ0ogMThJIE5PIjtzOjExOiJkZWJ0X2Ftb3VudCI7TjtzOjE2OiJkZWJ0X2Rlc2NyaXB0aW9uIjtOO3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtzOjI5NToiW3siZXN0YWJsaXNobWVudF9udW1iZXIiOiIwMDEiLCJjb21tZXJjaWFsX25hbWUiOiJBQk9MSU5FIFMuQS4iLCJlc3RhYmxpc2htZW50X3R5cGUiOiJNQVQiLCJjb21wbGV0ZV9hZGRyZXNzIjoiR1VBWUFTIFwvIEdVQVlBUVVJTCBcLyBUQVJRVUkgXC8gNiBQSkUgMzggRCBOTyBTTCAxQiBZIDIgQ0ogMThJIE5PIiwiZXN0YWJsaXNobWVudF9zdGF0dXMiOiJBQklFUlRPIiwiaXNfaGVhZHF1YXJ0ZXJzIjp0cnVlLCJwcm92aW5jZSI6IkdVQVlBUyIsImNhbnRvbiI6IkdVQVlBUVVJTCIsInBhcmlzaCI6IlRBUlFVSSJ9XSI7czo5OiJjaGFsbGVuZ2UiO047czo5OiJyZW1pc3Npb24iO047czoxMDoidXBkYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwMzo1MDo1OCI7czoxMDoiY3JlYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwMzo1MDo1OCI7fXM6MTA6IgAqAGNoYW5nZXMiO2E6MDp7fXM6MTE6IgAqAHByZXZpb3VzIjthOjA6e31zOjg6IgAqAGNhc3RzIjthOjQ6e3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtzOjU6ImFycmF5IjtzOjk6ImNoYWxsZW5nZSI7czo1OiJhcnJheSI7czo5OiJyZW1pc3Npb24iO3M6NToiYXJyYXkiO3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7czo1OiJhcnJheSI7fXM6MTc6IgAqAGNsYXNzQ2FzdENhY2hlIjthOjA6e31zOjIxOiIAKgBhdHRyaWJ1dGVDYXN0Q2FjaGUiO2E6MDp7fXM6MTM6IgAqAGRhdGVGb3JtYXQiO047czoxMDoiACoAYXBwZW5kcyI7YTowOnt9czoxOToiACoAZGlzcGF0Y2hlc0V2ZW50cyI7YTowOnt9czoxNDoiACoAb2JzZXJ2YWJsZXMiO2E6MDp7fXM6MTI6IgAqAHJlbGF0aW9ucyI7YTowOnt9czoxMDoiACoAdG91Y2hlcyI7YTowOnt9czoyNzoiACoAcmVsYXRpb25BdXRvbG9hZENhbGxiYWNrIjtOO3M6MjY6IgAqAHJlbGF0aW9uQXV0b2xvYWRDb250ZXh0IjtOO3M6MTA6InRpbWVzdGFtcHMiO2I6MTtzOjEzOiJ1c2VzVW5pcXVlSWRzIjtiOjA7czo5OiIAKgBoaWRkZW4iO2E6MDp7fXM6MTA6IgAqAHZpc2libGUiO2E6MDp7fXM6MTE6IgAqAGZpbGxhYmxlIjthOjI3OntpOjA7czoxNDoiaWRlbnRpZmljYXRpb24iO2k6MTtzOjEzOiJidXNpbmVzc19uYW1lIjtpOjI7czoxMDoibGVnYWxfbmFtZSI7aTozO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7aTo0O3M6Njoic3RhdHVzIjtpOjU7czoxMzoidGF4cGF5ZXJfdHlwZSI7aTo2O3M6MTU6InRheHBheWVyX3N0YXR1cyI7aTo3O3M6MTQ6InRheHBheWVyX2NsYXNzIjtpOjg7czo2OiJyZWdpbWUiO2k6OTtzOjEzOiJtYWluX2FjdGl2aXR5IjtpOjEwO3M6MTA6InN0YXJ0X2RhdGUiO2k6MTE7czoxNDoiY2Vzc2F0aW9uX2RhdGUiO2k6MTI7czoxMjoicmVzdGFydF9kYXRlIjtpOjEzO3M6MTE6InVwZGF0ZV9kYXRlIjtpOjE0O3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO2k6MTU7czoxNzoid2l0aGhvbGRpbmdfYWdlbnQiO2k6MTY7czoxNjoic3BlY2lhbF90YXhwYXllciI7aToxNztzOjE0OiJnaG9zdF90YXhwYXllciI7aToxODtzOjI0OiJub25leGlzdGVudF90cmFuc2FjdGlvbnMiO2k6MTk7czoyMToibGVnYWxfcmVwcmVzZW50YXRpdmVzIjtpOjIwO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO2k6MjE7czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7aToyMjtzOjExOiJkZWJ0X2Ftb3VudCI7aToyMztzOjE2OiJkZWJ0X2Rlc2NyaXB0aW9uIjtpOjI0O3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtpOjI1O3M6OToiY2hhbGxlbmdlIjtpOjI2O3M6OToicmVtaXNzaW9uIjt9czoxMDoiACoAZ3VhcmRlZCI7YToxOntpOjA7czoxOiIqIjt9fQ==	1754128258
fact_cachesri_data_c199433d2be2e9f5fe4f21fae811ced2	TzoxODoiQXBwXE1vZGVsc1xTUklcU3JpIjozMzp7czoxMzoiACoAY29ubmVjdGlvbiI7czo1OiJwZ3NxbCI7czo4OiIAKgB0YWJsZSI7czo0OiJzcmlzIjtzOjEzOiIAKgBwcmltYXJ5S2V5IjtzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMDoiACoAa2V5VHlwZSI7czo2OiJzdHJpbmciO3M6MTI6ImluY3JlbWVudGluZyI7YjowO3M6NzoiACoAd2l0aCI7YTowOnt9czoxMjoiACoAd2l0aENvdW50IjthOjA6e31zOjE5OiJwcmV2ZW50c0xhenlMb2FkaW5nIjtiOjA7czoxMDoiACoAcGVyUGFnZSI7aToxNTtzOjY6ImV4aXN0cyI7YjoxO3M6MTg6Indhc1JlY2VudGx5Q3JlYXRlZCI7YjoxO3M6Mjg6IgAqAGVzY2FwZVdoZW5DYXN0aW5nVG9TdHJpbmciO2I6MDtzOjEzOiIAKgBhdHRyaWJ1dGVzIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMTc5MzAyMTE1ODAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoxMjoiMjRLQVBJVEFMIFNBIjtzOjEwOiJsZWdhbF9uYW1lIjtzOjEyOiIyNEtBUElUQUwgU0EiO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7TjtzOjY6InN0YXR1cyI7TjtzOjEzOiJ0YXhwYXllcl90eXBlIjtzOjg6IlNPQ0lFREFEIjtzOjE1OiJ0YXhwYXllcl9zdGF0dXMiO047czoxNDoidGF4cGF5ZXJfY2xhc3MiO047czo2OiJyZWdpbWUiO3M6NzoiR0VORVJBTCI7czoxMzoibWFpbl9hY3Rpdml0eSI7czoyODM6IkFDVElWSURBREVTIERFIFBFUlNPTkFTLCBFTVBSRVNBUyBZIE9UUkFTIEVOVElEQURFUyBRVUUgR0VTVElPTkFOIENBUlRFUkFTIFkgRk9ORE9TIEEgQ0FNQklPIERFIFVOQSBSRVRSSUJVQ0nDk04gTyBQT1IgQ09OVFJBVE8uIFNFIElOQ0xVWUVOIExBUyBTSUdVSUVOVEVTIEFDVElWSURBREVTOiBHRVNUScOTTiBERSBGT05ET1MgREUgUEVOU0lPTkVTLCBHRVNUScOTTiBERSBGT05ET1MgTVVUVU9TIERFIElOVkVSU0nDk04gWSBHRVNUScOTTiBERSBPVFJPUyBGT05ET1MgREUgSU5WRVJTScOTTi4iO3M6MTA6InN0YXJ0X2RhdGUiO047czoxNDoiY2Vzc2F0aW9uX2RhdGUiO047czoxMjoicmVzdGFydF9kYXRlIjtOO3M6MTE6InVwZGF0ZV9kYXRlIjtOO3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO3M6MjoiU0kiO3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtzOjI6Ik5PIjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtzOjI6Ik5PIjtzOjE0OiJnaG9zdF90YXhwYXllciI7czoyOiJOTyI7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtzOjI6Ik5PIjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6NzU6Ilt7ImlkZW50aWZpY2FjaW9uIjoiMTc1ODg1NjMwNCIsIm5vbWJyZSI6IlBJTlRPIE9NQVx1MDBkMUEgRkVMSVggRURVQVJETyJ9XSI7czoxOToiY2FuY2VsbGF0aW9uX3JlYXNvbiI7TjtzOjE5OiJoZWFkX29mZmljZV9hZGRyZXNzIjtzOjY5OiJQSUNISU5DSEEgLyBRVUlUTyAvIEnDkUFRVUlUTyAvIEFCUkFIQU0gTElOQ09MTiBFIDExQiBZIDEyIERFIE9DVFVCUkUiO3M6MTE6ImRlYnRfYW1vdW50IjtOO3M6MTY6ImRlYnRfZGVzY3JpcHRpb24iO047czoxNDoiZXN0YWJsaXNobWVudHMiO3M6MzA4OiJbeyJlc3RhYmxpc2htZW50X251bWJlciI6IjAwMSIsImNvbW1lcmNpYWxfbmFtZSI6IjI0S0FQSVRBTCIsImVzdGFibGlzaG1lbnRfdHlwZSI6Ik1BVCIsImNvbXBsZXRlX2FkZHJlc3MiOiJQSUNISU5DSEEgXC8gUVVJVE8gXC8gSVx1MDBkMUFRVUlUTyBcLyBBQlJBSEFNIExJTkNPTE4gRSAxMUIgWSAxMiBERSBPQ1RVQlJFIiwiZXN0YWJsaXNobWVudF9zdGF0dXMiOiJBQklFUlRPIiwiaXNfaGVhZHF1YXJ0ZXJzIjp0cnVlLCJwcm92aW5jZSI6IlBJQ0hJTkNIQSIsImNhbnRvbiI6IlFVSVRPIiwicGFyaXNoIjoiSVx1MDBkMUFRVUlUTyJ9XSI7czo5OiJjaGFsbGVuZ2UiO047czo5OiJyZW1pc3Npb24iO047czoxMDoidXBkYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwNDozNjowOSI7czoxMDoiY3JlYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwNDozNjowOSI7fXM6MTE6IgAqAG9yaWdpbmFsIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMTc5MzAyMTE1ODAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoxMjoiMjRLQVBJVEFMIFNBIjtzOjEwOiJsZWdhbF9uYW1lIjtzOjEyOiIyNEtBUElUQUwgU0EiO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7TjtzOjY6InN0YXR1cyI7TjtzOjEzOiJ0YXhwYXllcl90eXBlIjtzOjg6IlNPQ0lFREFEIjtzOjE1OiJ0YXhwYXllcl9zdGF0dXMiO047czoxNDoidGF4cGF5ZXJfY2xhc3MiO047czo2OiJyZWdpbWUiO3M6NzoiR0VORVJBTCI7czoxMzoibWFpbl9hY3Rpdml0eSI7czoyODM6IkFDVElWSURBREVTIERFIFBFUlNPTkFTLCBFTVBSRVNBUyBZIE9UUkFTIEVOVElEQURFUyBRVUUgR0VTVElPTkFOIENBUlRFUkFTIFkgRk9ORE9TIEEgQ0FNQklPIERFIFVOQSBSRVRSSUJVQ0nDk04gTyBQT1IgQ09OVFJBVE8uIFNFIElOQ0xVWUVOIExBUyBTSUdVSUVOVEVTIEFDVElWSURBREVTOiBHRVNUScOTTiBERSBGT05ET1MgREUgUEVOU0lPTkVTLCBHRVNUScOTTiBERSBGT05ET1MgTVVUVU9TIERFIElOVkVSU0nDk04gWSBHRVNUScOTTiBERSBPVFJPUyBGT05ET1MgREUgSU5WRVJTScOTTi4iO3M6MTA6InN0YXJ0X2RhdGUiO047czoxNDoiY2Vzc2F0aW9uX2RhdGUiO047czoxMjoicmVzdGFydF9kYXRlIjtOO3M6MTE6InVwZGF0ZV9kYXRlIjtOO3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO3M6MjoiU0kiO3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtzOjI6Ik5PIjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtzOjI6Ik5PIjtzOjE0OiJnaG9zdF90YXhwYXllciI7czoyOiJOTyI7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtzOjI6Ik5PIjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6NzU6Ilt7ImlkZW50aWZpY2FjaW9uIjoiMTc1ODg1NjMwNCIsIm5vbWJyZSI6IlBJTlRPIE9NQVx1MDBkMUEgRkVMSVggRURVQVJETyJ9XSI7czoxOToiY2FuY2VsbGF0aW9uX3JlYXNvbiI7TjtzOjE5OiJoZWFkX29mZmljZV9hZGRyZXNzIjtzOjY5OiJQSUNISU5DSEEgLyBRVUlUTyAvIEnDkUFRVUlUTyAvIEFCUkFIQU0gTElOQ09MTiBFIDExQiBZIDEyIERFIE9DVFVCUkUiO3M6MTE6ImRlYnRfYW1vdW50IjtOO3M6MTY6ImRlYnRfZGVzY3JpcHRpb24iO047czoxNDoiZXN0YWJsaXNobWVudHMiO3M6MzA4OiJbeyJlc3RhYmxpc2htZW50X251bWJlciI6IjAwMSIsImNvbW1lcmNpYWxfbmFtZSI6IjI0S0FQSVRBTCIsImVzdGFibGlzaG1lbnRfdHlwZSI6Ik1BVCIsImNvbXBsZXRlX2FkZHJlc3MiOiJQSUNISU5DSEEgXC8gUVVJVE8gXC8gSVx1MDBkMUFRVUlUTyBcLyBBQlJBSEFNIExJTkNPTE4gRSAxMUIgWSAxMiBERSBPQ1RVQlJFIiwiZXN0YWJsaXNobWVudF9zdGF0dXMiOiJBQklFUlRPIiwiaXNfaGVhZHF1YXJ0ZXJzIjp0cnVlLCJwcm92aW5jZSI6IlBJQ0hJTkNIQSIsImNhbnRvbiI6IlFVSVRPIiwicGFyaXNoIjoiSVx1MDBkMUFRVUlUTyJ9XSI7czo5OiJjaGFsbGVuZ2UiO047czo5OiJyZW1pc3Npb24iO047czoxMDoidXBkYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwNDozNjowOSI7czoxMDoiY3JlYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwNDozNjowOSI7fXM6MTA6IgAqAGNoYW5nZXMiO2E6MDp7fXM6MTE6IgAqAHByZXZpb3VzIjthOjA6e31zOjg6IgAqAGNhc3RzIjthOjQ6e3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtzOjU6ImFycmF5IjtzOjk6ImNoYWxsZW5nZSI7czo1OiJhcnJheSI7czo5OiJyZW1pc3Npb24iO3M6NToiYXJyYXkiO3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7czo1OiJhcnJheSI7fXM6MTc6IgAqAGNsYXNzQ2FzdENhY2hlIjthOjA6e31zOjIxOiIAKgBhdHRyaWJ1dGVDYXN0Q2FjaGUiO2E6MDp7fXM6MTM6IgAqAGRhdGVGb3JtYXQiO047czoxMDoiACoAYXBwZW5kcyI7YTowOnt9czoxOToiACoAZGlzcGF0Y2hlc0V2ZW50cyI7YTowOnt9czoxNDoiACoAb2JzZXJ2YWJsZXMiO2E6MDp7fXM6MTI6IgAqAHJlbGF0aW9ucyI7YTowOnt9czoxMDoiACoAdG91Y2hlcyI7YTowOnt9czoyNzoiACoAcmVsYXRpb25BdXRvbG9hZENhbGxiYWNrIjtOO3M6MjY6IgAqAHJlbGF0aW9uQXV0b2xvYWRDb250ZXh0IjtOO3M6MTA6InRpbWVzdGFtcHMiO2I6MTtzOjEzOiJ1c2VzVW5pcXVlSWRzIjtiOjA7czo5OiIAKgBoaWRkZW4iO2E6MDp7fXM6MTA6IgAqAHZpc2libGUiO2E6MDp7fXM6MTE6IgAqAGZpbGxhYmxlIjthOjI3OntpOjA7czoxNDoiaWRlbnRpZmljYXRpb24iO2k6MTtzOjEzOiJidXNpbmVzc19uYW1lIjtpOjI7czoxMDoibGVnYWxfbmFtZSI7aTozO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7aTo0O3M6Njoic3RhdHVzIjtpOjU7czoxMzoidGF4cGF5ZXJfdHlwZSI7aTo2O3M6MTU6InRheHBheWVyX3N0YXR1cyI7aTo3O3M6MTQ6InRheHBheWVyX2NsYXNzIjtpOjg7czo2OiJyZWdpbWUiO2k6OTtzOjEzOiJtYWluX2FjdGl2aXR5IjtpOjEwO3M6MTA6InN0YXJ0X2RhdGUiO2k6MTE7czoxNDoiY2Vzc2F0aW9uX2RhdGUiO2k6MTI7czoxMjoicmVzdGFydF9kYXRlIjtpOjEzO3M6MTE6InVwZGF0ZV9kYXRlIjtpOjE0O3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO2k6MTU7czoxNzoid2l0aGhvbGRpbmdfYWdlbnQiO2k6MTY7czoxNjoic3BlY2lhbF90YXhwYXllciI7aToxNztzOjE0OiJnaG9zdF90YXhwYXllciI7aToxODtzOjI0OiJub25leGlzdGVudF90cmFuc2FjdGlvbnMiO2k6MTk7czoyMToibGVnYWxfcmVwcmVzZW50YXRpdmVzIjtpOjIwO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO2k6MjE7czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7aToyMjtzOjExOiJkZWJ0X2Ftb3VudCI7aToyMztzOjE2OiJkZWJ0X2Rlc2NyaXB0aW9uIjtpOjI0O3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtpOjI1O3M6OToiY2hhbGxlbmdlIjtpOjI2O3M6OToicmVtaXNzaW9uIjt9czoxMDoiACoAZ3VhcmRlZCI7YToxOntpOjA7czoxOiIqIjt9fQ==	1754130969
fact_cachesri_data_818aed223ad3c890976ba0b3cfa4a809	TzoxODoiQXBwXE1vZGVsc1xTUklcU3JpIjozMzp7czoxMzoiACoAY29ubmVjdGlvbiI7czo1OiJwZ3NxbCI7czo4OiIAKgB0YWJsZSI7czo0OiJzcmlzIjtzOjEzOiIAKgBwcmltYXJ5S2V5IjtzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMDoiACoAa2V5VHlwZSI7czo2OiJzdHJpbmciO3M6MTI6ImluY3JlbWVudGluZyI7YjowO3M6NzoiACoAd2l0aCI7YTowOnt9czoxMjoiACoAd2l0aENvdW50IjthOjA6e31zOjE5OiJwcmV2ZW50c0xhenlMb2FkaW5nIjtiOjA7czoxMDoiACoAcGVyUGFnZSI7aToxNTtzOjY6ImV4aXN0cyI7YjoxO3M6MTg6Indhc1JlY2VudGx5Q3JlYXRlZCI7YjoxO3M6Mjg6IgAqAGVzY2FwZVdoZW5DYXN0aW5nVG9TdHJpbmciO2I6MDtzOjEzOiIAKgBhdHRyaWJ1dGVzIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMDk5MjU2NzM2ODAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoxNDoiQURNSUxFR0FMIFMuQS4iO3M6MTA6ImxlZ2FsX25hbWUiO3M6MTQ6IkFETUlMRUdBTCBTLkEuIjtzOjE1OiJjb21tZXJjaWFsX25hbWUiO047czo2OiJzdGF0dXMiO047czoxMzoidGF4cGF5ZXJfdHlwZSI7czo4OiJTT0NJRURBRCI7czoxNToidGF4cGF5ZXJfc3RhdHVzIjtOO3M6MTQ6InRheHBheWVyX2NsYXNzIjtOO3M6NjoicmVnaW1lIjtzOjc6IkdFTkVSQUwiO3M6MTM6Im1haW5fYWN0aXZpdHkiO3M6MjU0OiJTRVJWSUNJT1MgREUgIEFTRVNPUkFNSUVOVE8sIE9SSUVOVEFDScOTTiBZIEFTSVNURU5DSUEgT1BFUkFUSVZBIEEgTEFTIEVNUFJFU0FTIFkgQSBMQSBBRE1JTklTVFJBQ0nDk04gUMOaQkxJQ0EgRU4gTUFURVJJQSBERTogRElTRcORTyBERSBNw4lUT0RPUyBPIFBST0NFRElNSUVOVE9TIENPTlRBQkxFUywgUFJPR1JBTUFTIERFIENPTlRBQklMSURBRCBERSBDT1NUT1MgWSBQUk9DRURJTUlFTlRPUyBERSBDT05UUk9MIFBSRVNVUFVFU1RBUklPLiI7czoxMDoic3RhcnRfZGF0ZSI7TjtzOjE0OiJjZXNzYXRpb25fZGF0ZSI7TjtzOjEyOiJyZXN0YXJ0X2RhdGUiO047czoxMToidXBkYXRlX2RhdGUiO047czoxOToiYWNjb3VudGluZ19yZXF1aXJlZCI7czoyOiJTSSI7czoxNzoid2l0aGhvbGRpbmdfYWdlbnQiO3M6MjoiTk8iO3M6MTY6InNwZWNpYWxfdGF4cGF5ZXIiO3M6MjoiTk8iO3M6MTQ6Imdob3N0X3RheHBheWVyIjtzOjI6Ik5PIjtzOjI0OiJub25leGlzdGVudF90cmFuc2FjdGlvbnMiO3M6MjoiTk8iO3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7czo3OToiW3siaWRlbnRpZmljYWNpb24iOiIwOTAxMjQzOTgwIiwibm9tYnJlIjoiSUxMSU5HV09SVEggQVNIVE9OIFBSSVNDSUxMQSBNQVJJQSJ9XSI7czoxOToiY2FuY2VsbGF0aW9uX3JlYXNvbiI7TjtzOjE5OiJoZWFkX29mZmljZV9hZGRyZXNzIjtzOjc2OiJHVUFZQVMgLyBHVUFZQVFVSUwgLyBUQVJRVUkgLyBBVi4gRlJBTkNJU0NPIE9SRUxMQU5BIFMvTiBZIE1JR1VFTCBILiBBTENJVkFSIjtzOjExOiJkZWJ0X2Ftb3VudCI7TjtzOjE2OiJkZWJ0X2Rlc2NyaXB0aW9uIjtOO3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtzOjI5OToiW3siZXN0YWJsaXNobWVudF9udW1iZXIiOiIwMDEiLCJjb21tZXJjaWFsX25hbWUiOm51bGwsImVzdGFibGlzaG1lbnRfdHlwZSI6Ik1BVCIsImNvbXBsZXRlX2FkZHJlc3MiOiJHVUFZQVMgXC8gR1VBWUFRVUlMIFwvIFRBUlFVSSBcLyBBVi4gRlJBTkNJU0NPIE9SRUxMQU5BIFNcL04gWSBNSUdVRUwgSC4gQUxDSVZBUiIsImVzdGFibGlzaG1lbnRfc3RhdHVzIjoiQUJJRVJUTyIsImlzX2hlYWRxdWFydGVycyI6dHJ1ZSwicHJvdmluY2UiOiJHVUFZQVMiLCJjYW50b24iOiJHVUFZQVFVSUwiLCJwYXJpc2giOiJUQVJRVUkifV0iO3M6OToiY2hhbGxlbmdlIjtOO3M6OToicmVtaXNzaW9uIjtOO3M6MTA6InVwZGF0ZWRfYXQiO3M6MTk6IjIwMjUtMDgtMDIgMDU6MDA6NDMiO3M6MTA6ImNyZWF0ZWRfYXQiO3M6MTk6IjIwMjUtMDgtMDIgMDU6MDA6NDMiO31zOjExOiIAKgBvcmlnaW5hbCI7YToyOTp7czoxNDoiaWRlbnRpZmljYXRpb24iO3M6MTM6IjA5OTI1NjczNjgwMDEiO3M6MTM6ImJ1c2luZXNzX25hbWUiO3M6MTQ6IkFETUlMRUdBTCBTLkEuIjtzOjEwOiJsZWdhbF9uYW1lIjtzOjE0OiJBRE1JTEVHQUwgUy5BLiI7czoxNToiY29tbWVyY2lhbF9uYW1lIjtOO3M6Njoic3RhdHVzIjtOO3M6MTM6InRheHBheWVyX3R5cGUiO3M6ODoiU09DSUVEQUQiO3M6MTU6InRheHBheWVyX3N0YXR1cyI7TjtzOjE0OiJ0YXhwYXllcl9jbGFzcyI7TjtzOjY6InJlZ2ltZSI7czo3OiJHRU5FUkFMIjtzOjEzOiJtYWluX2FjdGl2aXR5IjtzOjI1NDoiU0VSVklDSU9TIERFICBBU0VTT1JBTUlFTlRPLCBPUklFTlRBQ0nDk04gWSBBU0lTVEVOQ0lBIE9QRVJBVElWQSBBIExBUyBFTVBSRVNBUyBZIEEgTEEgQURNSU5JU1RSQUNJw5NOIFDDmkJMSUNBIEVOIE1BVEVSSUEgREU6IERJU0XDkU8gREUgTcOJVE9ET1MgTyBQUk9DRURJTUlFTlRPUyBDT05UQUJMRVMsIFBST0dSQU1BUyBERSBDT05UQUJJTElEQUQgREUgQ09TVE9TIFkgUFJPQ0VESU1JRU5UT1MgREUgQ09OVFJPTCBQUkVTVVBVRVNUQVJJTy4iO3M6MTA6InN0YXJ0X2RhdGUiO047czoxNDoiY2Vzc2F0aW9uX2RhdGUiO047czoxMjoicmVzdGFydF9kYXRlIjtOO3M6MTE6InVwZGF0ZV9kYXRlIjtOO3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO3M6MjoiU0kiO3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtzOjI6Ik5PIjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtzOjI6Ik5PIjtzOjE0OiJnaG9zdF90YXhwYXllciI7czoyOiJOTyI7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtzOjI6Ik5PIjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6Nzk6Ilt7ImlkZW50aWZpY2FjaW9uIjoiMDkwMTI0Mzk4MCIsIm5vbWJyZSI6IklMTElOR1dPUlRIIEFTSFRPTiBQUklTQ0lMTEEgTUFSSUEifV0iO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO047czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7czo3NjoiR1VBWUFTIC8gR1VBWUFRVUlMIC8gVEFSUVVJIC8gQVYuIEZSQU5DSVNDTyBPUkVMTEFOQSBTL04gWSBNSUdVRUwgSC4gQUxDSVZBUiI7czoxMToiZGVidF9hbW91bnQiO047czoxNjoiZGVidF9kZXNjcmlwdGlvbiI7TjtzOjE0OiJlc3RhYmxpc2htZW50cyI7czoyOTk6Ilt7ImVzdGFibGlzaG1lbnRfbnVtYmVyIjoiMDAxIiwiY29tbWVyY2lhbF9uYW1lIjpudWxsLCJlc3RhYmxpc2htZW50X3R5cGUiOiJNQVQiLCJjb21wbGV0ZV9hZGRyZXNzIjoiR1VBWUFTIFwvIEdVQVlBUVVJTCBcLyBUQVJRVUkgXC8gQVYuIEZSQU5DSVNDTyBPUkVMTEFOQSBTXC9OIFkgTUlHVUVMIEguIEFMQ0lWQVIiLCJlc3RhYmxpc2htZW50X3N0YXR1cyI6IkFCSUVSVE8iLCJpc19oZWFkcXVhcnRlcnMiOnRydWUsInByb3ZpbmNlIjoiR1VBWUFTIiwiY2FudG9uIjoiR1VBWUFRVUlMIiwicGFyaXNoIjoiVEFSUVVJIn1dIjtzOjk6ImNoYWxsZW5nZSI7TjtzOjk6InJlbWlzc2lvbiI7TjtzOjEwOiJ1cGRhdGVkX2F0IjtzOjE5OiIyMDI1LTA4LTAyIDA1OjAwOjQzIjtzOjEwOiJjcmVhdGVkX2F0IjtzOjE5OiIyMDI1LTA4LTAyIDA1OjAwOjQzIjt9czoxMDoiACoAY2hhbmdlcyI7YTowOnt9czoxMToiACoAcHJldmlvdXMiO2E6MDp7fXM6ODoiACoAY2FzdHMiO2E6NDp7czoxNDoiZXN0YWJsaXNobWVudHMiO3M6NToiYXJyYXkiO3M6OToiY2hhbGxlbmdlIjtzOjU6ImFycmF5IjtzOjk6InJlbWlzc2lvbiI7czo1OiJhcnJheSI7czoyMToibGVnYWxfcmVwcmVzZW50YXRpdmVzIjtzOjU6ImFycmF5Ijt9czoxNzoiACoAY2xhc3NDYXN0Q2FjaGUiO2E6MDp7fXM6MjE6IgAqAGF0dHJpYnV0ZUNhc3RDYWNoZSI7YTowOnt9czoxMzoiACoAZGF0ZUZvcm1hdCI7TjtzOjEwOiIAKgBhcHBlbmRzIjthOjA6e31zOjE5OiIAKgBkaXNwYXRjaGVzRXZlbnRzIjthOjA6e31zOjE0OiIAKgBvYnNlcnZhYmxlcyI7YTowOnt9czoxMjoiACoAcmVsYXRpb25zIjthOjA6e31zOjEwOiIAKgB0b3VjaGVzIjthOjA6e31zOjI3OiIAKgByZWxhdGlvbkF1dG9sb2FkQ2FsbGJhY2siO047czoyNjoiACoAcmVsYXRpb25BdXRvbG9hZENvbnRleHQiO047czoxMDoidGltZXN0YW1wcyI7YjoxO3M6MTM6InVzZXNVbmlxdWVJZHMiO2I6MDtzOjk6IgAqAGhpZGRlbiI7YTowOnt9czoxMDoiACoAdmlzaWJsZSI7YTowOnt9czoxMToiACoAZmlsbGFibGUiO2E6Mjc6e2k6MDtzOjE0OiJpZGVudGlmaWNhdGlvbiI7aToxO3M6MTM6ImJ1c2luZXNzX25hbWUiO2k6MjtzOjEwOiJsZWdhbF9uYW1lIjtpOjM7czoxNToiY29tbWVyY2lhbF9uYW1lIjtpOjQ7czo2OiJzdGF0dXMiO2k6NTtzOjEzOiJ0YXhwYXllcl90eXBlIjtpOjY7czoxNToidGF4cGF5ZXJfc3RhdHVzIjtpOjc7czoxNDoidGF4cGF5ZXJfY2xhc3MiO2k6ODtzOjY6InJlZ2ltZSI7aTo5O3M6MTM6Im1haW5fYWN0aXZpdHkiO2k6MTA7czoxMDoic3RhcnRfZGF0ZSI7aToxMTtzOjE0OiJjZXNzYXRpb25fZGF0ZSI7aToxMjtzOjEyOiJyZXN0YXJ0X2RhdGUiO2k6MTM7czoxMToidXBkYXRlX2RhdGUiO2k6MTQ7czoxOToiYWNjb3VudGluZ19yZXF1aXJlZCI7aToxNTtzOjE3OiJ3aXRoaG9sZGluZ19hZ2VudCI7aToxNjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtpOjE3O3M6MTQ6Imdob3N0X3RheHBheWVyIjtpOjE4O3M6MjQ6Im5vbmV4aXN0ZW50X3RyYW5zYWN0aW9ucyI7aToxOTtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO2k6MjA7czoxOToiY2FuY2VsbGF0aW9uX3JlYXNvbiI7aToyMTtzOjE5OiJoZWFkX29mZmljZV9hZGRyZXNzIjtpOjIyO3M6MTE6ImRlYnRfYW1vdW50IjtpOjIzO3M6MTY6ImRlYnRfZGVzY3JpcHRpb24iO2k6MjQ7czoxNDoiZXN0YWJsaXNobWVudHMiO2k6MjU7czo5OiJjaGFsbGVuZ2UiO2k6MjY7czo5OiJyZW1pc3Npb24iO31zOjEwOiIAKgBndWFyZGVkIjthOjE6e2k6MDtzOjE6IioiO319	1754132443
fact_cachesri_data_009c6c994556be5d5f861b6ff187d51b	TzoxODoiQXBwXE1vZGVsc1xTUklcU3JpIjozMzp7czoxMzoiACoAY29ubmVjdGlvbiI7czo1OiJwZ3NxbCI7czo4OiIAKgB0YWJsZSI7czo0OiJzcmlzIjtzOjEzOiIAKgBwcmltYXJ5S2V5IjtzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMDoiACoAa2V5VHlwZSI7czo2OiJzdHJpbmciO3M6MTI6ImluY3JlbWVudGluZyI7YjowO3M6NzoiACoAd2l0aCI7YTowOnt9czoxMjoiACoAd2l0aENvdW50IjthOjA6e31zOjE5OiJwcmV2ZW50c0xhenlMb2FkaW5nIjtiOjA7czoxMDoiACoAcGVyUGFnZSI7aToxNTtzOjY6ImV4aXN0cyI7YjoxO3M6MTg6Indhc1JlY2VudGx5Q3JlYXRlZCI7YjoxO3M6Mjg6IgAqAGVzY2FwZVdoZW5DYXN0aW5nVG9TdHJpbmciO2I6MDtzOjEzOiIAKgBhdHRyaWJ1dGVzIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMDk5MTAwNDY5NjAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoxNjoiQUNBSUNPUE9MSVMgUy5BLiI7czoxMDoibGVnYWxfbmFtZSI7czoxNjoiQUNBSUNPUE9MSVMgUy5BLiI7czoxNToiY29tbWVyY2lhbF9uYW1lIjtOO3M6Njoic3RhdHVzIjtOO3M6MTM6InRheHBheWVyX3R5cGUiO3M6ODoiU09DSUVEQUQiO3M6MTU6InRheHBheWVyX3N0YXR1cyI7TjtzOjE0OiJ0YXhwYXllcl9jbGFzcyI7TjtzOjY6InJlZ2ltZSI7czo3OiJHRU5FUkFMIjtzOjEzOiJtYWluX2FjdGl2aXR5IjtzOjM3NDoiQ09NUFJBIC0gVkVOVEEsIEFMUVVJTEVSIFkgRVhQTE9UQUNJw5NOIERFIEJJRU5FUyBJTk1VRUJMRVMgUFJPUElPUyBPIEFSUkVOREFET1MsIENPTU86IEVESUZJQ0lPUyBERSBBUEFSVEFNRU5UT1MgWSBWSVZJRU5EQVM7IEVESUZJQ0lPUyBOTyBSRVNJREVOQ0lBTEVTLCBJTkNMVVNPIFNBTEFTIERFIEVYUE9TSUNJT05FUzsgSU5TVEFMQUNJT05FUyBQQVJBIEFMTUFDRU5BSkUsIENFTlRST1MgQ09NRVJDSUFMRVMgWSBURVJSRU5PUzsgSU5DTFVZRSBFTCBBTFFVSUxFUiBERSBDQVNBUyBZIEFQQVJUQU1FTlRPUyBBTVVFQkxBRE9TIE8gU0lOIEFNVUVCTEFSIFBPUiBQRVLDjU9ET1MgTEFSR09TLCBFTiBHRU5FUkFMIFBPUiBNRVNFUyBPIFBPUiBBw5FPUy4iO3M6MTA6InN0YXJ0X2RhdGUiO047czoxNDoiY2Vzc2F0aW9uX2RhdGUiO047czoxMjoicmVzdGFydF9kYXRlIjtOO3M6MTE6InVwZGF0ZV9kYXRlIjtOO3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO3M6MjoiU0kiO3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtzOjI6Ik5PIjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtzOjI6Ik5PIjtzOjE0OiJnaG9zdF90YXhwYXllciI7czoyOiJOTyI7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtzOjI6Ik5PIjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6NjY6Ilt7ImlkZW50aWZpY2FjaW9uIjoiMDkwMzM2NjcxNCIsIm5vbWJyZSI6IlJBTUlSRVogUkFNSVJFWiBISUxEQSJ9XSI7czoxOToiY2FuY2VsbGF0aW9uX3JlYXNvbiI7czo5OiJFWFRJTkNJT04iO3M6MTk6ImhlYWRfb2ZmaWNlX2FkZHJlc3MiO3M6NTI6IkdVQVlBUyAvIEdVQVlBUVVJTCAvIFJPQ0EgLyBWSUNUT1IgTUFOVUVMIFJFTkRPTiA5MTEiO3M6MTE6ImRlYnRfYW1vdW50IjtOO3M6MTY6ImRlYnRfZGVzY3JpcHRpb24iO047czoxNDoiZXN0YWJsaXNobWVudHMiO3M6MjcyOiJbeyJlc3RhYmxpc2htZW50X251bWJlciI6IjAwMSIsImNvbW1lcmNpYWxfbmFtZSI6bnVsbCwiZXN0YWJsaXNobWVudF90eXBlIjoiTUFUIiwiY29tcGxldGVfYWRkcmVzcyI6IkdVQVlBUyBcLyBHVUFZQVFVSUwgXC8gUk9DQSBcLyBWSUNUT1IgTUFOVUVMIFJFTkRPTiA5MTEiLCJlc3RhYmxpc2htZW50X3N0YXR1cyI6IkNFUlJBRE8iLCJpc19oZWFkcXVhcnRlcnMiOnRydWUsInByb3ZpbmNlIjoiR1VBWUFTIiwiY2FudG9uIjoiR1VBWUFRVUlMIiwicGFyaXNoIjoiUk9DQSJ9XSI7czo5OiJjaGFsbGVuZ2UiO047czo5OiJyZW1pc3Npb24iO047czoxMDoidXBkYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwNTowOTo0OSI7czoxMDoiY3JlYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwNTowOTo0OSI7fXM6MTE6IgAqAG9yaWdpbmFsIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMDk5MTAwNDY5NjAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoxNjoiQUNBSUNPUE9MSVMgUy5BLiI7czoxMDoibGVnYWxfbmFtZSI7czoxNjoiQUNBSUNPUE9MSVMgUy5BLiI7czoxNToiY29tbWVyY2lhbF9uYW1lIjtOO3M6Njoic3RhdHVzIjtOO3M6MTM6InRheHBheWVyX3R5cGUiO3M6ODoiU09DSUVEQUQiO3M6MTU6InRheHBheWVyX3N0YXR1cyI7TjtzOjE0OiJ0YXhwYXllcl9jbGFzcyI7TjtzOjY6InJlZ2ltZSI7czo3OiJHRU5FUkFMIjtzOjEzOiJtYWluX2FjdGl2aXR5IjtzOjM3NDoiQ09NUFJBIC0gVkVOVEEsIEFMUVVJTEVSIFkgRVhQTE9UQUNJw5NOIERFIEJJRU5FUyBJTk1VRUJMRVMgUFJPUElPUyBPIEFSUkVOREFET1MsIENPTU86IEVESUZJQ0lPUyBERSBBUEFSVEFNRU5UT1MgWSBWSVZJRU5EQVM7IEVESUZJQ0lPUyBOTyBSRVNJREVOQ0lBTEVTLCBJTkNMVVNPIFNBTEFTIERFIEVYUE9TSUNJT05FUzsgSU5TVEFMQUNJT05FUyBQQVJBIEFMTUFDRU5BSkUsIENFTlRST1MgQ09NRVJDSUFMRVMgWSBURVJSRU5PUzsgSU5DTFVZRSBFTCBBTFFVSUxFUiBERSBDQVNBUyBZIEFQQVJUQU1FTlRPUyBBTVVFQkxBRE9TIE8gU0lOIEFNVUVCTEFSIFBPUiBQRVLDjU9ET1MgTEFSR09TLCBFTiBHRU5FUkFMIFBPUiBNRVNFUyBPIFBPUiBBw5FPUy4iO3M6MTA6InN0YXJ0X2RhdGUiO047czoxNDoiY2Vzc2F0aW9uX2RhdGUiO047czoxMjoicmVzdGFydF9kYXRlIjtOO3M6MTE6InVwZGF0ZV9kYXRlIjtOO3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO3M6MjoiU0kiO3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtzOjI6Ik5PIjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtzOjI6Ik5PIjtzOjE0OiJnaG9zdF90YXhwYXllciI7czoyOiJOTyI7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtzOjI6Ik5PIjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6NjY6Ilt7ImlkZW50aWZpY2FjaW9uIjoiMDkwMzM2NjcxNCIsIm5vbWJyZSI6IlJBTUlSRVogUkFNSVJFWiBISUxEQSJ9XSI7czoxOToiY2FuY2VsbGF0aW9uX3JlYXNvbiI7czo5OiJFWFRJTkNJT04iO3M6MTk6ImhlYWRfb2ZmaWNlX2FkZHJlc3MiO3M6NTI6IkdVQVlBUyAvIEdVQVlBUVVJTCAvIFJPQ0EgLyBWSUNUT1IgTUFOVUVMIFJFTkRPTiA5MTEiO3M6MTE6ImRlYnRfYW1vdW50IjtOO3M6MTY6ImRlYnRfZGVzY3JpcHRpb24iO047czoxNDoiZXN0YWJsaXNobWVudHMiO3M6MjcyOiJbeyJlc3RhYmxpc2htZW50X251bWJlciI6IjAwMSIsImNvbW1lcmNpYWxfbmFtZSI6bnVsbCwiZXN0YWJsaXNobWVudF90eXBlIjoiTUFUIiwiY29tcGxldGVfYWRkcmVzcyI6IkdVQVlBUyBcLyBHVUFZQVFVSUwgXC8gUk9DQSBcLyBWSUNUT1IgTUFOVUVMIFJFTkRPTiA5MTEiLCJlc3RhYmxpc2htZW50X3N0YXR1cyI6IkNFUlJBRE8iLCJpc19oZWFkcXVhcnRlcnMiOnRydWUsInByb3ZpbmNlIjoiR1VBWUFTIiwiY2FudG9uIjoiR1VBWUFRVUlMIiwicGFyaXNoIjoiUk9DQSJ9XSI7czo5OiJjaGFsbGVuZ2UiO047czo5OiJyZW1pc3Npb24iO047czoxMDoidXBkYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwNTowOTo0OSI7czoxMDoiY3JlYXRlZF9hdCI7czoxOToiMjAyNS0wOC0wMiAwNTowOTo0OSI7fXM6MTA6IgAqAGNoYW5nZXMiO2E6MDp7fXM6MTE6IgAqAHByZXZpb3VzIjthOjA6e31zOjg6IgAqAGNhc3RzIjthOjQ6e3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtzOjU6ImFycmF5IjtzOjk6ImNoYWxsZW5nZSI7czo1OiJhcnJheSI7czo5OiJyZW1pc3Npb24iO3M6NToiYXJyYXkiO3M6MjE6ImxlZ2FsX3JlcHJlc2VudGF0aXZlcyI7czo1OiJhcnJheSI7fXM6MTc6IgAqAGNsYXNzQ2FzdENhY2hlIjthOjA6e31zOjIxOiIAKgBhdHRyaWJ1dGVDYXN0Q2FjaGUiO2E6MDp7fXM6MTM6IgAqAGRhdGVGb3JtYXQiO047czoxMDoiACoAYXBwZW5kcyI7YTowOnt9czoxOToiACoAZGlzcGF0Y2hlc0V2ZW50cyI7YTowOnt9czoxNDoiACoAb2JzZXJ2YWJsZXMiO2E6MDp7fXM6MTI6IgAqAHJlbGF0aW9ucyI7YTowOnt9czoxMDoiACoAdG91Y2hlcyI7YTowOnt9czoyNzoiACoAcmVsYXRpb25BdXRvbG9hZENhbGxiYWNrIjtOO3M6MjY6IgAqAHJlbGF0aW9uQXV0b2xvYWRDb250ZXh0IjtOO3M6MTA6InRpbWVzdGFtcHMiO2I6MTtzOjEzOiJ1c2VzVW5pcXVlSWRzIjtiOjA7czo5OiIAKgBoaWRkZW4iO2E6MDp7fXM6MTA6IgAqAHZpc2libGUiO2E6MDp7fXM6MTE6IgAqAGZpbGxhYmxlIjthOjI3OntpOjA7czoxNDoiaWRlbnRpZmljYXRpb24iO2k6MTtzOjEzOiJidXNpbmVzc19uYW1lIjtpOjI7czoxMDoibGVnYWxfbmFtZSI7aTozO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7aTo0O3M6Njoic3RhdHVzIjtpOjU7czoxMzoidGF4cGF5ZXJfdHlwZSI7aTo2O3M6MTU6InRheHBheWVyX3N0YXR1cyI7aTo3O3M6MTQ6InRheHBheWVyX2NsYXNzIjtpOjg7czo2OiJyZWdpbWUiO2k6OTtzOjEzOiJtYWluX2FjdGl2aXR5IjtpOjEwO3M6MTA6InN0YXJ0X2RhdGUiO2k6MTE7czoxNDoiY2Vzc2F0aW9uX2RhdGUiO2k6MTI7czoxMjoicmVzdGFydF9kYXRlIjtpOjEzO3M6MTE6InVwZGF0ZV9kYXRlIjtpOjE0O3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO2k6MTU7czoxNzoid2l0aGhvbGRpbmdfYWdlbnQiO2k6MTY7czoxNjoic3BlY2lhbF90YXhwYXllciI7aToxNztzOjE0OiJnaG9zdF90YXhwYXllciI7aToxODtzOjI0OiJub25leGlzdGVudF90cmFuc2FjdGlvbnMiO2k6MTk7czoyMToibGVnYWxfcmVwcmVzZW50YXRpdmVzIjtpOjIwO3M6MTk6ImNhbmNlbGxhdGlvbl9yZWFzb24iO2k6MjE7czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7aToyMjtzOjExOiJkZWJ0X2Ftb3VudCI7aToyMztzOjE2OiJkZWJ0X2Rlc2NyaXB0aW9uIjtpOjI0O3M6MTQ6ImVzdGFibGlzaG1lbnRzIjtpOjI1O3M6OToiY2hhbGxlbmdlIjtpOjI2O3M6OToicmVtaXNzaW9uIjt9czoxMDoiACoAZ3VhcmRlZCI7YToxOntpOjA7czoxOiIqIjt9fQ==	1754132989
fact_cachea75f3f172bfb296f2e10cbfc6dfc1883:timer	i:1754442550;	1754442550
fact_cachea75f3f172bfb296f2e10cbfc6dfc1883	i:2;	1754442550
fact_cachesri_data_683c48147c983f5c544f29afbac8cff8	TzoxODoiQXBwXE1vZGVsc1xTUklcU3JpIjozMzp7czoxMzoiACoAY29ubmVjdGlvbiI7czo1OiJwZ3NxbCI7czo4OiIAKgB0YWJsZSI7czo0OiJzcmlzIjtzOjEzOiIAKgBwcmltYXJ5S2V5IjtzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMDoiACoAa2V5VHlwZSI7czo2OiJzdHJpbmciO3M6MTI6ImluY3JlbWVudGluZyI7YjowO3M6NzoiACoAd2l0aCI7YTowOnt9czoxMjoiACoAd2l0aENvdW50IjthOjA6e31zOjE5OiJwcmV2ZW50c0xhenlMb2FkaW5nIjtiOjA7czoxMDoiACoAcGVyUGFnZSI7aToxNTtzOjY6ImV4aXN0cyI7YjoxO3M6MTg6Indhc1JlY2VudGx5Q3JlYXRlZCI7YjoxO3M6Mjg6IgAqAGVzY2FwZVdoZW5DYXN0aW5nVG9TdHJpbmciO2I6MDtzOjEzOiIAKgBhdHRyaWJ1dGVzIjthOjI5OntzOjE0OiJpZGVudGlmaWNhdGlvbiI7czoxMzoiMDk5MjM1NTc5NDAwMSI7czoxMzoiYnVzaW5lc3NfbmFtZSI7czoxMjoiQUNJTUFMTCBTLkEuIjtzOjEwOiJsZWdhbF9uYW1lIjtzOjEyOiJBQ0lNQUxMIFMuQS4iO3M6MTU6ImNvbW1lcmNpYWxfbmFtZSI7TjtzOjY6InN0YXR1cyI7TjtzOjEzOiJ0YXhwYXllcl90eXBlIjtzOjg6IlNPQ0lFREFEIjtzOjE1OiJ0YXhwYXllcl9zdGF0dXMiO047czoxNDoidGF4cGF5ZXJfY2xhc3MiO047czo2OiJyZWdpbWUiO3M6NzoiR0VORVJBTCI7czoxMzoibWFpbl9hY3Rpdml0eSI7czo2ODoiRkFCUklDQUNJw5NOIERFIE9UUk9TIFBST0RVQ1RPUyBRVcONTUlDT1MgREUgVVNPIEFHUk9QRUNVQVJJTyBOLkMuUC4iO3M6MTA6InN0YXJ0X2RhdGUiO047czoxNDoiY2Vzc2F0aW9uX2RhdGUiO047czoxMjoicmVzdGFydF9kYXRlIjtOO3M6MTE6InVwZGF0ZV9kYXRlIjtOO3M6MTk6ImFjY291bnRpbmdfcmVxdWlyZWQiO3M6MjoiU0kiO3M6MTc6IndpdGhob2xkaW5nX2FnZW50IjtzOjI6Ik5PIjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtzOjI6Ik5PIjtzOjE0OiJnaG9zdF90YXhwYXllciI7czoyOiJOTyI7czoyNDoibm9uZXhpc3RlbnRfdHJhbnNhY3Rpb25zIjtzOjI6Ik5PIjtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO3M6NzQ6Ilt7ImlkZW50aWZpY2FjaW9uIjoiMDkxNjU5MDc0OCIsIm5vbWJyZSI6IkdBUkNJQSBFVUdFTklPIEpBWk1JTiBNQVJJQkVMIn1dIjtzOjE5OiJjYW5jZWxsYXRpb25fcmVhc29uIjtzOjEwOiJERVBVUkFDSU9OIjtzOjE5OiJoZWFkX29mZmljZV9hZGRyZXNzIjtzOjUzOiJHVUFZQVMgLyBHVUFZQVFVSUwgLyBST0NBRlVFUlRFIC8gQUdVSVJSRSAzMjQgWSBDSElMRSI7czoxMToiZGVidF9hbW91bnQiO047czoxNjoiZGVidF9kZXNjcmlwdGlvbiI7TjtzOjE0OiJlc3RhYmxpc2htZW50cyI7czoyODk6Ilt7ImVzdGFibGlzaG1lbnRfbnVtYmVyIjoiMDAxIiwiY29tbWVyY2lhbF9uYW1lIjoiQUNJTUFMTCBTLkEuIiwiZXN0YWJsaXNobWVudF90eXBlIjoiTUFUIiwiY29tcGxldGVfYWRkcmVzcyI6IkdVQVlBUyBcLyBHVUFZQVFVSUwgXC8gUk9DQUZVRVJURSBcLyBBR1VJUlJFIDMyNCBZIENISUxFIiwiZXN0YWJsaXNobWVudF9zdGF0dXMiOiJDRVJSQURPIiwiaXNfaGVhZHF1YXJ0ZXJzIjp0cnVlLCJwcm92aW5jZSI6IkdVQVlBUyIsImNhbnRvbiI6IkdVQVlBUVVJTCIsInBhcmlzaCI6IlJPQ0FGVUVSVEUifV0iO3M6OToiY2hhbGxlbmdlIjtOO3M6OToicmVtaXNzaW9uIjtOO3M6MTA6InVwZGF0ZWRfYXQiO3M6MTk6IjIwMjUtMDgtMDIgMDQ6NDQ6MzEiO3M6MTA6ImNyZWF0ZWRfYXQiO3M6MTk6IjIwMjUtMDgtMDIgMDQ6NDQ6MzEiO31zOjExOiIAKgBvcmlnaW5hbCI7YToyOTp7czoxNDoiaWRlbnRpZmljYXRpb24iO3M6MTM6IjA5OTIzNTU3OTQwMDEiO3M6MTM6ImJ1c2luZXNzX25hbWUiO3M6MTI6IkFDSU1BTEwgUy5BLiI7czoxMDoibGVnYWxfbmFtZSI7czoxMjoiQUNJTUFMTCBTLkEuIjtzOjE1OiJjb21tZXJjaWFsX25hbWUiO047czo2OiJzdGF0dXMiO047czoxMzoidGF4cGF5ZXJfdHlwZSI7czo4OiJTT0NJRURBRCI7czoxNToidGF4cGF5ZXJfc3RhdHVzIjtOO3M6MTQ6InRheHBheWVyX2NsYXNzIjtOO3M6NjoicmVnaW1lIjtzOjc6IkdFTkVSQUwiO3M6MTM6Im1haW5fYWN0aXZpdHkiO3M6Njg6IkZBQlJJQ0FDScOTTiBERSBPVFJPUyBQUk9EVUNUT1MgUVXDjU1JQ09TIERFIFVTTyBBR1JPUEVDVUFSSU8gTi5DLlAuIjtzOjEwOiJzdGFydF9kYXRlIjtOO3M6MTQ6ImNlc3NhdGlvbl9kYXRlIjtOO3M6MTI6InJlc3RhcnRfZGF0ZSI7TjtzOjExOiJ1cGRhdGVfZGF0ZSI7TjtzOjE5OiJhY2NvdW50aW5nX3JlcXVpcmVkIjtzOjI6IlNJIjtzOjE3OiJ3aXRoaG9sZGluZ19hZ2VudCI7czoyOiJOTyI7czoxNjoic3BlY2lhbF90YXhwYXllciI7czoyOiJOTyI7czoxNDoiZ2hvc3RfdGF4cGF5ZXIiO3M6MjoiTk8iO3M6MjQ6Im5vbmV4aXN0ZW50X3RyYW5zYWN0aW9ucyI7czoyOiJOTyI7czoyMToibGVnYWxfcmVwcmVzZW50YXRpdmVzIjtzOjc0OiJbeyJpZGVudGlmaWNhY2lvbiI6IjA5MTY1OTA3NDgiLCJub21icmUiOiJHQVJDSUEgRVVHRU5JTyBKQVpNSU4gTUFSSUJFTCJ9XSI7czoxOToiY2FuY2VsbGF0aW9uX3JlYXNvbiI7czoxMDoiREVQVVJBQ0lPTiI7czoxOToiaGVhZF9vZmZpY2VfYWRkcmVzcyI7czo1MzoiR1VBWUFTIC8gR1VBWUFRVUlMIC8gUk9DQUZVRVJURSAvIEFHVUlSUkUgMzI0IFkgQ0hJTEUiO3M6MTE6ImRlYnRfYW1vdW50IjtOO3M6MTY6ImRlYnRfZGVzY3JpcHRpb24iO047czoxNDoiZXN0YWJsaXNobWVudHMiO3M6Mjg5OiJbeyJlc3RhYmxpc2htZW50X251bWJlciI6IjAwMSIsImNvbW1lcmNpYWxfbmFtZSI6IkFDSU1BTEwgUy5BLiIsImVzdGFibGlzaG1lbnRfdHlwZSI6Ik1BVCIsImNvbXBsZXRlX2FkZHJlc3MiOiJHVUFZQVMgXC8gR1VBWUFRVUlMIFwvIFJPQ0FGVUVSVEUgXC8gQUdVSVJSRSAzMjQgWSBDSElMRSIsImVzdGFibGlzaG1lbnRfc3RhdHVzIjoiQ0VSUkFETyIsImlzX2hlYWRxdWFydGVycyI6dHJ1ZSwicHJvdmluY2UiOiJHVUFZQVMiLCJjYW50b24iOiJHVUFZQVFVSUwiLCJwYXJpc2giOiJST0NBRlVFUlRFIn1dIjtzOjk6ImNoYWxsZW5nZSI7TjtzOjk6InJlbWlzc2lvbiI7TjtzOjEwOiJ1cGRhdGVkX2F0IjtzOjE5OiIyMDI1LTA4LTAyIDA0OjQ0OjMxIjtzOjEwOiJjcmVhdGVkX2F0IjtzOjE5OiIyMDI1LTA4LTAyIDA0OjQ0OjMxIjt9czoxMDoiACoAY2hhbmdlcyI7YTowOnt9czoxMToiACoAcHJldmlvdXMiO2E6MDp7fXM6ODoiACoAY2FzdHMiO2E6NDp7czoxNDoiZXN0YWJsaXNobWVudHMiO3M6NToiYXJyYXkiO3M6OToiY2hhbGxlbmdlIjtzOjU6ImFycmF5IjtzOjk6InJlbWlzc2lvbiI7czo1OiJhcnJheSI7czoyMToibGVnYWxfcmVwcmVzZW50YXRpdmVzIjtzOjU6ImFycmF5Ijt9czoxNzoiACoAY2xhc3NDYXN0Q2FjaGUiO2E6MDp7fXM6MjE6IgAqAGF0dHJpYnV0ZUNhc3RDYWNoZSI7YTowOnt9czoxMzoiACoAZGF0ZUZvcm1hdCI7TjtzOjEwOiIAKgBhcHBlbmRzIjthOjA6e31zOjE5OiIAKgBkaXNwYXRjaGVzRXZlbnRzIjthOjA6e31zOjE0OiIAKgBvYnNlcnZhYmxlcyI7YTowOnt9czoxMjoiACoAcmVsYXRpb25zIjthOjA6e31zOjEwOiIAKgB0b3VjaGVzIjthOjA6e31zOjI3OiIAKgByZWxhdGlvbkF1dG9sb2FkQ2FsbGJhY2siO047czoyNjoiACoAcmVsYXRpb25BdXRvbG9hZENvbnRleHQiO047czoxMDoidGltZXN0YW1wcyI7YjoxO3M6MTM6InVzZXNVbmlxdWVJZHMiO2I6MDtzOjk6IgAqAGhpZGRlbiI7YTowOnt9czoxMDoiACoAdmlzaWJsZSI7YTowOnt9czoxMToiACoAZmlsbGFibGUiO2E6Mjc6e2k6MDtzOjE0OiJpZGVudGlmaWNhdGlvbiI7aToxO3M6MTM6ImJ1c2luZXNzX25hbWUiO2k6MjtzOjEwOiJsZWdhbF9uYW1lIjtpOjM7czoxNToiY29tbWVyY2lhbF9uYW1lIjtpOjQ7czo2OiJzdGF0dXMiO2k6NTtzOjEzOiJ0YXhwYXllcl90eXBlIjtpOjY7czoxNToidGF4cGF5ZXJfc3RhdHVzIjtpOjc7czoxNDoidGF4cGF5ZXJfY2xhc3MiO2k6ODtzOjY6InJlZ2ltZSI7aTo5O3M6MTM6Im1haW5fYWN0aXZpdHkiO2k6MTA7czoxMDoic3RhcnRfZGF0ZSI7aToxMTtzOjE0OiJjZXNzYXRpb25fZGF0ZSI7aToxMjtzOjEyOiJyZXN0YXJ0X2RhdGUiO2k6MTM7czoxMToidXBkYXRlX2RhdGUiO2k6MTQ7czoxOToiYWNjb3VudGluZ19yZXF1aXJlZCI7aToxNTtzOjE3OiJ3aXRoaG9sZGluZ19hZ2VudCI7aToxNjtzOjE2OiJzcGVjaWFsX3RheHBheWVyIjtpOjE3O3M6MTQ6Imdob3N0X3RheHBheWVyIjtpOjE4O3M6MjQ6Im5vbmV4aXN0ZW50X3RyYW5zYWN0aW9ucyI7aToxOTtzOjIxOiJsZWdhbF9yZXByZXNlbnRhdGl2ZXMiO2k6MjA7czoxOToiY2FuY2VsbGF0aW9uX3JlYXNvbiI7aToyMTtzOjE5OiJoZWFkX29mZmljZV9hZGRyZXNzIjtpOjIyO3M6MTE6ImRlYnRfYW1vdW50IjtpOjIzO3M6MTY6ImRlYnRfZGVzY3JpcHRpb24iO2k6MjQ7czoxNDoiZXN0YWJsaXNobWVudHMiO2k6MjU7czo5OiJjaGFsbGVuZ2UiO2k6MjY7czo5OiJyZW1pc3Npb24iO31zOjEwOiIAKgBndWFyZGVkIjthOjE6e2k6MDtzOjE6IioiO319	1754131470
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, is_active, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: core_web_vitals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.core_web_vitals (id, url, lcp, fid, cls, fcp, ttfb, device_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: domains; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.domains (id, domain, tenant_id, created_at, updated_at) FROM stdin;
1	empresa-demo.facturacion.test	empresa-demo	2025-07-07 03:34:26	2025-07-07 03:34:26
2	tech-solutions.facturacion.test	tech-solutions	2025-07-07 03:34:27	2025-07-07 03:34:27
3	consultoria-peru.facturacion.test	consultoria-peru	2025-07-07 03:34:27	2025-07-07 03:34:27
4	innovacion-digital.facturacion.test	innovacion-digital	2025-07-07 03:34:27	2025-07-07 03:34:27
5	servicios-contables.facturacion.test	servicios-contables	2025-07-07 03:34:28	2025-07-07 03:34:28
7	velez-pena-allan-stuart.facturacion.test	velez-pena-allan-stuart	2025-07-23 22:31:01	2025-07-23 22:31:01
8	montesdeoca-ordonez-esthella-de-las-mercedes.facturacion.test	montesdeoca-ordonez-esthella-de-las-mercedes	2025-07-24 03:14:08	2025-07-24 03:14:08
10	iscarsa-group-sas.facturacion.test	iscarsa-group-sas	2025-07-24 03:44:33	2025-07-24 03:44:33
11	montesdeoca-ordonez-jose-israel.facturacion.test	montesdeoca-ordonez-jose-israel	2025-07-24 04:01:55	2025-07-24 04:01:55
12	aa-asociados-krm-cia-ltda.facturacion.test	aa-asociados-krm-cia-ltda	2025-07-24 04:04:38	2025-07-24 04:04:38
13	aaa-adventuregalapagos-islands-sas.facturacion.test	aaa-adventuregalapagos-islands-sas	2025-07-24 04:13:03	2025-07-24 04:13:03
15	0papeleoecuadorcialtdabic.facturacion.test	0papeleoecuadorcialtdabic	2025-08-01 01:20:04	2025-08-01 01:20:04
16	velezpenaallanstuart.facturacion.test	velezpenaallanstuart	2025-08-01 01:38:26	2025-08-01 01:38:26
17	montesdeocaordonezesthelladelasmercedes.facturacion.test	montesdeocaordonezesthelladelasmercedes	2025-08-01 01:41:26	2025-08-01 01:41:26
19	001rcbmacmbitecb001d1sasbic.facturacion.test	001rcbmacmbitecb001d1sasbic	2025-08-01 04:33:33	2025-08-01 04:33:33
20	001rcbmacmbiteca001a1sasbic.facturacion.test	001rcbmacmbiteca001a1sasbic	2025-08-01 04:36:46	2025-08-01 04:36:46
21	09-celularesgamvalsaenliquidacion.facturacion.test	09-celularesgamvalsaenliquidacion	2025-08-01 04:39:47	2025-08-01 04:39:47
22	agricolalolandiasa.facturacion.test	agricolalolandiasa	2025-08-01 04:41:50	2025-08-01 04:41:50
23	agbrandsa.facturacion.test	agbrandsa	2025-08-01 04:48:39	2025-08-01 04:48:39
24	2bagsa.facturacion.test	2bagsa	2025-08-01 04:54:52	2025-08-01 04:54:52
25	abalossa.facturacion.test	abalossa	2025-08-01 04:56:52	2025-08-01 04:56:52
26	absolemsa.facturacion.test	absolemsa	2025-08-02 03:03:41	2025-08-02 03:03:41
27	genesiscorporationindjanimangmbhsas.facturacion.test	genesiscorporationindjanimangmbhsas	2025-08-02 03:28:55	2025-08-02 03:28:55
28	genesiscommunicationlatinoamericanagecolasa.facturacion.test	genesiscommunicationlatinoamericanagecolasa	2025-08-02 03:31:50	2025-08-02 03:31:50
30	abolinesa.facturacion.test	abolinesa	2025-08-02 03:51:16	2025-08-02 03:51:16
31	akdemossa.facturacion.test	akdemossa	2025-08-02 04:33:46	2025-08-02 04:33:46
34	3fasico-sa.facturacion.test	3fasico-sa	2025-08-02 04:47:48	2025-08-02 04:47:48
35	admilegalsa.facturacion.test	admilegalsa	2025-08-02 05:01:52	2025-08-02 05:01:52
36	acaicopolissa.facturacion.test	acaicopolissa	2025-08-02 05:10:41	2025-08-02 05:10:41
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: footers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.footers (id, name, template, content, is_active, logo_path, created_at, updated_at) FROM stdin;
1	Default Footer	simple	[]	t	\N	2025-07-30 06:04:09	2025-07-30 06:04:09
\.


--
-- Data for Name: invoice_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_usage (id, total_invoices, monthly_invoices, "limit", last_reset, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
1	default	{"uuid":"eb214101-dddc-4f0c-a733-d0a79996a159","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:18:\\"innovacion-digital\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753211063,"delay":null}	0	\N	1753211063	1753211063
2	default	{"uuid":"810cd341-e903-463f-bbfe-b921c2254482","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:23:\\"velez-pena-allan-stuart\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753309866,"delay":null}	0	\N	1753309866	1753309866
3	default	{"uuid":"3292270f-f6df-4572-8fbb-36caeb5fcb7c","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:44:\\"montesdeoca-ordonez-esthella-de-las-mercedes\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753326850,"delay":null}	0	\N	1753326850	1753326850
4	default	{"uuid":"9795286a-8b64-4e3c-9dab-f94a98269003","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:13:\\"zx-studio-sas\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753327314,"delay":null}	0	\N	1753327314	1753327314
5	default	{"uuid":"14eed70e-9203-4498-baf4-f1fac619c988","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:13:\\"zx-studio-sas\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753327510,"delay":null}	0	\N	1753327510	1753327510
6	default	{"uuid":"034724bf-7b3f-41e5-bd16-9fca69a5bded","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:13:\\"zx-studio-sas\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753327554,"delay":null}	0	\N	1753327554	1753327554
7	default	{"uuid":"3543e38f-20db-4277-a062-12e06acfbe1d","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:17:\\"iscarsa-group-sas\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753328675,"delay":null}	0	\N	1753328675	1753328675
8	default	{"uuid":"9275df38-acba-491b-93e8-1283f33cfca4","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:13:\\"zx-studio-sas\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753329241,"delay":null}	0	\N	1753329241	1753329241
9	default	{"uuid":"845cd96a-eee3-4ada-9b50-28a7124964b2","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:31:\\"montesdeoca-ordonez-jose-israel\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753329716,"delay":null}	0	\N	1753329716	1753329716
10	default	{"uuid":"51e7eaf7-352c-4691-b5f4-5b92b05a37b6","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:31:\\"montesdeoca-ordonez-jose-israel\\";s:8:\\"isActive\\";b:0;s:7:\\"message\\";s:30:\\"Su cuenta ha sido desactivada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753329731,"delay":null}	0	\N	1753329731	1753329731
11	default	{"uuid":"0822e7ae-564f-4f39-b13c-a66e8d41d385","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:31:\\"montesdeoca-ordonez-jose-israel\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753329742,"delay":null}	0	\N	1753329742	1753329742
12	default	{"uuid":"5170c06c-78bb-4a88-90a3-2336baf387dc","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:31:\\"montesdeoca-ordonez-jose-israel\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753329757,"delay":null}	0	\N	1753329757	1753329757
13	default	{"uuid":"51ff1ef6-81c6-4cef-bdb6-20933768d769","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:25:\\"aa-asociados-krm-cia-ltda\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753329879,"delay":null}	0	\N	1753329879	1753329879
14	default	{"uuid":"833f6bd2-391c-4c1d-b031-393d8cafb15d","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:25:\\"aa-asociados-krm-cia-ltda\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753329905,"delay":null}	0	\N	1753329905	1753329905
15	default	{"uuid":"5b131bf5-e60e-4ed0-9f5e-0cf077272281","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:34:\\"aaa-adventuregalapagos-islands-sas\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753330384,"delay":null}	0	\N	1753330384	1753330384
16	default	{"uuid":"430762cf-0c25-4154-b546-c88240f4323b","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:12:\\"empresa-demo\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753337995,"delay":null}	0	\N	1753337995	1753337995
17	default	{"uuid":"0851a90d-2dc2-46bd-b9b4-ceb644b7d208","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:17:\\"iscarsa-group-sas\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753556510,"delay":null}	0	\N	1753556510	1753556510
18	default	{"uuid":"0943f02a-3c3b-46ba-b355-28a8eacf3396","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:17:\\"iscarsa-group-sas\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753556752,"delay":null}	0	\N	1753556752	1753556752
19	default	{"uuid":"ad58906d-5555-4735-b1df-cab2bcfdc21a","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:17:\\"iscarsa-group-sas\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753556769,"delay":null}	0	\N	1753556769	1753556769
20	default	{"uuid":"3cc97e98-a19c-4004-9e97-03bd89ca8176","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:17:\\"iscarsa-group-sas\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1753714398,"delay":null}	0	\N	1753714398	1753714398
21	default	{"uuid":"16e2b7dd-b895-4049-abe7-26a122db368e","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:9:\\"absolemsa\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1754103943,"delay":null}	0	\N	1754103943	1754103943
22	default	{"uuid":"34044845-b81b-4558-ae25-91d723847aea","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:9:\\"absolemsa\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1754104240,"delay":null}	0	\N	1754104240	1754104240
23	default	{"uuid":"0835b484-6675-4493-8660-446fd5de2dfc","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:9:\\"absolemsa\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1754104296,"delay":null}	0	\N	1754104296	1754104296
24	default	{"uuid":"3523a02f-0d21-46f1-80d6-4d806e7a7f59","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:35:\\"genesiscorporationindjanimangmbhsas\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1754105432,"delay":null}	0	\N	1754105432	1754105432
25	default	{"uuid":"d9a18287-a83b-4e87-91e7-b76bbe1a9ffe","displayName":"App\\\\Events\\\\StatusTenant","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":14:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\StatusTenant\\":3:{s:8:\\"tenantId\\";s:10:\\"3fasico-sa\\";s:8:\\"isActive\\";b:1;s:7:\\"message\\";s:33:\\"Su suscripción ha sido activada.\\";}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}"},"createdAt":1754110069,"delay":null}	0	\N	1754110069	1754110069
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media (id, model_type, model_id, uuid, collection_name, name, file_name, mime_type, disk, conversions_disk, size, manipulations, custom_properties, generated_conversions, responsive_images, order_column, deleted_at, created_at, updated_at) FROM stdin;
1	App\\Models\\Banner	1	0fe741e8-d599-47c2-9196-e3a41e17ed32	banners_covers	demobanner	demobanner.png	image/png	public	public	130929	[]	[]	{"thumb":true,"optimized":true}	[]	1	\N	2025-07-30 06:29:10	2025-07-30 06:29:12
\.


--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_items (id, menu_id, label, url, type, object_id, target, css_class, "order", parent_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: menus; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menus (id, title, description, location, is_active, created_at, updated_at) FROM stdin;
1	dem	\N	\N	t	2025-07-30 06:11:45	2025-07-30 06:11:45
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2019_09_15_000000_create_subscription_plans_table	1
5	2019_09_15_000010_create_tenants_table	1
6	2019_09_15_000020_create_domains_table	1
7	2025_06_24_165950_create_permission_tables	1
8	2025_06_24_170728_add_tenant_id_to_users_table	1
9	2025_06_24_220903_create_personal_access_tokens_table	1
10	2025_06_26_000001_create_subscriptions_table	1
11	2025_06_26_000002_create_invoice_usage_table	1
12	2025_06_26_005332_add_billing_period_to_tenants_table	1
13	2025_06_27_000001_create_payments_table	1
14	2025_06_29_193311_add_subscription_plan_id_to_subscriptions_table	1
15	2025_06_27_172016_create_sris_table	2
16	2025_06_04_065902_create_news_table	3
17	2025_06_04_065902_create_pages_table	3
18	2025_06_04_065903_create_banners_table	3
19	2025_06_04_065903_create_menus_table	3
20	2025_06_04_065904_create_menu_items_table	3
21	2025_06_04_065904_create_testimonials_table	3
22	2025_06_04_065905_create_page_views_table	3
23	2025_06_04_071748_create_seo_table	3
24	2025_06_05_034950_create_categories_table	3
25	2025_06_09_182654_unattached_media_containers	3
26	2025_06_11_043620_create_activity_log_table	3
27	2025_06_17_205442_add_event_column_to_activity_log_table	3
28	2025_06_17_205443_add_batch_uuid_column_to_activity_log_table	3
29	2025_06_17_205539_create_media_table	3
30	2025_06_17_224156_add_fields_to_activity_log_table	3
31	2025_06_18_195350_create_site_settings_table	3
\.


--
-- Data for Name: model_has_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_has_permissions (permission_id, model_type, model_id) FROM stdin;
\.


--
-- Data for Name: model_has_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_has_roles (role_id, model_type, model_id) FROM stdin;
1	App\\Models\\User	1
\.


--
-- Data for Name: news; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.news (id, title, slug, excerpt, content, published_at, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: page_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.page_views (id, url, referer, user_agent, title, meta_description, meta_keywords, time_on_page, is_bounce, exit_page, device_type, browser, os, screen_resolution, country, city, utm_source, utm_medium, utm_campaign, utm_term, utm_content, is_conversion, conversion_type, conversion_value, session_id, is_new_visitor, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages (id, title, slug, content, template, template_data, is_active, sort_order, meta_title, meta_description, meta_image, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, tenant_id, subscription_plan_id, amount, payment_method, payment_date, billing_period, subscription_starts_at, subscription_ends_at, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, guard_name, created_at, updated_at) FROM stdin;
1	dashboard.view	web	2025-07-07 03:34:28	2025-07-07 03:34:28
2	user.view	web	2025-07-07 03:34:28	2025-07-07 03:34:28
3	user.create	web	2025-07-07 03:34:28	2025-07-07 03:34:28
4	user.edit	web	2025-07-07 03:34:28	2025-07-07 03:34:28
5	user.delete	web	2025-07-07 03:34:28	2025-07-07 03:34:28
6	role.view	web	2025-07-07 03:34:28	2025-07-07 03:34:28
7	role.create	web	2025-07-07 03:34:28	2025-07-07 03:34:28
8	role.edit	web	2025-07-07 03:34:28	2025-07-07 03:34:28
9	role.delete	web	2025-07-07 03:34:28	2025-07-07 03:34:28
10	tenant.manage	web	2025-07-07 03:34:28	2025-07-07 03:34:28
11	sales.view	web	2025-07-07 03:34:28	2025-07-07 03:34:28
12	sales.create	web	2025-07-07 03:34:28	2025-07-07 03:34:28
13	sales.edit	web	2025-07-07 03:34:28	2025-07-07 03:34:28
14	sales.delete	web	2025-07-07 03:34:28	2025-07-07 03:34:28
15	inventory.view	web	2025-07-07 03:34:28	2025-07-07 03:34:28
16	inventory.manage	web	2025-07-07 03:34:28	2025-07-07 03:34:28
17	cash.manage	web	2025-07-07 03:34:28	2025-07-07 03:34:28
18	cash.view	web	2025-07-07 03:34:28	2025-07-07 03:34:28
19	accounting.view	web	2025-07-07 03:34:28	2025-07-07 03:34:28
20	accounting.manage	web	2025-07-07 03:34:28	2025-07-07 03:34:28
21	reports.view	web	2025-07-07 03:34:28	2025-07-07 03:34:28
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
1	App\\Models\\User	1	default_token	ba974bf35d81fa303037508019cecfbebb40e52733c02f3639061c2b8efb37fe	["*"]	\N	\N	2025-07-22 11:19:31	2025-07-22 11:19:31
\.


--
-- Data for Name: role_has_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_has_permissions (permission_id, role_id) FROM stdin;
1	1
2	1
3	1
4	1
5	1
6	1
7	1
8	1
9	1
10	1
11	1
12	1
13	1
14	1
15	1
16	1
17	1
18	1
19	1
20	1
21	1
1	2
2	2
1	3
11	3
12	3
15	3
1	4
18	4
17	4
11	4
1	5
19	5
20	5
21	5
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, guard_name, created_at, updated_at) FROM stdin;
1	admin	web	2025-07-07 03:34:28	2025-07-07 03:34:28
2	user	web	2025-07-07 03:34:28	2025-07-07 03:34:28
3	vendedor	web	2025-07-07 03:34:28	2025-07-07 03:34:28
4	cajero	web	2025-07-07 03:34:28	2025-07-07 03:34:28
5	contador	web	2025-07-07 03:34:28	2025-07-07 03:34:28
\.


--
-- Data for Name: seo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seo (id, model_id, model_type, description, route, title, image, author, robots, keywords, canonical_url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: seo_errors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seo_errors (id, url, status_code, error_type, error_message, referer, user_agent, count, first_seen, last_seen, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: seo_keywords; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seo_keywords (id, keyword, url, "position", clicks, impressions, ctr, avg_position, date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
hf5otA3xDmyLBBEdFeZuynrILvpyILNV5MtqxQhv	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	YTozOntzOjY6Il90b2tlbiI7czo0MDoidjdCYXQ2QnVaSW1pSWRYVGZzcXQ0NjhhOTF2V3p0MDJMd0dET0RCNSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vZmFjdHVyYWNpb24udGVzdCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=	1754448469
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, site_name, logo_path, favicon_path, primary_color, secondary_color, social_links, contact_email, contact_phone, support_email, support_phone, address, site_description, meta_description, meta_keywords, analytics_data, seo_title, seo_keywords, seo_description, seo_metadata, social_network, created_at, updated_at) FROM stdin;
1	Laravel	\N	\N	#3b82f6	#10b981	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	2025-07-30 05:58:09	2025-07-30 05:58:09
\.


--
-- Data for Name: sris; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sris (identification, business_name, legal_name, commercial_name, status, taxpayer_type, taxpayer_status, taxpayer_class, regime, main_activity, start_date, cessation_date, restart_date, update_date, accounting_required, withholding_agent, special_taxpayer, ghost_taxpayer, nonexistent_transactions, legal_representatives, cancellation_reason, head_office_address, debt_amount, debt_description, establishments, challenge, remission, created_at, updated_at) FROM stdin;
0940440167001	VELEZ PEÑA ALLAN STUART	VELEZ PEÑA ALLAN STUART	\N	\N	PERSONA NATURAL	\N	\N	GENERAL	ACTIVIDADES DE DISEÑO DE LA ESTRUCTURA Y EL CONTENIDO DE LOS ELEMENTOS SIGUIENTES (Y/O ESCRITURA DEL CÓDIGO INFORMÁTICO NECESARIO PARA SU CREACIÓN Y APLICACIÓN): PROGRAMAS DE SISTEMAS OPERATIVOS (INCLUIDAS ACTUALIZACIONES Y PARCHES DE CORRECCIÓN), APLICACIONES INFORMÁTICAS (INCLUIDAS ACTUALIZACIONES Y PARCHES DE CORRECCIÓN), BASES DE DATOS Y PÁGINAS WEB.	\N	\N	\N	\N	NO	NO	NO	NO	NO	[]	\N	GUAYAS / DURAN / ELOY ALFARO (DURAN) /  SOLAR 4	\N	\N	[{"establishment_number":"001","commercial_name":null,"establishment_type":"MAT","complete_address":"GUAYAS \\/ DURAN \\/ ELOY ALFARO (DURAN) \\/  SOLAR 4","establishment_status":"ABIERTO","is_headquarters":true,"province":"GUAYAS","canton":"DURAN","parish":"ELOY ALFARO (DURAN)"}]	\N	\N	2025-07-22 23:57:21	2025-07-22 23:57:21
0993387314001	ZX-STUDIO S.A.S.	ZX-STUDIO S.A.S.	\N	\N	SOCIEDAD	\N	\N	GENERAL	ACTIVIDADES DE DISEÑO DE LA ESTRUCTURA Y EL CONTENIDO DE LOS ELEMENTOS SIGUIENTES (Y/O ESCRITURA DEL CÓDIGO INFORMÁTICO NECESARIO PARA SU CREACIÓN Y APLICACIÓN): PROGRAMAS DE SISTEMAS OPERATIVOS (INCLUIDAS ACTUALIZACIONES Y PARCHES DE CORRECCIÓN), APLICACIONES INFORMÁTICAS (INCLUIDAS ACTUALIZACIONES Y PARCHES DE CORRECCIÓN), BASES DE DATOS Y PÁGINAS WEB.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"0940440167","nombre":"VELEZ PE\\u00d1A ALLAN STUART"}]	\N	GUAYAS / DURAN / ELOY ALFARO (DURAN) / ANA MARIA DE OLMEDO Y N/A	\N	\N	[{"establishment_number":"001","commercial_name":"ZX-STUDIO","establishment_type":"MAT","complete_address":"GUAYAS \\/ DURAN \\/ ELOY ALFARO (DURAN) \\/ ANA MARIA DE OLMEDO Y N\\/A","establishment_status":"ABIERTO","is_headquarters":true,"province":"GUAYAS","canton":"DURAN","parish":"ELOY ALFARO (DURAN)"}]	\N	\N	2025-07-23 00:00:15	2025-07-23 00:00:15
0929004158001	MONTESDEOCA ORDOÑEZ ESTHELLA DE LAS MERCEDES	MONTESDEOCA ORDOÑEZ ESTHELLA DE LAS MERCEDES	\N	\N	PERSONA NATURAL	\N	\N	RIMPE	VENTA AL POR MENOR DE GRAN VARIEDAD DE PRODUCTOS EN TIENDAS, ENTRE LOS QUE PREDOMINAN, LOS PRODUCTOS ALIMENTICIOS, LAS BEBIDAS O EL TABACO, COMO PRODUCTOS DE PRIMERA NECESIDAD Y VARIOS OTROS TIPOS DE PRODUCTOS.	\N	\N	\N	\N	NO	NO	NO	NO	NO	[]	\N	GUAYAS / DAULE / LA AURORA (SATÉLITE) / MANZANA U 10 Y PEATONAL	\N	\N	[{"establishment_number":"001","commercial_name":"PRINCESITAS ECUADOR","establishment_type":"MAT","complete_address":"GUAYAS \\/ DAULE \\/ LA AURORA (SAT\\u00c9LITE) \\/ MANZANA U 10 Y PEATONAL","establishment_status":"ABIERTO","is_headquarters":true,"province":"GUAYAS","canton":"DAULE","parish":"LA AURORA (SAT\\u00c9LITE)"}]	\N	\N	2025-07-23 21:48:07	2025-07-23 21:48:07
0993388324001	ISCARSA GROUP S.A.S.	ISCARSA GROUP S.A.S.	\N	\N	SOCIEDAD	\N	\N	GENERAL	PRESTACIÓN DE OTROS SERVICIOS DE RESERVAS RELACIONADOS CON LOS VIAJES: RESERVAS DE TRANSPORTE, HOTELES, RESTAURANTES, ALQUILER DE AUTOMÓVILES, ENTRETENIMIENTO Y DEPORTE, ETCÉTERA.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"0927541755","nombre":"MONTESDEOCA ORDO\\u00d1EZ JOSE ISRAEL"}]	\N	GUAYAS / GUAYAQUIL / GUAYAQUIL / VILLA CLUB Y N/A	\N	\N	[{"establishment_number":"001","commercial_name":"ISCARSA GROUP","establishment_type":"MAT","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ GUAYAQUIL \\/ VILLA CLUB Y N\\/A","establishment_status":"ABIERTO","is_headquarters":true,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"GUAYAQUIL"}]	\N	\N	2025-07-24 03:44:08	2025-07-24 03:44:08
0927541755001	MONTESDEOCA ORDOÑEZ JOSE ISRAEL	MONTESDEOCA ORDOÑEZ JOSE ISRAEL	\N	\N	PERSONA NATURAL	\N	\N	RIMPE	ACTIVIDADES DE SERVICIOS DIVERSOS.	\N	\N	\N	\N	NO	NO	NO	NO	NO	[]	\N	GUAYAS / DAULE / LA AURORA (SATÉLITE) / URB. AURA II ETAPA MZU SL10 DE VILLA CLUB 10 Y SN	\N	\N	[{"establishment_number":"001","commercial_name":"MINIMARKET VIKINGOS BY SKAL","establishment_type":"OFI","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ XIMENA \\/ WASHINGTON SN Y ENTRE EL ORO Y MARACAIBO","establishment_status":"ABIERTO","is_headquarters":false,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"XIMENA"},{"establishment_number":"002","commercial_name":"PRINCESITAS ECUADOR","establishment_type":"OFI","complete_address":"GUAYAS \\/ DAULE \\/ LOS LOJAS (ENRIQUE BAQUERIZO MORENO) \\/ URBANIZACION VILLA CLUB 10 Y MZ U","establishment_status":"ABIERTO","is_headquarters":false,"province":"GUAYAS","canton":"DAULE","parish":"LOS LOJAS (ENRIQUE BAQUERIZO MORENO)"},{"establishment_number":"003","commercial_name":"ISCAR RENTADORA DE VEHICULOS","establishment_type":"MAT","complete_address":"GUAYAS \\/ DAULE \\/ LA AURORA (SAT\\u00c9LITE) \\/ URB. AURA II ETAPA MZU SL10 DE VILLA CLUB 10 Y SN","establishment_status":"ABIERTO","is_headquarters":true,"province":"GUAYAS","canton":"DAULE","parish":"LA AURORA (SAT\\u00c9LITE)"}]	\N	\N	2025-07-24 04:01:46	2025-07-24 04:01:46
1191786684001	A&A ASOCIADOS KRM CIA LTDA	A&A ASOCIADOS KRM CIA LTDA	\N	\N	SOCIEDAD	\N	\N	GENERAL	PRESTACIÓN DE ASESORAMIENTO Y AYUDA A LAS EMPRESAS Y LAS ADMINISTRACIONES PÚBLICAS EN MATERIA DE PLANIFICACIÓN, ORGANIZACIÓN, EFICIENCIA Y CONTROL, INFORMACIÓN ADMINISTRATIVA, ETCÉTERA.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"1103664692","nombre":"QUIZHPE ANDRADE ANA MERCEDES"}]	\N	LOJA / SARAGURO / SARAGURO / LOJA SN Y 10 DE MARZO	\N	\N	[{"establishment_number":"001","commercial_name":null,"establishment_type":"MAT","complete_address":"LOJA \\/ SARAGURO \\/ SARAGURO \\/ LOJA SN Y 10 DE MARZO","establishment_status":"ABIERTO","is_headquarters":true,"province":"LOJA","canton":"SARAGURO","parish":"SARAGURO"},{"establishment_number":"002","commercial_name":null,"establishment_type":"OFI","complete_address":"LOJA \\/ SARAGURO \\/ SARAGURO \\/ LOJA SN Y 10 DE MARZO","establishment_status":"ABIERTO","is_headquarters":false,"province":"LOJA","canton":"SARAGURO","parish":"SARAGURO"}]	\N	\N	2025-07-24 04:04:24	2025-07-24 04:04:24
2091767839001	AAA-ADVENTUREGALAPAGOS ISLANDS S.A.S.	AAA-ADVENTUREGALAPAGOS ISLANDS S.A.S.	\N	\N	SOCIEDAD	\N	\N	RIMPE	ACTIVIDAD DE OPERADORES TURÍSTICOS QUE SE ENCARGAN DE LA PLANIFICACIÓN Y ORGANIZACIÓN DE PAQUETES DE SERVICIOS DE VIAJES (TOURS) PARA SU VENTA A TRAVÉS DE AGENCIAS DE VIAJES O POR LOS PROPIOS OPERADORES TURÍSTICOS. ESOS VIAJES ORGANIZADOS (TOURS) PUEDEN INCLUIR LA TOTALIDAD O PARTE DE LAS SIGUIENTES CARACTERÍSTICAS: TRANSPORTE, ALOJAMIENTO, COMIDAS, VISITAS A MUSEOS, LUGARES HISTÓRICOS O CULTURALES, ESPECTÁCULOS TEATRALES, MUSICALES O DEPORTIVOS.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"1754843520","nombre":"VELEZ MONTERO PABLO ANTONIO"},{"identificacion":"1805072384","nombre":"NU\\u00d1EZ LLERENA ERICK ADRIAN"}]	\N	GALAPAGOS / SANTA CRUZ / PUERTO AYORA / ISLAS PLAZA Y CHARLES BINFORD CALLE PRINCIPAL S/N TRAS LA ES Y DIAGONAL A LA JUDICATURA	\N	\N	[{"establishment_number":"001","commercial_name":null,"establishment_type":"MAT","complete_address":"GALAPAGOS \\/ SANTA CRUZ \\/ PUERTO AYORA \\/ ISLAS PLAZA Y CHARLES BINFORD CALLE PRINCIPAL S\\/N TRAS LA ES Y DIAGONAL A LA JUDICATURA","establishment_status":"ABIERTO","is_headquarters":true,"province":"GALAPAGOS","canton":"SANTA CRUZ","parish":"PUERTO AYORA"}]	\N	\N	2025-07-24 04:12:50	2025-07-24 04:12:50
0691785586001	0PAPELEO ECUADOR CIA.LTDA. B.I.C.	0PAPELEO ECUADOR CIA.LTDA. B.I.C.	\N	\N	SOCIEDAD	\N	\N	RIMPE	ACTIVIDADES DE CENTROS QUE ATIENDEN A LLAMADAS DE CLIENTES UTILIZANDO OPERADORES HUMANOS, SISTEMAS DE DISTRIBUCIÓN AUTOMÁTICA DE LLAMADAS, SISTEMAS INFORMATIZADOS DE TELEFONÍA, SISTEMAS INTERACTIVOS DE RESPUESTA DE VOZ O MÉTODOS SIMILARES PARA RECIBIR PEDIDOS, PROPORCIONAR INFORMACIÓN SOBRE PRODUCTOS, RESPONDER A SOLICITUDES DE ASISTENCIA DE LOS CLIENTES O ATENDER RECLAMACIONES (CALL - CENTER).	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"0602177750","nombre":"NOBOA VI\\u00d1AN JORKY MARCELO"}]	\N	CHIMBORAZO / RIOBAMBA / RIOBAMBA / LAVALLE Y PRIMERA CONSTITUYENTE	\N	\N	[{"establishment_number":"001","commercial_name":null,"establishment_type":"MAT","complete_address":"CHIMBORAZO \\/ RIOBAMBA \\/ RIOBAMBA \\/ LAVALLE Y PRIMERA CONSTITUYENTE","establishment_status":"ABIERTO","is_headquarters":true,"province":"CHIMBORAZO","canton":"RIOBAMBA","parish":"RIOBAMBA"}]	\N	\N	2025-07-31 19:38:29	2025-07-31 19:38:29
0891793540001	001 RCBM ACMB IT EC B001D1 S.A.S. B.I.C.	001 RCBM ACMB IT EC B001D1 S.A.S. B.I.C.	\N	\N	SOCIEDAD	\N	\N	GENERAL	CONSTRUCCIÓN DE TODO TIPO DE EDIFICIOS RESIDENCIALES: CASAS FAMILIARES INDIVIDUALES, EDIFICIOS MULTIFAMILIARES, INCLUSO EDIFICIOS DE ALTURAS ELEVADAS, VIVIENDAS PARA ANCIANATOS, CASAS PARA BENEFICENCIA, ORFANATOS, CÁRCELES, CUARTELES, CONVENTOS, CASAS RELIGIOSAS. INCLUYE REMODELACIÓN, RENOVACIÓN O REHABILITACIÓN DE ESTRUCTURAS EXISTENTES.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"1205862269","nombre":"BRICE\\u00d1O MORA ROBERTO CARLOS"}]	\N	ESMERALDAS / ESMERALDAS / ESMERALDAS / AV. SIMON BOLIVAR Y AV. PEDRO VICENTE MALDONADO	\N	\N	[{"establishment_number":"001","commercial_name":"ANONYM0US1 NDRGT01BTC B001","establishment_type":"MAT","complete_address":"ESMERALDAS \\/ ESMERALDAS \\/ ESMERALDAS \\/ AV. SIMON BOLIVAR Y AV. PEDRO VICENTE MALDONADO","establishment_status":"ABIERTO","is_headquarters":true,"province":"ESMERALDAS","canton":"ESMERALDAS","parish":"ESMERALDAS"}]	\N	\N	2025-08-01 04:33:08	2025-08-01 04:33:08
0993396452001	001 RCBM ACMB IT EC A001A1 S.A.S. B.I.C.	001 RCBM ACMB IT EC A001A1 S.A.S. B.I.C.	\N	\N	SOCIEDAD	\N	\N	GENERAL	SUPERVISIÓN Y GESTIÓN DE OTRAS UNIDADES DE LA MISMA COMPAÑÍA O EMPRESA, ASUMIENDO LA PLANIFICACIÓN ESTRATÉGICA, ORGANIZATIVA Y LA FUNCIÓN DE TOMA DE DECISIONES DE LA COMPAÑÍA O EMPRESA; EJERCIENDO EL CONTROL OPERATIVO Y LA GESTIÓN DE LAS OPERACIONES CORRIENTES DE LAS OTRAS UNIDADES: OFICINAS PRINCIPALES, OFICINAS ADMINISTRATIVAS CENTRALIZADAS, SEDES, OFICINAS DE DISTRITO, REGIONALES Y OFICINAS SUBSIDIARIAS DE GESTIÓN.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"1205862269","nombre":"BRICE\\u00d1O MORA ROBERTO CARLOS"}]	\N	GUAYAS / GUAYAQUIL / GUAYAQUIL / AV. FRANCISCO DE ORELLANA Y AV. JUSTINO CORNEJO	\N	\N	[{"establishment_number":"001","commercial_name":"ANONYM0US1 NDRGT01BTC A001","establishment_type":"MAT","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ GUAYAQUIL \\/ AV. FRANCISCO DE ORELLANA Y AV. JUSTINO CORNEJO","establishment_status":"ABIERTO","is_headquarters":true,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"GUAYAQUIL"}]	\N	\N	2025-08-01 04:36:31	2025-08-01 04:36:31
1091798873001	019 RCBM ACMB IT EC B019F6 S.A.S. B.I.C.	019 RCBM ACMB IT EC B019F6 S.A.S. B.I.C.	\N	\N	SOCIEDAD	\N	\N	RIMPE	ELABORACIÓN DE ALIMENTOS COMPUESTOS (MEZCLA) PRINCIPALMENTE DE FRUTAS LEGUMBRES U HORTALIZAS, EXCEPTO PLATOS PREPARADOS EN FORMA CONGELADA O ENLATADA LISTOS PARA CONSUMIR.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"1205862269","nombre":"BRICE\\u00d1O MORA ROBERTO CARLOS"}]	\N	IMBABURA / IBARRA / IBARRA / AV. JOSE TOBAR Y AV. GABRIELA MISTRAL	\N	\N	[{"establishment_number":"001","commercial_name":"ANONYM0US1 NDRGT01BTC B018","establishment_type":"MAT","complete_address":"IMBABURA \\/ IBARRA \\/ IBARRA \\/ AV. JOSE TOBAR Y AV. GABRIELA MISTRAL","establishment_status":"ABIERTO","is_headquarters":true,"province":"IMBABURA","canton":"IBARRA","parish":"IBARRA"}]	\N	\N	2025-08-01 04:37:54	2025-08-01 04:37:54
0992144998001	09 - CELULARES GAMVAL S.A. EN LIQUIDACION	09 - CELULARES GAMVAL S.A. EN LIQUIDACION	\N	\N	SOCIEDAD	\N	\N	GENERAL	VENTA AL POR MAYOR DE TELÉFONOS Y EQUIPOS DE COMUNICACIÓN.	\N	\N	\N	\N	NO	NO	NO	NO	NO	[{"identificacion":"0903352904","nombre":"GAMBOA ECHEVERRIA ARTURO RICARDO"}]	EXTINCION	GUAYAS / GUAYAQUIL / CARBO (CONCEPCION) / LORENZO DE GARAYCOA 732 Y VICTOR MANUEL RENDON	\N	\N	[{"establishment_number":"001","commercial_name":"09 - CELULARES","establishment_type":"MAT","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ CARBO (CONCEPCION) \\/ LORENZO DE GARAYCOA 732 Y VICTOR MANUEL RENDON","establishment_status":"CERRADO","is_headquarters":true,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"CARBO (CONCEPCION)"},{"establishment_number":"002","commercial_name":"09 - CELULARES","establishment_type":"OFI","complete_address":"EL ORO \\/ MACHALA \\/ MACHALA \\/ AYACUCHO 1517 Y AV. 25 DE JUNIO Y SUCRE","establishment_status":"CERRADO","is_headquarters":false,"province":"EL ORO","canton":"MACHALA","parish":"MACHALA"},{"establishment_number":"003","commercial_name":"09 - CELULARES","establishment_type":"OFI","complete_address":"AZUAY \\/ CUENCA \\/ CUENCA \\/ HUAYNACAPAC 04-13","establishment_status":"CERRADO","is_headquarters":false,"province":"AZUAY","canton":"CUENCA","parish":"CUENCA"},{"establishment_number":"004","commercial_name":"09 - CELULARES","establishment_type":"OFI","complete_address":"LOJA \\/ LOJA \\/ LOJA \\/ IBEROAMERICA 11-41 Y MERCADILLO","establishment_status":"CERRADO","is_headquarters":false,"province":"LOJA","canton":"LOJA","parish":"LOJA"},{"establishment_number":"005","commercial_name":"09 - CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ TARQUI \\/  S\\/N","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"TARQUI"},{"establishment_number":"006","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ MILAGRO \\/ MILAGRO \\/ AV. LOS CHIRIJOS S\\/N Y MANABI Y COSTA RICA","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"MILAGRO","parish":"MILAGRO"},{"establishment_number":"007","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ TARQUI \\/ AV. PRINCIPAL SOLAR 8","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"TARQUI"},{"establishment_number":"008","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ TARQUI \\/  SOLAR 1-A","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"TARQUI"},{"establishment_number":"009","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ TARQUI \\/ AV. JUAN PABLO SEGUNDO SOLAR 24","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"TARQUI"},{"establishment_number":"010","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ XIMENA \\/  SOLAR 3","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"XIMENA"},{"establishment_number":"011","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ FEBRES CORDERO \\/ 29 AVA. 1401 Y PORTETE Y VENEZUELA","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"FEBRES CORDERO"},{"establishment_number":"012","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ TARQUI \\/  SOLAR 6","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"TARQUI"},{"establishment_number":"013","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"EL ORO \\/ MACHALA \\/ EL CAMBIO \\/ AV. VEINTEDE AGOSTO S\\/N Y AV. PRINCIPAL FERROVIARIA","establishment_status":"CERRADO","is_headquarters":false,"province":"EL ORO","canton":"MACHALA","parish":"EL CAMBIO"},{"establishment_number":"014","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ TARQUI \\/ AV. PRINCIPAL S\\/N","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"TARQUI"},{"establishment_number":"015","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ TARQUI \\/ AV. NICASIO SAFADI SOLAR 1 Y ROBERTO GILBERT","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"TARQUI"},{"establishment_number":"016","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ BALZAR \\/ BALZAR \\/ AV. JUAN MONTALVO SOLAR 16 Y JUAN FALQUEZ","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"BALZAR","parish":"BALZAR"},{"establishment_number":"017","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ CARBO (CONCEPCION) \\/ VICTOR MANUEL RENDON 920 Y RUMICHACA - LORENZO GARAICOA","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"CARBO (CONCEPCION)"},{"establishment_number":"018","commercial_name":"09-CELULARES","establishment_type":"OFI","complete_address":"GUAYAS \\/ DURAN \\/ ELOY ALFARO (DURAN) \\/  S\\/N","establishment_status":"CERRADO","is_headquarters":false,"province":"GUAYAS","canton":"DURAN","parish":"ELOY ALFARO (DURAN)"},{"establishment_number":"019","commercial_name":"09 - CELULARES","establishment_type":"OFI","complete_address":"AZUAY \\/ CUENCA \\/ SAN BLAS \\/ SIMON BOLIVAR 6 - 56 Y PRESIDENTE ANTONIO BORRERO","establishment_status":"CERRADO","is_headquarters":false,"province":"AZUAY","canton":"CUENCA","parish":"SAN BLAS"}]	\N	\N	2025-08-01 04:39:23	2025-08-01 04:39:23
0990440042001	AGRICOLA LOLANDIA S.A.	AGRICOLA LOLANDIA S.A.	\N	\N	SOCIEDAD	\N	\N	GENERAL	CULTIVO DE CAÑA DE AZÚCAR.	\N	\N	\N	\N	SI	SI	NO	NO	NO	[{"identificacion":"0905408647","nombre":"OLSEN PONS CHRISTIAN ANTONIO"}]	\N	GUAYAS / GUAYAQUIL / TARQUI / AV BENJAMIN CARRION N/A Y DR EMILIO ROMERO	\N	\N	[{"establishment_number":"001","commercial_name":"AGRICOLA LOLANDIA SA","establishment_type":"MAT","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ TARQUI \\/ AV BENJAMIN CARRION N\\/A Y DR EMILIO ROMERO","establishment_status":"ABIERTO","is_headquarters":true,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"TARQUI"}]	\N	\N	2025-08-01 04:41:32	2025-08-01 04:41:32
0993268003001	AGBRAND S.A.	AGBRAND S.A.	\N	\N	SOCIEDAD	\N	\N	GENERAL	RECEPCIÓN DE REGALÍAS O DERECHOS DE LICENCIA POR LA UTILIZACIÓN DE: FRANQUICIAS, ENTIDADES PATENTADAS, MARCAS DE FÁBRICA O DE COMERCIO O MARCAS DE SERVICIOS Y NOMBRES COMERCIALES.	\N	\N	\N	\N	NO	NO	NO	NO	NO	[{"identificacion":"1712816931","nombre":"GOMEZ DE LA TORRE ITURRALDE PABLO JOSE"}]	EXTINCION	GUAYAS / SAMBORONDON / LA PUNTILLA (SATELITE) /  SN	\N	\N	[{"establishment_number":"001","commercial_name":null,"establishment_type":"MAT","complete_address":"GUAYAS \\/ SAMBORONDON \\/ LA PUNTILLA (SATELITE) \\/  SN","establishment_status":"CERRADO","is_headquarters":true,"province":"GUAYAS","canton":"SAMBORONDON","parish":"LA PUNTILLA (SATELITE)"}]	\N	\N	2025-08-01 04:48:14	2025-08-01 04:48:14
0992954876001	2BAG S.A.	2BAG S.A.	\N	\N	SOCIEDAD	\N	\N	RIMPE	VENTA AL POR MAYOR DE OTROS PRODUCTOS DIVERSOS PARA EL CONSUMIDOR.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"0919861211","nombre":"MENDOZA BULGARIN FAUSTO LEONEL"}]	DEPURACION	GUAYAS / GUAYAQUIL / TARQUI / AV. MIGUEL H. ALCIVAR S/N Y NAHIM ISAIAS BARQUET	\N	\N	[{"establishment_number":"001","commercial_name":null,"establishment_type":"MAT","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ TARQUI \\/ AV. MIGUEL H. ALCIVAR S\\/N Y NAHIM ISAIAS BARQUET","establishment_status":"CERRADO","is_headquarters":true,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"TARQUI"}]	\N	\N	2025-08-01 04:54:05	2025-08-01 04:54:05
0992154047001	ABALOS S.A.	ABALOS S.A.	\N	\N	SOCIEDAD	\N	\N	GENERAL	SIN ACTIVIDAD ECONOMICA - CIIU	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"1202790018","nombre":"PEREZ ORTEGA EUGENIA MARISOL"}]	EXTINCION	GUAYAS / GUAYAQUIL / GUAYAQUIL / 6 DE MARZO 1212 Y COLON	\N	\N	[{"establishment_number":"001","commercial_name":null,"establishment_type":"MAT","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ GUAYAQUIL \\/ 6 DE MARZO 1212 Y COLON","establishment_status":"CERRADO","is_headquarters":true,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"GUAYAQUIL"}]	\N	\N	2025-08-01 04:56:35	2025-08-01 04:56:35
0992567368001	ADMILEGAL S.A.	ADMILEGAL S.A.	\N	\N	SOCIEDAD	\N	\N	GENERAL	SERVICIOS DE  ASESORAMIENTO, ORIENTACIÓN Y ASISTENCIA OPERATIVA A LAS EMPRESAS Y A LA ADMINISTRACIÓN PÚBLICA EN MATERIA DE: DISEÑO DE MÉTODOS O PROCEDIMIENTOS CONTABLES, PROGRAMAS DE CONTABILIDAD DE COSTOS Y PROCEDIMIENTOS DE CONTROL PRESUPUESTARIO.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"0901243980","nombre":"ILLINGWORTH ASHTON PRISCILLA MARIA"}]	\N	GUAYAS / GUAYAQUIL / TARQUI / AV. FRANCISCO ORELLANA S/N Y MIGUEL H. ALCIVAR	\N	\N	[{"establishment_number":"001","commercial_name":null,"establishment_type":"MAT","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ TARQUI \\/ AV. FRANCISCO ORELLANA S\\/N Y MIGUEL H. ALCIVAR","establishment_status":"ABIERTO","is_headquarters":true,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"TARQUI"}]	\N	\N	2025-08-02 05:00:43	2025-08-02 05:00:43
1792512654001	ABSOLEM S.A.	ABSOLEM S.A.	\N	\N	SOCIEDAD	\N	\N	GENERAL	ACTIVIDADES DE CONSULTORÍA DE SEGURIDAD.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"1713326294","nombre":"NARVAEZ GAYBOR RAUL ANDRES"}]	\N	PICHINCHA / QUITO / CONOCOTO / SEBASTIAN DE BENALCAZAR S/N Y BARTOLOME RUIZ	\N	\N	[{"establishment_number":"001","commercial_name":"ABSOLEM S.A.","establishment_type":"MAT","complete_address":"PICHINCHA \\/ QUITO \\/ CONOCOTO \\/ SEBASTIAN DE BENALCAZAR S\\/N Y BARTOLOME RUIZ","establishment_status":"ABIERTO","is_headquarters":true,"province":"PICHINCHA","canton":"QUITO","parish":"CONOCOTO"},{"establishment_number":"002","commercial_name":"CEN CENTRO DE ENTRENAMIENTO DE NEGOCIOS","establishment_type":"OFI","complete_address":"PICHINCHA \\/ QUITO \\/ CONOCOTO \\/ SEBASTIAN DE BENALCAZAR S\\/N Y BARTOLOME RUIZ","establishment_status":"ABIERTO","is_headquarters":false,"province":"PICHINCHA","canton":"QUITO","parish":"CONOCOTO"},{"establishment_number":"003","commercial_name":"YOU! MAKE-UP & COSMETICS","establishment_type":"OFI","complete_address":"PICHINCHA \\/ QUITO \\/ CONOCOTO \\/ SEBASTIAN DE BENALCAZAR SN Y TERESA DE CEPEDA","establishment_status":"ABIERTO","is_headquarters":false,"province":"PICHINCHA","canton":"QUITO","parish":"CONOCOTO"}]	\N	\N	2025-08-02 03:03:20	2025-08-02 03:03:20
2293530729001	GENESIS CORPORATION IND JANIMAN GMBH S.A.S.	GENESIS CORPORATION IND JANIMAN GMBH S.A.S.	\N	\N	SOCIEDAD	\N	\N	RIMPE	VENTA AL POR MAYOR DE PRODUCTOS FARMACÉUTICOS.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"2100683115","nombre":"CHICAIZA GUZMAN YESSENIA PRESLEYRY"}]	\N	ORELLANA / LA JOYA DE LOS SACHAS / LA JOYA DE LOS SACHAS / FUNDADORES N1-57 Y DE FEBRERO	\N	\N	[{"establishment_number":"001","commercial_name":null,"establishment_type":"MAT","complete_address":"ORELLANA \\/ LA JOYA DE LOS SACHAS \\/ LA JOYA DE LOS SACHAS \\/ FUNDADORES N1-57 Y DE FEBRERO","establishment_status":"ABIERTO","is_headquarters":true,"province":"ORELLANA","canton":"LA JOYA DE LOS SACHAS","parish":"LA JOYA DE LOS SACHAS"}]	\N	\N	2025-08-02 03:28:34	2025-08-02 03:28:34
1791767357001	GENESIS COMMUNICATION LATINOAMERICANA GECOLA S.A.	GENESIS COMMUNICATION LATINOAMERICANA GECOLA S.A.	\N	\N	SOCIEDAD	\N	\N	GENERAL	ACTIVIDADES DE CREACIÓN DEL PROGRAMA COMPLETO DE UNA CADENA DE TELEVISIÓN PARA UN CANAL, DESDE LA COMPRA DE LOS COMPONENTES DEL PROGRAMA (PELÍCULAS, DOCUMENTALES, ETCÉTERA.) HASTA LA PRODUCCIÓN PROPIA DE LOS COMPONENTES DEL PROGRAMA AUTO PRODUCIDOS (NOTICIAS LOCALES, REPORTAJES EN VIVO) O UNA COMBINACIÓN DE LAS DOS OPCIONES. EL PROGRAMA COMPLETO DE TELEVISIÓN PUEDE SER EMITIDO POR LAS UNIDADES DE PRODUCCIÓN O BIEN PRODUCIRSE PARA SU TRANSMISIÓN POR TERCEROS DISTRIBUIDORES, COMO COMPAÑÍAS DE EMISIÓN POR CABLE O PROVEEDORES DE TELEVISIÓN POR SATÉLITE, INCLUYE LA PROGRAMACIÓN DE CANALES DE VIDEO A LA CARTA.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"1700206186","nombre":"FLORES BERMEO NESTOR OSWALDO"}]	EXTINCION	PICHINCHA / QUITO / QUITO DISTRITO METROPOLITANO / AV. BRASIL 941 Y MARIANO ECHEVERRIA	\N	\N	[{"establishment_number":"001","commercial_name":null,"establishment_type":"MAT","complete_address":"PICHINCHA \\/ QUITO \\/ QUITO DISTRITO METROPOLITANO \\/ AV. BRASIL 941 Y MARIANO ECHEVERRIA","establishment_status":"CERRADO","is_headquarters":true,"province":"PICHINCHA","canton":"QUITO","parish":"QUITO DISTRITO METROPOLITANO"}]	\N	\N	2025-08-02 03:31:32	2025-08-02 03:31:32
0195120102001	GENESIS DO&DL S.A.S.	GENESIS DO&DL S.A.S.	\N	\N	SOCIEDAD	\N	\N	RIMPE	SERVICIOS DE TASACIÓN INMOBILIARIA.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"0152390621","nombre":"ONUFFER DALE RICHARD"}]	\N	AZUAY / CUENCA / SAN SEBASTIAN / VICTOR MANUEL ALBORNOZ S/N Y DANIEL MUÑOZ	\N	\N	[{"establishment_number":"001","commercial_name":null,"establishment_type":"MAT","complete_address":"AZUAY \\/ CUENCA \\/ SAN SEBASTIAN \\/ VICTOR MANUEL ALBORNOZ S\\/N Y DANIEL MU\\u00d1OZ","establishment_status":"ABIERTO","is_headquarters":true,"province":"AZUAY","canton":"CUENCA","parish":"SAN SEBASTIAN"}]	\N	\N	2025-08-02 03:41:18	2025-08-02 03:41:18
0992219408001	ABOLINE S.A.	ABOLINE S.A.	\N	\N	SOCIEDAD	\N	\N	GENERAL	FABRICACIÓN DE PRODUCTOS QUÍMICOS INORGÁNICOS BÁSICOS N.C.P.	\N	\N	\N	\N	SI	SI	NO	NO	NO	[{"identificacion":"0925460933","nombre":"SOTOMAYOR SOTOMAYOR JONATHAN ISMAEL"}]	\N	GUAYAS / GUAYAQUIL / TARQUI / 6 PJE 38 D NO SL 1B Y 2 CJ 18I NO	\N	\N	[{"establishment_number":"001","commercial_name":"ABOLINE S.A.","establishment_type":"MAT","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ TARQUI \\/ 6 PJE 38 D NO SL 1B Y 2 CJ 18I NO","establishment_status":"ABIERTO","is_headquarters":true,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"TARQUI"}]	\N	\N	2025-08-02 03:50:58	2025-08-02 03:50:58
1792162726001	AKDEMOS S.A.	AKDEMOS S.A.	\N	\N	SOCIEDAD	\N	\N	GENERAL	OTROS TIPOS DE ENSEÑANZA N.C.P.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"1717721540","nombre":"CHANABA ORTEGA DAVID ARMANDO"}]	\N	PICHINCHA / QUITO / SAN JUAN / ULPIANO PAEZ N19-26 Y PATRIA	\N	\N	[{"establishment_number":"001","commercial_name":"AKDEMOS","establishment_type":"MAT","complete_address":"PICHINCHA \\/ QUITO \\/ SAN JUAN \\/ ULPIANO PAEZ N19-26 Y PATRIA","establishment_status":"ABIERTO","is_headquarters":true,"province":"PICHINCHA","canton":"QUITO","parish":"SAN JUAN"}]	\N	\N	2025-08-02 04:33:23	2025-08-02 04:33:23
1793021158001	24KAPITAL SA	24KAPITAL SA	\N	\N	SOCIEDAD	\N	\N	GENERAL	ACTIVIDADES DE PERSONAS, EMPRESAS Y OTRAS ENTIDADES QUE GESTIONAN CARTERAS Y FONDOS A CAMBIO DE UNA RETRIBUCIÓN O POR CONTRATO. SE INCLUYEN LAS SIGUIENTES ACTIVIDADES: GESTIÓN DE FONDOS DE PENSIONES, GESTIÓN DE FONDOS MUTUOS DE INVERSIÓN Y GESTIÓN DE OTROS FONDOS DE INVERSIÓN.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"1758856304","nombre":"PINTO OMA\\u00d1A FELIX EDUARDO"}]	\N	PICHINCHA / QUITO / IÑAQUITO / ABRAHAM LINCOLN E 11B Y 12 DE OCTUBRE	\N	\N	[{"establishment_number":"001","commercial_name":"24KAPITAL","establishment_type":"MAT","complete_address":"PICHINCHA \\/ QUITO \\/ I\\u00d1AQUITO \\/ ABRAHAM LINCOLN E 11B Y 12 DE OCTUBRE","establishment_status":"ABIERTO","is_headquarters":true,"province":"PICHINCHA","canton":"QUITO","parish":"I\\u00d1AQUITO"}]	\N	\N	2025-08-02 04:36:09	2025-08-02 04:36:09
0992355794001	ACIMALL S.A.	ACIMALL S.A.	\N	\N	SOCIEDAD	\N	\N	GENERAL	FABRICACIÓN DE OTROS PRODUCTOS QUÍMICOS DE USO AGROPECUARIO N.C.P.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"0916590748","nombre":"GARCIA EUGENIO JAZMIN MARIBEL"}]	DEPURACION	GUAYAS / GUAYAQUIL / ROCAFUERTE / AGUIRRE 324 Y CHILE	\N	\N	[{"establishment_number":"001","commercial_name":"ACIMALL S.A.","establishment_type":"MAT","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ ROCAFUERTE \\/ AGUIRRE 324 Y CHILE","establishment_status":"CERRADO","is_headquarters":true,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"ROCAFUERTE"}]	\N	\N	2025-08-02 04:44:31	2025-08-02 04:44:31
0992567880001	3FASICO S.A.	3FASICO S.A.	\N	\N	SOCIEDAD	\N	\N	GENERAL	ACTIVIDADES DE SERVICIOS DIVERSOS.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"0914020656","nombre":"SANTAMARIA SALAZAR RAUL ERNESTO"}]	\N	SANTA ELENA / SANTA ELENA / SANTA ELENA / 1 S/N Y ANCON	\N	\N	[{"establishment_number":"001","commercial_name":"3FASICO S.A.","establishment_type":"MAT","complete_address":"SANTA ELENA \\/ SANTA ELENA \\/ SANTA ELENA \\/ 1 S\\/N Y ANCON","establishment_status":"ABIERTO","is_headquarters":true,"province":"SANTA ELENA","canton":"SANTA ELENA","parish":"SANTA ELENA"}]	\N	\N	2025-08-02 04:47:38	2025-08-02 04:47:38
0991004696001	ACAICOPOLIS S.A.	ACAICOPOLIS S.A.	\N	\N	SOCIEDAD	\N	\N	GENERAL	COMPRA - VENTA, ALQUILER Y EXPLOTACIÓN DE BIENES INMUEBLES PROPIOS O ARRENDADOS, COMO: EDIFICIOS DE APARTAMENTOS Y VIVIENDAS; EDIFICIOS NO RESIDENCIALES, INCLUSO SALAS DE EXPOSICIONES; INSTALACIONES PARA ALMACENAJE, CENTROS COMERCIALES Y TERRENOS; INCLUYE EL ALQUILER DE CASAS Y APARTAMENTOS AMUEBLADOS O SIN AMUEBLAR POR PERÍODOS LARGOS, EN GENERAL POR MESES O POR AÑOS.	\N	\N	\N	\N	SI	NO	NO	NO	NO	[{"identificacion":"0903366714","nombre":"RAMIREZ RAMIREZ HILDA"}]	EXTINCION	GUAYAS / GUAYAQUIL / ROCA / VICTOR MANUEL RENDON 911	\N	\N	[{"establishment_number":"001","commercial_name":null,"establishment_type":"MAT","complete_address":"GUAYAS \\/ GUAYAQUIL \\/ ROCA \\/ VICTOR MANUEL RENDON 911","establishment_status":"CERRADO","is_headquarters":true,"province":"GUAYAS","canton":"GUAYAQUIL","parish":"ROCA"}]	\N	\N	2025-08-02 05:09:49	2025-08-02 05:09:49
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, slug, stripe_plan_id, price, billing_period, invoice_limit, features, is_active, is_featured, created_at, updated_at) FROM stdin;
1	Plan Gratuito	free	\N	0.00	monthly	100	["Hasta 100 facturas mensuales","Validaci\\u00f3n de documentos","Soporte por correo","API b\\u00e1sica","1 usuario"]	t	f	2025-07-07 03:34:26	2025-07-07 03:34:26
2	Plan Profesional	professional	\N	199.00	monthly	500	["Hasta 500 facturas mensuales","Validaci\\u00f3n de documentos ilimitada","Soporte prioritario","API completa","Hasta 5 usuarios","Reportes avanzados"]	t	t	2025-07-07 03:34:26	2025-07-07 03:34:26
3	Plan Empresarial	enterprise	\N	399.00	monthly	0	["Facturas ilimitadas","Validaci\\u00f3n de documentos ilimitada","Soporte 24\\/7","API completa con mayor capacidad","Usuarios ilimitados","Reportes personalizados","Integraci\\u00f3n con ERP"]	t	f	2025-07-07 03:34:26	2025-07-07 03:34:26
4	Plan Básico	basic	\N	29.99	monthly	200	["Facturaci\\u00f3n electr\\u00f3nica","Hasta 200 documentos mensuales","Soporte por email","1 usuario"]	t	f	2025-07-07 03:35:42	2025-07-07 03:35:42
5	Plan Estándar	standard	\N	59.99	monthly	500	["Facturaci\\u00f3n electr\\u00f3nica","Hasta 500 documentos mensuales","Soporte prioritario","3 usuarios","Reportes avanzados"]	t	t	2025-07-07 03:35:42	2025-07-07 03:35:42
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, tenant_id, name, stripe_id, stripe_status, stripe_price, plan_type, quantity, trial_ends_at, ends_at, created_at, updated_at, status, subscription_plan_id) FROM stdin;
1	consultoria-peru	Plan Gratuito	\N	\N	\N	monthly	1	2025-07-07 03:34:26	2025-08-07 03:34:26	2025-07-07 03:34:26	2025-07-07 03:34:26	active	1
2	innovacion-digital	Plan Gratuito	\N	\N	\N	basic	1	2025-10-17 00:00:00	2025-12-05 00:00:00	2025-07-22 19:04:23	2025-07-22 19:04:23	active	1
4	montesdeoca-ordonez-jose-israel	Plan Gratuito	\N	\N	\N	basic	1	2025-07-28 00:00:00	\N	2025-07-24 04:02:37	2025-07-24 04:02:37	active	1
5	aa-asociados-krm-cia-ltda	Plan Gratuito	\N	\N	\N	basic	1	2025-07-28 00:00:00	2025-07-28 00:00:00	2025-07-24 04:05:05	2025-07-24 04:05:05	active	1
6	aaa-adventuregalapagos-islands-sas	Plan Gratuito	\N	\N	\N	basic	1	2025-07-28 04:13:01	2025-07-28 04:13:01	2025-07-24 04:13:03	2025-07-24 04:13:03	active	1
7	empresa-demo	Plan Gratuito	\N	\N	\N	basic	1	2025-07-24 00:00:00	2025-08-07 00:00:00	2025-07-24 06:19:55	2025-07-24 06:19:55	active	1
8	iscarsa-group-sas	Plan Gratuito	\N	\N	\N	basic	1	\N	2025-08-09 00:00:00	2025-07-26 19:01:49	2025-07-28 14:53:18	active	1
9	absolemsa	Plan Gratuito	\N	\N	\N	basic	1	\N	2025-09-01 00:00:00	2025-08-02 03:05:43	2025-08-02 03:11:36	active	1
10	genesiscorporationindjanimangmbhsas	Plan Gratuito	\N	\N	\N	basic	1	\N	2025-09-02 00:00:00	2025-08-02 03:30:32	2025-08-02 03:30:32	active	1
12	abolinesa	Plan Gratuito	\N	\N	\N	basic	1	\N	2025-09-02 03:51:14	2025-08-02 03:51:16	2025-08-02 03:51:16	active	1
13	akdemossa	Plan Gratuito	\N	\N	\N	basic	1	\N	2025-09-02 04:33:45	2025-08-02 04:33:46	2025-08-02 04:33:46	active	1
16	3fasico-sa	Plan Gratuito	\N	\N	\N	basic	1	2025-08-06 04:47:45	2025-08-06 04:47:45	2025-08-02 04:47:48	2025-08-02 04:47:48	active	1
17	admilegalsa	Plan Gratuito	\N	\N	\N	basic	1	2025-08-07 23:59:59	2025-09-06 23:59:59	2025-08-02 05:01:52	2025-08-02 05:01:52	active	1
18	acaicopolissa	Plan Gratuito	\N	\N	\N	basic	1	2025-08-07 23:59:59	2025-09-06 23:59:59	2025-08-02 05:10:41	2025-08-02 05:10:41	active	1
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, data, subscription_plan_id, trial_ends_at, is_active, subscription_active, subscription_ends_at, billing_period, created_at, updated_at) FROM stdin;
tech-solutions	{"updated_at":"2025-07-07 03:34:26","created_at":"2025-07-07 03:34:26","subscription_plan_id":2,"is_active":true,"subscription_active":true,"trial_ends_at":null,"subscription_ends_at":"2025-08-07 03:34:26","billing_period":"monthly","tenancy_db_name":"tenanttech-solutions"}	\N	\N	t	f	\N	monthly	2025-07-07 03:34:26	2025-07-07 03:34:26
aaa-adventuregalapagos-islands-sas	{"updated_at":"2025-07-24 04:13:01","created_at":"2025-07-24 04:13:01","subscription_plan_id":1,"subscription_ends_at":"2025-07-28 04:13:01","trial_ends_at":"2025-07-28 04:13:01","is_active":true,"subscription_active":true,"tenancy_db_name":"tenantaaa-adventuregalapagos-islands-sas"}	\N	\N	t	f	\N	monthly	2025-07-24 04:13:01	2025-07-24 04:13:01
servicios-contables	{"updated_at":"2025-07-07 03:34:27","created_at":"2025-07-07 03:34:27","subscription_plan_id":1,"is_active":false,"subscription_active":false,"trial_ends_at":"2025-07-02 03:34:26","subscription_ends_at":null,"billing_period":"monthly","tenancy_db_name":"tenantservicios-contables"}	\N	\N	t	f	\N	monthly	2025-07-07 03:34:27	2025-07-07 03:34:27
consultoria-peru	{"updated_at":"2025-07-07 03:34:26","created_at":"2025-07-07 03:34:26","subscription_plan_id":2,"is_active":true,"subscription_active":true,"trial_ends_at":null,"subscription_ends_at":"2025-08-07 03:34:26","billing_period":"monthly","tenancy_db_name":"tenantconsultoria-peru"}	\N	\N	t	t	\N	monthly	2025-07-07 03:34:27	2025-07-07 03:34:27
innovacion-digital	{"subscription_plan_id":1,"trial_ends_at":"2025-10-17 00:00:00","is_active":true,"subscription_active":true,"subscription_ends_at":"2025-12-05 00:00:00","billing_period":"yearly","created_at":"2025-07-07 03:34:27","updated_at":"2025-07-07 03:34:27","tenancy_db_name":"tenantinnovacion-digital"}	\N	\N	t	f	\N	monthly	2025-07-07 03:34:27	2025-07-22 19:04:23
empresa-demo	{"subscription_plan_id":1,"trial_ends_at":"2025-07-24 00:00:00","is_active":true,"subscription_active":true,"subscription_ends_at":"2025-08-07 00:00:00","billing_period":"monthly","created_at":"2025-07-07 03:34:26","updated_at":"2025-07-07 03:34:26","tenancy_db_name":"tenantempresa-demo"}	\N	\N	t	f	\N	monthly	2025-07-07 03:34:26	2025-07-24 06:19:55
velez-pena-allan-stuart	{"updated_at":"2025-07-23 22:30:52","created_at":"2025-07-23 22:30:52","subscription_plan_id":null,"trial_ends_at":"2025-07-27 22:30:52","is_active":true,"subscription_active":true,"tenancy_db_name":"tenantvelez-pena-allan-stuart"}	\N	\N	t	f	\N	monthly	2025-07-23 22:30:52	2025-07-23 22:30:52
montesdeoca-ordonez-esthella-de-las-mercedes	{"updated_at":"2025-07-24 03:14:04","created_at":"2025-07-24 03:14:04","subscription_plan_id":null,"trial_ends_at":"2025-07-28 03:14:04","is_active":true,"subscription_active":true,"tenancy_db_name":"tenantmontesdeoca-ordonez-esthella-de-las-mercedes"}	\N	\N	t	f	\N	monthly	2025-07-24 03:14:04	2025-07-24 03:14:04
0papeleoecuadorcialtdabic	{"updated_at":"2025-08-01 01:20:02","created_at":"2025-08-01 01:20:02","billing_period":"monthly","tenancy_db_name":"tenant0papeleoecuadorcialtdabic","subscription_active":true,"trial_ends_at":"2025-08-31 01:20:04"}	\N	\N	t	f	\N	monthly	2025-08-01 01:20:02	2025-08-01 01:20:04
iscarsa-group-sas	{"subscription_plan_id":1,"trial_ends_at":null,"is_active":true,"subscription_active":true,"subscription_ends_at":"2025-08-09 00:00:00","billing_period":"monthly","created_at":"2025-07-24 03:44:30","updated_at":"2025-07-24 03:44:30","tenancy_db_name":"tenantiscarsa-group-sas"}	\N	\N	t	f	\N	monthly	2025-07-24 03:44:30	2025-07-28 14:53:18
montesdeoca-ordonez-jose-israel	{"subscription_plan_id":1,"trial_ends_at":"2025-07-28 00:00:00","is_active":true,"subscription_active":true,"subscription_ends_at":null,"billing_period":"monthly","created_at":"2025-07-24 04:01:53","updated_at":"2025-07-24 04:01:53","tenancy_db_name":"tenantmontesdeoca-ordonez-jose-israel"}	\N	\N	t	f	\N	monthly	2025-07-24 04:01:53	2025-07-24 04:02:37
aa-asociados-krm-cia-ltda	{"subscription_plan_id":1,"trial_ends_at":"2025-07-28 00:00:00","is_active":true,"subscription_active":true,"subscription_ends_at":"2025-07-28 00:00:00","billing_period":"monthly","created_at":"2025-07-24 04:04:36","updated_at":"2025-07-24 04:04:36","tenancy_db_name":"tenantaa-asociados-krm-cia-ltda"}	\N	\N	t	f	\N	monthly	2025-07-24 04:04:36	2025-07-24 04:05:05
velezpenaallanstuart	{"updated_at":"2025-08-01 01:38:24","created_at":"2025-08-01 01:38:24","billing_period":"monthly","tenancy_db_name":"tenantvelezpenaallanstuart","subscription_active":true,"trial_ends_at":"2025-08-31 01:38:26"}	\N	\N	t	f	\N	monthly	2025-08-01 01:38:24	2025-08-01 01:38:26
agricolalolandiasa	{"updated_at":"2025-08-01 04:41:47","created_at":"2025-08-01 04:41:47","billing_period":"monthly","tenancy_db_name":"tenantagricolalolandiasa","subscription_active":true,"trial_ends_at":"2025-08-31 04:41:50"}	\N	\N	t	f	\N	monthly	2025-08-01 04:41:47	2025-08-01 04:41:50
montesdeocaordonezesthelladelasmercedes	{"updated_at":"2025-08-01 01:41:24","created_at":"2025-08-01 01:41:24","billing_period":"monthly","tenancy_db_name":"tenantmontesdeocaordonezesthelladelasmercedes","subscription_active":true,"trial_ends_at":"2025-08-31 01:41:26"}	\N	\N	t	f	\N	monthly	2025-08-01 01:41:24	2025-08-01 01:41:26
001rcbmacmbitecb001d1sasbic	{"updated_at":"2025-08-01 04:33:31","created_at":"2025-08-01 04:33:31","billing_period":"monthly","tenancy_db_name":"tenant001rcbmacmbitecb001d1sasbic","subscription_active":true,"trial_ends_at":"2025-08-31 04:33:33"}	\N	\N	t	f	\N	monthly	2025-08-01 04:33:31	2025-08-01 04:33:33
09-celularesgamvalsaenliquidacion	{"updated_at":"2025-08-01 04:39:45","created_at":"2025-08-01 04:39:45","billing_period":"monthly","tenancy_db_name":"tenant09-celularesgamvalsaenliquidacion","subscription_active":true,"trial_ends_at":"2025-08-31 04:39:47"}	\N	\N	t	f	\N	monthly	2025-08-01 04:39:45	2025-08-01 04:39:47
001rcbmacmbiteca001a1sasbic	{"updated_at":"2025-08-01 04:36:43","created_at":"2025-08-01 04:36:43","billing_period":"monthly","tenancy_db_name":"tenant001rcbmacmbiteca001a1sasbic","subscription_active":true,"trial_ends_at":"2025-08-31 04:36:46"}	\N	\N	t	f	\N	monthly	2025-08-01 04:36:43	2025-08-01 04:36:46
agbrandsa	{"updated_at":"2025-08-01 04:48:37","created_at":"2025-08-01 04:48:37","billing_period":"monthly","tenancy_db_name":"tenantagbrandsa","subscription_active":true,"trial_ends_at":"2025-08-31 04:48:39"}	\N	\N	t	f	\N	monthly	2025-08-01 04:48:37	2025-08-01 04:48:39
2bagsa	{"updated_at":"2025-08-01 04:54:50","created_at":"2025-08-01 04:54:50","billing_period":"monthly","tenancy_db_name":"tenant2bagsa","subscription_active":true,"trial_ends_at":"2025-08-31 04:54:52"}	\N	\N	t	f	\N	monthly	2025-08-01 04:54:50	2025-08-01 04:54:52
abalossa	{"updated_at":"2025-08-01 04:56:50","created_at":"2025-08-01 04:56:50","billing_period":"monthly","tenancy_db_name":"tenantabalossa","subscription_active":true,"trial_ends_at":"2025-08-31 04:56:52"}	\N	\N	t	f	\N	monthly	2025-08-01 04:56:50	2025-08-01 04:56:52
24kapital-sa	{"updated_at":"2025-08-02 04:43:57","created_at":"2025-08-02 04:43:57","subscription_plan_id":1,"subscription_ends_at":"2025-08-06 04:43:57","trial_ends_at":"2025-08-06 04:43:57","is_active":true,"subscription_active":true,"tenancy_db_name":"anahisoft_24kapital-sa"}	\N	\N	t	f	\N	monthly	2025-08-02 04:43:57	2025-08-02 04:43:57
absolemsa	{"subscription_plan_id":1,"trial_ends_at":null,"is_active":true,"subscription_active":true,"subscription_ends_at":"2025-09-01 00:00:00","billing_period":"monthly","created_at":"2025-08-02 03:03:39","updated_at":"2025-08-02 03:03:39","tenancy_db_name":"tenantabsolemsa"}	\N	\N	t	f	\N	monthly	2025-08-02 03:03:39	2025-08-02 03:11:36
genesiscorporationindjanimangmbhsas	{"subscription_plan_id":1,"trial_ends_at":null,"is_active":true,"subscription_active":true,"subscription_ends_at":"2025-09-02 00:00:00","billing_period":"monthly","created_at":"2025-08-02 03:28:53","updated_at":"2025-08-02 03:28:53","tenancy_db_name":"tenantgenesiscorporationindjanimangmbhsas"}	\N	\N	t	f	\N	monthly	2025-08-02 03:28:53	2025-08-02 03:30:32
genesiscommunicationlatinoamericanagecolasa	{"updated_at":"2025-08-02 03:31:49","created_at":"2025-08-02 03:31:49","subscription_plan_id":1,"billing_period":"monthly","subscription_active":true,"is_active":true,"trial_ends_at":null,"subscription_ends_at":"2025-09-02 03:31:49","tenancy_db_name":"anahisoft_genesiscommunicationlatinoamericanagecolasa"}	\N	\N	t	f	\N	monthly	2025-08-02 03:31:49	2025-08-02 03:31:49
abolinesa	{"updated_at":"2025-08-02 03:51:14","created_at":"2025-08-02 03:51:14","subscription_plan_id":1,"billing_period":"monthly","subscription_active":true,"is_active":true,"trial_ends_at":null,"subscription_ends_at":"2025-09-02 03:51:14","tenancy_db_name":"anahisoft_abolinesa"}	\N	\N	t	f	\N	monthly	2025-08-02 03:51:14	2025-08-02 03:51:14
akdemossa	{"updated_at":"2025-08-02 04:33:45","created_at":"2025-08-02 04:33:45","subscription_plan_id":1,"billing_period":"monthly","subscription_active":true,"is_active":true,"trial_ends_at":null,"subscription_ends_at":"2025-09-02 04:33:45","tenancy_db_name":"anahisoft_akdemossa"}	\N	\N	t	f	\N	monthly	2025-08-02 04:33:45	2025-08-02 04:33:45
3fasico-sa	{"updated_at":"2025-08-02 04:47:45","created_at":"2025-08-02 04:47:45","subscription_plan_id":1,"subscription_ends_at":"2025-08-06 04:47:45","trial_ends_at":"2025-08-06 04:47:45","is_active":true,"subscription_active":true,"tenancy_db_name":"anahisoft_3fasico-sa"}	\N	\N	t	f	\N	monthly	2025-08-02 04:47:45	2025-08-02 04:47:45
admilegalsa	{"updated_at":"2025-08-02 05:01:51","created_at":"2025-08-02 05:01:51","subscription_plan_id":1,"billing_period":"monthly","subscription_active":true,"is_active":true,"trial_ends_at":"2025-08-07 23:59:59","subscription_ends_at":"2025-09-06 23:59:59","tenancy_db_name":"anahisoft_admilegalsa"}	\N	\N	t	f	\N	monthly	2025-08-02 05:01:51	2025-08-02 05:01:51
acaicopolissa	{"updated_at":"2025-08-02 05:10:39","created_at":"2025-08-02 05:10:39","subscription_plan_id":1,"billing_period":"monthly","subscription_active":true,"is_active":true,"trial_ends_at":"2025-08-07 23:59:59","subscription_ends_at":"2025-09-06 23:59:59","tenancy_db_name":"anahisoft_acaicopolissa"}	\N	\N	t	f	\N	monthly	2025-08-02 05:10:39	2025-08-02 05:10:39
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.testimonials (id, name, "position", message, photo, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: themes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.themes (id, name, type, colors, styles, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: unattached_media_containers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unattached_media_containers (id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, tenant_id) FROM stdin;
1	Admin Central	admin@example.com	2025-07-07 03:34:28	$2y$12$JOu6GlbWTo.uWJQrkyPWjO8o8.7JnOZW06CkiJkHpGwi8E7OI0nuu	\N	2025-07-07 03:34:28	2025-07-07 03:34:28	\N
\.


--
-- Name: activity_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_log_id_seq', 1, false);


--
-- Name: backlinks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.backlinks_id_seq', 1, false);


--
-- Name: banners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.banners_id_seq', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 1, false);


--
-- Name: core_web_vitals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.core_web_vitals_id_seq', 1, false);


--
-- Name: domains_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.domains_id_seq', 36, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: footers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.footers_id_seq', 1, true);


--
-- Name: invoice_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_usage_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 25, true);


--
-- Name: media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_id_seq', 1, true);


--
-- Name: menu_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menu_items_id_seq', 1, false);


--
-- Name: menus_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.menus_id_seq', 1, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 31, true);


--
-- Name: news_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.news_id_seq', 1, false);


--
-- Name: page_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.page_views_id_seq', 1, false);


--
-- Name: pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pages_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 21, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 1, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 5, true);


--
-- Name: seo_errors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seo_errors_id_seq', 1, false);


--
-- Name: seo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seo_id_seq', 1, false);


--
-- Name: seo_keywords_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seo_keywords_id_seq', 1, false);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 1, true);


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscription_plans_id_seq', 5, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 18, true);


--
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 1, false);


--
-- Name: themes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.themes_id_seq', 1, false);


--
-- Name: unattached_media_containers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.unattached_media_containers_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (id);


--
-- Name: backlinks backlinks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backlinks
    ADD CONSTRAINT backlinks_pkey PRIMARY KEY (id);


--
-- Name: backlinks backlinks_source_url_target_url_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backlinks
    ADD CONSTRAINT backlinks_source_url_target_url_unique UNIQUE (source_url, target_url);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: core_web_vitals core_web_vitals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.core_web_vitals
    ADD CONSTRAINT core_web_vitals_pkey PRIMARY KEY (id);


--
-- Name: domains domains_domain_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_domain_unique UNIQUE (domain);


--
-- Name: domains domains_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: footers footers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.footers
    ADD CONSTRAINT footers_pkey PRIMARY KEY (id);


--
-- Name: invoice_usage invoice_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_usage
    ADD CONSTRAINT invoice_usage_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: media media_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_uuid_unique UNIQUE (uuid);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: model_has_permissions model_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_pkey PRIMARY KEY (permission_id, model_id, model_type);


--
-- Name: model_has_roles model_has_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_pkey PRIMARY KEY (role_id, model_id, model_type);


--
-- Name: news news_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_pkey PRIMARY KEY (id);


--
-- Name: news news_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.news
    ADD CONSTRAINT news_slug_unique UNIQUE (slug);


--
-- Name: page_views page_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_views
    ADD CONSTRAINT page_views_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: pages pages_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_slug_unique UNIQUE (slug);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: role_has_permissions role_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_pkey PRIMARY KEY (permission_id, role_id);


--
-- Name: roles roles_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: seo_errors seo_errors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_errors
    ADD CONSTRAINT seo_errors_pkey PRIMARY KEY (id);


--
-- Name: seo_keywords seo_keywords_keyword_url_date_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_keywords
    ADD CONSTRAINT seo_keywords_keyword_url_date_unique UNIQUE (keyword, url, date);


--
-- Name: seo_keywords seo_keywords_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_keywords
    ADD CONSTRAINT seo_keywords_pkey PRIMARY KEY (id);


--
-- Name: seo seo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo
    ADD CONSTRAINT seo_pkey PRIMARY KEY (id);


--
-- Name: seo seo_route_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo
    ADD CONSTRAINT seo_route_unique UNIQUE (route);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: sris sris_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sris
    ADD CONSTRAINT sris_pkey PRIMARY KEY (identification);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_slug_unique UNIQUE (slug);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_stripe_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_id_unique UNIQUE (stripe_id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: themes themes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.themes
    ADD CONSTRAINT themes_pkey PRIMARY KEY (id);


--
-- Name: unattached_media_containers unattached_media_containers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unattached_media_containers
    ADD CONSTRAINT unattached_media_containers_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: activity_log_log_name_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_log_log_name_index ON public.activity_log USING btree (log_name);


--
-- Name: backlinks_is_active_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX backlinks_is_active_index ON public.backlinks USING btree (is_active);


--
-- Name: backlinks_target_url_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX backlinks_target_url_index ON public.backlinks USING btree (target_url);


--
-- Name: causer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX causer ON public.activity_log USING btree (causer_type, causer_id);


--
-- Name: core_web_vitals_device_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX core_web_vitals_device_type_index ON public.core_web_vitals USING btree (device_type);


--
-- Name: core_web_vitals_url_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX core_web_vitals_url_created_at_index ON public.core_web_vitals USING btree (url, created_at);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: media_model_type_model_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_model_type_model_id_index ON public.media USING btree (model_type, model_id);


--
-- Name: media_order_column_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX media_order_column_index ON public.media USING btree (order_column);


--
-- Name: menu_items_menu_id_parent_id_order_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX menu_items_menu_id_parent_id_order_index ON public.menu_items USING btree (menu_id, parent_id, "order");


--
-- Name: menu_items_type_object_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX menu_items_type_object_id_index ON public.menu_items USING btree (type, object_id);


--
-- Name: menus_location_is_active_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX menus_location_is_active_index ON public.menus USING btree (location, is_active);


--
-- Name: model_has_permissions_model_id_model_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_has_permissions_model_id_model_type_index ON public.model_has_permissions USING btree (model_id, model_type);


--
-- Name: model_has_roles_model_id_model_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_has_roles_model_id_model_type_index ON public.model_has_roles USING btree (model_id, model_type);


--
-- Name: page_views_device_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX page_views_device_type_index ON public.page_views USING btree (device_type);


--
-- Name: page_views_is_bounce_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX page_views_is_bounce_index ON public.page_views USING btree (is_bounce);


--
-- Name: page_views_session_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX page_views_session_id_index ON public.page_views USING btree (session_id);


--
-- Name: page_views_url_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX page_views_url_created_at_index ON public.page_views USING btree (url, created_at);


--
-- Name: page_views_utm_source_utm_medium_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX page_views_utm_source_utm_medium_index ON public.page_views USING btree (utm_source, utm_medium);


--
-- Name: pages_is_active_sort_order_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_is_active_sort_order_index ON public.pages USING btree (is_active, sort_order);


--
-- Name: pages_template_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pages_template_index ON public.pages USING btree (template);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: seo_errors_error_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX seo_errors_error_type_index ON public.seo_errors USING btree (error_type);


--
-- Name: seo_errors_url_status_code_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX seo_errors_url_status_code_index ON public.seo_errors USING btree (url, status_code);


--
-- Name: seo_keywords_keyword_date_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX seo_keywords_keyword_date_index ON public.seo_keywords USING btree (keyword, date);


--
-- Name: seo_keywords_url_date_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX seo_keywords_url_date_index ON public.seo_keywords USING btree (url, date);


--
-- Name: seo_model_id_model_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX seo_model_id_model_type_index ON public.seo USING btree (model_id, model_type);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: sris_regime_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sris_regime_index ON public.sris USING btree (regime);


--
-- Name: sris_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sris_status_index ON public.sris USING btree (status);


--
-- Name: sris_taxpayer_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sris_taxpayer_type_index ON public.sris USING btree (taxpayer_type);


--
-- Name: subject; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subject ON public.activity_log USING btree (subject_type, subject_id);


--
-- Name: domains domains_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: menu_items menu_items_menu_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_menu_id_foreign FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- Name: model_has_permissions model_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: model_has_roles model_has_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: payments payments_subscription_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_subscription_plan_id_foreign FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plans(id) ON DELETE SET NULL;


--
-- Name: payments payments_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_subscription_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_subscription_plan_id_foreign FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plans(id) ON DELETE SET NULL;


--
-- Name: subscriptions subscriptions_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenants tenants_subscription_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_subscription_plan_id_foreign FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plans(id) ON DELETE SET NULL;


--
-- Name: users users_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

