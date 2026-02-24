import { EventEmitter } from 'events';
import type { PipelineEvent, WorkflowEventType } from '../types';

class PipelineEventBus {
  private emitter = new EventEmitter();

  emit(event: PipelineEvent): void {
    this.emitter.emit(event.type, event);
    this.emitter.emit('*', event);
  }

  on(eventType: WorkflowEventType | '*', handler: (event: PipelineEvent) => void): void {
    this.emitter.on(eventType, handler);
  }

  off(eventType: WorkflowEventType | '*', handler: (event: PipelineEvent) => void): void {
    this.emitter.off(eventType, handler);
  }
}

export const eventBus = new PipelineEventBus();
