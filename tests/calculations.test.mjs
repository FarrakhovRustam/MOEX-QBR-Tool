import test from "node:test";
import assert from "node:assert/strict";
import { canTransition, metricStatus, parseValue, progress, russianCount } from "../lib/calculations.mjs";
test("normalizes display values", () => { assert.equal(parseValue("52,4 тыс."), 52.4); assert.equal(parseValue("18%"), 18); assert.equal(parseValue("9 дней"), 9); assert.equal(parseValue("4 продукта"), 4); });
test("calculates increase, decrease and rounding", () => { assert.equal(progress(50, 52.4), 105); assert.equal(progress(7, 9, "decrease"), 78); });
test("maps statuses and guards transitions", () => { assert.equal(metricStatus(100), "green"); assert.equal(metricStatus(85), "yellow"); assert.equal(metricStatus(84), "red"); assert.equal(canTransition("preparation", "review", 69), false); assert.equal(canTransition("preparation", "review", 70), true); assert.equal(canTransition("review", "results", 100, 1), false); assert.equal(canTransition("review", "results", 100, 0), true); });
test("uses Russian counter forms", () => { const forms = ["вопрос", "вопроса", "вопросов"]; assert.equal(russianCount(1, forms), "1 вопрос"); assert.equal(russianCount(2, forms), "2 вопроса"); assert.equal(russianCount(11, forms), "11 вопросов"); });
