import * as React from 'react';

interface CompanyLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function CompanyLogoSVG({ className, ...props }: CompanyLogoProps) {
  return (
    <svg
      viewBox='0 0 52 52'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
      {...props}
    >
      {/* path1: "4" shape - uses accent color in both themes */}
      <path
        d='M7.25781 32.6592V27.8479L17.5464 15.3687H23.4497V28.4493V32.6592V36.418H18.3897V32.6592H7.25781ZM12.4864 28.4493H18.3897V21.2324L12.4864 28.4493Z'
        className='fill-accent'
      />
      {/* path2: "C" shape - uses black in light mode, white in dark mode */}
      <path
        d='M41.9975 29.4977L44.7358 32.3812C44.1608 33.1309 43.4762 33.7941 42.6821 34.3996C41.2856 35.4088 39.2592 36.418 36.5209 36.418C30.6061 36.418 26.1152 31.6603 26.1152 25.8933C26.1152 20.1264 30.6061 15.3687 36.5209 15.3687C39.177 15.3687 41.2308 16.3779 42.5726 17.3871C43.3667 17.9926 44.0239 18.6558 44.5989 19.4055L41.8606 22.289C41.4499 21.7411 40.9843 21.2798 40.4641 20.8473C39.5604 20.1264 38.246 19.4055 36.5209 19.4055C33.098 19.4055 30.3596 22.289 30.3596 25.8933C30.3596 29.4977 33.098 32.3812 36.5209 32.3812C38.3008 32.3812 39.6426 31.6603 40.601 30.9394C41.1486 30.5069 41.6142 30.0456 41.9975 29.4977Z'
        className='fill-[#131418] dark:fill-white'
      />
      {/* path3: circle - uses accent color in both themes */}
      <circle cx='36.1173' cy='25.8932' r='3.23837' className='fill-accent' />
    </svg>
  );
}
