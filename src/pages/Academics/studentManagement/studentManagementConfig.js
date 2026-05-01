export const STAGE_ICONS = {
  'Pre Primary': 'child_care',
  Primary: 'menu_book',
  Secondary: 'school',
};

export const CLASS_TILE_ICONS = [
  'class',
  'menu_book',
  'edit_note',
  'science',
  'history_edu',
  'calculate',
  'language',
  'biotech',
  'school',
  'workspace_premium',
];

export const STAGE_SLUGS = {
  'pre-primary': 'Pre Primary',
  primary: 'Primary',
  secondary: 'Secondary',
};

export const STAGE_TO_SLUG = {
  'Pre Primary': 'pre-primary',
  Primary: 'primary',
  Secondary: 'secondary',
};

export const classLevelToSlug = (classLevel) => classLevel.replace(/\s+/g, '-').toLowerCase();
export const sectionToSlug = (sectionLabel) => sectionLabel.replace(/\s+/g, '-').toLowerCase();

export const slugToStage = (slug) => STAGE_SLUGS[(slug || '').toLowerCase()] ?? null;

export const classesForStageSlug = (stageSlug, structure) => {
  const stage = slugToStage(stageSlug);
  if (!stage) return [];
  return structure?.stages?.[stage]?.classes?.map((c) => c.name) ?? [];
};

export const slugToClassLevel = (slug, classList) =>
  (classList || []).find((c) => classLevelToSlug(c) === (slug || '').toLowerCase()) ?? null;

export const sectionFromSlug = (slug, sections) =>
  (sections || []).find((s) => sectionToSlug(s) === (slug || '').toLowerCase()) ?? null;

/** All class names across stages, in curriculum order (stageOrder then class order). */
export const flattenAllClassNames = (structure) => {
  const order = structure?.stageOrder ?? [];
  const names = [];
  order.forEach((stageKey) => {
    (structure?.stages?.[stageKey]?.classes ?? []).forEach((c) => {
      if (c?.name) names.push(c.name);
    });
  });
  return names;
};

/** Resolve which stage key owns this class name (first match in stageOrder). */
export const resolveStageForClass = (structure, className) => {
  if (!className || !structure?.stages) return null;
  const order = structure?.stageOrder?.length ? structure.stageOrder : Object.keys(structure.stages);
  for (const stageKey of order) {
    const classes = structure.stages[stageKey]?.classes ?? [];
    if (classes.some((c) => c.name === className)) return stageKey;
  }
  return null;
};
