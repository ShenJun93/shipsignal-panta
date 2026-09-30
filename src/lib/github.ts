import type { GitHubPullRequestSignal } from "@/lib/types";

const PR_PATTERN = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:\/.*)?$/i;

type GitHubLabel = {
  name?: string | null;
};

type GitHubPullResponse = {
  html_url: string;
  title: string;
  state: string;
  draft: boolean;
  mergeable: boolean | null;
  mergeable_state?: string | null;
  comments?: number;
  review_comments?: number;
  changed_files?: number;
  additions?: number;
  deletions?: number;
  commits?: number;
  created_at: string;
  updated_at: string;
  merged_at?: string | null;
  head?: { sha?: string | null };
  base?: { sha?: string | null };
  user?: { login?: string | null };
  labels?: GitHubLabel[];
};

export function parsePullRequestUrl(url: string) {
  const match = url.trim().match(PR_PATTERN);
  if (!match) {
    throw new Error("Enter a GitHub pull-request URL such as https://github.com/owner/repo/pull/123");
  }
  return { owner: match[1], repo: match[2], number: Number(match[3]) };
}

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN?.trim();
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function scorePullRequest(pr: GitHubPullResponse) {
  let score = 55;
  const evidence: string[] = [];

  if (pr.state === "closed" && pr.merged_at) {
    score = 100;
    evidence.push("PR is already merged.");
  } else {
    if (pr.draft) {
      score -= 20;
      evidence.push("PR is still a draft.");
    } else {
      score += 8;
      evidence.push("PR is marked ready for review.");
    }

    if (pr.mergeable === true) {
      score += 12;
      evidence.push("GitHub currently reports the PR as mergeable.");
    } else if (pr.mergeable === false) {
      score -= 25;
      evidence.push("GitHub currently reports merge conflicts.");
    } else {
      evidence.push("Mergeability is not resolved yet.");
    }

    const mergeableState = String(pr.mergeable_state || "");
    if (mergeableState === "clean") {
      score += 10;
      evidence.push("Required checks/review state is clean.");
    } else if (["blocked", "dirty"].includes(mergeableState)) {
      score -= 15;
      evidence.push(`GitHub merge state is ${mergeableState}.`);
    } else if (mergeableState) {
      evidence.push(`GitHub merge state is ${mergeableState}.`);
    }

    const ageDays = Math.max(
      0,
      (Date.now() - new Date(pr.created_at).getTime()) / 86_400_000,
    );
    if (ageDays < 7) score += 5;
    if (ageDays > 30) score -= 8;
    evidence.push(`PR age is ${ageDays.toFixed(1)} days.`);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const deliveryLabel: GitHubPullRequestSignal["deliveryLabel"] =
    score >= 75 ? "strong" : score >= 45 ? "mixed" : "blocked";
  return { score, deliveryLabel, evidence };
}

export async function getPullRequestSignal(url: string): Promise<GitHubPullRequestSignal> {
  const { owner, repo, number } = parsePullRequestUrl(url);
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}`,
    { headers: githubHeaders(), cache: "no-store" },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body.slice(0, 300)}`);
  }

  const pr = (await response.json()) as GitHubPullResponse;
  const scored = scorePullRequest(pr);

  return {
    source: "github",
    fetchedAt: new Date().toISOString(),
    url: pr.html_url,
    repository: `${owner}/${repo}`,
    number,
    title: pr.title,
    state: pr.state,
    draft: Boolean(pr.draft),
    mergeable: pr.mergeable,
    mergeableState: pr.mergeable_state || null,
    comments: Number(pr.comments || 0),
    reviewComments: Number(pr.review_comments || 0),
    changedFiles: Number(pr.changed_files || 0),
    additions: Number(pr.additions || 0),
    deletions: Number(pr.deletions || 0),
    commits: Number(pr.commits || 0),
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    headSha: pr.head?.sha || "",
    baseSha: pr.base?.sha || "",
    author: pr.user?.login || "unknown",
    labels: (pr.labels || []).map((label) => label.name).filter((name): name is string => Boolean(name)),
    deliveryScore: scored.score,
    deliveryLabel: scored.deliveryLabel,
    evidence: scored.evidence,
  };
}