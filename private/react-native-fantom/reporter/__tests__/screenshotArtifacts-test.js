/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {ScreenshotResult} from '../../runtime/ScreenshotContext';

import saveScreenshotArtifacts from '../screenshotArtifacts';
import {Buffer} from 'node:buffer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let directory: string;
let artifacts: string;
let result: {
  ...ScreenshotResult,
  receivedPath: string,
  differencePath: string,
};
const expected = fs.readFileSync(path.join(__dirname, 'fixtures/preview.png'));
const received = Buffer.concat([expected, Buffer.from('received')]);
const difference = Buffer.concat([expected, Buffer.from('difference')]);

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'fantom-artifacts-test-'));
  artifacts = path.join(directory, 'artifacts');
  const captureDirectory = path.join(directory, 'attempt-1');
  fs.mkdirSync(captureDirectory);
  result = {
    fileName: 'image.png',
    expectedPath: path.join(directory, 'expected.png'),
    receivedPath: path.join(captureDirectory, 'image.png'),
    differencePath: path.join(captureDirectory, 'image.diff.png'),
    pass: false,
    isNew: false,
  };
  fs.writeFileSync(result.expectedPath, expected);
  fs.writeFileSync(result.receivedPath, received);
  fs.writeFileSync(result.differencePath, difference);
});

afterEach(() => {
  fs.rmSync(directory, {recursive: true, force: true});
});

it('copies expected, received and difference images without modifying the sources', () => {
  expect(saveScreenshotArtifacts([result], artifacts)).toEqual([]);
  const comparison = path.join(artifacts, 'attempt-1/image');
  for (const [label, contents] of [
    ['expected', expected],
    ['received', received],
    ['difference', difference],
  ]) {
    expect(fs.readFileSync(path.join(comparison, `${label}.png`))).toEqual(
      contents,
    );
  }
  expect(fs.readFileSync(result.expectedPath)).toEqual(expected);
  expect(fs.readFileSync(result.receivedPath)).toEqual(received);
  expect(fs.readFileSync(result.differencePath)).toEqual(difference);
});

it('omits passing screenshots and snapshots without saved captures', () => {
  expect(
    saveScreenshotArtifacts(
      [
        {...result, pass: true},
        {...result, receivedPath: null},
      ],
      artifacts,
    ),
  ).toEqual([]);
  expect(fs.existsSync(artifacts)).toBe(false);
});

it('saves the received image when there is no baseline', () => {
  fs.unlinkSync(result.expectedPath);
  expect(
    saveScreenshotArtifacts(
      [{...result, isNew: true, differencePath: undefined}],
      artifacts,
    ),
  ).toEqual([]);
  const comparison = path.join(artifacts, 'attempt-1/image');
  expect(fs.readdirSync(comparison)).toEqual(['received.png']);
  expect(fs.readFileSync(path.join(comparison, 'received.png'))).toEqual(
    received,
  );
});

it('retains earlier retries without overwriting their captures', () => {
  saveScreenshotArtifacts([result], artifacts);
  const captureDirectory = path.join(directory, 'attempt-2');
  fs.mkdirSync(captureDirectory);
  const nextReceived = path.join(captureDirectory, 'image.png');
  fs.writeFileSync(nextReceived, expected);
  expect(
    saveScreenshotArtifacts(
      [{...result, receivedPath: nextReceived}],
      artifacts,
    ),
  ).toEqual([]);
  expect(
    fs.readFileSync(path.join(artifacts, 'attempt-1/image/received.png')),
  ).toEqual(received);
  expect(
    fs.readFileSync(path.join(artifacts, 'attempt-2/image/received.png')),
  ).toEqual(expected);
});

it('keeps available images when another image cannot be copied', () => {
  fs.unlinkSync(result.expectedPath);
  const errors = saveScreenshotArtifacts([result], artifacts);
  expect(errors.length).toBe(1);
  expect(errors[0]).toContain(result.expectedPath);
  const comparison = path.join(artifacts, 'attempt-1/image');
  expect(fs.readFileSync(path.join(comparison, 'received.png'))).toEqual(
    received,
  );
  expect(fs.readFileSync(path.join(comparison, 'difference.png'))).toEqual(
    difference,
  );
});
