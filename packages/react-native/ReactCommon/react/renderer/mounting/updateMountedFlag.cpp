/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "updateMountedFlag.h"

#include <react/featureflags/ReactNativeFeatureFlags.h>

namespace facebook::react {
void updateMountedFlag(
    const std::vector<std::shared_ptr<const ShadowNode>>& oldChildren,
    const std::vector<std::shared_ptr<const ShadowNode>>& newChildren,
    ShadowTreeCommitSource commitSource) {
  // This is a simplified version of Diffing algorithm that only updates
  // `mounted` flag on `ShadowNode`s. The algorithm sets "mounted" flag before
  // "unmounted" to allow `ShadowNode` detect a situation where the node was
  // remounted.

  if (&oldChildren == &newChildren) {
    // Lists are identical, nothing to do.
    return;
  }

  if (oldChildren.empty() && newChildren.empty()) {
    // Both lists are empty, nothing to do.
    return;
  }

  size_t index = 0;

  // Stage 1: Mount and unmount "updated" children.
  for (index = 0; index < oldChildren.size() && index < newChildren.size();
       index++) {
    const auto& oldChild = oldChildren[index];
    const auto& newChild = newChildren[index];

    if (oldChild == newChild) {
      // Nodes are identical, skipping the subtree.
      continue;
    }

    if (!ShadowNode::sameFamily(*oldChild, *newChild)) {
      // Totally different nodes, updating is impossible.
      break;
    }

    newChild->setMounted(true);
    oldChild->setMounted(false);

    if (commitSource == ShadowTreeCommitSource::React &&
        ReactNativeFeatureFlags::updateRuntimeShadowNodeReferencesOnCommit()) {
      newChild->updateRuntimeShadowNodeReference(newChild);
    }

    updateMountedFlag(
        oldChild->getChildren(), newChild->getChildren(), commitSource);
  }

  size_t lastIndexAfterFirstStage = index;

  // State 2: Mount new children.
  for (index = lastIndexAfterFirstStage; index < newChildren.size(); index++) {
    const auto& newChild = newChildren[index];
    newChild->setMounted(true);
    updateMountedFlag({}, newChild->getChildren(), commitSource);
  }

  // State 3: Unmount old children.
  for (index = lastIndexAfterFirstStage; index < oldChildren.size(); index++) {
    const auto& oldChild = oldChildren[index];
    oldChild->setMounted(false);
    updateMountedFlag(oldChild->getChildren(), {}, commitSource);
  }
}
} // namespace facebook::react
