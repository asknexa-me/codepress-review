import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("checked-in action bundle", () => {
  it("contains the isolated report-only entry point", () => {
    const bundle = readFileSync(resolve("dist/index.js"), "utf8");

    expect(bundle).toContain('getBooleanInput("isolated_mode")');
    expect(bundle).toContain("Isolated review report generated");
    expect(bundle).toContain("pull_request_target");
  });
});
