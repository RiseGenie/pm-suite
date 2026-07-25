export type UserRole = 'super_admin' | 'company_admin' | 'member';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';
export type GoalStatus = 'on_track' | 'at_risk' | 'completed';
export type HuddleItemType = 'issue' | 'todo' | 'goal';

export interface Company {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  company_id: string | null;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CompanyTheme {
  company_id: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  muted_text_color: string;
  border_color: string;
  success_color: string;
  warning_color: string;
  danger_color: string;
  sidebar_bg_color: string;
  sidebar_text_color: string;
  font_family: string;
  radius: string;
  density: string;
  custom_css: string | null;
}

export interface Project {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  color: string;
  status: ProjectStatus;
  created_by: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  company_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  position: number;
  created_by: string | null;
  source_issue_id: string | null;
  huddle_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: TaskPriority;
  deadline: string | null;
  assignee_id: string | null;
  source_task_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  deadline: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Huddle {
  id: string;
  company_id: string;
  started_by: string | null;
  started_at: string;
  ended_at: string | null;
  summary: string | null;
  email_sent_at: string | null;
  created_at: string;
}

export interface HuddleDiscussionItem {
  id: string;
  huddle_id: string;
  item_type: HuddleItemType;
  item_id: string;
  notes: string | null;
  added_by: string | null;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  uploaded_by: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  content_type: string | null;
  created_at: string;
}

export interface Invite {
  id: string;
  company_id: string;
  email: string;
  role: UserRole;
  token: string;
  accepted_at: string | null;
  created_at: string;
}

// Minimal Database type placeholder so @supabase/ssr generics resolve.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
