/**
 * TaskSphere Logo — monochrome SVG icon mark + wordmark.
 *
 * Props:
 *   size      — icon dimensions in px (default 22)
 *   iconOnly  — hide the wordmark (default false)
 *   className — additional CSS class
 *
 * Color: inherits via currentColor — stays monochrome.
 */
export default function TaskSphereLogo({ iconOnly = false, size = 22, className = '' }) {
  return (
    <span className={`ts-logo ${className}`}>
      {/* Icon Mark: open sphere arcs + checkmark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Lower-left arc — ¾ sweep */}
        <path
          d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Upper-right arc — ¼ sweep, creates the opening */}
        <path
          d="M16 2c7.732 0 14 6.268 14 14"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Checkmark */}
        <path
          d="M11 16.5l4 4 8.5-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      {!iconOnly && (
        <span className="ts-logo-text">
          Task<span className="ts-logo-text-bold">Sphere</span>
        </span>
      )}
    </span>
  );
}
