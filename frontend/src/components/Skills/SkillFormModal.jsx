import React from 'react';
import { Modal } from 'antd';
import SkillForm from './SkillForm';

function SkillFormModal({ visible, onClose, onSkillCreated, venues, skillsCategory, batchData, editingSkill, editSkillData }) {
  return (
    <Modal
      title={editingSkill ? 'Edit Skill' : 'Create Skill'}
      open={visible || editingSkill }
      onCancel={onClose}
      footer={null}
      centered
      width={800}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '16px' }}
    >
      <SkillForm venues={venues} skillsCategory={skillsCategory} batchData={batchData} onSkillCreated={onSkillCreated} onCancel={onClose} editingSkill={editingSkill} editSkillData={editSkillData} />
    </Modal>
  );
}

export default SkillFormModal;
