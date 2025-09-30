import { UserProfile } from '@/lib/mock-auth';

export default function ProfileViewPage() {
  return (
    <div className='flex w-full flex-col p-4'>
      <UserProfile />
    </div>
  );
}
