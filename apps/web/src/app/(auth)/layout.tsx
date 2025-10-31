// Auth Layout - No navigation/sidebar
// Clean layout for authentication pages

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* TODO: Add auth-specific styling/branding */}
      {children}
    </div>
  )
}
