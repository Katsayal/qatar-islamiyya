import { test } from "node:test";
import assert from "node:assert/strict";
import { isImageBytes } from "./image-bytes.ts";

const bytes = (...v: number[]) => new Uint8Array(v);
const ascii = (s: string) => new TextEncoder().encode(s);

test("isImageBytes accepts real JPEG, PNG and WebP headers", () => {
  assert.equal(isImageBytes(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0x10)), true);
  assert.equal(isImageBytes(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d)), true);
  assert.equal(isImageBytes(ascii("RIFF\x24\x00\x00\x00WEBPVP8 ")), true);
});

test("isImageBytes refuses text, empty files and cut-off headers", () => {
  assert.equal(isImageBytes(ascii("not an image")), false);
  assert.equal(isImageBytes(bytes()), false);
  assert.equal(isImageBytes(bytes(0x89, 0x50, 0x4e)), false); // PNG header cut short
  assert.equal(isImageBytes(ascii("RIFF\x24\x00\x00\x00WAVEfmt ")), false); // RIFF but audio
});
