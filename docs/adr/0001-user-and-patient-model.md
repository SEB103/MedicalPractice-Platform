# ADR-0001: Login account, patient record and practice roles

Date: 2026-10-23
Status: Accepted

## Context
The prototype distinguishes visitors, pending and approved patients. The practice must also be able to
record patients who never registered on the website (letter, phone, personal visit, court order), and a
person who later registers must not create a duplicate. No medical data is stored.

## Options considered
- Patient fields on the user model: simple, but patients without a login would need fake accounts.
- Separate `Patient` record with an optional link to a login account: one extra model, clean separation.
- Automatic linking of a registration to an existing record by name and birth date: convenient, but anyone
  who knows those details could gain access to someone else's appointments.

## Decision
- Custom `accounts.User` with e-mail login (case-insensitive unique), introduced before any real data.
- `patients.Patient` holds name, birth date (required, for identification), optional contact data,
  status (`pending`, `approved`, `rejected`, `blocked`), source (`website`, `practice`) and an optional
  one-to-one link to `User`. No diagnoses, insurance, free-text notes or reason of admission.
- Website registration always creates a new pending record. Staff see possible matches (same surname +
  birth date, or same e-mail) and link manually; the practice record stays authoritative. The website never
  reveals whether a person is already known.
- Roles are groups: `Praxisleitung` (doctor, full practice access), `Empfang` (reception: patients and
  appointments). The technical administrator is a Django superuser; the doctor has no Django Admin access.
- Audit entries use the label `Patient #<id>`, never personal data.

## Consequences
Switching `AUTH_USER_MODEL` requires fresh development databases. Appointments (phase 2) reference
`Patient`, and linking must reassign them. Account invitations for practice-created patients need e-mail
delivery and are deferred.
