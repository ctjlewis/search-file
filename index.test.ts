import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { searchFile } from "."; // Assuming we've exported the searchFile function
import { writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";

describe("searchFile", () => {
  const testDir = join(import.meta.dir, "test-files");

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test("should find a phrase in a small file", async () => {
    const filePath = join(testDir, "small.txt");
    await writeFile(filePath, "Hello, world!");
    expect(await searchFile(filePath, "world")).toBe(true);
    expect(await searchFile(filePath, "universe")).toBe(false);
  });

  test("should find a phrase spanning multiple chunks", async () => {
    const filePath = join(testDir, "multi-chunk.txt");
    const content = "a".repeat(65536) + "target" + "b".repeat(65536);
    await writeFile(filePath, content);

    expect(await searchFile(filePath, "target")).toBe(true);
  });

  test("should handle multi-byte characters", async () => {
    const filePath = join(testDir, "multi-byte.txt");
    await writeFile(filePath, "你好，世界！");

    expect(await searchFile(filePath, "世界")).toBe(true);
    expect(await searchFile(filePath, "宇宙")).toBe(false);
  });

  test("should handle large files efficiently", async () => {
    const filePath = join(testDir, "large.txt");
    const content = "a".repeat(10 * 1024 * 1024) + "needle" + "b".repeat(10 * 1024 * 1024);
    await writeFile(filePath, content);

    const start = performance.now();
    const result = await searchFile(filePath, "needle");
    const end = performance.now();

    expect(result).toBe(true);
    expect(end - start).toBeLessThan(1000); // Should complete in less than 1 second
  });
});