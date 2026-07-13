import React from 'react';

/**
 * A premium reusable Switch Toggle component.
 * Tracks:
 * - Off: #D8D2BE (light mode) / muted gray (dark mode)
 * - On: #2E5142 (forest green)
 * Knobs:
 * - Off: White
 * - On: #C6461E (terracotta)
 */
const Toggle = ({ checked, onChange, ariaLabel = 'Toggle' }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange && onChange(!checked)}
      className={`relative inline-flex h-[24px] w-[42px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-c-accent focus-visible:ring-offset-2 ${
        checked
          ? 'bg-[#2E5142]'
          : 'bg-[#D8D2BE] dark:bg-zinc-600'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition-all duration-250 ease-out ${
          checked
            ? 'translate-x-[18px] bg-[#C6461E]'
            : 'translate-x-0 bg-white'
        }`}
      />
    </button>
  );
};

export default Toggle;
