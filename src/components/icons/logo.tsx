import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      {...props}
    >
      <rect width="24" height="24" rx="6" fill="currentColor"/>
      <path d="M12.0001 18.26C11.6901 18.26 11.3801 18.14 11.1501 17.91L6.59006 13.35C5.41006 12.17 5.41006 10.29 6.59006 9.10999C7.77006 7.92999 9.65006 7.92999 10.8301 9.10999L12.0001 10.28L13.1701 9.10999C14.3501 7.92999 16.2301 7.92999 17.4101 9.10999C18.5901 10.29 18.5901 12.17 17.4101 13.35L12.8501 17.91C12.6201 18.14 12.3101 18.26 12.0001 18.26Z" fill="white"/>
    </svg>
  );
}
