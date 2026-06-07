import AdminShell from "./AdminShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock user since auth is bypassed
  const mockUser = { id: 'bypassed', email: 'admin@bypassed.local' } as any;

  return <AdminShell user={mockUser}>{children}</AdminShell>;
}
