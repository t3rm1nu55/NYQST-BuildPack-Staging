'use client';

import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  LayoutDashboard,
  FolderKanban,
  FileText,
  Layers,
  Workflow,
  Settings,
  Play,
  Clock,
  GitCompare,
  Link2,
  BookOpen,
  Sparkles,
  Database,
  Shield,
  ChevronRight,
  ChevronDown,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

// Assumes shadcn/ui exists in your repo. Replace imports if your paths differ.
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type NavKey =
  | 'projects'
  | 'apps'
  | 'studio'
  | 'documents'
  | 'crm'
  | 'models'
  | 'dashboards'
  | 'workflows'
  | 'runs'
  | 'settings';

type AppType = 'VIEW' | 'AGENT' | 'ANALYSIS' | 'WORKFLOW';
type AppStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type RunStatus = 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

type AppCard = {
  id: string;
  name: string;
  type: AppType;
  status: AppStatus;
  description: string;
  inputsSummary: string;
  triggers: Array<'MANUAL' | 'SCHEDULE' | 'EVENT'>;
  lastRun?: { status: RunStatus; at: string };
};

type Project = {
  id: string;
  name: string;
  description: string;
  pinnedAppIds: string[];
};

type Bundle = {
  id: string;
  name: string;
  type: string;
  versions: { v: number; status: 'COMPLETED' | 'PROCESSING' | 'FAILED'; createdAt: string }[];
};

type CRMEntity = {
  id: string;
  type: 'COMPANY' | 'PERSON' | 'ASSET';
  name: string;
  tags: string[];
  lastUpdated: string;
};

type Model = {
  id: string;
  name: string;
  version: number;
  status: 'ACTIVE' | 'DRAFT';
  lastValidation: { status: 'PASS' | 'FAIL'; at: string };
};

type Dashboard = {
  id: string;
  name: string;
  tiles: number;
  lastRefresh: string;
};

type WorkflowDef = {
  id: string;
  name: string;
  triggers: string[];
  lastRun?: { status: RunStatus; at: string };
};

type Run = {
  id: string;
  name: string;
  kind: 'APP' | 'WORKFLOW' | 'INGEST' | 'VALIDATION';
  status: RunStatus;
  startedAt: string;
  duration: string;
  cost: string;
};

const nowish = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

const seedProjects: Project[] = [
  {
    id: 'prj_001',
    name: 'CRE Tech 2026',
    description: 'Commercial real estate technology tracking, vendor diligence, and dashboard refresh.',
    pinnedAppIds: ['app_lease_review', 'app_weekly_refresh', 'app_research_notebook'],
  },
  {
    id: 'prj_002',
    name: 'RegOps - UK',
    description: 'Regulatory obligations, evidence, and validation workflows.',
    pinnedAppIds: ['app_reg_mapper', 'app_vendor_dd'],
  },
];

const seedApps: AppCard[] = [
  {
    id: 'app_research_notebook',
    name: 'Research Notebook',
    type: 'AGENT',
    status: 'PUBLISHED',
    description: 'NotebookLM-style research assistant over web + project docs.',
    inputsSummary: 'Question, optional bundle(s), date range',
    triggers: ['MANUAL'],
    lastRun: { status: 'SUCCEEDED', at: '2026-02-19 16:12' },
  },
  {
    id: 'app_lease_review',
    name: 'Lease Review',
    type: 'ANALYSIS',
    status: 'PUBLISHED',
    description: 'Extract key terms + risks, generate evidence + insight candidates.',
    inputsSummary: 'Bundle (Lease Pack), focus questions',
    triggers: ['MANUAL', 'EVENT'],
    lastRun: { status: 'FAILED', at: '2026-02-18 10:03' },
  },
  {
    id: 'app_weekly_refresh',
    name: 'Weekly Regulatory Refresh',
    type: 'WORKFLOW',
    status: 'PUBLISHED',
    description: 'Weekly refresh → ingest → extract → validate → dashboard → notify.',
    inputsSummary: 'None (uses project defaults)',
    triggers: ['SCHEDULE'],
    lastRun: { status: 'SUCCEEDED', at: '2026-02-16 09:00' },
  },
  {
    id: 'app_vendor_dd',
    name: 'Vendor Due Diligence',
    type: 'AGENT',
    status: 'DRAFT',
    description: 'Run a diligence checklist and produce a report + evidence set.',
    inputsSummary: 'Company, bundle(s), scope',
    triggers: ['MANUAL'],
  },
  {
    id: 'app_reg_mapper',
    name: 'Obligation Mapper',
    type: 'ANALYSIS',
    status: 'PUBLISHED',
    description: 'Map obligations to controls, evidence, and model fields.',
    inputsSummary: 'Reg pack bundle(s), target model',
    triggers: ['MANUAL', 'EVENT'],
    lastRun: { status: 'RUNNING', at: '2026-02-20 09:41' },
  },
];

