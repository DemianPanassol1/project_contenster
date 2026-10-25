import { ResetPasswordView } from '@/features/auth';

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params;

  return <ResetPasswordView token={token} />;
}
