import React from 'react';

/**
 * Shared card for class grid and section rows — styling from AcademicsModernPage.scss
 * (ac-card-base + ac-class-card | ac-section-card).
 */
export const ClassCard = ({
  pill,
  title,
  count,
  isSenior = false,
  isSelected = false,
  onClick,
  className = '',
  variant = 'class',
}) => {
  const countText = typeof count === 'number' ? `${count} Students` : count;
  const base = variant === 'section' ? 'ac-class-card ac-section-card' : 'ac-class-card';
  const seniorCls = variant === 'class' && isSenior ? ' senior' : '';
  const selectedCls = isSelected ? ' is-selected' : '';

  return (
    <button
      type="button"
      className={`${base}${seniorCls}${selectedCls} ${className}`.trim()}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      <span className="code">{pill}</span>
      <h3>{title}</h3>
      <p>{countText}</p>
    </button>
  );
};
