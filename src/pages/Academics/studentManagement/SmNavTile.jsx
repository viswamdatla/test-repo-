import React from 'react';
import { Link } from 'react-router-dom';

const VARIANTS = ['blue', 'amber', 'green', 'violet', 'teal'];

export const stageVariant = (stage) => {
  if (stage === 'Pre Primary') return 'blue';
  if (stage === 'Primary') return 'amber';
  if (stage === 'Secondary') return 'green';
  return VARIANTS[0];
};

export const cycleVariant = (index) => VARIANTS[index % VARIANTS.length];

export const SmNavTile = ({ to, variant, icon, title, caption }) => (
  <Link className={`sm-nav-tile sm-nav-tile--${variant}`} to={to} relative="path">
    <div className="sm-nav-tile__icon-wrap">
      <span className="material-symbols-outlined sm-nav-tile__icon">{icon}</span>
    </div>
    <div className="sm-nav-tile__title">{title}</div>
    {caption != null && caption !== '' && <div className="sm-nav-tile__caption">{caption}</div>}
  </Link>
);

export const SmNavTileButton = ({ onClick, variant, icon, title, caption, active }) => (
  <button
    type="button"
    className={`sm-nav-tile sm-nav-tile--${variant}${active ? ' is-active' : ''}`}
    onClick={onClick}
  >
    <div className="sm-nav-tile__icon-wrap">
      <span className="material-symbols-outlined sm-nav-tile__icon">{icon}</span>
    </div>
    <div className="sm-nav-tile__title">{title}</div>
    {caption != null && caption !== '' && <div className="sm-nav-tile__caption">{caption}</div>}
  </button>
);
