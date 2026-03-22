import assert from "node:assert/strict";
import test from "node:test";
import {
  getSeedChannelMode,
  resolveSeedInputDisplayValue,
} from "./seedDisplay";

test("seedDisplay: modo manual cuando hay valor escrito", () => {
  assert.equal(getSeedChannelMode("#0ea5e9"), "manual");
  assert.equal(getSeedChannelMode("  #0ea5e9  "), "manual");
});

test("seedDisplay: modo auto cuando el valor manual esta vacio", () => {
  assert.equal(getSeedChannelMode(""), "auto");
  assert.equal(getSeedChannelMode("   "), "auto");
});

test("seedDisplay: en manual muestra exactamente el valor editable", () => {
  const value = resolveSeedInputDisplayValue({
    manualValue: "#ABCDEF",
    resolvedValue: "#112233",
    fallbackValue: "#0f62fe",
  });

  assert.equal(value, "#ABCDEF");
});

test("seedDisplay: en auto muestra valor derivado valido", () => {
  const value = resolveSeedInputDisplayValue({
    manualValue: "",
    resolvedValue: "#06a9a1",
    fallbackValue: "#0f62fe",
  });

  assert.equal(value, "#06a9a1");
});

test("seedDisplay: en auto usa fallback cuando no hay derivado valido", () => {
  const value = resolveSeedInputDisplayValue({
    manualValue: "",
    resolvedValue: "invalid",
    fallbackValue: "#0f62fe",
  });

  assert.equal(value, "#0f62fe");
});

