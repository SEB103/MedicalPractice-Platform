export type Role = 'visitor' | 'approved' | 'pending'
export type PracticeTheme = 'hausarzt' | 'psychiatry' | 'gemeinschaft'
export type ColorMode = 'light' | 'dark' | 'system'
export type AppointmentStatus =
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'declined'
  | 'no_show'
  | 'expired'
export interface Appointment {
  serviceId?: string
  practiceProfile?: PracticeTheme
  id: string
  date: string
  time: string
  service: string
  durationMinutes?: number
  status: AppointmentStatus
  /** Short organisational note from the practice (e.g. reason for declining). */
  note?: string
}
export interface Booking {
  serviceId?: string
  practiceProfile?: PracticeTheme
  date: string
  time: string
  service: string
}
export interface Profile {
  name: string
  email: string
  address: string
}
export interface DemoState {
  version: 1
  role: Role
  theme: PracticeTheme
  mode: ColorMode
  appointments: Appointment[]
  alternateAddress: boolean
  notifications: boolean
}
export interface PatientService {
  list(): Promise<Appointment[]>
  book(input: Booking, replaceId?: string): Promise<Appointment>
  cancel(id: string): Promise<void>
}
