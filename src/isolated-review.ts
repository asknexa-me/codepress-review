import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { reviewFullDiff } from "./agent";
import { getModelConfig } from "./config";

interface IsolatedReviewInput {
  repo: string;
  prNumber: number;
  commitSha: string;
  repositoryFiles: string[];
  prFilesFormatted: string;
}

export async function runIsolatedReview(inputPath: string, reportPath: string): Promise<void> {
  const input = JSON.parse(readFileSync(resolve(inputPath), "utf8")) as IsolatedReviewInput;
  if (!input.repo || !input.prNumber || !/^[0-9a-f]{40}$/i.test(input.commitSha)) {
    throw new Error("Invalid isolated review input");
  }
  process.env.ISOLATED_REVIEW = "true";
  process.env.ENABLE_WEB_SEARCH = "false";
  const result = await reviewFullDiff(
    await getModelConfig(),
    input.repositoryFiles,
    { repo: input.repo, prNumber: input.prNumber, commitSha: input.commitSha },
    18,
    false,
    [],
    [],
    [],
    input.prFilesFormatted,
  );
  writeFileSync(resolve(reportPath), JSON.stringify({
    schemaVersion: 1,
    repository: input.repo,
    pullRequest: input.prNumber,
    commitSha: input.commitSha,
    result,
  }, null, 2), { encoding: "utf8", mode: 0o600 });
}
