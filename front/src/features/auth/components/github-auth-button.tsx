'use client';

import { useSearchParams } from 'next/navigation';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export default function GithubSignInButton() {
  const searchParams = useSearchParams();
  const _callbackUrl = searchParams.get('callbackUrl');

  return (
    <Button
      className='w-full'
      variant='outline'
      type='button'
      onClick={() => {
        /* implement github auth here */
      }}
    >
      <Icons.github className='mr-2 h-4 w-4' />
      Continue with Github
    </Button>
  );
}
