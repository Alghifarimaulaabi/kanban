# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Internal software / IT team (Developers, QA, PMs)** collaborating daily on software delivery across multiple projects.
- **Admin**: Provisions team member accounts, creates and manages project cards, assigns members to projects, and oversees delivery.
- **Member**: Signs in to view only assigned projects and moves task cards freely across workflow stages as engineering and QA work progresses.

## Product Purpose

Provide a focused, auth-gated internal Kanban web application that moves a software team cleanly from sign-in to project selection to daily task execution. Opening the domain lands directly on the login screen; once signed in, users see project cards created by admins and open each project into a 6-column Kanban board (`Backlog`, `To Do`, `Revision`, `In Progress`, `In Review`, `Done`). Success means every team member immediately knows which projects they belong to, what is in progress, and what needs revision without the overhead of bloated enterprise suites.

## Positioning

A lean internal engineering delivery tool with strict admin-provisioned access (no public sign-up, per-project member visibility) and an explicit 6-stage workflow where `Revision` is a first-class column alongside `Backlog`, `To Do`, `In Progress`, `In Review`, and `Done`.

## Operating Context

- **Primary entry & workflow**: Domain root gates access behind authentication (`/login` for unauthenticated visitors; assigned project cards view for authenticated users; clicking a project card opens its 6-column Kanban board).
- **Provisioning & access**: Only Admins create user accounts and projects, and assign Members to projects. Members only access projects they are assigned to, and within an assigned project can freely move task cards across all 6 columns.
- **Language**: Full English interface for all labels, navigation, statuses, and system feedback.

## Capabilities and Constraints

- **Confirmed technical foundation**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma 7 with PostgreSQL (`@prisma/adapter-pg`), Better Auth (`emailAndPassword` + `admin` plugin), and `react-kanban-kit` for board drag-and-drop.
- **Confirmed access & workflow rules**:
  - No public self-registration.
  - Admin-only account and project creation.
  - Project visibility scoped to assigned Members (and Admins).
  - Six fixed board columns in order: `Backlog`, `To Do`, `Revision`, `In Progress`, `In Review`, `Done`.
  - Assigned Members may move cards freely across all 6 columns.
- **Open / undecided product facts**:
  - Final product name and brand identity (currently working under `kanban`).
  - Exact MVP scope for secondary features (revision comments, priority/due dates, search/filtering, subtasks, attachments, real-time sync, notifications).
  - Target production hosting environment and PostgreSQL deployment provider.

## Evidence on Hand

- Repository contains the Next.js 16 starter scaffold (`app/`), Prisma 7 schema (`prisma/schema.prisma`) modeling `User`, `Session`, `Account`, `Verification`, `Project`, `ProjectMember`, `Task`, and `TaskComment`, Better Auth server/client wiring (`lib/auth.ts`, `lib/auth-client.ts`, `app/api/auth/[...all]/route.ts`), and default starter SVG files in `public/`.
- **Absences (do not fabricate)**: No brand logo, custom imagery, real team roster, production project/task data, customer quotes, or deployment claims exist yet.

## Product Principles

1. **Direct path to work**: Keep navigation strictly focused on Login → Assigned Project Cards → 6-Column Kanban Board with no unnecessary layers.
2. **Centralized access, autonomous execution**: Restrict account provisioning and project assignment to Admins while letting assigned Members update card status freely across the board.
3. **Treat rework as a first-class stage**: Keep `Revision` distinct from `Backlog` and `To Do` so QA and review feedback stays visible and actionable.
4. **Clear, consistent English engineering copy**: Use concise, standard software-delivery terminology across every screen, status, and error message.
