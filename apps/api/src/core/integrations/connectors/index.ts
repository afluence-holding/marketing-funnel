import type { ConnectorId, IntegrationConnector } from '../types';
import { mailerliteConnector } from './mailerlite';
import { metaCapiConnector } from './meta-capi';
import { hyrosConnector } from './hyros';

export const connectorRegistry: Record<ConnectorId, IntegrationConnector> = {
  mailerlite: mailerliteConnector as IntegrationConnector,
  'meta-capi': metaCapiConnector as IntegrationConnector,
  hyros: hyrosConnector as IntegrationConnector,
};
