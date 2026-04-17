import assert from "node:assert/strict";
import test from "node:test";
import { resolvePanelBrandHydratorScope } from "./brandHydratorScope";

test("brandHydratorScope: cliente no-admin usa panel", () => {
  const scope = resolvePanelBrandHydratorScope({
    isAdmin: false,
    pathname: "/panel/dashboard",
    systemSemanticRuntimeEnabled: true,
  });

  assert.equal(scope, "panel");
});

test("brandHydratorScope: admin usa panel en Taller Brand con flag OFF", () => {
  const scope = resolvePanelBrandHydratorScope({
    isAdmin: true,
    pathname: "/panel/taller/brand",
    systemSemanticRuntimeEnabled: false,
  });

  assert.equal(scope, "panel");
});

test("brandHydratorScope: admin usa system solo en taller brand con flag ON", () => {
  const scope = resolvePanelBrandHydratorScope({
    isAdmin: true,
    pathname: "/panel/taller/brand",
    systemSemanticRuntimeEnabled: true,
  });

  assert.equal(scope, "system");
});

test("brandHydratorScope: admin usa panel en otras rutas de Studio", () => {
  const scope = resolvePanelBrandHydratorScope({
    isAdmin: true,
    pathname: "/panel/taller/media",
    systemSemanticRuntimeEnabled: true,
  });

  assert.equal(scope, "panel");
});

test("brandHydratorScope: admin fuera de studio usa panel", () => {
  const scope = resolvePanelBrandHydratorScope({
    isAdmin: true,
    pathname: "/panel/settings/appearance",
    systemSemanticRuntimeEnabled: true,
  });

  assert.equal(scope, "panel");
});
