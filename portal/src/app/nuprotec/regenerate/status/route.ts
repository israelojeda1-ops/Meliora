import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { getClient } from "@/lib/clients";

type GhStep = {
  name: string;
  status: string;
  conclusion: string | null;
};

type GhJob = {
  steps?: GhStep[];
};

type GhWorkflowRun = {
  created_at: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  jobs_url: string;
};

export async function GET(req: NextRequest) {
  const client = getClient("nuprotec");
  if (!client || !client.repo.workflowFile) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session || session.client !== client.slug) {
    return NextResponse.json({ found: false }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { found: false, error: "GITHUB_TOKEN no configurado" },
      { status: 500 }
    );
  }

  const since = req.nextUrl.searchParams.get("since");
  if (!since) {
    return NextResponse.json({ found: false });
  }

  const sinceMs = new Date(since).getTime() - 30_000;
  const runsUrl = `https://api.github.com/repos/${client.repo.owner}/${client.repo.name}/actions/workflows/${client.repo.workflowFile}/runs?event=workflow_dispatch&per_page=5`;

  const runsRes = await fetch(runsUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  if (!runsRes.ok) {
    return NextResponse.json(
      { found: false, error: `GitHub respondió ${runsRes.status}` },
      { status: 502 }
    );
  }

  const runsData = (await runsRes.json()) as { workflow_runs: GhWorkflowRun[] };
  const run = runsData.workflow_runs.find(
    (r) => new Date(r.created_at).getTime() >= sinceMs
  );

  if (!run) {
    return NextResponse.json({ found: false });
  }

  let steps: GhStep[] = [];
  const jobsRes = await fetch(run.jobs_url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  if (jobsRes.ok) {
    const jobsData = (await jobsRes.json()) as { jobs: GhJob[] };
    steps = jobsData.jobs[0]?.steps ?? [];
  }

  return NextResponse.json({
    found: true,
    status: run.status,
    conclusion: run.conclusion,
    html_url: run.html_url,
    steps,
  });
}