const seedBundles: Bundle[] = [
  {
    id: 'bun_001',
    name: 'Lease Pack - Riverside',
    type: 'Lease Pack',
    versions: [
      { v: 1, status: 'COMPLETED', createdAt: '2026-02-12 11:10' },
      { v: 2, status: 'PROCESSING', createdAt: '2026-02-20 09:10' },
    ],
  },
  {
    id: 'bun_002',
    name: 'Vendor Pack - RiskCo',
    type: 'Vendor Pack',
    versions: [{ v: 1, status: 'COMPLETED', createdAt: '2026-02-10 15:42' }],
  },
  {
    id: 'bun_003',
    name: 'Reg Pack - FCA Updates',
    type: 'Reg Pack',
    versions: [{ v: 1, status: 'FAILED', createdAt: '2026-02-18 08:00' }],
  },
];

const seedCRM: CRMEntity[] = [
  { id: 'crm_001', type: 'COMPANY', name: 'RiskCo', tags: ['vendor', 'security'], lastUpdated: '2026-02-18 12:03' },
  { id: 'crm_002', type: 'COMPANY', name: 'PropTechX', tags: ['cre-tech'], lastUpdated: '2026-02-19 09:22' },
  { id: 'crm_003', type: 'ASSET', name: 'Riverside Office', tags: ['asset', 'lease'], lastUpdated: '2026-02-12 11:30' },
];

const seedModels: Model[] = [
  { id: 'mdl_001', name: 'Lease Risk Model', version: 3, status: 'ACTIVE', lastValidation: { status: 'FAIL', at: '2026-02-20 09:15' } },
  { id: 'mdl_002', name: 'Vendor Risk Model', version: 2, status: 'ACTIVE', lastValidation: { status: 'PASS', at: '2026-02-19 18:40' } },
];

const seedDashboards: Dashboard[] = [
  { id: 'dsh_001', name: 'CRE Tech Trends', tiles: 12, lastRefresh: '2026-02-19 07:00' },
  { id: 'dsh_002', name: 'RegOps Exceptions', tiles: 8, lastRefresh: '2026-02-20 09:20' },
];

const seedWorkflows: WorkflowDef[] = [
  {
    id: 'wf_001',
    name: 'New Bundle Version → Re-extract → Validate → Notify',
    triggers: ['BUNDLE_VERSION_CREATED'],
    lastRun: { status: 'RUNNING', at: '2026-02-20 09:10' },
  },
  {
    id: 'wf_002',
    name: 'Weekly Refresh',
    triggers: ['SCHEDULE: 0 9 * * 1'],
    lastRun: { status: 'SUCCEEDED', at: '2026-02-16 09:00' },
  },
];

const seedRuns: Run[] = [
  { id: 'run_101', name: 'Lease Review (Riverside v2)', kind: 'APP', status: 'RUNNING', startedAt: '2026-02-20 09:11', duration: '00:04:12', cost: '$0.62' },
  { id: 'run_100', name: 'Weekly Refresh', kind: 'WORKFLOW', status: 'SUCCEEDED', startedAt: '2026-02-16 09:00', duration: '00:06:22', cost: '$1.48' },
  { id: 'run_099', name: 'Ingest Bundle (Lease Pack Riverside v1)', kind: 'INGEST', status: 'SUCCEEDED', startedAt: '2026-02-12 11:10', duration: '00:02:55', cost: '$0.00' },
];

