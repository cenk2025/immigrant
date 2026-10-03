// Data access for the Talent Pathway section (tables + RPCs from 0108_talent_pathway.sql).

import { supabase } from './supabase';
import type { CVVersion } from './supabase';
import type { JobType, PermitStatus } from '../data/pathwayData';

export interface PathwayProfile {
    user_id: string;
    arrival_date: string | null;
    permit_status: PermitStatus;
    permit_submitted_on: string | null;
    completed_tasks: string[];
    cohort_id: string | null;
    updated_at: string;
}

export type PathwayProfileUpdate = Partial<Pick<PathwayProfile,
    'arrival_date' | 'permit_status' | 'permit_submitted_on' | 'completed_tasks'>>;

export interface JobSkill {
    uri: string;
    label: string;
}

export interface JobPosting {
    id: string;
    employer_user_id: string;
    company_name: string;
    title: string;
    description: string;
    job_type: JobType;
    region: string;
    city: string | null;
    language_requirements: string | null;
    apply_url: string | null;
    contact_email: string | null;
    skills: JobSkill[];
    is_active: boolean;
    expires_on: string | null;
    created_at: string;
}

export type NewJobPosting = Omit<JobPosting, 'id' | 'employer_user_id' | 'is_active' | 'created_at'>;

export interface MyCohort {
    cohort_id: string;
    cohort_name: string;
    institution_name: string;
    institution_verified: boolean;
    retention_survey_open: boolean;
}

export interface Institution {
    id: string;
    name: string;
    region: string | null;
    advisor_invite_code: string;
    is_verified: boolean;
    created_at: string;
}

export interface Cohort {
    id: string;
    institution_id: string;
    name: string;
    intake_term: string | null;
    invite_code: string;
    retention_survey_open: boolean;
    created_at: string;
}

export interface InstitutionContent {
    id: string;
    institution_id: string;
    cohort_id: string | null;
    title: string;
    body: string;
    link_url: string | null;
    created_at: string;
}

export interface CohortProgressStats {
    member_count: number;
    avg_completion_pct: number | null;
    with_arrival_date: number | null;
    arrived_count: number | null;
    task_counts: Record<string, number> | null;
    permit_counts: Record<string, number> | null;
}

export interface CohortRetentionStats {
    response_count: number;
    in_region_pct: number | null;
    employed_in_field_pct: number | null;
    avg_recommend: number | null;
    status_counts: Record<string, number> | null;
}

export type RetentionStatus = 'employed' | 'studying' | 'job_seeking' | 'entrepreneur' | 'other';

export interface RetentionAnswer {
    in_region: boolean;
    status: RetentionStatus;
    employed_in_field: boolean | null;
    would_recommend: number | null;
}

/** Minimum group size before advisors see any aggregate (enforced in SQL too). */
export const MIN_GROUP_SIZE = 5;

const fail = (what: string, message: string) => {
    console.error(`${what} failed:`, message);
};

// ── Student profile ─────────────────────────────────────────────────────────

export async function getPathwayProfile(userId: string): Promise<PathwayProfile | null> {
    const { data, error } = await supabase
        .from('pathway_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
    if (error) fail('getPathwayProfile', error.message);
    return (data as PathwayProfile | null) ?? null;
}

export async function savePathwayProfile(userId: string, patch: PathwayProfileUpdate): Promise<PathwayProfile | null> {
    const { data, error } = await supabase
        .from('pathway_profiles')
        .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        .select()
        .single();
    if (error) {
        fail('savePathwayProfile', error.message);
        return null;
    }
    return data as PathwayProfile;
}

// ── Cohort membership (student side) ────────────────────────────────────────

export async function getMyCohort(): Promise<MyCohort | null> {
    const { data, error } = await supabase.rpc('my_cohort');
    if (error) {
        fail('getMyCohort', error.message);
        return null;
    }
    const rows = (data as MyCohort[] | null) ?? [];
    return rows[0] ?? null;
}

export async function joinCohort(code: string): Promise<{ ok: boolean; error?: string }> {
    const { error } = await supabase.rpc('join_cohort', { p_code: code });
    return error ? { ok: false, error: error.message } : { ok: true };
}

export async function leaveCohort(): Promise<boolean> {
    const { error } = await supabase.rpc('leave_cohort');
    if (error) fail('leaveCohort', error.message);
    return !error;
}

export async function getVisibleInstitutionContent(): Promise<InstitutionContent[]> {
    const { data, error } = await supabase
        .from('institution_content')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) fail('getVisibleInstitutionContent', error.message);
    return (data as InstitutionContent[] | null) ?? [];
}

