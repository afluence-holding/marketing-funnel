/**
 * Capa de integraciones / fan-out — tipos del core (agnóstico al creador).
 *
 * Un evento de negocio (`registro` | `compra`) se reparte a N destinos externos
 * (connectors). El mapeo por creador (group IDs, field keys) es code-first; los
 * tokens son secretos referenciados por `secretRef` (env). Ver
 * funcionalidades-por-desarrollar/integraciones-fanout/USER-STORIES.md.
 */

export type IntegrationEventType = 'registro' | 'compra';

export type ConnectorId = 'mailerlite' | 'hyros' | 'meta-capi';

/** Datos de tracking de Meta capturados en el request (NO viajan por el bus). */
export interface IntegrationTracking {
  /** event_id compartido Pixel↔CAPI para dedupe. */
  eventId?: string;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}

/** Evento normalizado que entra al dispatcher. */
export interface IntegrationEvent {
  type: IntegrationEventType;
  orgKey: string;
  buKey: string;
  /** Base del dedup_key: 'whop:pay_123' | 'lead:<uuid>'. El dispatcher antepone el tipo. */
  dedupBase: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  country?: string;
  cohortCode?: string;
  /** Precio del tier ($67/$77/$87) para `tier_compra`. */
  tier?: number;
  /** Valor cobrado real (para CAPI/Hyros). */
  value?: number;
  currency?: string;
  /** Order id / transaction id de la compra. */
  orderId?: string;
  source?: string;
  utm?: Record<string, string>;
  tracking?: IntegrationTracking;
  /** ISO date YYYY-MM-DD del registro (campo DATE de MailerLite). */
  registeredOn?: string;
  /** Timestamp del evento (para event_time). */
  occurredAt?: Date;
}

// ── Config code-first por creador (MAPEO, no secretos) ──────────────────────

export interface MailerliteTargetConfig {
  connector: 'mailerlite';
  enabledFor: IntegrationEventType[];
  /** Nombre del env con el token (NUNCA el token). */
  secretRef: string;
  /** Grupo de registrantes (registro entra aquí). */
  registrantGroupId: string;
  /** Grupo de compradores (compra entra aquí). */
  buyerGroupId: string;
  /** Mapeo nombre-lógico → field key real de la cuenta. */
  fieldKeys: {
    name?: string;
    source?: string;
    cohort?: string;
    tier?: string;
    regDate?: string;
  };
  /** Valor a poner en el campo `cohorte` (p.ej. 'di21-c2'). */
  cohortValue: string;
}

export interface HyrosTargetConfig {
  connector: 'hyros';
  enabledFor: IntegrationEventType[];
  secretRef: string;
}

export interface MetaCapiTargetConfig {
  connector: 'meta-capi';
  enabledFor: IntegrationEventType[];
  /** Env del pixel id. */
  pixelRef: string;
  /** Env del CAPI token. */
  tokenRef: string;
  /** event_name por tipo (p.ej. registro→Lead, compra→Purchase). */
  eventNames: { registro: string; compra: string };
  /** URL del event_source_url. */
  eventSourceUrl?: string;
  /** ISO-2 país por defecto del creador. */
  defaultCountry?: string;
  /** content_ids / content_name para custom_data de compra. */
  contentIds?: string[];
  contentName?: string;
}

export type TargetConfig =
  | MailerliteTargetConfig
  | HyrosTargetConfig
  | MetaCapiTargetConfig;

export interface BuIntegrationConfig {
  orgKey: string;
  buKey: string;
  targets: TargetConfig[];
}

// ── Connector ───────────────────────────────────────────────────────────────

/** Error que el connector lanza para indicar fallo PERMANENTE (no reintentar). */
export class PermanentDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermanentDeliveryError';
  }
}

export interface IntegrationConnector<T extends TargetConfig = TargetConfig> {
  id: ConnectorId;
  /**
   * Entrega el evento a este destino. Resuelve normalmente o:
   * - throw `PermanentDeliveryError` → la fila va a `dead` (no reintentar).
   * - throw cualquier otro Error → fallo reintentable (`failed` + backoff).
   * Si las credenciales del destino no están configuradas, NO debe lanzar:
   * retorna y el dispatcher marca `delivered` (no-op intencional, como el
   * guard de CAPI). Un destino sin token no es un error a reintentar.
   */
  deliver(event: IntegrationEvent, target: T): Promise<void>;
}
