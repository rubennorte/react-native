/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import {isOSS, validateEnvironmentVariables} from '../EnvironmentOptions';
import build from './build';

export default async function globalSetup(
  globalConfig: {...},
  projectConfig: {...},
): Promise<void> {
  validateEnvironmentVariables();

  if (!isOSS) {
    await build();
  }
}