export async function getMyRetentionAnswer(cohortId: string, userId: string): Promise<RetentionAnswer | null> {
    const { data, error } = await supabase
        .from('retention_responses')
        .select('in_region, status, employed_in_field, would_recommend')
        .eq('cohort_id', cohortId)
        .eq('user_id', userId)
        .maybeSingle();
    if (error) fail('getMyRetentionAnswer', error.message);
    return (data as RetentionAnswer | null) ?? null;
}

export async function submitRetentionAnswer(cohortId: string, userId: string, answer: RetentionAnswer): Promise<boolean> {
    const { error } = await supabase
        .from('retention_responses')
        .upsert({ cohort_id: cohortId, user_id: userId, ...answer }, { onConflict: 'cohort_id,user_id' });
    if (error) fail('submitRetentionAnswer', error.message);
    return !error;
}

// ── Jobs ────────────────────────────────────────────────────────────────────

export async function listActiveJobs(): Promise<JobPosting[]> {
    const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    if (error) fail('listActiveJobs', error.message);
    const today = new Date().toISOString().slice(0, 10);
    return ((data as JobPosting[] | null) ?? []).filter((j) => !j.expires_on || j.expires_on >= today);
}

export async function listMyJobs(userId: string): Promise<JobPosting[]> {
    const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('employer_user_id', userId)
        .order('created_at', { ascending: false });
    if (error) fail('listMyJobs', error.message);
    return (data as JobPosting[] | null) ?? [];
}

export async function createJob(userId: string, job: NewJobPosting): Promise<{ ok: boolean; error?: string }> {
    const { error } = await supabase.from('job_postings').insert([{ ...job, employer_user_id: userId }]);
    return error ? { ok: false, error: error.message } : { ok: true };
}

export async function setJobActive(jobId: string, isActive: boolean): Promise<boolean> {
    const { error } = await supabase.from('job_postings').update({ is_active: isActive }).eq('id', jobId);
    if (error) fail('setJobActive', error.message);
    return !error;
}

export async function deleteJob(jobId: string): Promise<boolean> {
    const { error } = await supabase.from('job_postings').delete().eq('id', jobId);
    if (error) fail('deleteJob', error.message);
    return !error;
}

/** Skills on the user's CVs: ESCO-linked URIs plus lower-cased free-text labels. */
export async function getMyCvSkills(userId: string): Promise<{ uris: Set<string>; labels: Set<string> }> {
    const uris = new Set<string>();
    const labels = new Set<string>();
    const { data, error } = await supabase.from('cv_versions').select('data').eq('user_id', userId);
    if (error) {
        fail('getMyCvSkills', error.message);
        return { uris, labels };
    }
    for (const cv of (data as Pick<CVVersion, 'data'>[] | null) ?? []) {
        for (const s of cv.data?.skills ?? []) if (s?.trim()) labels.add(s.trim().toLowerCase());
        for (const link of cv.data?.skill_links ?? []) {
            if (link.skill_uri) uris.add(link.skill_uri);
            if (link.label?.trim()) labels.add(link.label.trim().toLowerCase());
        }
    }
    return { uris, labels };
}

/** Which of a job's skills the candidate already has (by ESCO URI, else by label). */
export function matchJobSkills(job: JobPosting, mine: { uris: Set<string>; labels: Set<string> }) {
    const matched = job.skills.filter(
        (s) => mine.uris.has(s.uri) || mine.labels.has(s.label.trim().toLowerCase())
    );
    const pct = job.skills.length === 0 ? null : Math.round((matched.length / job.skills.length) * 100);
    return { matched, pct };
}

