/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react.defaults

import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class DefaultNewArchitectureEntryPointTest {

  @Test
  fun isConfigurationValid_withEverythingOff_returnsFalse() {
    val (isValid, errorMessage) =
        DefaultNewArchitectureEntryPoint.isConfigurationValid(
            turboModulesEnabled = false,
            fabricEnabled = false,
        )
    assertThat(isValid).isFalse()
    assertThat(errorMessage)
        .isEqualTo(
            "You cannot load React Native with the New Architecture disabled. Please use DefaultNewArchitectureEntryPoint.load() instead of DefaultNewArchitectureEntryPoint.load(turboModulesEnabled=false, fabricEnabled=false)",
        )
  }

  @Test
  fun isConfigurationValid_withTurboModulesOnlyOn_returnsFalse() {
    val (isValid, errorMessage) =
        DefaultNewArchitectureEntryPoint.isConfigurationValid(
            turboModulesEnabled = true,
            fabricEnabled = false,
        )
    assertThat(isValid).isFalse()
    assertThat(errorMessage)
        .isEqualTo(
            "You cannot load React Native with the New Architecture disabled. Please use DefaultNewArchitectureEntryPoint.load() instead of DefaultNewArchitectureEntryPoint.load(turboModulesEnabled=true, fabricEnabled=false)",
        )
  }

  @Test
  fun isConfigurationValid_withFabricWithoutTurboModules_returnsFalse() {
    val (isValid, errorMessage) =
        DefaultNewArchitectureEntryPoint.isConfigurationValid(
            turboModulesEnabled = false,
            fabricEnabled = true,
        )
    assertThat(isValid).isFalse()
    assertThat(errorMessage)
        .isEqualTo(
            "You cannot load React Native with the New Architecture disabled. Please use DefaultNewArchitectureEntryPoint.load() instead of DefaultNewArchitectureEntryPoint.load(turboModulesEnabled=false, fabricEnabled=true)",
        )
  }

  @Test
  fun isConfigurationValid_withEverythingOn_returnsTrue() {
    val (isValid, _) =
        DefaultNewArchitectureEntryPoint.isConfigurationValid(
            turboModulesEnabled = true,
            fabricEnabled = true,
        )
    assertThat(isValid).isTrue()
  }
}
