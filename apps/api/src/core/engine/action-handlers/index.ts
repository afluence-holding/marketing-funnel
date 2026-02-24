import type { ActionHandlerMap } from '../../types';
import { moveStageAction } from './move-stage';
import { updateStatusAction } from './update-status';
import { enrollSequenceAction } from './enroll-sequence';
import { unenrollSequenceAction } from './unenroll-sequence';
import { logAction } from './log';
import { notifyAction } from './notify';

export const actionHandlerMap: ActionHandlerMap = {
  move_stage: moveStageAction,
  update_status: updateStatusAction,
  enroll_sequence: enrollSequenceAction,
  unenroll_sequence: unenrollSequenceAction,
  log: logAction,
  notify: notifyAction,
};
