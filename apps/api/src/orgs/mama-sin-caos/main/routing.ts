import type { RoutingEngine } from '../../../core/types';

// Sin routing: los leads de Mamá Sin Caos viven en su tabla dedicada, no en el
// pipeline del CRM. Devolver [] = no se crean lead_pipeline_entries.
export const routingEngine: RoutingEngine = () => [];
