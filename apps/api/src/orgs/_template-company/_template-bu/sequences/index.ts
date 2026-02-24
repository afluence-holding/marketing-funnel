/**
 * ============================================================================
 * SEQUENCE REGISTRY — Export all sequences for this BU
 * ============================================================================
 *
 * Every sequence you create in this folder must be imported here and
 * added to the `sequences` map. The key MUST match the sequence's `key` field.
 *
 * This file is imported by orgs/index.ts which feeds the global registry.
 *
 * EXAMPLE:
 *   import { welcomeSequence } from './welcome';
 *   import { nurtureSequence } from './nurture';
 *
 *   export const sequences: Record<string, SequenceDef> = {
 *     [welcomeSequence.key]: welcomeSequence,
 *     [nurtureSequence.key]: nurtureSequence,
 *   };
 */

import type { SequenceDef } from '../../../../core/types';
import { exampleSequence } from './_example-sequence';

export const sequences: Record<string, SequenceDef> = {
  [exampleSequence.key]: exampleSequence,
};