function statusBadge(status: RunStatus) {
  const map: Record<RunStatus, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' }> = {
    RUNNING: { label: 'Running', icon: <CircleDot className="h-3.5 w-3.5" />, variant: 'secondary' },
    SUCCEEDED: { label: 'Succeeded', icon: <CheckCircle2 className="h-3.5 w-3.5" />, variant: 'default' },
    FAILED: { label: 'Failed', icon: <XCircle className="h-3.5 w-3.5" />, variant: 'destructive' },
    CANCELLED: { label: 'Cancelled', icon: <AlertTriangle className="h-3.5 w-3.5" />, variant: 'secondary' },
  };
  const v = map[status];
  return (
    <Badge variant={v.variant} className="gap-1">
      {v.icon}
      {v.label}
    </Badge>
  );
}

function appTypeBadge(t: AppType) {
  const label = t === 'AGENT' ? 'Agent' : t === 'ANALYSIS' ? 'Analysis' : t === 'WORKFLOW' ? 'Workflow' : 'View';
  return <Badge variant="secondary">{label}</Badge>;
}

function sectionTitle(title: string, subtitle?: string, actions?: React.ReactNode) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

function SidebarNav({ active, onSelect }: { active: NavKey; onSelect: (k: NavKey) => void }) {
  const items: Array<{ key: NavKey; label: string; icon: React.ReactNode }> = [
    { key: 'projects', label: 'Projects', icon: <FolderKanban className="h-4 w-4" /> },
    { key: 'apps', label: 'Apps', icon: <Sparkles className="h-4 w-4" /> },
    { key: 'studio', label: 'Studio', icon: <Layers className="h-4 w-4" /> },
    { key: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
    { key: 'crm', label: 'CRM', icon: <Database className="h-4 w-4" /> },
    { key: 'models', label: 'Models', icon: <Shield className="h-4 w-4" /> },
    { key: 'dashboards', label: 'Dashboards', icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: 'workflows', label: 'Workflows', icon: <Workflow className="h-4 w-4" /> },
    { key: 'runs', label: 'Runs', icon: <Play className="h-4 w-4" /> },
    { key: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="h-full w-64 border-r bg-background">
      <div className="p-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center font-semibold">N</div>
        <div className="leading-tight">
          <div className="font-semibold">NYQST</div>
          <div className="text-xs text-muted-foreground">Production mock</div>
        </div>
      </div>

      <div className="px-3">
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search…" />
        </div>
      </div>

      <div className="px-2 space-y-1">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onSelect(it.key)}
            className={[
              'w-full flex items-center gap-2 rounded px-3 py-2 text-sm',
              active === it.key ? 'bg-muted font-medium' : 'hover:bg-muted/60',
            ].join(' ')}
          >
            {it.icon}
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TopBar({
  project,
  onProjectChange,
}: {
  project: Project;
  onProjectChange: (id: string) => void;
}) {
  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Project</Badge>
        <Select value={project.id} onValueChange={onProjectChange}>
          <SelectTrigger className="w-[260px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {seedProjects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground hidden md:inline">{project.description}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary">
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
        <Button>Run App</Button>
      </div>
    </div>
  );
}

function ProjectsScreen({ project }: { project: Project }) {
  const pinnedApps = seedApps.filter((a) => project.pinnedAppIds.includes(a.id));
  return (
    <div className="p-6 space-y-6">
      {sectionTitle('Project home', 'Pinned apps, recent work, and attention needed.')}

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pinned Apps</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            {pinnedApps.map((a) => (
              <Card key={a.id} className="border">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{a.name}</div>
                    {appTypeBadge(a.type)}
                  </div>
                  <div className="text-sm text-muted-foreground">{a.description}</div>
                  <div className="flex items-center justify-between pt-2">
                    {a.lastRun ? statusBadge(a.lastRun.status) : <Badge variant="secondary">No runs</Badge>}
                    <Button size="sm" variant="secondary">Open</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attention required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Lease Risk Model validation failed</div>
                <div className="text-xs text-muted-foreground">2 rules failing, 3 stale insights</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Bundle v2 processing</div>
                <div className="text-xs text-muted-foreground">Lease Pack - Riverside (v2)</div>
              </div>
            </div>
            <Button className="w-full" variant="secondary">View queue</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {seedBundles.slice(0, 3).map((b) => (
              <div key={b.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-muted-foreground">{b.type} • {b.versions.length} versions</div>
                </div>
                <Button size="sm" variant="secondary">Open</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent runs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {seedRuns.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.kind} • {r.startedAt}</div>
                </div>
                {statusBadge(r.status)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AppsScreen({
  onSelectApp,
  selectedAppId,
}: {
  onSelectApp: (id: string) => void;
  selectedAppId?: string;
}) {
  const [filter, setFilter] = useState<'ALL' | AppType>('ALL');
  const apps = seedApps.filter((a) => (filter === 'ALL' ? true : a.type === filter));

  const selected = seedApps.find((a) => a.id === selectedAppId) ?? apps[0];

  return (
    <div className="p-6 grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 space-y-3">
        {sectionTitle('Apps', 'Configured units of work (Dify-style).', (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create App
          </Button>
        ))}
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="VIEW">View</SelectItem>
                <SelectItem value="AGENT">Agent</SelectItem>
                <SelectItem value="ANALYSIS">Analysis</SelectItem>
                <SelectItem value="WORKFLOW">Workflow</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <ScrollArea className="h-[640px] pr-2">
          <div className="space-y-2">
            {apps.map((a) => (
              <button
                key={a.id}
                onClick={() => onSelectApp(a.id)}
                className={[
                  'w-full text-left rounded border p-3 hover:bg-muted/40',
                  selected?.id === a.id ? 'bg-muted' : 'bg-background',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{a.name}</div>
                  {appTypeBadge(a.type)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{a.inputsSummary}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    {a.triggers.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                  {a.lastRun ? (
                    <span className="text-[10px] text-muted-foreground">{a.lastRun.at}</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">No runs</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {selected ? <AppDetail app={selected} /> : null}
      </div>
    </div>
  );
}

function AppDetail({ app }: { app: AppCard }) {
  const [runName, setRunName] = useState(`${app.name} run`);
  const [bundle, setBundle] = useState(seedBundles[0].id);
  const [question, setQuestion] = useState('What changed and what does it impact?');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{app.name}</CardTitle>
            <div className="text-sm text-muted-foreground">{app.description}</div>
            <div className="mt-2 flex items-center gap-2">
              {appTypeBadge(app.type)}
              <Badge variant={app.status === 'PUBLISHED' ? 'default' : 'secondary'}>{app.status}</Badge>
              {app.lastRun ? statusBadge(app.lastRun.status) : null}
            </div>
          </div>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Run now
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="run">
          <TabsList>
            <TabsTrigger value="run">Run</TabsTrigger>
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="runs">Runs</TabsTrigger>
            <TabsTrigger value="outputs">Outputs</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="run" className="pt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-sm">Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Run name</div>
                    <Input value={runName} onChange={(e) => setRunName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Bundle</div>
                    <Select value={bundle} onValueChange={setBundle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {seedBundles.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Question / focus</div>
                    <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="secondary">Context: project</Badge>
                    <Badge variant="secondary">Context: bundle</Badge>
                    <Badge variant="secondary">Web: optional</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader>
                  <CardTitle className="text-sm">Live progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">Plan created: 6 tasks</div>
                  <div className="space-y-2">
                    <ProgressRow label="Extracting deltas" status="RUNNING" />
                    <ProgressRow label="Rebuilding evidence" status="RUNNING" />
                    <ProgressRow label="Updating model fields" status="SUCCEEDED" />
                    <ProgressRow label="Refreshing dashboard tiles" status="PENDING" />
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Started {nowish()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border">
              <CardHeader>
                <CardTitle className="text-sm">Output preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm font-medium">Summary</div>
                <div className="text-sm text-muted-foreground">
                  Riverside Lease Pack v2 introduces changes in break clauses and rent review terms.
                  Evidence coverage is 87%. Two model rules failed due to conflicting clauses.
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary">
                    <Link2 className="h-4 w-4 mr-2" />
                    Pin to canvas
                  </Button>
                  <Button variant="secondary">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create notebook page
                  </Button>
                  <Button variant="secondary">
                    <GitCompare className="h-4 w-4 mr-2" />
                    Open diff
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configure" className="pt-4 space-y-4">
            <Card className="border">
              <CardContent className="p-4 space-y-2">
                <div className="font-medium">Configuration wizard (placeholder)</div>
                <div className="text-sm text-muted-foreground">
                  Inputs schema • Context pack • Engine selection • Outputs mapping • Triggers • Publish.
                </div>
                <Button variant="secondary">Open wizard</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="runs" className="pt-4">
            <Card className="border">
              <CardContent className="p-4 space-y-2">
                {seedRuns.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border-b last:border-b-0 py-2">
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.startedAt} • {r.duration} • {r.cost}</div>
                    </div>
                    {statusBadge(r.status)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outputs" className="pt-4">
            <Card className="border">
              <CardContent className="p-4 space-y-2">
                <div className="font-medium">Artifacts</div>
                <div className="text-sm text-muted-foreground">
                  Notebook page • Evidence set • Insight candidates • Model updates • Dashboard refresh.
                </div>
                <Button variant="secondary">Open outputs</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="pt-4">
            <Card className="border">
              <CardContent className="p-4 space-y-2">
                <div className="font-medium">Permissions (v1-lite)</div>
                <div className="text-sm text-muted-foreground">
                  Viewer (run) • Editor (edit config) • Admin (schedules/triggers).
                </div>
                <Button variant="secondary">Manage</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ProgressRow({ label, status }: { label: string; status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' }) {
  const icon =
    status === 'PENDING' ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> :
    status === 'RUNNING' ? <CircleDot className="h-4 w-4 text-muted-foreground" /> :
    status === 'SUCCEEDED' ? <CheckCircle2 className="h-4 w-4 text-muted-foreground" /> :
    <XCircle className="h-4 w-4 text-muted-foreground" />;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-sm">{label}</div>
      </div>
      <Badge variant={status === 'FAILED' ? 'destructive' : status === 'SUCCEEDED' ? 'default' : 'secondary'}>
        {status}
      </Badge>
    </div>
  );
}

function StudioScreen() {
  const blocks = [
    { id: 'b1', type: 'App Output', title: 'Lease Review Output', meta: 'run_101 • Riverside v2', },
    { id: 'b2', type: 'Evidence', title: 'Break clause change', meta: 'Lease Pack v2 • p.12', },
    { id: 'b3', type: 'Insight', title: 'Increased termination risk', meta: 'draft', },
    { id: 'b4', type: 'Model Field', title: 'LeaseRisk.break_clause_risk', meta: 'changed', },
    { id: 'b5', type: 'Diff', title: 'v1 ↔ v2 Extraction Delta', meta: '37 changes', },
  ];

  return (
    <div className="p-6 space-y-4">
      {sectionTitle('Studio', 'Notebook + infinite canvas. Pin outputs, diffs, evidence, and model fields.')}

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border">
          <CardHeader>
            <CardTitle className="text-base">Canvas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[520px] rounded border bg-muted/20 p-4 relative overflow-hidden">
              <div className="text-xs text-muted-foreground mb-3">Mock canvas — blocks are positioned arbitrarily.</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {blocks.map((b) => (
                  <Card key={b.id} className="border bg-background/80">
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground">{b.type}</div>
                      <div className="font-medium">{b.title}</div>
                      <div className="text-xs text-muted-foreground">{b.meta}</div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="secondary">Inspect</Button>
                        <Button size="sm" variant="secondary">Link</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">Inspector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">Selected</div>
              <div className="font-medium">Lease Review Output</div>
              <div className="text-xs text-muted-foreground">Linked to run_101</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Provenance</div>
              <div className="text-sm flex items-center gap-1">
                <ChevronDown className="h-4 w-4" />
                Bundle v2 → ingest run → extraction → evidence → insight → model update
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Actions</div>
              <Button className="w-full" variant="secondary">Open run</Button>
              <Button className="w-full" variant="secondary">Pin diff</Button>
              <Button className="w-full" variant="secondary">Create insight</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DocumentsScreen() {
  return (
    <div className="p-6 space-y-6">
      {sectionTitle('Documents', 'Bundles, versions, ingest, and diffs.', (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Upload bundle
        </Button>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bundles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {seedBundles.map((b) => (
            <div key={b.id} className="border rounded p-3 flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{b.name}</div>
                <div className="text-xs text-muted-foreground">{b.type}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {b.versions.map((v) => (
                    <Badge key={v.v} variant="secondary">
                      v{v.v} • {v.status}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Open</Button>
                <Button variant="secondary">
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function CRMScreen() {
  return (
    <div className="p-6 space-y-6">
      {sectionTitle('CRM', 'Entities, relationships, timeline, linked evidence and insights.', (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New entity
        </Button>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {seedCRM.map((e) => (
            <div key={e.id} className="border rounded p-3 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{e.type}</Badge>
                  <div className="font-medium">{e.name}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {e.tags.join(' • ')} • updated {e.lastUpdated}
                </div>
              </div>
              <Button variant="secondary">Open</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ModelsScreen() {
  return (
    <div className="p-6 space-y-6">
      {sectionTitle('Models', 'Domain models, rules, validation runs, and impact diffs.', (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New model
        </Button>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Model registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {seedModels.map((m) => (
            <div key={m.id} className="border rounded p-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">v{m.version} • {m.status}</div>
                <div className="mt-2">
                  <Badge variant={m.lastValidation.status === 'PASS' ? 'default' : 'destructive'}>
                    Last validation: {m.lastValidation.status} • {m.lastValidation.at}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Open</Button>
                <Button variant="secondary">Validate</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardsScreen() {
  return (
    <div className="p-6 space-y-6">
      {sectionTitle('Dashboards', 'Provenance-first KPIs and exception drilldowns.', (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New dashboard
        </Button>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dashboards</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          {seedDashboards.map((d) => (
            <Card key={d.id} className="border">
              <CardContent className="p-4 space-y-2">
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-muted-foreground">{d.tiles} tiles • refreshed {d.lastRefresh}</div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="secondary">Open</Button>
                  <Button size="sm" variant="secondary">Refresh</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function WorkflowsScreen() {
  return (
    <div className="p-6 space-y-6">
      {sectionTitle('Workflows', 'Automation builder (n8n-like) with triggers and run logs.', (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New workflow
        </Button>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workflow list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {seedWorkflows.map((w) => (
            <div key={w.id} className="border rounded p-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{w.name}</div>
                <div className="text-xs text-muted-foreground">Triggers: {w.triggers.join(' • ')}</div>
                <div className="mt-2">{w.lastRun ? statusBadge(w.lastRun.status) : <Badge variant="secondary">No runs</Badge>}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Builder</Button>
                <Button variant="secondary">Run</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RunsScreen() {
  return (
    <div className="p-6 space-y-6">
      {sectionTitle('Runs', 'Audit logs for apps, workflows, ingest pipelines, and validations.')}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent runs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {seedRuns.map((r) => (
            <div key={r.id} className="border rounded p-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">
                  {r.kind} • {r.startedAt} • {r.duration} • {r.cost}
                </div>
              </div>
              <Button variant="secondary">Open</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsScreen() {
  return (
    <div className="p-6 space-y-6">
      {sectionTitle('Settings', 'Project settings, permissions, integrations, and environment.')}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="font-medium">Integrations (placeholder)</div>
          <div className="text-sm text-muted-foreground">LLM providers • Web search • Storage • Billing • SSO.</div>
          <Button variant="secondary">Configure</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NyqstPortalMockupV2() {
  const [active, setActive] = useState<NavKey>('projects');
  const [projectId, setProjectId] = useState(seedProjects[0].id);
  const [selectedAppId, setSelectedAppId] = useState(seedApps[0].id);

  const project = useMemo(
    () => seedProjects.find((p) => p.id === projectId) ?? seedProjects[0],
    [projectId],
  );

  let content: React.ReactNode = null;

  if (active === 'projects') content = <ProjectsScreen project={project} />;
  if (active === 'apps') content = <AppsScreen selectedAppId={selectedAppId} onSelectApp={setSelectedAppId} />;
  if (active === 'studio') content = <StudioScreen />;
  if (active === 'documents') content = <DocumentsScreen />;
  if (active === 'crm') content = <CRMScreen />;
  if (active === 'models') content = <ModelsScreen />;
  if (active === 'dashboards') content = <DashboardsScreen />;
  if (active === 'workflows') content = <WorkflowsScreen />;
  if (active === 'runs') content = <RunsScreen />;
  if (active === 'settings') content = <SettingsScreen />;

  return (
    <div className="h-screen w-screen flex">
      <SidebarNav active={active} onSelect={setActive} />
      <div className="flex-1 flex flex-col">
        <TopBar project={project} onProjectChange={setProjectId} />
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    </div>
  );
}

