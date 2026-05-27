export const PAGE_SIZE = 20

export const gradientBtn = { background: 'linear-gradient(to right, #f97316, #ec4899)' }
export const gradientBtnWide = { background: 'linear-gradient(to right, #f97316, #ec4899, #a855f7)' }

export const fmtDateLong = (dt: string) =>
  new Date(dt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })

export const fmtTime = (dt: string) =>
  new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

export const CATEGORY_COLORS: Record<string, string> = {
  'Announcement': 'bg-blue-100 text-blue-700',
  'Company Update': 'bg-purple-100 text-purple-700',
  'Employee of the Month': 'bg-yellow-100 text-yellow-700',
  'Event': 'bg-green-100 text-green-700',
  'Policy Change': 'bg-red-100 text-red-700',
  'Other': 'bg-gray-100 text-gray-600',
}