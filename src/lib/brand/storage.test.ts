import assert from "node:assert/strict";
import test from "node:test";
import { getBrandChannel } from "./storage";

test("brand/storage: studio, panel y web usan canales distintos", () => {
  const studioChannel = getBrandChannel("studio");
  const panelChannel = getBrandChannel("panel", "acme-barber");
  const webChannel = getBrandChannel("web", "acme-barber");

  assert.notEqual(studioChannel, panelChannel);
  assert.notEqual(studioChannel, webChannel);
  assert.notEqual(panelChannel, webChannel);
});

test("brand/storage: evento studio no activa listeners panel/web y viceversa", () => {
  const studioChannel = getBrandChannel("studio");
  const panelChannel = getBrandChannel("panel", "acme-barber");
  const webChannel = getBrandChannel("web", "acme-barber");

  const bus = new EventTarget();
  let studioCount = 0;
  let panelCount = 0;
  let webCount = 0;

  bus.addEventListener(studioChannel, () => {
    studioCount += 1;
  });
  bus.addEventListener(panelChannel, () => {
    panelCount += 1;
  });
  bus.addEventListener(webChannel, () => {
    webCount += 1;
  });

  bus.dispatchEvent(new Event(studioChannel));
  assert.equal(studioCount, 1);
  assert.equal(panelCount, 0);
  assert.equal(webCount, 0);

  bus.dispatchEvent(new Event(panelChannel));
  assert.equal(studioCount, 1);
  assert.equal(panelCount, 1);
  assert.equal(webCount, 0);

  bus.dispatchEvent(new Event(webChannel));
  assert.equal(studioCount, 1);
  assert.equal(panelCount, 1);
  assert.equal(webCount, 1);
});
