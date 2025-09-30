'use client';

interface NotFoundProps {
  title?: string;
  description?: string;
}

export function NotFound({
  title = "We couldn't find that URL",
  description = 'Check the URL'
}: NotFoundProps) {
  return (
    <div className='flex h-full flex-col items-center justify-center gap-3 px-4 text-center'>
      <h1 className='text-4xl font-bold'>404</h1>
      <h2 className='text-xl font-semibold'>{title}</h2>
      <p className='text-muted-foreground max-w-md text-sm'>{description}</p>
    </div>
  );
}

export default NotFound;
