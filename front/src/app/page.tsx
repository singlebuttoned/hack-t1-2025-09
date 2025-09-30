import { redirect } from 'next/navigation';

import { auth } from '@/lib/mock-auth-server';

export default async function Page() {
  const { userId } = await auth();

  if (userId === '') {
    return redirect('/auth/sign-in');
  } else {
    redirect('/dashboard/overview');
  }
}
