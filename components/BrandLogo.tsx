import { useId } from "react";

export default function BrandLogo({ className = "w-28 h-auto" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const g0 = `paint0_${uid}`;
  const g1 = `paint1_${uid}`;

  return (
    <svg
      viewBox="0 0 428 199"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="BITX"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M425.889 40.1111L413.614 0L361.462 69.6159L339.333 40.1111H297.111L340.338 97.8133L295 158H337.222L425.889 40.1111Z"
        fill={`url(#${g0})`}
      />
      <path
        d="M415.725 198.445L373.206 141.67L394.354 113.472L428 158.333L415.725 198.445Z"
        fill={`url(#${g1})`}
      />
      <path d="M219 63H184L184 40L284 40.0001V63H249V158H219V63Z" fill="currentColor" />
      <path d="M157 158H132L132 40L157 40V158Z" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 40V132.894C0 146.759 11.1929 158 25 158H74.5C93.5538 158 109 142.99 109 123.855C109 110.26 101.203 98.4936 89.854 92.8203C96.646 87.3927 101 79.0198 101 69.6255C101 53.2638 87.7924 40 71.5 40H0ZM27 86.1958V62.0936H61.5C68.4036 62.0936 73.5 67.2117 73.5 74.1447C73.5 81.0776 68.4036 86.1958 61.5 86.1958H27ZM27 133.396V109.294H68.8878C75.5772 109.294 81 114.4 81 121.345C81 128.29 75.5772 133.396 68.8878 133.396H27Z"
        fill="currentColor"
      />
      <defs>
        <linearGradient id={g0} x1="214" y1="0" x2="214" y2="198.445" gradientUnits="userSpaceOnUse">
          <stop offset="0.0480769" stopColor="#2A8EFF" />
          <stop offset="0.219851" stopColor="#0078FF" />
          <stop offset="0.833012" stopColor="#023B83" />
        </linearGradient>
        <linearGradient id={g1} x1="214" y1="0" x2="214" y2="198.445" gradientUnits="userSpaceOnUse">
          <stop offset="0.0480769" stopColor="#2A8EFF" />
          <stop offset="0.219851" stopColor="#0078FF" />
          <stop offset="0.833012" stopColor="#023B83" />
        </linearGradient>
      </defs>
    </svg>
  );
}
