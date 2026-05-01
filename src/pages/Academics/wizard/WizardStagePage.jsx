import React from 'react';
import { useSelector } from 'react-redux';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { selectAcademicsStructure, selectStageOrder } from '../../../store/academics/academicsSlice';
import { STAGE_ICONS, STAGE_TO_SLUG } from '../studentManagement/studentManagementConfig';
import { SmNavTile, stageVariant } from '../studentManagement/SmNavTile';
import { AcademicsProvisionPanel } from './AcademicsProvisionPanel';
import { useAcademicsWizardMeta } from './useAcademicsWizardMeta';
import '../AcademicsPages.scss';
import '../studentManagement/StudentManagementFlow.scss';

export const WizardStagePage = () => {
  const { navRootTitle, stageSubtitle } = useAcademicsWizardMeta();
  const stageOrder = useSelector(selectStageOrder);
  const structure = useSelector(selectAcademicsStructure);
  usePageTitle(navRootTitle);

  return (
    <div className="sm-card">
      <h1>{navRootTitle}</h1>
      <p>{stageSubtitle}</p>
      <div className="sm-nav-tile-grid cols-3">
        {stageOrder.map((stage) => (
          <SmNavTile
            key={stage}
            to={STAGE_TO_SLUG[stage]}
            variant={stageVariant(stage)}
            icon={STAGE_ICONS[stage]}
            title={stage}
            caption={`${structure.stages?.[stage]?.classes?.length ?? 0} classes`}
          />
        ))}
      </div>
      <AcademicsProvisionPanel />
    </div>
  );
};
