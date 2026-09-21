/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

import NativeExceptionsManager from 'react-native/Libraries/Core/NativeExceptionsManager';

test('NativeAnimatedHelper is a mock', () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

  try {
    const NativeAnimatedHelper: {
      assertNativeAnimatedModule: () => void,
      nativeEventEmitter: {addListener: () => void},
      shouldUseNativeDriver: () => boolean,
    } = jest.requireMock(
      'react-native/src/private/animated/NativeAnimatedHelper',
    ).default;

    expect(
      jest.isMockFunction(NativeAnimatedHelper.assertNativeAnimatedModule),
    ).toBe(true);
    expect(NativeAnimatedHelper.nativeEventEmitter).toBeDefined();
    expect(
      jest.isMockFunction(NativeAnimatedHelper.shouldUseNativeDriver),
    ).toBe(false);
    expect(consoleWarn).not.toHaveBeenCalled();
  } finally {
    consoleWarn.mockRestore();
  }
});

test('NativeExceptionsManager is a mock', () => {
  expect(jest.isMockFunction(NativeExceptionsManager.reportException)).toBe(
    true,
  );
});
