import type { SVGProps } from "react";

export function TechBroMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="2"
        y="2"
        width="32"
        height="32"
        fill="var(--tb-primary)"
        stroke="var(--tb-ink)"
        strokeWidth="3"
      />
      <path
        d="M8 11H22M15 11V26"
        stroke="var(--tb-ink)"
        strokeWidth="3.2"
        strokeLinecap="square"
      />
      <path
        d="M21 15H26.5C28.2 15 29.2 16 29.2 17.5C29.2 18.8 28.4 19.6 27.3 19.9C28.7 20.2 29.6 21.2 29.6 22.7C29.6 24.6 28.3 25.8 26.2 25.8H21V15Z"
        stroke="var(--tb-ink)"
        strokeWidth="2.8"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <path d="M2 12C4.6 7.5 8 5.5 12 5.5C16 5.5 19.4 7.5 22 12C19.4 16.5 16 18.5 12 18.5C8 18.5 4.6 16.5 2 12Z" />
      <rect x="9.5" y="9.5" width="5" height="5" />
    </svg>
  );
}

export function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 3L21 21" />
      <path d="M10.2 5.7C10.8 5.6 11.4 5.5 12 5.5C16 5.5 19.4 7.5 22 12C20.9 13.8 19.6 15.2 18.1 16.3" />
      <path d="M14.3 18.2C13.6 18.4 12.8 18.5 12 18.5C8 18.5 4.6 16.5 2 12C3.3 9.8 4.8 8.2 6.6 7.1" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 8.5L6.5 12L13 4.5" />
    </svg>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M3.5 10H15.5" />
      <path d="M11 5L16 10L11 15" />
    </svg>
  );
}

export function AlertIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M10 2.5L18.5 17H1.5L10 2.5Z" />
      <path d="M10 8V11.5" />
      <rect x="9.25" y="13.75" width="1.5" height="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BracketsIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M6.5 5L2.5 10L6.5 15" />
      <path d="M13.5 5L17.5 10L13.5 15" />
      <path d="M11 4L9 16" />
    </svg>
  );
}

export function BoltIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M11.5 2L4 11H10L8.5 18L16 9H10L11.5 2Z" />
    </svg>
  );
}
