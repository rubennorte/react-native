/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {FeatureFlagValue} from '../../../packages/react-native/scripts/featureflags/types';
import type {FantomTestConfig} from '../runner/getFantomTestConfigs';
import type {HermesVariant} from '../runner/utils';
import type {PartialFantomTestConfig} from './getFantomTestConfigs';

import {
  FantomTestConfigHermesVariant,
  FantomTestConfigMode,
} from '../runner/getFantomTestConfigs';
import {getOverrides} from './getFantomTestConfigs';

function formatFantomMode(mode: FantomTestConfigMode): string {
  switch (mode) {
    case FantomTestConfigMode.DevelopmentWithSource:
      return 'mode 🐛';
    case FantomTestConfigMode.DevelopmentWithBytecode:
      return 'mode 🐛🔢';
    case FantomTestConfigMode.Optimized:
      return 'mode 🚀';
  }
}

function formatFantomHermesVariant(hermesVariant: HermesVariant): string {
  switch (hermesVariant) {
    case FantomTestConfigHermesVariant.Hermes:
      return 'hermes';
    case FantomTestConfigHermesVariant.StaticHermesStable:
      return 'shermes 🆕';
    case FantomTestConfigHermesVariant.StaticHermesStaging:
      return 'shermes ⏭️';
    case FantomTestConfigHermesVariant.StaticHermesExperimental:
      return 'shermes 🧪';
  }
}

function formatFantomFeatureFlag(
  flagName: string,
  flagValue: FeatureFlagValue,
): string {
  if (typeof flagValue === 'boolean') {
    return `${flagName} ${flagValue ? '✅' : '🛑'}`;
  }

  return `🔐 ${flagName} = ${flagValue}`;
}

function formatFantomConfigPretty(config: PartialFantomTestConfig): string {
  const parts = [];

  if (config.mode) {
    parts.push(formatFantomMode(config.mode));
  }

  if (config.hermesVariant) {
    parts.push(formatFantomHermesVariant(config.hermesVariant));
  }

  if (config.flags) {
    for (const flagType of ['common', 'jsOnly', 'reactInternal'] as const) {
      if (config.flags[flagType]) {
        for (const [flagName, flagValue] of Object.entries(
          config.flags[flagType],
        )) {
          parts.push(formatFantomFeatureFlag(flagName, flagValue));
        }
      }
    }
  }

  return parts.join(', ');
}

function formatFantomConfigShort(config: PartialFantomTestConfig): string {
  const parts = [];

  if (config.hermesVariant) {
    parts.push((config.hermesVariant as string).toLocaleLowerCase());
  }

  if (config.mode) {
    switch (config.mode) {
      case FantomTestConfigMode.DevelopmentWithSource:
        parts.push('dev');
        break;
      case FantomTestConfigMode.DevelopmentWithBytecode:
        parts.push('dev-bytecode');
        break;
      case FantomTestConfigMode.Optimized:
        parts.push('opt');
        break;
    }
  }

  if (config.flags) {
    for (const flagType of ['common', 'jsOnly', 'reactInternal'] as const) {
      if (config.flags[flagType]) {
        for (const [flagName, flagValue] of Object.entries(
          config.flags[flagType],
        )) {
          parts.push(`${flagName}[${String(flagValue)}]`);
        }
      }
    }
  }

  return parts.join('-');
}

export default function formatFantomConfig(
  config: FantomTestConfig,
  options?: ?{style?: 'pretty' | 'short'},
): string {
  const overrides = getOverrides(config);

  if (options?.style === 'short') {
    return formatFantomConfigShort(overrides);
  }

  return formatFantomConfigPretty(overrides);
}
