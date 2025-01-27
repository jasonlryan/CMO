-- Basic CMO Profile and Assessment Tables for Prototype

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- CMO Profiles
create table if not exists cmo_profiles (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    current_role text not null,
    years_experience integer not null,
    industry text not null,
    organization_type text check (organization_type in ('B2B', 'B2C', 'Hybrid')),
    skills jsonb not null default '{
        "hardSkills": {},
        "softSkills": {}
    }',
    target_maturity_stage uuid references company_maturity_stages(id),
    skill_depth_levels jsonb not null default '{
        "strategic_understanding": {},
        "managerial_oversight": {},
        "conversational_proficiency": {},
        "executional_expertise": {}
    }',
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Assessment Results
create table if not exists assessment_results (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid references cmo_profiles(id) on delete cascade,
    overall_score numeric not null check (overall_score >= 0 and overall_score <= 100),
    category_scores jsonb not null default '{
        "hardSkills": 0,
        "softSkills": 0
    }',
    recommendations jsonb default '[]',
    maturity_aligned_score numeric,
    skill_depth_scores jsonb not null default '{
        "strategic_understanding": 0,
        "managerial_oversight": 0,
        "conversational_proficiency": 0,
        "executional_expertise": 0
    }',
    evidence jsonb,
    assessment_notes jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add maturity stages table
create table if not exists company_maturity_stages (
    id uuid primary key default uuid_generate_v4(),
    stage text not null check (stage in ('Early-Stage', 'Growth', 'Scale-Up', 'Enterprise')),
    description text not null,
    skill_weightings jsonb not null default '{
        "hardSkills": 0,
        "softSkills": 0,
        "leadershipSkills": 0,
        "commercialAcumen": 0
    }',
    created_at timestamp with time zone default timezone('utc'::text, now())
); 