import React, { useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { selectAcademicsStructure } from '../../../store/academics/academicsSlice';
import { CLASS_TILE_ICONS, classLevelToSlug, classesForStageSlug, slugToStage } from '../studentManagement/studentManagementConfig';
import { SmNavTile, cycleVariant } from '../studentManagement/SmNavTile';
import { useAcademicsWizardMeta } from './useAcademicsWizardMeta';
import '../AcademicsPages.scss';
import '../studentManagement/StudentManagementFlow.scss';

export const WizardClassPage = () => {
  const { stageSlug } = useParams();
  const { wizardBase } = useOutletContext();
  const navigate = useNavigate();
  const { navRootTitle, classSubtitle } = useAcademicsWizardMeta();
  const structure = useSelector(selectAcademicsStructure);
  const stage = slugToStage(stageSlug);
  const classes = classesForStageSlug(stageSlug, structure);
  const cols = classes.length <= 3 ? 'cols-3' : 'cols-5';

  usePageTitle(stage ? `${stage} — Classes` : navRootTitle);

  useEffect(() => {
    if (!stage) navigate(wizardBase, { replace: true });
  }, [stage, navigate, wizardBase]);

  if (!stage) return null;

  return (
    <div className="sm-card">
      <button type="button" className="sm-back" onClick={() => navigate(wizardBase)}>
        <span className="material-symbols-outlined">arrow_back</span>
        All levels
      </button>
      <h1>{stage}</h1>
      <p className="sm-sub">{classSubtitle}</p>
      <div className={`sm-nav-tile-grid ${cols}`}>
        {classes.map((cl, i) => (
          <SmNavTile
            key={cl}
            to={classLevelToSlug(cl)}
            variant={cycleVariant(i)}
            icon={CLASS_TILE_ICONS[i % CLASS_TILE_ICONS.length]}
            title={cl}
            caption={`${structure.stages?.[stage]?.classes?.find((x) => x.name === cl)?.sections?.length ?? 0} sections`}
          />
        ))}
      </div>
    </div>
  );
};
