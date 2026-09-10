/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

@file:Suppress("DEPRECATION") // We want to use ReactFeatureFlags here specifically

package com.facebook.react.defaults

import com.facebook.react.common.ReleaseLevel
import com.facebook.react.common.annotations.VisibleForTesting
import com.facebook.react.internal.featureflags.ReactNativeFeatureFlags
import com.facebook.react.internal.featureflags.ReactNativeFeatureFlagsOverrides_RNOSS_Canary_Android
import com.facebook.react.internal.featureflags.ReactNativeFeatureFlagsOverrides_RNOSS_Experimental_Android
import com.facebook.react.internal.featureflags.ReactNativeFeatureFlagsOverrides_RNOSS_Stable_Android
import com.facebook.react.internal.featureflags.ReactNativeFeatureFlagsProvider

/**
 * A utility class that serves as an entry point for users setup the New Architecture.
 *
 * This class needs to be invoked as `DefaultNewArchitectureEntryPoint.load(...)` by passing a
 * series of optional parameters.
 *
 * By default it loads a library called `appmodules`. `appmodules` is a convention used to refer to
 * the application dynamic library. If changed here should be updated also inside the template.
 *
 * By default it also enables both TurboModules, Fabric and Concurrent React (aka React 18), and
 * Bridgeless
 */
public object DefaultNewArchitectureEntryPoint {

  public var releaseLevel: ReleaseLevel = ReleaseLevel.STABLE

  /**
   * Loads the React Native New Architecture entry point with the default configuration.
   *
   * This will load the app with TurboModules, Fabric and Bridgeless by default.
   */
  @JvmStatic
  public fun load() {
    load(turboModulesEnabled = true, fabricEnabled = true)
  }

  @JvmStatic
  @Deprecated(
      message =
          "Loading the entry point with different flags for Fabric and TurboModule is deprecated." +
              " Please use load() instead when loading the New Architecture.",
      replaceWith = ReplaceWith("load()"),
  )
  public fun load(
      turboModulesEnabled: Boolean = true,
  ) {
    load(turboModulesEnabled, fabricEnabled = true)
  }

  @JvmStatic
  @Deprecated(
      message =
          "Loading the entry point with different flags for Fabric and TurboModule is deprecated." +
              " Please use load() instead when loading the New Architecture.",
      replaceWith = ReplaceWith("load()"),
  )
  public fun load(
      turboModulesEnabled: Boolean = true,
      fabricEnabled: Boolean = true,
  ) {
    val (isValid, errorMessage) = isConfigurationValid(turboModulesEnabled, fabricEnabled)
    if (!isValid) {
      error(errorMessage)
    }

    when (releaseLevel) {
      ReleaseLevel.EXPERIMENTAL -> {
        ReactNativeFeatureFlags.override(
            ReactNativeFeatureFlagsOverrides_RNOSS_Experimental_Android(),
        )
      }
      ReleaseLevel.CANARY -> {
        ReactNativeFeatureFlags.override(ReactNativeFeatureFlagsOverrides_RNOSS_Canary_Android())
      }
      ReleaseLevel.STABLE -> {
        ReactNativeFeatureFlags.override(ReactNativeFeatureFlagsOverrides_RNOSS_Stable_Android())
      }
    }

    privateTurboModulesEnabled = turboModulesEnabled

    DefaultSoLoader.maybeLoadSoLibrary()
  }

  @JvmStatic
  internal fun loadWithFeatureFlags(featureFlags: ReactNativeFeatureFlagsProvider) {
    ReactNativeFeatureFlags.override(featureFlags)

    privateTurboModulesEnabled = true

    DefaultSoLoader.maybeLoadSoLibrary()
  }

  @JvmStatic
  public val fabricEnabled: Boolean
    get() = true

  private var privateTurboModulesEnabled: Boolean = false

  @JvmStatic
  public val turboModulesEnabled: Boolean
    get() = privateTurboModulesEnabled

  @JvmStatic
  public val concurrentReactEnabled: Boolean
    get() = true

  @VisibleForTesting
  public fun isConfigurationValid(
      turboModulesEnabled: Boolean,
      fabricEnabled: Boolean,
  ): Pair<Boolean, String> =
      if (!turboModulesEnabled || !fabricEnabled) {
        false to
            "You cannot load React Native with the New Architecture disabled. " +
                "Please use DefaultNewArchitectureEntryPoint.load() instead of " +
                "DefaultNewArchitectureEntryPoint.load(turboModulesEnabled=$turboModulesEnabled, " +
                "fabricEnabled=$fabricEnabled)"
      } else {
        true to ""
      }
}