// ── Institutions (advisor side) ─────────────────────────────────────────────

export async function listMyInstitutions(): Promise<Institution[]> {
    const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .order('created_at', { ascending: true });
    if (error) fail('listMyInstitutions', error.message);
    return (data as Institution[] | null) ?? [];
}

export async function createInstitution(name: string, region: string): Promise<{ id?: string; error?: string }> {
    const { data, error } = await supabase.rpc('create_institution', { p_name: name, p_region: region });
    return error ? { error: error.message } : { id: data as string };
}

export async function joinInstitutionAsAdvisor(code: string): Promise<{ id?: string; error?: string }> {
    const { data, error } = await supabase.rpc('join_institution_as_advisor', { p_code: code });
    return error ? { error: error.message } : { id: data as string };
}

export async function listCohorts(institutionId: string): Promise<Cohort[]> {
    const { data, error } = await supabase
        .from('institution_cohorts')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });
    if (error) fail('listCohorts', error.message);
    return (data as Cohort[] | null) ?? [];
}

export async function getCohortSizes(institutionId: string): Promise<Record<string, number>> {
    const { data, error } = await supabase.rpc('institution_cohort_sizes', { p_institution_id: institutionId });
    if (error) {
        fail('getCohortSizes', error.message);
        return {};
    }
    const out: Record<string, number> = {};
    for (const row of (data as { cohort_id: string; member_count: number }[] | null) ?? []) {
        out[row.cohort_id] = row.member_count;
    }
    return out;
}

export async function createCohort(institutionId: string, name: string, intakeTerm: string): Promise<boolean> {
    const { error } = await supabase
        .from('institution_cohorts')
        .insert([{ institution_id: institutionId, name, intake_term: intakeTerm || null }]);
    if (error) fail('createCohort', error.message);
    return !error;
}

export async function setRetentionSurveyOpen(cohortId: string, open: boolean): Promise<boolean> {
    const { error } = await supabase
        .from('institution_cohorts')
        .update({ retention_survey_open: open })
        .eq('id', cohortId);
    if (error) fail('setRetentionSurveyOpen', error.message);
    return !error;
}

export async function getCohortProgressStats(cohortId: string, totalTasks: number): Promise<CohortProgressStats | null> {
    const { data, error } = await supabase.rpc('cohort_progress_stats', {
        p_cohort_id: cohortId,
        p_total_tasks: totalTasks,
    });
    if (error) {
        fail('getCohortProgressStats', error.message);
        return null;
    }
    return ((data as CohortProgressStats[] | null) ?? [])[0] ?? null;
}

export async function getCohortRetentionStats(cohortId: string): Promise<CohortRetentionStats | null> {
    const { data, error } = await supabase.rpc('cohort_retention_stats', { p_cohort_id: cohortId });
    if (error) {
        fail('getCohortRetentionStats', error.message);
        return null;
    }
    return ((data as CohortRetentionStats[] | null) ?? [])[0] ?? null;
}

export async function listInstitutionContent(institutionId: string): Promise<InstitutionContent[]> {
    const { data, error } = await supabase
        .from('institution_content')
        .select('*')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false });
    if (error) fail('listInstitutionContent', error.message);
    return (data as InstitutionContent[] | null) ?? [];
}

export async function addInstitutionContent(
    userId: string,
    item: { institution_id: string; cohort_id: string | null; title: string; body: string; link_url: string | null }
): Promise<boolean> {
    const { error } = await supabase.from('institution_content').insert([{ ...item, created_by: userId }]);
    if (error) fail('addInstitutionContent', error.message);
    return !error;
}

export async function deleteInstitutionContent(id: string): Promise<boolean> {
    const { error } = await supabase.from('institution_content').delete().eq('id', id);
    if (error) fail('deleteInstitutionContent', error.message);
    return !error;
}
