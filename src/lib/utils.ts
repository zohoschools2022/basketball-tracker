import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}

export function isValidBookingTime(date: Date): boolean {
  const now = new Date()
  const hoursFromNow = (date.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursFromNow >= 1 && hoursFromNow <= 24
}

export function canCancelBooking(date: Date, startTime: string): boolean {
  const now = new Date()
  const [hours, minutes] = startTime.split(':').map(Number)
  const bookingDateTime = new Date(date)
  bookingDateTime.setHours(hours, minutes, 0, 0)
  
  const minutesUntilStart = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60)
  return minutesUntilStart > 30
}