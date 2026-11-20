import type { SVGProps } from "react";

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <path d="M10 4V16M4 10H16" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 5L15 15M15 5L5 15" />
    </svg>
  );
}

export function FolderBoardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <rect x="2.5" y="3.5" width="15" height="13" />
      <path d="M7.5 3.5V16.5M12.5 3.5V12" />
    </svg>
  );
}

export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <rect x="5" y="3.5" width="5.5" height="5.5" />
      <path d="M2.5 16.5V14C2.5 12.6 3.6 11.5 5 11.5H10.5C11.9 11.5 13 12.6 13 14V16.5" />
      <path d="M13.5 4.5H16.5V8.5H13.5" />
      <path d="M15 11.5C16.4 11.5 17.5 12.6 17.5 14V16.5" />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <circle cx="9" cy="9" r="5.5" />
      <path d="M13.5 13.5L17.5 17.5" />
    </svg>
  );
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <path d="M3.5 5.5H16.5" />
      <path d="M7.5 3H12.5V5.5H7.5V3Z" />
      <path d="M5.5 5.5L6.2 16.5H13.8L14.5 5.5" />
      <path d="M8.5 9V13.5M11.5 9V13.5" />
    </svg>
  );
}

export function LogOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <path d="M8.5 3.5H3.5V16.5H8.5" />
      <path d="M8 10H16.5M13 6.5L16.5 10L13 13.5" />
    </svg>
  );
}

export function KeyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <circle cx="6.5" cy="10" r="3.5" />
      <path d="M10 10H17.5M14.5 10V13M17 10V12.5" />
    </svg>
  );
}
