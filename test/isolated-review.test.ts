jest.mock("jsdom", () => ({ JSDOM: class {} }));

import { getAllTools, resolveRepoPath, runSearchRepo } from "../src/agent/tools";

describe("isolated review tools", () => {
  const previous = process.env.ISOLATED_REVIEW;

  afterEach(() => {
    if (previous === undefined) delete process.env.ISOLATED_REVIEW;
    else process.env.ISOLATED_REVIEW = previous;
  });

  it("exposes repository read tools without shell or network tools", () => {
    process.env.ISOLATED_REVIEW = "true";
    const names = getAllTools().map((tool) => tool.name);
    expect(names).toEqual(expect.arrayContaining(["fetch_files", "fetch_snippet", "search_repo", "dep_graph"]));
    expect(names).not.toContain("bash");
    expect(names).not.toContain("web_fetch");
    expect(names).not.toContain("web_search");
  });

  it("refuses paths outside the repository root", () => {
    expect(resolveRepoPath("../outside.txt")).toBeNull();
    expect(resolveRepoPath("/etc/passwd")).toBeNull();
    expect(resolveRepoPath("docs/development-workflow.md")).not.toBeNull();
  });

  it("refuses repository searches scoped outside the repository root", async () => {
    await expect(runSearchRepo({ query: "secret", paths: ["../"] })).rejects.toThrow(
      "Search path is outside the repository",
    );
    await expect(runSearchRepo({ query: "secret", paths: ["/etc"] })).rejects.toThrow(
      "Search path is outside the repository",
    );
  });
});
