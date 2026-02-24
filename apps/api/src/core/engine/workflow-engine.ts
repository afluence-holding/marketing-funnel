import { eventBus } from './event-bus';
import { workflowRegistry } from '../../orgs';
import { actionHandlerMap } from './action-handlers';
import type { PipelineEvent, WorkflowDef } from '../types';

export function startWorkflowEngine() {
  eventBus.on('*', async (event: PipelineEvent) => {
    const matching = Object.values(workflowRegistry).filter(
      (w) => w.trigger.event === event.type && matchConditions(w.trigger.conditions, event),
    );

    for (const workflow of matching) {
      console.log(`[workflow-engine] Matched "${workflow.key}" on ${event.type}`);
      for (const action of workflow.actions) {
        try {
          const handler = actionHandlerMap[action.type];
          if (!handler) {
            console.error(`[workflow-engine] No handler for action type "${action.type}"`);
            continue;
          }
          await handler(action, event);
        } catch (err) {
          console.error(`[workflow-engine] Action "${action.type}" failed in "${workflow.key}":`, err);
        }
      }
    }
  });

  const count = Object.keys(workflowRegistry).length;
  console.log(`[workflow-engine] Started with ${count} workflow(s) registered`);
}

function matchConditions(
  conditions: Record<string, unknown> | undefined,
  event: PipelineEvent,
): boolean {
  if (!conditions || Object.keys(conditions).length === 0) return true;

  for (const [key, expected] of Object.entries(conditions)) {
    const actual = event.metadata?.[key];
    if (actual !== expected) return false;
  }
  return true;
}
