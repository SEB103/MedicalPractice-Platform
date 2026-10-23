# ADR-0002: Wagtail admin as the single practice admin

Date: 2026-10-23
Status: Accepted

## Context
The practice needs to edit website content and handle patients, appointment requests and schedules.
Staff are not technical users.

## Options considered
- Django Admin (optionally with a theme) for operations plus Wagtail for content: two different admin UIs.
- Wagtail admin only: one login, German UI, content editing with revisions and image renditions; custom
  actions (approve, confirm) need some extra code.
- Django Admin only, dropping Wagtail: loses page editing, revisions and image handling the frontend expects.

## Decision
The Wagtail admin (`/cms/`) is the only admin for practice staff. Django Admin (`/django-admin/`) remains
for the technical administrator (superuser) for maintenance and emergencies.

## Consequences
Operational screens (requests, patients, schedule) are built as Wagtail viewsets/settings in later phases.
Permissions are granted through Django groups shown in the Wagtail admin.
