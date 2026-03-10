import type { ActionHandlerMap } from '../../types';
import { moveStageAction } from './move-stage';
import { updateStatusAction } from './update-status';
import { enrollSequenceAction } from './enroll-sequence';
import { unenrollSequenceAction } from './unenroll-sequence';
import { logAction } from './log';
import { notifyAction } from './notify';
import { createClickupTaskAction } from './create-clickup-task';
import { updateClickupStatusAction } from './update-clickup-status';

export const actionHandlerMap: ActionHandlerMap = {
  move_stage: moveStageAction,
  update_status: updateStatusAction,
  enroll_sequence: enrollSequenceAction,
  unenroll_sequence: unenrollSequenceAction,
  create_clickup_task: createClickupTaskAction,
  update_clickup_status: updateClickupStatusAction,
  log: logAction,
  notify: notifyAction,
};
