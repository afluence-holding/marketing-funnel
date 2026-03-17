import type { ActionHandlerMap } from '../../types';
import { moveStageAction } from './move-stage';
import { updateStatusAction } from './update-status';
import { enrollSequenceAction } from './enroll-sequence';
import { unenrollSequenceAction } from './unenroll-sequence';
import { logAction } from './log';
import { notifyAction } from './notify';
import { createClickupTaskAction } from './create-clickup-task';
import { updateClickupStatusAction } from './update-clickup-status';
import { notifyClickupChannelAction } from './notify-clickup-channel';

export const actionHandlerMap: ActionHandlerMap = {
  move_stage: moveStageAction,
  update_status: updateStatusAction,
  enroll_sequence: enrollSequenceAction,
  unenroll_sequence: unenrollSequenceAction,
  create_clickup_task: createClickupTaskAction,
  update_clickup_status: updateClickupStatusAction,
  notify_clickup_channel: notifyClickupChannelAction,
  log: logAction,
  notify: notifyAction,
};
