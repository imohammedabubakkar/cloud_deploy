import { useEffect, useState, type ReactNode } from "react";
import { accountApi, activityApi, adminApi, applicationApi, deploymentApi, settingsApi, teamApi } from "./api";

type IconName =
  | "grid" | "box" | "rocket" | "pulse" | "activity" | "users" | "settings"
  | "help" | "logout" | "search" | "bell" | "chevron" | "plus" | "menu"
  | "check" | "x" | "clock" | "git" | "more" | "eye" | "terminal"
  | "refresh" | "copy" | "download" | "shield" | "server" | "database"
  | "cloud" | "key" | "arrow" | "filter" | "code";

const paths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  box: <><path d="m21 8-9 5-9-5 9-5 9 5Z"/><path d="m3 8 9 5 9-5M12 13v9M21 8v9l-9 5-9-5V8"/></>,
  rocket: <><path d="M4.5 16.5c-1.3 1-1.8 3.5-1.8 3.5s2.5-.5 3.5-1.8c.6-.8.6-2-.1-2.7-.7-.7-1.9-.7-2.6 0Z"/><path d="m9 15-3-3s3.5-6.5 9-8.5c3.5-1.3 5.5-.5 5.5-.5s.8 2-.5 5.5C18 14 11.5 17.5 11.5 17.5L9 15Z"/><circle cx="15.5" cy="8.5" r="2"/><path d="M9 15H5l-3-3 5-2M11.5 17.5l-2 4.5 3-1.5 1.5-4"/></>,
  pulse: <path d="M3 12h4l2.5-7 5 14 2.5-7h4"/>,
  activity: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/><path d="M2 19h22"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1-1.55V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.55 1H21v4h-.08a1.7 1.7 0 0 0-1.52 1Z"/></>,
  help: <><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.5 1.7c-.9 1.2-2.6 1.3-2.6 3.3M12 18h.01"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M14 21h-4"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  x: <path d="M18 6 6 18M6 6l12 12"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  git: <><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 8v8a2 2 0 0 0 2 2h8M18 16V9a3 3 0 0 0-3-3H8"/></>,
  more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
  terminal: <><path d="m4 7 4 4-4 4M11 17h7"/><rect x="2" y="3" width="20" height="18" rx="2"/></>,
  refresh: <><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
  download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 19h16"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
  server: <><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/></>,
  cloud: <path d="M17.5 19H6a4 4 0 0 1-.5-8A6.5 6.5 0 0 1 18 9a5 5 0 0 1-.5 10Z"/>,
  key: <><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l3 3"/></>,
  arrow: <path d="m5 12 4 4L19 6"/>,
  filter: <path d="M4 5h16M7 12h10M10 19h4"/>,
  code: <path d="m8 9-3 3 3 3m8-6 3 3-3 3m-5 3 2-12"/>,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
}

function Button({ children, variant = "primary", icon, onClick, className = "" }: { children?: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; icon?: IconName; onClick?: () => void; className?: string }) {
  return <button className={`btn btn-${variant} ${className}`} onClick={onClick}>{icon && <Icon name={icon} size={16}/>} {children}</button>;
}

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "danger" | "warning" | "info" | "neutral" }) {
  return <span className={`badge badge-${tone}`}><span className="badge-dot"/>{children}</span>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function Avatar({ initials = "MK", small = false }: { initials?: string; small?: boolean }) {
  return <span className={`avatar ${small ? "avatar-sm" : ""}`}>{initials}</span>;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo"><span className="logo-mark"><Icon name="cloud" size={20}/></span>{!compact && <span>CloudDeploy<span>X</span></span>}</div>;
}

const nav = [
  ["Dashboard", "grid"], ["Applications", "box"], ["Deployments", "rocket"],
  ["Monitoring", "pulse"], ["Activity Logs", "activity"], ["Users", "users"], ["Team", "users"], ["Settings", "settings"],
] as [string, IconName][];

type Application = {
  id?: string;
  name: string;
  desc: string;
  repo: string;
  branch: string;
  version: string;
  env: string;
  owner: string;
  ownerUsername?: string;
  approvalStatus?: "PENDING" | "ASSIGNED" | "DEPLOYED";
  assignedTeam?: string;
  initials: string;
  tone: string;
};

type DeploymentRecord = {
  id: string;
  displayId: string;
  applicationId: string;
  applicationName: string;
  ownerUsername: string;
  version: string;
  environment: string;
  status: "IN_PROGRESS" | "SUCCESS" | "FAILED";
  duration: string;
  deployedBy: string;
  createdAt: string;
  completedAt?: string;
};

type AuthSession = {
  role: "USER" | "ADMIN" | "TEAM";
  name: string;
  username: string;
  application?: string;
  environment?: string;
};

type UserAccount = {
  name: string;
  dateOfBirth: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt?: string;
};

type ActivityEvent = {
  id: string;
  actor: string;
  action: string;
  resource: string;
  environment: string;
  timestamp: string;
};

type GlobalSearchResult = {
  key: string;
  label: string;
  description: string;
  icon: IconName;
  select: () => void;
};

async function hashPassword(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function PageHeader({ title, description, action, onAction }: { title: string; description: string; action?: string; onAction?: () => void }) {
  return <div className="page-header"><div><div className="eyebrow">Workspace / {title}</div><div className="page-title">{title}</div><div className="page-desc">{description}</div></div>{action && <Button icon="plus" onClick={onAction}>{action}</Button>}</div>;
}

function MiniChart({ color = "blue", bars = false }: { color?: string; bars?: boolean }) {
  if (bars) return <div className="bars">{[38,54,41,70,60,82,68,88,76,94,72,84].map((h,i)=><span key={i} style={{height:`${h}%`}} className={i === 9 ? "bar-active" : ""}/>)}</div>;
  return <svg className={`mini-chart chart-${color}`} viewBox="0 0 160 44" preserveAspectRatio="none"><path d="M0 37 C15 34,18 24,32 27 S49 35,63 21 S82 29,96 17 S115 24,128 11 S146 14,160 5" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M0 37 C15 34,18 24,32 27 S49 35,63 21 S82 29,96 17 S115 24,128 11 S146 14,160 5 V44 H0Z" fill="currentColor" opacity=".08"/></svg>;
}

function EmptyState({ icon, title, description, action, onAction }: { icon: IconName; title: string; description: string; action?: string; onAction?: () => void }) {
  return <div className="empty-state"><span><Icon name={icon} size={24}/></span><strong>{title}</strong><small>{description}</small>{action && <Button icon="plus" onClick={onAction}>{action}</Button>}</div>;
}

function Dashboard({ applications, deployments, openCreate, openApp, go, hasDeployment = false }: { applications: Application[]; deployments: DeploymentRecord[]; openCreate: () => void; openApp: (app: Application) => void; go: (p:string)=>void; hasDeployment?: boolean }) {
  const stats = [
    ["Total Applications",String(applications.length),"Added by you","box","blue"],["Active Deployments",hasDeployment?"1":"0",hasDeployment?"Production":"No active deployments","rocket","violet"],
    ["Successful",hasDeployment?"1":"0",hasDeployment?"Latest deployment":"No deployment data","check","green"],["Failed","0","No failed deployments","x","red"],
  ] as [string,string,string,IconName,string][];
  return <><PageHeader title="Good morning, Mohammed" description="Here’s an overview of your applications and deployments." action="New Application" onAction={openCreate}/>
    <div className="stat-grid stat-grid-empty">{stats.map(([label,value,change,icon,tone])=><Card key={label} className="stat-card"><div className={`stat-icon stat-${tone}`}><Icon name={icon}/></div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-foot"><span className="muted">{change}</span></div></Card>)}</div>
    <Card className="dashboard-empty"><div className="card-head table-head"><div><div className="section-title">Your applications</div><div className="section-sub">Applications in the selected environment.</div></div><Button variant="secondary" onClick={()=>go("Applications")}>View applications</Button></div>{applications.length === 0
      ? <EmptyState icon="box" title="No applications in this environment" description="Choose another environment or create an application here." action="Create application" onAction={openCreate}/>
      : <div className="dashboard-app-list">{applications.map(app=>{const status=app.approvalStatus||"PENDING";return <div className="dashboard-app-row" key={`${app.id||app.name}-${app.ownerUsername||app.owner}`}><span className={`app-logo logo-${app.tone}`}>{app.initials}</span><div className="dashboard-app-info"><strong>{app.name}</strong><small>{app.repo||"No repository connected"} | {app.env}</small></div><Badge tone={status==="DEPLOYED"?"success":status==="ASSIGNED"?"info":"warning"}>{status==="DEPLOYED"?"Deployed":status==="ASSIGNED"?"Assigned":"Pending review"}</Badge><Button variant="secondary" icon="eye" onClick={()=>openApp(app)}>Open</Button></div>})}</div>}
    </Card>
    <DeploymentTable title="Recent deployments" go={go} deployments={deployments.slice(0, 5)} hasData={hasDeployment}/></>;
}

function DeploymentTable({ title = "Deployment history", go, deployments, hasData = false }: { title?: string; go:(p:string)=>void; deployments:DeploymentRecord[]; hasData?: boolean }) {
  const rows = deployments.map(item => [item.displayId, item.applicationName, item.version, item.environment, item.status, item.duration || "—", item.deployedBy, new Date(item.completedAt || item.createdAt).toLocaleString()]);
  return <Card className="table-card"><div className="card-head table-head"><div><div className="section-title">{title}</div><div className="section-sub">Track and manage application deployments.</div></div>{title === "Recent deployments" && <Button variant="secondary" onClick={()=>go("Deployments")}>View all</Button>}</div>{!hasData?<EmptyState icon="rocket" title="No deployments yet" description="Deploy an application and its status and history will appear here."/>:<div className="table-scroll"><table><thead><tr><th>Deployment ID</th><th>Application</th><th>Version</th><th>Environment</th><th>Status</th><th>Duration</th><th>Deployed By</th><th>Date</th><th/></tr></thead><tbody>{rows.map(r=><tr key={r[0]}><td><strong>{r[0]}</strong></td><td><div className="app-cell"><span className="app-mini">{r[1].slice(0,2).toUpperCase()}</span><strong>{r[1]}</strong></div></td><td><code>{r[2]}</code></td><td>{r[3]}</td><td><Badge tone={r[4]==="SUCCESS"?"success":r[4]==="FAILED"?"danger":"info"}>{r[4]}</Badge></td><td>{r[5]}</td><td>{r[6]}</td><td className="muted">{r[7]}</td><td><Button variant="ghost" icon="more" onClick={()=>go("Deployment #1048")}/></td></tr>)}</tbody></table></div>}</Card>;
}

function Applications({ applications, openCreate, openApp, deployApp, openTeam, role, canCreate = true }: { applications: Application[]; openCreate:()=>void; openApp:(app: Application)=>void; deployApp:(app:Application)=>void; openTeam:()=>void; role?:AuthSession["role"]; canCreate?:boolean }) {
  const [grid, setGrid] = useState(true);
  return <><PageHeader title="Applications" description={role==="USER"?"Create applications and submit them for administrator assignment.":role==="TEAM"?"Applications assigned to your deployment team.":"Review, assign, and manage submitted applications."} action={canCreate?"New Application":undefined} onAction={openCreate}/><div className="toolbar"><div className="search-field"><Icon name="search"/><input placeholder="Search applications..."/></div><Button variant="secondary" icon="filter">Filters</Button><div className="view-toggle"><button className={grid?"active":""} onClick={()=>setGrid(true)}><Icon name="grid"/></button><button className={!grid?"active":""} onClick={()=>setGrid(false)}><Icon name="activity"/></button></div></div>{applications.length===0?<Card><EmptyState icon="box" title="No applications available" description={canCreate?"Create an application and submit it to an administrator.":"No application has been assigned to your team account."} action={canCreate?"New Application":undefined} onAction={openCreate}/></Card>:<div className={grid?"apps-grid":"apps-list"}>{applications.map(app=>{const status=app.approvalStatus||"PENDING";return <Card className="app-card" key={`${app.name}-${app.ownerUsername}`}><div className="app-top"><span className={`app-logo logo-${app.tone}`}>{app.initials}</span><Badge tone={status==="DEPLOYED"?"success":status==="ASSIGNED"?"info":"warning"}>{status==="DEPLOYED"?"Deployed":status==="ASSIGNED"?"Assigned":"Pending review"}</Badge></div><div className="app-name">{app.name}</div><div className="app-desc">{app.desc||"No description added"}</div><div className="repo"><Icon name="git" size={15}/>{app.repo||"No repository connected"}</div><div className="app-meta"><span><small>ENVIRONMENT</small>{app.env}</span><span><small>VERSION</small><code>{app.version}</code></span><span><small>OWNER</small>{app.owner}</span></div>{role==="USER"&&status!=="DEPLOYED"&&<div className="submission-note"><Icon name="clock" size={14}/>Submitted to admin for team assignment</div>}<div className="app-actions"><Button variant="secondary" icon="eye" onClick={()=>openApp(app)}>Open</Button>{role==="ADMIN"&&status==="PENDING"&&<Button variant="secondary" icon="users" onClick={openTeam}>Assign Team</Button>}{role!=="USER"&&<Button icon="rocket" onClick={()=>deployApp(app)}>Deploy</Button>}</div></Card>})}</div>}</>;
}

function Deployments({ go, deployments }: { go:(p:string)=>void; deployments:DeploymentRecord[] }) {
  return <><PageHeader title="Deployment History" description="Only deployments processed through this workspace are shown."/><div className="filters"><div className="search-field"><Icon name="search"/><input placeholder="Search deployments..."/></div>{["All applications","All environments","All statuses","Last 30 days"].map(x=><select key={x}><option>{x}</option></select>)}</div><DeploymentTable go={go} deployments={deployments} hasData={deployments.length>0}/></>;
}

function Monitoring({ app, hasData }: { app:Application|null; hasData:boolean }) {
  const metrics=[["CPU Usage","42%","pulse","blue"],["Memory Usage","61%","server","violet"],["Requests","1,248/min","activity","green"],["Error Rate","0.12%","x","red"],["Avg. Response","184 ms","clock","amber"]];
  if(!app||!hasData) return <><PageHeader title="Monitoring" description="Monitor application performance and infrastructure health."/><Card><EmptyState icon="pulse" title="No monitoring data" description="Metrics will appear after you deploy an application."/></Card></>;
  return <><PageHeader title="Monitoring" description={`Live performance and infrastructure health for ${app.name}.`}/><div className="monitor-bar"><div><span className="health-pulse"/>All systems operational</div><select defaultValue={app.env}><option>Development</option><option>Staging</option><option>Production</option></select></div><div className="health-summary">{[["API","server"],["Database","database"],["Redis","database"],["Kubernetes","cloud"],["AWS","cloud"]].map(([n,i])=><Card key={n}><span className="health-icon"><Icon name={i as IconName}/></span><span><strong>{n}</strong><small><i/>Healthy</small></span></Card>)}</div><div className="monitor-grid">{metrics.map(([a,b,c,d])=><Card className="monitor-card" key={a}><div className="monitor-head"><span>{a}</span><span className={`stat-icon stat-${d}`}><Icon name={c as IconName}/></span></div><strong>{b}</strong><small className="up">Within normal range</small><MiniChart color={d}/></Card>)}</div><div className="monitor-charts"><Card><div className="card-head"><div><div className="section-title">Performance metrics</div><div className="section-sub">CPU, memory, requests and response time</div></div><div className="segmented"><span>1H</span><span>6H</span><span className="active">24H</span><span>7D</span><span>30D</span></div></div><div className="performance-chart"><MiniChart color="blue"/><MiniChart color="violet"/></div><div className="legend"><span><i className="legend-success"/>CPU usage</span><span><i className="legend-violet"/>Memory usage</span></div></Card><Card><div className="section-title">Resource utilization</div><div className="resource-list">{[["Pod count","3 / 3 healthy",100],["CPU","42%",42],["Memory","61%",61],["Network","1.8 GB",54],["Storage","38%",38]].map(([n,v,w])=><div key={n as string}><span><strong>{n}</strong><small>{v}</small></span><i><b style={{width:`${w}%`}}/></i></div>)}</div></Card></div></>;
}

function Logs({ app, hasData }: { app:Application|null; hasData:boolean }) {
  const entries=[["2026-10-03 18:32:11","INFO","Application started"],["2026-10-03 18:32:16","INFO","Database connection established"],["2026-10-03 18:32:22","INFO","Redis connection established"],["2026-10-03 18:33:10","INFO","Deployment started"],["2026-10-03 18:34:05","WARN","High memory usage"],["2026-10-03 18:35:15","ERROR","Database connection timeout"]];
  if(!app||!hasData) return <><PageHeader title="Application Logs" description="Search and analyze application logs in real time."/><Card><EmptyState icon="terminal" title="No logs available" description="Logs will appear after an application has been deployed."/></Card></>;
  return <><PageHeader title="Application Logs" description="Search and analyze application logs in real time."/><div className="filters log-filters"><select><option>{app.name}</option></select><select><option>{app.env}</option></select><select><option>All levels</option><option>INFO</option><option>WARN</option><option>ERROR</option><option>DEBUG</option></select><div className="search-field"><Icon name="search"/><input placeholder="Search logs..."/></div></div><Card className="log-panel"><div className="log-toolbar"><div><span className="terminal-dots"><i/><i/><i/></span><strong>{app.name.toLowerCase().replaceAll(" ","-")} / {app.env.toLowerCase()}</strong><Badge tone="success">Live</Badge></div><div><Button variant="ghost" icon="copy">Copy</Button><Button variant="ghost" icon="download">Download</Button><Button variant="ghost" icon="x">Clear</Button></div></div><div className="logs">{entries.map(([time,level,msg])=><div className={`log-line log-${level.toLowerCase()}`} key={time}><span>{time}</span><b>{level}</b><strong>{msg}</strong><small>service={app.name.toLowerCase().replaceAll(" ","-")}</small></div>)}</div><div className="terminal-footer"><span>Auto refresh</span><input type="checkbox" defaultChecked/><span>Live mode enabled</span></div></Card></>;
}

function ActivityLogs() {
  const [events,setEvents]=useState<ActivityEvent[]>([]), [query,setQuery]=useState(""), [error,setError]=useState("");
  useEffect(()=>{activityApi.list().then(({events})=>{setEvents(events as unknown as ActivityEvent[]);setError("")}).catch(reason=>setError(reason instanceof Error?reason.message:"Unable to load activity."))},[]);
  const normalizedQuery=query.trim().toLowerCase();
  const filteredEvents=normalizedQuery?events.filter(event=>[event.actor,event.action,event.resource,event.environment].some(value=>value?.toLowerCase().includes(normalizedQuery))):events;
  const formatTimestamp=(timestamp:string)=>{const date=new Date(timestamp);return Number.isNaN(date.getTime())?"—":date.toLocaleString()};
  return <><PageHeader title="Activity Logs" description="Track real user and system activity across CloudDeployX."/><div className="filters"><div className="search-field"><Icon name="search"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search activity..."/></div></div><Card className="table-card">{error?<EmptyState icon="activity" title="Unable to load activity" description={error}/>:filteredEvents.length===0?<EmptyState icon="activity" title={query?"No matching activity":"No activity yet"} description={query?"Try a different search term.":"Real workspace actions will appear here as they occur."}/>:<div className="table-scroll"><table><thead><tr><th>User</th><th>Action</th><th>Resource</th><th>Environment</th><th>Timestamp</th></tr></thead><tbody>{filteredEvents.map(event=><tr key={event.id}><td><div className="user-cell"><Avatar initials={event.actor.split(" ").map(part=>part[0]).join("").slice(0,2).toUpperCase()} small/><strong>{event.actor}</strong></div></td><td>{event.action}</td><td><strong>{event.resource}</strong></td><td>{event.environment||"—"}</td><td className="muted">{formatTimestamp(event.timestamp)}</td></tr>)}</tbody></table></div>}</Card></>;
}

function Users({ users, error, onDelete }: { users:UserAccount[]; error:string; onDelete:(username:string,name:string)=>Promise<void> }) {
  const [selectedUser,setSelectedUser]=useState<UserAccount|null>(null);
  return <><PageHeader title="Registered Users" description="View every account created through user registration."/><div className="metric-strip users-metrics"><Card><span className="metric-icon"><Icon name="users"/></span><span><small>Total Registered Users</small><strong>{users.length}</strong></span></Card></div>{error?<Card><EmptyState icon="users" title="Unable to load users" description={error}/></Card>:<Card className="table-card">{users.length===0?<EmptyState icon="users" title="No registered users" description="New user registrations will appear here automatically."/>:<div className="table-scroll"><table><thead><tr><th>User</th><th>Username</th><th>Email</th><th>Date of Birth</th><th>Registered</th><th>Actions</th></tr></thead><tbody>{users.map(user=><tr key={user.username}><td><div className="user-cell"><Avatar initials={user.name.split(" ").map(part=>part[0]).join("").slice(0,2).toUpperCase()}/><strong>{user.name}</strong></div></td><td><code>@{user.username}</code></td><td>{user.email}</td><td>{user.dateOfBirth||"—"}</td><td className="muted">{user.createdAt?new Date(user.createdAt).toLocaleDateString():"—"}</td><td><Button variant="danger" onClick={()=>setSelectedUser(user)}>Delete</Button></td></tr>)}</tbody></table></div>}</Card>}{selectedUser&&<div className="modal-backdrop"><Card className="modal modal-small"><div className="modal-head"><div className="modal-icon danger"><Icon name="x"/></div><Button variant="ghost" icon="x" onClick={()=>setSelectedUser(null)}/></div><div className="section-title">Delete User</div><div className="section-sub">Permanently delete <strong>{selectedUser.name}</strong> and their login account?</div><div className="modal-actions"><Button variant="secondary" onClick={()=>setSelectedUser(null)}>Cancel</Button><Button variant="danger" onClick={async()=>{await onDelete(selectedUser.username,selectedUser.name);setSelectedUser(null)}}>Delete User</Button></div></Card></div>}</>;
}
function Team({ applications, assignApplication }: { applications:Application[]; assignApplication:(applicationName:string,environment:string,teamUsername:string)=>Promise<void> }) {
  type TeamMember={name:string;email:string;username?:string;passwordHash?:string;role:"DEVELOPER";status:string;lastActive:string;deploymentAccess?:string;environment?:string};
  const environmentOptions=["Production","Development","Staging"];
  const [invite,setInvite]=useState(false), [email,setEmail]=useState(""), [username,setUsername]=useState(""), [temporaryPassword,setTemporaryPassword]=useState(""), [environment,setEnvironment]=useState("Production"), [deploymentAccess,setDeploymentAccess]=useState(""), [teamError,setTeamError]=useState("");
  const [members,setMembers]=useState<TeamMember[]>([]);
  useEffect(()=>{teamApi.list().then(({members})=>setMembers(members as TeamMember[])).catch(error=>setTeamError(error.message))},[]);
  const availableApplications=applications.filter(application=>application.env===environment);
  const openInvite=()=>{setInvite(true);setEmail("");setUsername("");setTemporaryPassword("");setEnvironment("Production");setDeploymentAccess("");setTeamError("")};
  const closeInvite=()=>{setInvite(false);setTeamError("")};
  const inviteMember=async()=>{
    const cleanEmail=email.trim().toLowerCase(), cleanUsername=username.trim().toLowerCase();
    if(!cleanEmail||!cleanUsername){setTeamError("Email and username are required.");return}
    if(!/^\S+@\S+\.\S+$/.test(cleanEmail)){setTeamError("Enter a valid email address.");return}
    if(temporaryPassword.length<6){setTeamError("Temporary password must contain at least 6 characters.");return}
    if(!deploymentAccess){setTeamError(`Select a ${environment} application for deployment access.`);return}
    if(members.some(member=>member.username?.toLowerCase()===cleanUsername)){setTeamError("This team username has already been used.");return}
    if(members.some(member=>member.email.toLowerCase()===cleanEmail)){setTeamError("This team email has already been used.");return}
    const rawName=cleanEmail.split("@")[0].replace(/[._-]+/g," ");
    const name=rawName.replace(/\b\w/g,character=>character.toUpperCase());
    const passwordHash=await hashPassword(temporaryPassword);
    try {
      const { member } = await teamApi.invite({name,email:cleanEmail,username:cleanUsername,passwordHash,role:"DEVELOPER",status:"Invited",lastActive:"Never",deploymentAccess,environment});
      await assignApplication(deploymentAccess,environment,cleanUsername);
      setMembers(current=>[...current,member as TeamMember]);
      closeInvite();
    } catch (error) {
      setTeamError(error instanceof Error?error.message:"Unable to invite team member.");
    }
  };
  const assignedApplications=new Set(members.map(member=>`${member.deploymentAccess}-${member.environment}`).filter(Boolean)).size;
  const stats=[["Total Members",members.length,"users"],["Developers",members.length,"code"],["Assigned Applications",assignedApplications,"rocket"]] as [string,number,IconName][];
  return <>
    <PageHeader title="Team Members" description="Manage developer access to application deployments." action="Invite Member" onAction={openInvite}/>
    <div className="metric-strip team-metrics">{stats.map(([label,value,icon])=><Card key={label}><span className="metric-icon"><Icon name={icon}/></span><span><small>{label}</small><strong>{value}</strong></span></Card>)}</div>
    <Card className="table-card">{members.length===0?<EmptyState icon="users" title="No developers added" description="Invite your first developer and assign an application." action="Invite Member" onAction={openInvite}/>:<div className="table-scroll"><table><thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Environment</th><th>Deployment Access</th><th>Status</th><th>Last Active</th><th>Actions</th></tr></thead><tbody>{members.map(member=><tr key={member.email}><td><div className="user-cell"><Avatar initials={member.name.split(" ").map(x=>x[0]).join("").slice(0,2)}/><strong>{member.name}</strong></div></td><td>{member.email}</td><td><Badge tone="neutral">Developer</Badge></td><td>{member.environment||"—"}</td><td>{member.deploymentAccess?<div className="access-cell"><Icon name="rocket" size={14}/><span>{member.deploymentAccess}</span></div>:<span className="muted">—</span>}</td><td><Badge tone="warning">{member.status}</Badge></td><td className="muted">{member.lastActive}</td><td><Button variant="danger" onClick={async()=>{if(member.username){await teamApi.remove(member.username);setMembers(current=>current.filter(item=>item.username!==member.username))}}}>Remove</Button></td></tr>)}</tbody></table></div>}</Card>
    {invite&&<div className="modal-backdrop"><Card className="modal modal-small"><div className="modal-head"><div><div className="section-title">Invite Team Member</div><div className="section-sub">Assign environment-specific deployment access to a developer.</div></div><Button variant="ghost" icon="x" onClick={closeInvite}/></div><div className="form-stack"><label>Email<input type="email" value={email} onChange={event=>{setEmail(event.target.value);setTeamError("")}} placeholder="teammate@company.com"/><small>Email addresses can only be used once.</small></label><div className="form-grid"><label>Username<input value={username} onChange={event=>{setUsername(event.target.value);setTeamError("")}} placeholder="team.username"/><small>Usernames can only be used once.</small></label><label>Temporary Password<input type="password" value={temporaryPassword} onChange={event=>{setTemporaryPassword(event.target.value);setTeamError("")}} placeholder="Minimum 6 characters"/></label></div><label>Role<div className="fixed-field">Developer</div></label><label>Environment<select value={environment} onChange={event=>{setEnvironment(event.target.value);setDeploymentAccess("");setTeamError("")}}>{environmentOptions.map(option=><option key={option}>{option}</option>)}</select><small>Deployment access is filtered by the selected environment.</small></label><label>Deployment Access<select value={deploymentAccess} onChange={event=>{setDeploymentAccess(event.target.value);setTeamError("")}} disabled={availableApplications.length===0}><option value="" disabled>{availableApplications.length?`Select a ${environment} application`:`No ${environment} applications available`}</option>{availableApplications.map(application=><option value={application.name} key={`${application.name}-${application.ownerUsername||application.owner}`}>{application.name}</option>)}</select><small>{availableApplications.length?`The developer can deploy only the selected ${environment} application.`:`Create a ${environment} application before assigning deployment access.`}</small></label>{teamError&&<div className="github-error"><Icon name="x" size={15}/>{teamError}</div>}</div><div className="modal-actions"><Button variant="secondary" onClick={closeInvite}>Cancel</Button><Button onClick={inviteMember}>Send Invitation</Button></div></Card></div>}
  </>;
}
type EnvironmentSetting = { name: string; url: string; active: boolean };
type ApiKeySetting = { id: string; name: string; created: string; lastUsed: string; status: "Active" };

function readStoredSetting<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function SettingsPage({ session }: { session: AuthSession | null }) {
  const navItems = ["General", "Security", "Environment", "Notifications", "API Keys"];
  const defaultEnvironments: EnvironmentSetting[] = [
    { name: "Development", url: "https://development.clouddeployx.app", active: true },
    { name: "Staging", url: "https://staging.clouddeployx.app", active: true },
    { name: "Production", url: "https://production.clouddeployx.app", active: true },
  ];
  const defaultApiKeys: ApiKeySetting[] = [
    { id: "cdx_prod_8F3A", name: "Production CI/CD", created: "Today", lastUsed: "5 min ago", status: "Active" },
    { id: "cdx_mon_2C9D", name: "Monitoring Integration", created: "2 days ago", lastUsed: "1 hour ago", status: "Active" },
  ];
  const [tab, setTab] = useState("General");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [general, setGeneral] = useState(() => readStoredSetting("clouddeployx-general-settings", { workspace: "Acme Engineering", environment: "Development", timezone: "Asia/Kolkata" }));
  const [security, setSecurity] = useState(() => readStoredSetting("clouddeployx-security-settings", { twoFactor: false, loginNotifications: false, timeout: "30 minutes" }));
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [sessions, setSessions] = useState(["Windows / Chrome", "Android / Chrome"]);
  const [environments, setEnvironments] = useState<EnvironmentSetting[]>(() => readStoredSetting("clouddeployx-environment-settings", defaultEnvironments));
  const [editingEnvironment, setEditingEnvironment] = useState<EnvironmentSetting | null>(null);
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => readStoredSetting("clouddeployx-notification-settings", {
    "Deployment Successful": true,
    "Deployment Failed": true,
    "High CPU Usage": true,
    "High Memory Usage": true,
    "System Failure": true,
    "Email Notifications": true,
  }));
  const [apiKeys, setApiKeys] = useState<ApiKeySetting[]>(() => readStoredSetting("clouddeployx-api-keys", defaultApiKeys));
  const [apiModal, setApiModal] = useState(false);
  const [apiName, setApiName] = useState("");
  const [apiDescription, setApiDescription] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  useEffect(() => {
    if (!session?.username) return;
    let active = true;
    settingsApi.list(session.username).then(async ({ settings }) => {
      if (!active) return;
      const hadSettings = Object.keys(settings).length > 0;
      if (settings.general) setGeneral(settings.general as typeof general);
      if (settings.security) setSecurity(settings.security as typeof security);
      if (settings.environment) setEnvironments(settings.environment as EnvironmentSetting[]);
      if (settings.notifications) setNotifications(settings.notifications as Record<string, boolean>);
      if (settings.apiKeys) setApiKeys(settings.apiKeys as ApiKeySetting[]);
      if (!hadSettings) {
        await Promise.all([
          settingsApi.save(session.username, "general", general),
          settingsApi.save(session.username, "security", security),
          settingsApi.save(session.username, "environment", environments),
          settingsApi.save(session.username, "notifications", notifications),
          settingsApi.save(session.username, "apiKeys", apiKeys),
        ]);
      }
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : "Unable to load saved settings.");
    });
    return () => { active = false; };
  }, [session?.username]);

  const showNotice = (message: string) => {
    setError("");
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };
  const saveSetting = async (key: string, value: unknown, message: string) => {
    const settingName = ({
      "clouddeployx-general-settings": "general",
      "clouddeployx-security-settings": "security",
      "clouddeployx-environment-settings": "environment",
      "clouddeployx-notification-settings": "notifications",
      "clouddeployx-api-keys": "apiKeys",
    } as Record<string, string>)[key];
    try {
      if (!session?.username || !settingName) throw new Error("Unable to identify the workspace settings record.");
      await settingsApi.save(session.username, settingName, value);
      localStorage.setItem(key, JSON.stringify(value));
      showNotice(message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save settings to MongoDB.");
    }
  };
  const copyText = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showNotice(message);
    } catch {
      setError("Clipboard access is unavailable. Please copy the value manually.");
    }
  };
  const changePassword = async () => {
    setError("");
    if (!passwords.current || passwords.next.length < 8 || passwords.next !== passwords.confirm) {
      setError(passwords.next !== passwords.confirm ? "New passwords do not match." : "Enter your current password and use at least 8 characters for the new password.");
      return;
    }
    const currentHash = await hashPassword(passwords.current);
    const nextHash = await hashPassword(passwords.next);
    if (session?.role === "ADMIN") {
      try { await adminApi.changePassword(session.username, currentHash, nextHash); }
      catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to change password."); return; }
    } else if (session?.role === "TEAM") {
      try { await teamApi.changePassword(session.username, currentHash, nextHash); }
      catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to change password."); return; }
    } else if (session?.role === "USER") {
      try { await accountApi.changePassword(session.username, currentHash, nextHash); }
      catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to change password."); return; }
    }
    setPasswords({ current: "", next: "", confirm: "" });
    showNotice("Password changed successfully.");
  };
  const updateSecurity = (field: "twoFactor" | "loginNotifications", label: string) => {
    const next = { ...security, [field]: !security[field] };
    setSecurity(next);
    saveSetting("clouddeployx-security-settings", next, `${label} ${next[field] ? "enabled" : "disabled"}.`);
  };
  const saveEnvironment = () => {
    if (!editingEnvironment?.url.trim()) { setError("Enter a valid environment URL."); return; }
    const next = environments.map(item => item.name === editingEnvironment.name ? editingEnvironment : item);
    setEnvironments(next);
    setEditingEnvironment(null);
    saveSetting("clouddeployx-environment-settings", next, `${editingEnvironment.name} environment updated.`);
  };
  const createApiKey = () => {
    if (!apiName.trim()) { setError("Enter a name for the API key."); return; }
    const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 20);
    const id = `cdx_${suffix.slice(0, 8)}`;
    const secret = `${id}_${suffix.slice(8)}`;
    const next = [{ id, name: apiName.trim(), created: "Just now", lastUsed: "Never", status: "Active" as const }, ...apiKeys];
    setApiKeys(next);
    setGeneratedKey(secret);
    setError("");
    void saveSetting("clouddeployx-api-keys", next, `${apiName.trim()} API key saved.`);
  };
  const closeApiModal = () => {
    setApiModal(false);
    setApiName("");
    setApiDescription("");
    setGeneratedKey("");
    setError("");
  };

  return <>
    <PageHeader title="Settings" description="Configure your workspace, security, and integrations."/>
    {notice && <div className="settings-notice" role="status"><Icon name="check" size={16}/>{notice}</div>}
    <div className="settings-layout">
      <div className="settings-tabs" role="tablist" aria-label="Settings sections">
        {navItems.map(item => <button role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => { setTab(item); setError(""); }} key={item}><Icon name={item === "Security" ? "shield" : item === "API Keys" ? "key" : item === "Notifications" ? "bell" : item === "Environment" ? "cloud" : "settings"}/>{item}</button>)}
      </div>
      <Card className="settings-card">
        <div className="section-title">{tab}</div>
        <div className="section-sub">Manage your {tab.toLowerCase()} preferences and configuration.</div>
        {error && <div className="settings-error" role="alert">{error}</div>}
        {tab === "General" ? <div className="form-stack">
          <label>Workspace Name<input value={general.workspace} onChange={event => setGeneral({ ...general, workspace: event.target.value })}/></label>
          <label>Default Environment<select value={general.environment} onChange={event => setGeneral({ ...general, environment: event.target.value })}><option>Development</option><option>Staging</option><option>Production</option></select></label>
          <label>Timezone<select value={general.timezone} onChange={event => setGeneral({ ...general, timezone: event.target.value })}><option>Asia/Kolkata</option><option>UTC</option><option>America/New_York</option><option>Europe/London</option></select></label>
          <Button onClick={() => saveSetting("clouddeployx-general-settings", general, "General settings saved.")}>Save Changes</Button>
        </div> : tab === "Security" ? <div>
          <div className="form-stack">
            <label>Current Password<input type="password" autoComplete="current-password" value={passwords.current} onChange={event => setPasswords({ ...passwords, current: event.target.value })}/></label>
            <label>New Password<input type="password" autoComplete="new-password" value={passwords.next} onChange={event => setPasswords({ ...passwords, next: event.target.value })}/><small>Use at least 8 characters.</small></label>
            <label>Confirm Password<input type="password" autoComplete="new-password" value={passwords.confirm} onChange={event => setPasswords({ ...passwords, confirm: event.target.value })}/></label>
            <Button onClick={changePassword}>Change Password</Button>
          </div>
          <div className="setting-list">
            <div><span><strong>Two-Factor Authentication</strong><small>Protect your account with a second factor</small></span><Button variant="secondary" onClick={() => updateSecurity("twoFactor", "Two-factor authentication")}>{security.twoFactor ? "Disable" : "Enable"}</Button></div>
            <div><span><strong>Login Notifications</strong><small>Receive alerts for new sign-ins</small></span><Button variant="secondary" onClick={() => updateSecurity("loginNotifications", "Login notifications")}>{security.loginNotifications ? "Disable" : "Enable"}</Button></div>
            <div><span><strong>Session Timeout</strong><small>Automatically sign out inactive sessions</small></span><select className="compact-select" value={security.timeout} onChange={event => { const next = { ...security, timeout: event.target.value }; setSecurity(next); saveSetting("clouddeployx-security-settings", next, "Session timeout updated."); }}><option>15 minutes</option><option>30 minutes</option><option>1 hour</option><option>8 hours</option></select></div>
          </div>
          <div className="section-title">Active sessions</div>
          <div className="setting-list">{sessions.map((item, index) => <div key={item}><span><strong>{item}</strong><small>{index === 0 ? "Current session" : "2 hours ago"}</small></span>{index === 0 ? <Badge tone="success">Current</Badge> : <Button variant="danger" onClick={() => { setSessions(current => current.filter(sessionName => sessionName !== item)); showNotice("Session revoked."); }}>Revoke</Button>}</div>)}</div>
        </div> : tab === "Environment" ? <div className="environment-settings">{environments.map(item => <div key={item.name}><span className="health-icon"><Icon name="cloud"/></span><span><strong>{item.name}</strong><small>{item.url}</small></span><Badge tone={item.active ? "success" : "neutral"}>{item.active ? "Active" : "Paused"}</Badge><div className="environment-actions"><Button variant="ghost" onClick={() => { const next = environments.map(environment => environment.name === item.name ? { ...environment, active: !environment.active } : environment); setEnvironments(next); saveSetting("clouddeployx-environment-settings", next, `${item.name} ${item.active ? "paused" : "activated"}.`); }}>{item.active ? "Pause" : "Activate"}</Button><Button variant="secondary" onClick={() => setEditingEnvironment({ ...item })}>Edit</Button></div></div>)}</div> : tab === "Notifications" ? <div className="setting-list notification-settings">{Object.entries(notifications).map(([name, enabled]) => <div key={name}><span><strong>{name}</strong><small>{name === "Email Notifications" ? "Send enabled alerts to your account email" : "Email and in-app notification"}</small></span><label className="switch"><input aria-label={name} type="checkbox" checked={enabled} onChange={() => setNotifications(current => ({ ...current, [name]: !enabled }))}/><i/></label></div>)}<Button onClick={() => saveSetting("clouddeployx-notification-settings", notifications, "Notification preferences saved.")}>Save Changes</Button></div> : <div>
          <div className="settings-action"><div><div className="section-sub">Create and revoke credentials used by external services.</div></div><Button icon="plus" onClick={() => { setApiModal(true); setError(""); }}>Create API Key</Button></div>
          <div className="table-scroll"><table><thead><tr><th>Name</th><th>Key ID</th><th>Created</th><th>Last Used</th><th>Status</th><th>Actions</th></tr></thead><tbody>{apiKeys.map(item => <tr key={item.id}><td><strong>{item.name}</strong></td><td><code>{item.id}</code></td><td>{item.created}</td><td>{item.lastUsed}</td><td><Badge tone="success">{item.status}</Badge></td><td className="api-actions"><Button variant="ghost" icon="copy" onClick={() => copyText(item.id, "Key ID copied.")}>Copy ID</Button><Button variant="danger" onClick={() => { const next = apiKeys.filter(key => key.id !== item.id); setApiKeys(next); saveSetting("clouddeployx-api-keys", next, `${item.name} revoked.`); }}>Revoke</Button></td></tr>)}</tbody></table></div>
        </div>}
      </Card>
    </div>
    {editingEnvironment && <div className="modal-backdrop"><Card className="modal modal-small"><div className="modal-head"><div><div className="section-title">Edit {editingEnvironment.name}</div><div className="section-sub">Update the environment endpoint and availability.</div></div><Button variant="ghost" icon="x" onClick={() => { setEditingEnvironment(null); setError(""); }}/></div>{error && <div className="settings-error" role="alert">{error}</div>}<div className="form-stack"><label>Environment URL<input value={editingEnvironment.url} onChange={event => setEditingEnvironment({ ...editingEnvironment, url: event.target.value })}/></label><label className="toggle-label">Environment active<input type="checkbox" checked={editingEnvironment.active} onChange={event => setEditingEnvironment({ ...editingEnvironment, active: event.target.checked })}/></label></div><div className="modal-actions"><Button variant="secondary" onClick={() => setEditingEnvironment(null)}>Cancel</Button><Button onClick={saveEnvironment}>Save Environment</Button></div></Card></div>}
    {apiModal && <div className="modal-backdrop"><Card className="modal modal-small"><div className="modal-head"><div><div className="section-title">{generatedKey ? "API Key Created" : "Create API Key"}</div><div className="section-sub">{generatedKey ? "Copy this secret now. It will not be shown again." : "Create a credential for an external integration."}</div></div><Button variant="ghost" icon="x" onClick={closeApiModal}/></div>{error && <div className="settings-error" role="alert">{error}</div>}{generatedKey ? <div className="generated-key"><code>{generatedKey}</code><Button icon="copy" onClick={() => copyText(generatedKey, "API key copied.")}>Copy Key</Button></div> : <div className="form-stack"><label>Name<input value={apiName} onChange={event => setApiName(event.target.value)} placeholder="Production CI/CD"/></label><label>Description<textarea value={apiDescription} onChange={event => setApiDescription(event.target.value)} placeholder="Used by GitHub Actions deployment pipeline."/></label></div>}<div className="modal-actions">{generatedKey ? <Button onClick={closeApiModal}>Done</Button> : <><Button variant="secondary" onClick={closeApiModal}>Cancel</Button><Button onClick={createApiKey}>Create API Key</Button></>}</div></Card></div>}
  </>;
}
function AppDetails({ app, deploy, restart, edit, remove, hasData, canDeploy, go, deployments }: { app: Application; deploy:()=>void; restart:()=>void; edit:()=>void; remove:()=>void; hasData:boolean; canDeploy:boolean; go:(p:string)=>void; deployments:DeploymentRecord[] }) {
  const [activeTab,setActiveTab]=useState("Overview"), [menu,setMenu]=useState(false), [confirmDelete,setConfirmDelete]=useState(false);
  const tabs=["Overview","Deployments","Logs","Monitoring","Environment","Settings"];
  const tabContent=activeTab==="Overview"?<div className="detail-grid"><Card><div className="section-title">Application information</div><div className="detail-fields">{[["Repository",app.repo||"Not connected"],["Branch",app.branch],["Environment",app.env],["Container Port","8080"],["Replicas","3"],["Application Type",app.name]].map(x=><div key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong></div>)}</div></Card><Card><div className="section-title">Health status</div>{hasData?<div className="health-list compact">{["API","Database","Redis","Kubernetes","AWS"].map(x=><div className="health-row" key={x}><span className="health-pulse"/><span className="health-name">{x}</span><Badge tone="success">Healthy</Badge></div>)}</div>:<EmptyState icon="pulse" title="No health data" description="Health checks begin after the first deployment."/>}</Card></div>:activeTab==="Deployments"?<DeploymentTable go={go} deployments={deployments.filter(item=>item.applicationId===app.id)} hasData={deployments.some(item=>item.applicationId===app.id)}/>:activeTab==="Logs"?<Card>{hasData?<div className="inline-logs"><div className="log-toolbar"><div><Icon name="terminal"/><strong>{app.name} application logs</strong><Badge tone="success">Live</Badge></div><Button variant="secondary" onClick={()=>go("Logs")}>Open full logs</Button></div>{["18:32:11 INFO Application started","18:32:16 INFO Database connection established","18:34:05 WARN High memory usage"].map(x=><div className="inline-log" key={x}>{x}</div>)}</div>:<EmptyState icon="terminal" title="No logs available" description="Deploy this application to begin collecting logs."/>}</Card>:activeTab==="Monitoring"?<div>{hasData?<div className="monitor-grid">{[["CPU Usage","42%","pulse","blue"],["Memory Usage","61%","server","violet"],["Requests","1,248/min","activity","green"],["Error Rate","0.12%","x","red"],["Response Time","184 ms","clock","amber"]].map(([a,b,c,d])=><Card className="monitor-card" key={a}><div className="monitor-head"><span>{a}</span><span className={`stat-icon stat-${d}`}><Icon name={c as IconName}/></span></div><strong>{b}</strong><MiniChart color={d}/></Card>)}</div>:<Card><EmptyState icon="pulse" title="No monitoring data" description="Deploy this application to start collecting metrics."/></Card>}<Button className="tab-page-button" variant="secondary" onClick={()=>go("Monitoring")}>Open monitoring dashboard</Button></div>:activeTab==="Environment"?<Card className="tab-form-card"><div className="section-title">Environment configuration</div><div className="section-sub">Runtime configuration for {app.env}.</div><div className="form-grid resource-form"><label>Environment<select defaultValue={app.env}><option>Development</option><option>Staging</option><option>Production</option></select></label><label>Container Port<input defaultValue="8080"/></label><label>CPU<select defaultValue="500m"><option>250m</option><option>500m</option><option>1000m</option></select></label><label>Memory<select defaultValue="512 MB"><option>256 MB</option><option>512 MB</option><option>1 GB</option></select></label><label>Replicas<input defaultValue="3"/></label><label className="toggle-label">Auto Scaling<input type="checkbox" defaultChecked/></label></div><Button>Save Environment</Button></Card>:<Card className="tab-form-card"><div className="section-title">Application settings</div><div className="section-sub">Update general application behavior and lifecycle settings.</div><div className="setting-list"><div><span><strong>Application details</strong><small>Name, description, repository and branch</small></span><Button variant="secondary" onClick={edit}>Edit</Button></div><div><span><strong>Automatic deployments</strong><small>Deploy when changes are pushed to {app.branch}</small></span><input type="checkbox"/></div><div><span><strong>Delete application</strong><small>Permanently remove this application and its history</small></span><Button variant="danger" onClick={()=>setConfirmDelete(true)}>Delete</Button></div></div></Card>;
  return <><div className="app-detail-head"><div className="detail-identity"><span className={`app-logo logo-${app.tone}`}>{app.initials}</span><div><div className="eyebrow">Applications / {app.name}</div><div className="page-title">{app.name} <Badge tone={hasData?"success":app.approvalStatus==="ASSIGNED"?"info":"warning"}>{hasData?"Healthy":app.approvalStatus==="ASSIGNED"?"Assigned":"Pending review"}</Badge></div><div className="page-desc"><Icon name="git" size={13}/> GitHub / {app.repo.split("/").pop()||"repository"} · {app.env}</div></div></div><div className="detail-actions">{canDeploy&&<Button variant="secondary" icon="refresh" onClick={restart}>Restart</Button>}<Button variant="secondary" icon="settings" onClick={edit}>Edit</Button>{canDeploy&&<Button icon="rocket" onClick={deploy}>Deploy</Button>}<div className="action-menu-wrap"><Button variant="ghost" icon="more" onClick={()=>setMenu(!menu)}/>{menu&&<div className="app-action-menu"><button onClick={()=>{setMenu(false);setConfirmDelete(true)}}><Icon name="x" size={15}/>Delete application</button></div>}</div></div></div><div className="tabs">{tabs.map(x=><button className={activeTab===x?"active":""} onClick={()=>setActiveTab(x)} key={x}>{x}</button>)}</div>{tabContent}{confirmDelete&&<div className="modal-backdrop"><Card className="modal modal-small"><div className="modal-head"><div className="modal-icon danger"><Icon name="x"/></div><Button variant="ghost" icon="x" onClick={()=>setConfirmDelete(false)}/></div><div className="section-title">Delete Application</div><div className="section-sub">Permanently delete <strong>{app.name}</strong>? Deployment history, logs and settings for this application will be removed.</div><div className="modal-actions"><Button variant="secondary" onClick={()=>setConfirmDelete(false)}>Cancel</Button><Button variant="danger" onClick={remove}>Delete Application</Button></div></Card></div>}</>;
}

function EditApplicationModal({ app, close, save }: { app:Application; close:()=>void; save:(app:Application)=>void }) {
  const [name,setName]=useState(app.name), [desc,setDesc]=useState(app.desc), [branch,setBranch]=useState(app.branch), [env,setEnv]=useState(app.env);
  return <div className="modal-backdrop"><Card className="modal modal-small"><div className="modal-head"><div><div className="section-title">Edit Application</div><div className="section-sub">Update application details and deployment defaults.</div></div><Button variant="ghost" icon="x" onClick={close}/></div><div className="form-stack"><label>Application Name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Description<textarea value={desc} onChange={e=>setDesc(e.target.value)}/></label><label>Branch<input value={branch} onChange={e=>setBranch(e.target.value)}/></label><label>Environment<select value={env} onChange={e=>setEnv(e.target.value)}><option>Development</option><option>Staging</option><option>Production</option></select></label></div><div className="modal-actions"><Button variant="secondary" onClick={close}>Cancel</Button><Button onClick={()=>save({...app,name,desc,branch,env,initials:name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()})}>Save Changes</Button></div></Card></div>;
}

function DeployPage({ app, confirm, cancel }: { app:Application; confirm:()=>void; cancel:()=>void }) {
  return <><PageHeader title={`Deploy ${app.name}`} description="Review the release configuration before deploying."/><div className="warning-banner"><Icon name="shield"/><span><strong>Production deployment</strong><small>You are deploying this version to the {app.env} environment.</small></span></div><div className="deploy-page-grid"><Card className="config-card"><div className="section-title">Deployment configuration</div><div className="detail-fields">{[["Application",app.name],["Version","v1.4.3"],["Branch",app.branch],["Environment",app.env],["Docker Image",`${app.name.toLowerCase().replaceAll(" ","-")}:v1.4.3`],["Replicas","3"],["CPU","500m"],["Memory","512 MB"]].map(x=><div key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong></div>)}</div></Card><Card className="deploy-side"><div className="section-title">Deployment summary</div><div className="review"><div><span>Target</span><strong>{app.env}</strong></div><div><span>Strategy</span><strong>Rolling update</strong></div><div><span>Estimated time</span><strong>2–4 minutes</strong></div><div><span>Health checks</span><strong>Enabled</strong></div></div><Button className="full" icon="rocket" onClick={confirm}>Deploy Now</Button><Button className="full" variant="secondary" onClick={cancel}>Cancel</Button></Card></div></>;
}

function DeploymentProgress({ app, complete, go }: { app:Application; complete:boolean; go:(p:string)=>void }) {
  const steps=[["Queued","Completed","0s","12:04:31"],["Build","Completed","42s","12:04:35"],["Tests","Completed","31s","12:05:12"],["Docker Build","Completed","1m 02s","12:05:20"],["Push to ECR","Completed","27s","12:05:48"],["Deploying",complete?"Completed":"In progress",complete?"49s":"48s","12:06:02"],["Health Check",complete?"Completed":"Pending",complete?"16s":"—","12:06:18"],["Completed",complete?"Completed":"Pending","—","—"]];
  const logs=[["12:04:31","INFO","Starting deployment"],["12:04:35","INFO","Checking repository"],["12:04:42","INFO","Running Maven build"],["12:05:12","SUCCESS","Tests passed"],["12:05:20","INFO","Building Docker image"],["12:05:48","SUCCESS","Image pushed to ECR"],["12:06:02","INFO","Deploying to Kubernetes"],["12:06:18","INFO","Running health check"]];
  return <><div className="page-header"><div><div className="eyebrow">Deployments / #1048</div><div className="page-title">Deployment #1048 <Badge tone={complete?"success":"info"}>{complete?"SUCCESS":"DEPLOYING"}</Badge></div><div className="page-desc">{app.name} · v1.4.3 · {app.env}</div></div></div><Card className="pipeline-card"><div className="pipeline">{steps.map(([name,status,time,stamp],i)=><div className={`pipeline-step ${status==="Completed"?"complete":status==="In progress"?"current":""}`} key={name}><div className="step-track"><span>{status==="Completed"?<Icon name="check"/>:status==="In progress"?<Icon name="refresh"/>:i+1}</span>{i<steps.length-1&&<i/>}</div><strong>{name}</strong><small>{status} · {time}</small><small>{stamp}</small></div>)}</div></Card><Card className="log-panel deploy-log"><div className="log-toolbar"><div><Icon name="terminal"/><strong>Deployment Logs</strong><Badge tone={complete?"success":"info"}>{complete?"Complete":"Live"}</Badge></div><div><Button variant="ghost" icon="copy">Copy Logs</Button><Button variant="ghost" icon="download">Download</Button></div></div><div className="logs">{logs.map(([time,level,msg])=><div className={`deploy-line log-${level.toLowerCase()}`} key={time}><span>{time}</span> <b>{level}</b> {msg}</div>)}</div></Card>{complete&&<Card className="success-state"><span><Icon name="check" size={30}/></span><div><strong>Deployment Successful</strong><small>{app.name} v1.4.3 has been successfully deployed to {app.env}.</small></div><div><Button variant="secondary" onClick={()=>go("Application Details")}>View Application</Button><Button onClick={()=>go("Monitoring")}>View Monitoring</Button></div></Card>}</>;
}

function CreateModal({ close, create }: { close:()=>void; create:(app: Application)=>void }) {
  const [step,setStep]=useState(1), [success,setSuccess]=useState(false);
  const [name,setName]=useState(""), [type,setType]=useState("REST API"), [desc,setDesc]=useState("");
  const [repo,setRepo]=useState(""), [branch,setBranch]=useState("main"), [env,setEnv]=useState("Production");
  const [port,setPort]=useState("8080"), [cpu,setCpu]=useState("500m"), [memory,setMemory]=useState("512 MB"), [replicas,setReplicas]=useState("3");
  const serviceOptions=["Payment Service","Order Service","Customer Portal","Auth Gateway","Notification Service","Analytics Worker"];
  const [githubToken,setGithubToken]=useState(""), [githubLoading,setGithubLoading]=useState(false), [githubError,setGithubError]=useState("");
  const [githubUser,setGithubUser]=useState<{login:string;avatar_url:string}|null>(null);
  const [githubRepos,setGithubRepos]=useState<Array<{full_name:string;html_url:string;default_branch:string;private:boolean}>>([]);
  const [buildCommands,setBuildCommands]=useState<string[]>([]), [buildCommand,setBuildCommand]=useState(""), [inspectingRepo,setInspectingRepo]=useState(false);
  const inspectRepository=async(item:{full_name:string;default_branch:string})=>{
    setInspectingRepo(true);setGithubError("");setBuildCommands([]);setBuildCommand("");
    try{
      const headers={Accept:"application/vnd.github+json",Authorization:`Bearer ${githubToken.trim()}`,"X-GitHub-Api-Version":"2022-11-28"};
      const response=await fetch(`https://api.github.com/repos/${item.full_name}/contents?ref=${encodeURIComponent(item.default_branch)}`,{headers});
      if(!response.ok) throw new Error("Unable to inspect this repository. Ensure the token has Contents read access.");
      const contents=await response.json();
      const files=new Set((Array.isArray(contents)?contents:[]).map((entry:{name:string})=>entry.name.toLowerCase()));
      const commands:string[]=[];
      if(files.has("pom.xml")) commands.push("mvn clean package","mvn clean package -DskipTests");
      if(files.has("build.gradle")||files.has("build.gradle.kts")||files.has("gradlew")) commands.push("./gradlew build","./gradlew bootJar");
      if(files.has("package.json")){
        let scripts:string[]=[];
        try{
          const packageResponse=await fetch(`https://api.github.com/repos/${item.full_name}/contents/package.json?ref=${encodeURIComponent(item.default_branch)}`,{headers});
          if(packageResponse.ok){
            const packageFile=await packageResponse.json();
            const packageJson=JSON.parse(atob(String(packageFile.content).replace(/\n/g,"")));
            scripts=Object.keys(packageJson.scripts||{});
          }
        }catch{ scripts=[] }
        const manager=files.has("pnpm-lock.yaml")?"pnpm":files.has("yarn.lock")?"yarn":"npm";
        if(manager==="pnpm") commands.push("pnpm install --frozen-lockfile","pnpm install");
        else if(manager==="yarn") commands.push("yarn install --frozen-lockfile","yarn install");
        else commands.push(files.has("package-lock.json")?"npm ci":"npm install","npm install");
        scripts.forEach(script=>{
          if(manager==="npm") commands.push(script==="start"?"npm start":script==="test"?"npm test":`npm run ${script}`);
          else commands.push(`${manager} ${script}`);
        });
      }
      if(files.has("requirements.txt")) commands.push("pip install -r requirements.txt");
      if(files.has("pyproject.toml")) commands.push("pip install .");
      if(files.has("go.mod")) commands.push("go build ./...");
      if(files.has("cargo.toml")) commands.push("cargo build --release");
      if(files.has("dockerfile")) commands.push("docker build -t application .");
      const detected=[...new Set(commands)];
      const options=detected.length?detected:["No build command required"];
      setBuildCommands(options);setBuildCommand(options[0]);
    }catch(error){setGithubError(error instanceof Error?error.message:"Unable to inspect repository.")}finally{setInspectingRepo(false)}
  };
  const connectGitHub=async()=>{
    if(!githubToken.trim()){setGithubError("Enter a GitHub personal access token to continue.");return}
    setGithubLoading(true);setGithubError("");
    try{
      const headers={Accept:"application/vnd.github+json",Authorization:`Bearer ${githubToken.trim()}`,"X-GitHub-Api-Version":"2022-11-28"};
      const [userResponse,reposResponse]=await Promise.all([
        fetch("https://api.github.com/user",{headers}),
        fetch("https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member",{headers}),
      ]);
      if(!userResponse.ok||!reposResponse.ok) throw new Error(userResponse.status===401?"GitHub rejected this token. Check that it is valid.":"Unable to load your GitHub account.");
      const user=await userResponse.json();
      const repos=await reposResponse.json();
      setGithubUser({login:user.login,avatar_url:user.avatar_url});
      setGithubRepos(repos.map((item:{full_name:string;html_url:string;default_branch:string;private:boolean})=>({full_name:item.full_name,html_url:item.html_url,default_branch:item.default_branch,private:item.private})));
    }catch(error){setGithubError(error instanceof Error?error.message:"Unable to connect to GitHub.")}finally{setGithubLoading(false)}
  };
  const app={name,desc,repo,branch,env,version:"Not deployed",owner:"Mohammed",initials:name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase()||"AP",tone:"indigo"};
  if(success) return <div className="modal-backdrop"><Card className="modal modal-small success-modal"><span className="success-mark"><Icon name="check" size={28}/></span><div className="section-title">Application Created Successfully</div><div className="section-sub">{name} has been successfully registered.</div><div className="modal-actions"><Button variant="secondary" onClick={()=>create(app)}>Back to Applications</Button><Button onClick={()=>create(app)}>View Application</Button></div></Card></div>;
  return <div className="modal-backdrop"><Card className="modal wizard-modal"><div className="modal-head"><div><div className="section-title">Create New Application</div><div className="section-sub">Connect your repository and configure your application for deployment.</div></div><Button variant="ghost" icon="x" onClick={close}/></div><div className="wizard-labels">{["Application","Repository","Environment","Review"].map((x,i)=><span className={step===i+1?"active":""} key={x}>{x}</span>)}</div><div className="steps">{[1,2,3,4].map(x=><span className={x<=step?"active":""} key={x}><i>{x<step?<Icon name="check" size={14}/>:x}</i></span>)}</div><div className="modal-body">{step===1?<div className="form-stack"><label>Application Name<select value={name} onChange={e=>setName(e.target.value)}><option value="" disabled>Select a service</option>{serviceOptions.map(x=><option key={x}>{x}</option>)}</select><small>Select the service you want to configure for deployment.</small></label><label>Description<textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe your application"/><small>Add a short description for your team.</small></label><label>Application Type<select value={type} onChange={e=>setType(e.target.value)}>{["Web Application","REST API","Microservice","Frontend Application"].map(x=><option key={x}>{x}</option>)}</select></label></div>:step===2?<div>{githubUser?<><div className="connect-card github-connected"><img className="github-avatar" src={githubUser.avatar_url} alt=""/><span><strong>GitHub · @{githubUser.login}</strong><small>{githubRepos.length} repositories available</small></span><Badge tone="success">Connected</Badge></div><div className="form-stack"><label>Repository<select value={repo} onChange={e=>{const selected=githubRepos.find(item=>item.full_name===e.target.value);setRepo(e.target.value);if(selected){setBranch(selected.default_branch);inspectRepository(selected)}}}><option value="" disabled>Select a repository</option>{githubRepos.map(item=><option value={item.full_name} key={item.full_name}>{item.full_name}{item.private?" · Private":""}</option>)}</select><small>Repositories are loaded directly from your GitHub account.</small></label><div className="form-grid"><label>Branch<input value={branch} onChange={e=>setBranch(e.target.value)}/></label><label>Dockerfile<input defaultValue="./Dockerfile"/></label></div><label>Build Command<input value={buildCommand} onChange={e=>setBuildCommand(e.target.value)} disabled={!repo||inspectingRepo} placeholder={inspectingRepo?"Inspecting repository...":"Enter build command"}/><small>{inspectingRepo?"Checking repository files to detect the build system...":"A recommended command is detected automatically and can be edited."}</small></label><Button variant="secondary" icon="refresh" onClick={()=>{setGithubUser(null);setGithubRepos([]);setRepo("");setBuildCommands([]);setBuildCommand("")}}>Connect a different account</Button></div></>:<div><div className="connect-card"><span className="git-mark"><Icon name="git" size={24}/></span><span><strong>Connect GitHub</strong><small>Load repositories from your account</small></span><Badge tone="neutral">Not connected</Badge></div><div className="form-stack"><label>GitHub Personal Access Token<input type="password" value={githubToken} onChange={e=>setGithubToken(e.target.value)} placeholder="github_pat_••••••••••••"/><small>Use a fine-grained token with repository metadata access. Your token is used only for this session and is never saved.</small></label>{githubError&&<div className="github-error"><Icon name="x" size={15}/>{githubError}</div>}<Button icon="git" onClick={connectGitHub}>{githubLoading?"Connecting...":"Connect GitHub Account"}</Button></div></div>}</div>:step===3?<div><div className="environment-options">{[["Development","For development and testing"],["Staging","For pre-production testing"],["Production","For live applications"]].map(([x,d],i)=><button className={env===x?"selected":""} onClick={()=>setEnv(x)} key={x}><span><Icon name={i===0?"code":i===1?"server":"cloud"}/></span><strong>{x}</strong><small>{d}</small></button>)}</div><div className="form-grid resource-form"><label>Container Port<input value={port} onChange={e=>setPort(e.target.value)}/></label><label>CPU<select value={cpu} onChange={e=>setCpu(e.target.value)}><option>250m</option><option>500m</option><option>1000m</option></select></label><label>Memory<select value={memory} onChange={e=>setMemory(e.target.value)}><option>256 MB</option><option>512 MB</option><option>1 GB</option></select></label><label>Replicas<input value={replicas} onChange={e=>setReplicas(e.target.value)}/></label><label className="toggle-label">Auto Scaling<input type="checkbox" defaultChecked/></label><label>Min / Max Replicas<div className="split-input"><input defaultValue="2"/><input defaultValue="5"/></div></label></div></div>:<div><div className="review-grid">{[["Application",name],["Application Type",type],["Repository",repo||"Not connected"],["Branch",branch],["Build Command",buildCommand],["Environment",env],["Container Port",port],["CPU",cpu],["Memory",memory],["Replicas",replicas]].map(([a,b])=><div key={a}><span>{a}</span><strong>{b}</strong></div>)}</div><Button variant="secondary" icon="settings" onClick={()=>setStep(1)}>Edit Configuration</Button></div>}</div><div className="modal-actions"><Button variant="secondary" onClick={()=>step===1?close():setStep(step-1)}>{step===1?"Cancel":"Back"}</Button><Button onClick={()=>step<4?(step===1?name:step===2?repo&&buildCommand:true)&&setStep(step+1):setSuccess(true)}>{step===4?"Create Application":"Continue"} <Icon name="chevron" size={15}/></Button></div></Card></div>;
}

function DeployModal({ app, close, confirm }: { app:Application; close:()=>void; confirm:()=>void }) {
  return <div className="modal-backdrop"><Card className="modal modal-small"><div className="modal-head"><div className="modal-icon warning"><Icon name="rocket"/></div><Button variant="ghost" icon="x" onClick={close}/></div><div className="section-title">Confirm Deployment</div><div className="section-sub">You are about to deploy <strong>{app.name} v1.4.3</strong> to {app.env}.</div><div className="deploy-summary"><span>Environment <strong>{app.env}</strong></span><span>Version <strong>v1.4.3</strong></span><span>Replicas <strong>3</strong></span></div><div className="modal-actions"><Button variant="secondary" onClick={close}>Cancel</Button><Button icon="rocket" onClick={confirm}>Confirm Deployment</Button></div></Card></div>;
}

function Login({ onLogin }: { onLogin:(session:AuthSession)=>void }) {
  const [loginType,setLoginType]=useState<"USER"|"ADMIN"|"TEAM">("USER"), [signup,setSignup]=useState(false), [error,setError]=useState(""), [loading,setLoading]=useState(false);
  const [name,setName]=useState(""), [dateOfBirth,setDateOfBirth]=useState(""), [username,setUsername]=useState(""), [email,setEmail]=useState(""), [password,setPassword]=useState(""), [confirmPassword,setConfirmPassword]=useState("");
  const [usernameUsed,setUsernameUsed]=useState(false), [emailUsed,setEmailUsed]=useState(false), [availabilityReady,setAvailabilityReady]=useState(false);
  const reset=()=>{setError("");setSignup(false);setUsername("");setPassword("");setConfirmPassword("")};
  const normalizedUsername=username.trim().toLowerCase(), normalizedEmail=email.trim().toLowerCase();
  useEffect(()=>{
    if(!signup){setUsernameUsed(false);setEmailUsed(false);setAvailabilityReady(false);return}
    setAvailabilityReady(false);
    const timer=setTimeout(()=>accountApi.check(normalizedUsername,normalizedEmail).then(result=>{setUsernameUsed(result.usernameUsed);setEmailUsed(result.emailUsed);setAvailabilityReady(true);setError("")}).catch(reason=>{setAvailabilityReady(false);setError(reason instanceof Error?reason.message:"Unable to check account availability.")}),350);
    return()=>clearTimeout(timer);
  },[signup,normalizedUsername,normalizedEmail]);
  const emailValid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const passwordRules=[
    ["At least 8 characters",password.length>=8],
    ["One uppercase letter",/[A-Z]/.test(password)],
    ["One lowercase letter",/[a-z]/.test(password)],
    ["One number",/\d/.test(password)],
    ["One symbol",/[^A-Za-z0-9]/.test(password)],
  ] as [string,boolean][];
  const strongPassword=passwordRules.every(([,valid])=>valid);
  const passwordsMatch=confirmPassword.length>0&&password===confirmPassword;
  const submit=async()=>{
    setError("");setLoading(true);
    try{
      if(signup&&loginType==="USER"){
        if(!name.trim()||!dateOfBirth||!username.trim()||!email.trim())throw new Error("Complete every required field.");
        if(usernameUsed)throw new Error("This username is already used.");
        if(!emailValid)throw new Error("Enter a valid email address.");
        if(emailUsed)throw new Error("This email address is already used.");
        if(!strongPassword)throw new Error("Password does not meet all strength requirements.");
        if(!passwordsMatch)throw new Error("Password and confirm password must match.");
        const account={name:name.trim(),dateOfBirth,username:username.trim(),email:email.trim(),passwordHash:await hashPassword(password),createdAt:new Date().toISOString()};
        await accountApi.signup(account);
        await activityApi.create({actor:account.name,action:"registered",resource:"User account",environment:"—"}).catch(()=>undefined);
        onLogin({role:"USER",name:account.name,username:account.username});return;
      }
      if(!username.trim()||!password)throw new Error("Enter your username and password.");
      if(loginType==="ADMIN"){
        const {admin}=await adminApi.login(username.trim(),await hashPassword(password));
        onLogin({role:"ADMIN",name:admin.name,username:admin.username});return;
      }
      const passwordHash=await hashPassword(password);
      if(loginType==="USER"){
        const { user }=await accountApi.login(username.trim(),passwordHash);
        onLogin({role:"USER",name:user.name,username:user.username});return;
      }
      const { member }=await teamApi.login(username.trim(),passwordHash);
      const { applications }=await applicationApi.list() as {applications:Application[]};
      const application=applications.find(item=>item.name===member.deploymentAccess&&(!member.environment||item.env===member.environment));
      onLogin({role:"TEAM",name:member.name,username:member.username||member.email,application:member.deploymentAccess,environment:application?.env});
    }catch(reason){setError(reason instanceof Error?reason.message:"Unable to sign in.")}finally{setLoading(false)}
  };
  return <div className="login-page"><div className="login-brand"><Logo/><div className="login-copy"><div className="login-title">Ship software<br/>with confidence.</div><div className="login-sub">Deploy, monitor and manage your applications from one secure, reliable platform.</div></div><div className="cloud-visual"><div className="orbit one"/><div className="orbit two"/><span className="visual-cloud"><Icon name="cloud" size={46}/></span><span className="visual-node n1"><Icon name="git"/></span><span className="visual-node n2"><Icon name="server"/></span><span className="visual-node n3"><Icon name="database"/></span></div><small>Secure access for users, administrators, and deployment teams</small></div><div className="login-form-wrap"><div className="login-form"><div className="mobile-logo"><Logo/></div><div className="page-title">{signup?"Create your account":"Welcome back"}</div><div className="page-desc">{signup?"Register a CloudDeployX user account.":"Choose how you want to access CloudDeployX."}</div><div className="auth-role-tabs">{[["USER","User"],["ADMIN","Admin"]].map(([value,label])=><button className={loginType===value?"active":""} onClick={()=>{setLoginType(value as typeof loginType);reset()}} key={value}>{label}</button>)}</div><div className="form-stack">{signup&&<><label>Full Name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name"/></label><label>Date of Birth<input type="date" value={dateOfBirth} onChange={e=>setDateOfBirth(e.target.value)}/></label></>}<label className={signup&&username&&availabilityReady?(usernameUsed?"field-error":"field-success"):""}>Username{loginType==="TEAM"&&" or Email"}<input value={username} onChange={e=>setUsername(e.target.value)} placeholder={loginType==="TEAM"?"Enter invited username":"Enter username"}/>{signup&&username&&<small>{!availabilityReady?"Checking username availability...":usernameUsed?"This username is already used.":"Username is available."}</small>}</label>{signup&&<label className={email&&availabilityReady?(emailUsed||!emailValid?"field-error":"field-success"):""}>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/>{email&&<small>{!availabilityReady?"Checking email availability...":emailUsed?"This email is already used.":!emailValid?"Enter a valid email address.":"Email is available."}</small>}</label>}<label className={signup&&password?(strongPassword?"field-success":"field-error"):""}>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password"/>{signup&&<div className="password-strength"><div className="strength-track"><i className={`strength-fill strength-${passwordRules.filter(([,valid])=>valid).length}`}/></div><div className="password-rules">{passwordRules.map(([rule,valid])=><span className={valid?"valid":""} key={rule}><Icon name={valid?"check":"x"} size={12}/>{rule}</span>)}</div></div>}</label>{signup&&<label className={confirmPassword?(passwordsMatch?"field-success":"field-error"):""}>Confirm Password<input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Confirm password"/>{confirmPassword&&<small>{passwordsMatch?"Passwords match.":"Passwords do not match."}</small>}</label>}{error&&<div className="github-error"><Icon name="x" size={15}/>{error}</div>}<Button className="full" onClick={submit}>{loading?"Please wait...":signup?"Create Account":"Sign In"}</Button></div>{loginType==="USER"&&<div className="signup">{signup?"Already have an account?":"New to CloudDeployX?"} <button className="text-button" onClick={()=>{setSignup(!signup);setError("")}}>{signup?"Sign in":"Create account"}</button></div>}{loginType!=="TEAM"&&<div className="signup">Team member? <button className="text-button" onClick={()=>{setLoginType("TEAM");reset()}}>Team sign in</button></div>}{loginType==="TEAM"&&<><div className="auth-note"><Icon name="shield" size={15}/>Use the username and temporary password provided in your team invitation.</div><div className="signup"><button className="text-button" onClick={()=>{setLoginType("USER");reset()}}>Back to user sign in</button></div></>}</div><div className="login-footer">© 2026 CloudDeployX · Privacy · Terms</div></div></div>;
}

export default function App() {
  const [loggedIn,setLoggedIn]=useState(false), [session,setSession]=useState<AuthSession|null>(null), [page,setPage]=useState("Dashboard"), [sidebar,setSidebar]=useState(false), [notify,setNotify]=useState(false), [notificationRead,setNotificationRead]=useState(false), [profileMenu,setProfileMenu]=useState(false), [globalSearch,setGlobalSearch]=useState("");
  const [selectedEnvironment,setSelectedEnvironment]=useState("Production");
  const [modal,setModal]=useState<"create"|"deploy"|"edit"|null>(null), [hasDeployment,setHasDeployment]=useState(false), [deploymentComplete,setDeploymentComplete]=useState(false);
  const [applications,setApplications]=useState<Application[]>([]), [deployments,setDeployments]=useState<DeploymentRecord[]>([]), [persistenceError,setPersistenceError]=useState("");
  const [registeredUsers,setRegisteredUsers]=useState<UserAccount[]>([]), [usersError,setUsersError]=useState("");
  const [selectedApp,setSelectedApp]=useState<Application|null>(null);
  const [deployedApp,setDeployedApp]=useState<Application|null>(null);
  useEffect(()=>{
    if(!loggedIn||!session)return;
    let active=true;
    setPersistenceError("");
    Promise.all([applicationApi.list(),deploymentApi.list()]).then(async ([applicationResult,deploymentResult])=>{
      let savedApplications=applicationResult.applications as unknown as Application[];
      let savedDeployments=deploymentResult.deployments as unknown as DeploymentRecord[];
      let legacy:Application[]=[];
      try{legacy=JSON.parse(localStorage.getItem("clouddeployx-applications")||"[]")}catch{legacy=[]}
      for(const application of legacy){
        const ownerUsername=application.ownerUsername||session.username;
        if(savedApplications.some(saved=>saved.name===application.name&&saved.ownerUsername===ownerUsername))continue;
        const migrated={...application,id:application.id||crypto.randomUUID(),ownerUsername};
        await applicationApi.create(migrated as unknown as Record<string,unknown>);
        savedApplications=[...savedApplications,migrated];
      }
      if(savedDeployments.length===0){
        let legacyDeployment:Application|null=null;
        try{legacyDeployment=JSON.parse(localStorage.getItem("clouddeployx-deployment")||"null")}catch{legacyDeployment=null}
        if(legacyDeployment){
          let app=savedApplications.find(item=>item.name===legacyDeployment?.name&&item.ownerUsername===session.username);
          if(!app){
            app={...legacyDeployment,id:legacyDeployment.id||crypto.randomUUID(),ownerUsername:legacyDeployment.ownerUsername||session.username};
            await applicationApi.create(app as unknown as Record<string,unknown>);
            savedApplications=[...savedApplications,app];
          }
          const migrated:DeploymentRecord={id:crypto.randomUUID(),displayId:"#"+Date.now().toString().slice(-4),applicationId:app.id||"",applicationName:app.name,ownerUsername:app.ownerUsername||session.username,version:app.version,environment:app.env,status:"SUCCESS",duration:"2m 14s",deployedBy:session.name,createdAt:new Date().toISOString(),completedAt:new Date().toISOString()};
          await deploymentApi.create(migrated as unknown as Record<string,unknown>);
          savedDeployments=[migrated];
        }
      }
      if(!active)return;
      setApplications(savedApplications);
      setDeployments(savedDeployments);
      const latest=[...savedDeployments].filter(item=>item.status==="SUCCESS").sort((a,b)=>Date.parse(b.completedAt||b.createdAt)-Date.parse(a.completedAt||a.createdAt))[0];
      setHasDeployment(Boolean(latest));
      setDeployedApp(latest?savedApplications.find(item=>item.id===latest.applicationId)||null:null);
    }).catch(error=>{if(active)setPersistenceError(error instanceof Error?error.message:"Unable to load workspace data from MongoDB.")});
    return()=>{active=false};
  },[loggedIn,session?.username]);
  useEffect(()=>{if(loggedIn&&session?.role==="ADMIN"){accountApi.list().then(({users})=>{setRegisteredUsers(users as UserAccount[]);setUsersError("")}).catch(error=>setUsersError(error instanceof Error?error.message:"Unable to load registered users."))}},[loggedIn,session?.role,page]);
  useEffect(()=>{
    if(page!=="Deployment #1048"||deploymentComplete)return;
    const running=deployments.find(item=>item.status==="IN_PROGRESS");
    if(!running)return;
    const timer=setTimeout(async()=>{
      const completedApp=applications.find(app=>app.id===running.applicationId);
      try{
        await deploymentApi.update(running.id,{status:"SUCCESS",completedAt:new Date().toISOString(),duration:"2m 14s"});
        if(completedApp?.id)await applicationApi.update(completedApp.id,{...completedApp,approvalStatus:"DEPLOYED",version:running.version});
        setDeployments(current=>current.map(item=>item.id===running.id?{...item,status:"SUCCESS",completedAt:new Date().toISOString(),duration:"2m 14s"}:item));
        if(completedApp){const updated={...completedApp,approvalStatus:"DEPLOYED" as const,version:running.version};setDeployedApp(updated);setApplications(current=>current.map(app=>app.id===updated.id?updated:app))}
        setDeploymentComplete(true);setHasDeployment(true);setNotificationRead(false);
      }catch(error){setPersistenceError(error instanceof Error?error.message:"Unable to save deployment to MongoDB.")}
    },1800);
    return()=>clearTimeout(timer);
  },[page,deploymentComplete,deployments,applications]);
  const go=(p:string)=>{setPage(p);setSidebar(false);setProfileMenu(false)};
  const logout=()=>{setLoggedIn(false);setSession(null);setProfileMenu(false);setPage("Dashboard")};
  const recordActivity=(action:string,resource:string,environment="—")=>{if(session)activityApi.create({actor:session.name,action,resource,environment}).catch(()=>undefined)};
  const createApplication=async(app:Application)=>{const ownedApp={...app,id:crypto.randomUUID(),createdAt:new Date().toISOString(),owner:session?.name||app.owner,ownerUsername:session?.username,approvalStatus:"PENDING" as const};try{await applicationApi.create(ownedApp as unknown as Record<string,unknown>);setApplications(current=>[...current,ownedApp]);recordActivity("created application",ownedApp.name,ownedApp.env);setSelectedEnvironment(ownedApp.env);setSelectedApp(ownedApp);setPersistenceError("");setModal(null);setPage("Application Details")}catch(error){setPersistenceError(error instanceof Error?error.message:"Unable to save application to MongoDB.")}};
  const openApplication=(app:Application)=>{setSelectedApp(app);setPage("Application Details")};
  const startDeployment=async(application:Application|null=activeApp)=>{if(!application?.id)return;const deployment:DeploymentRecord={id:crypto.randomUUID(),displayId:"#"+Date.now().toString().slice(-4),applicationId:application.id,applicationName:application.name,ownerUsername:application.ownerUsername||session?.username||"",version:"v1.4.3",environment:application.env,status:"IN_PROGRESS",duration:"—",deployedBy:session?.name||application.owner,createdAt:new Date().toISOString()};try{await deploymentApi.create(deployment as unknown as Record<string,unknown>);setDeployments(current=>[deployment,...current]);setSelectedApp(application);setDeployedApp(application);setSelectedEnvironment(application.env);recordActivity("started deployment",application.name,application.env);setDeploymentComplete(false);setHasDeployment(false);setPersistenceError("");setPage("Deployment #1048")}catch(error){setPersistenceError(error instanceof Error?error.message:"Unable to save deployment to MongoDB.")}};
  const assignApplication=async(applicationName:string,environment:string,teamUsername:string)=>{const targets=applications.filter(app=>app.name===applicationName&&app.env===environment);try{for(const app of targets){if(!app.id)continue;const updated={...app,approvalStatus:"ASSIGNED" as const,assignedTeam:teamUsername};await applicationApi.update(app.id,updated as unknown as Record<string,unknown>)}setApplications(current=>current.map(app=>app.name===applicationName&&app.env===environment?{...app,approvalStatus:"ASSIGNED",assignedTeam:teamUsername}:app));recordActivity("assigned application",`${applicationName} to ${teamUsername}`,environment)}catch(error){throw error}};
  const updateApplication=async(updated:Application)=>{try{if(!updated.id)throw new Error("Application ID is missing.");await applicationApi.update(updated.id,updated as unknown as Record<string,unknown>);setApplications(current=>current.map(app=>app.id===updated.id?updated:app));recordActivity("updated application",updated.name,updated.env);setSelectedEnvironment(updated.env);setSelectedApp(updated);setModal(null);setPersistenceError("")}catch(error){setPersistenceError(error instanceof Error?error.message:"Unable to update application in MongoDB.")}};
  const deleteApplication=async()=>{if(!selectedApp?.id)return;try{await applicationApi.remove(selectedApp.id);if(selectedApp)recordActivity("deleted application",selectedApp.name,selectedApp.env);setApplications(current=>current.filter(app=>app.id!==selectedApp.id));if(deployedApp?.id===selectedApp.id){setDeployedApp(null);setHasDeployment(false)}setSelectedApp(null);setPage("Applications");setPersistenceError("")}catch(error){setPersistenceError(error instanceof Error?error.message:"Unable to delete application from MongoDB.")}};
  const deleteRegisteredUser=async(username:string,name:string)=>{try{await accountApi.remove(username);setRegisteredUsers(current=>current.filter(user=>user.username!==username));setUsersError("");recordActivity("deleted user",name)}catch(error){setUsersError(error instanceof Error?error.message:"Unable to delete user.")}};
  const visibleApplications=session?.role==="TEAM"?applications.filter(app=>app.name===session.application):session?.role==="USER"?applications.filter(app=>app.ownerUsername===session.username):applications;
  const filteredApplications=visibleApplications.filter(app=>app.env===selectedEnvironment);
  const activeApp=selectedApp?.env===selectedEnvironment?selectedApp:filteredApplications[0]||null;
  const environmentHasDeployment=hasDeployment&&deployedApp?.env===selectedEnvironment&&visibleApplications.some(app=>app.name===deployedApp.name&&app.ownerUsername===deployedApp.ownerUsername);
  const environmentDataApp=environmentHasDeployment?deployedApp:activeApp;
  if(!loggedIn)return <Login onLogin={authSession=>{setSession(authSession);setLoggedIn(true);if(authSession.environment)setSelectedEnvironment(authSession.environment);setPage(authSession.role==="TEAM"?"Applications":"Dashboard")}}/>;
  const roleNavigation=session?.role==="ADMIN"?nav:session?.role==="TEAM"?nav.filter(([label])=>["Applications","Deployments"].includes(label)):nav.filter(([label])=>["Dashboard","Applications","Deployments","Monitoring"].includes(label));
  const searchTerm=globalSearch.trim().toLowerCase();
  const searchResults:GlobalSearchResult[]=searchTerm?[
    ...roleNavigation.map(([label,icon])=>({key:`page-${label}`,label,description:"Page",icon,select:()=>go(label)})),
    ...visibleApplications.map(application=>({key:`app-${application.name}-${application.ownerUsername}`,label:application.name,description:`Application · ${application.env}`,icon:"box" as IconName,select:()=>{setSelectedEnvironment(application.env);openApplication(application)}})),
    ...(session?.role==="ADMIN"?registeredUsers.map(user=>({key:`user-${user.username}`,label:user.name,description:`User · @${user.username} · ${user.email}`,icon:"users" as IconName,select:()=>go("Users")})):[]),
  ].filter(result=>`${result.label} ${result.description}`.toLowerCase().includes(searchTerm)).slice(0,8):[];
  const content=page==="Dashboard"?<Dashboard applications={filteredApplications} deployments={deployments.filter(item=>visibleApplications.some(app=>app.id===item.applicationId))} openCreate={()=>setModal("create")} openApp={openApplication} go={go} hasDeployment={environmentHasDeployment}/>:page==="Applications"?<Applications applications={filteredApplications} openCreate={()=>setModal("create")} openApp={openApplication} deployApp={app=>startDeployment(app)} openTeam={()=>go("Team")} role={session?.role} canCreate={session?.role!=="TEAM"}/>:page==="Deployments"?<Deployments go={go} deployments={deployments.filter(item=>visibleApplications.some(app=>app.id===item.applicationId))}/>:page==="Monitoring"?<Monitoring app={environmentDataApp} hasData={environmentHasDeployment}/>:page==="Logs"?<Logs app={environmentDataApp} hasData={environmentHasDeployment}/>:page==="Activity Logs"?<ActivityLogs/>:page==="Users"?<Users users={registeredUsers} error={usersError} onDelete={deleteRegisteredUser}/>:page==="Team"?<Team applications={applications} assignApplication={assignApplication}/>:page==="Settings"?<SettingsPage session={session}/>:page==="Application Details"?(activeApp?<AppDetails app={activeApp} deployments={deployments} deploy={()=>startDeployment(activeApp)} restart={()=>startDeployment(activeApp)} edit={()=>setModal("edit")} remove={deleteApplication} hasData={environmentHasDeployment&&deployedApp?.name===activeApp.name} canDeploy={session?.role!=="USER"} go={go}/>:<><PageHeader title="Application Details" description={`No application is configured for ${selectedEnvironment}.`}/><Card><EmptyState icon="box" title={`No ${selectedEnvironment} application`} description="Create an application in this environment to view its details."/></Card></>):page==="Deploy Application"&&activeApp?<DeployPage app={activeApp} confirm={()=>setModal("deploy")} cancel={()=>go("Application Details")}/>:page==="Deployment #1048"&&deployedApp?<DeploymentProgress app={deployedApp} complete={deploymentComplete} go={go}/>:<Logs app={environmentDataApp} hasData={environmentHasDeployment}/>;
  return <div className="app-shell"><div className={`mobile-overlay ${sidebar?"show":""}`} onClick={()=>setSidebar(false)}/><aside className={sidebar?"open":""}><div className="sidebar-top"><Logo/><Button variant="ghost" icon="x" className="sidebar-close" onClick={()=>setSidebar(false)}/></div><div className="workspace"><span className="workspace-mark">AX</span><span><small>WORKSPACE</small><strong>Acme Engineering</strong></span><Icon name="chevron" size={14}/></div><nav>{roleNavigation.map(([label,icon])=><button key={label} className={page===label?"active":""} onClick={()=>go(label)}><Icon name={icon}/><span>{label}</span></button>)}</nav><div className="sidebar-bottom">{profileMenu&&<div className="profile-menu"><button onClick={logout}><Icon name="logout" size={16}/><span>Logout</span></button></div>}<div className="profile"><Avatar initials={session?.name.split(" ").map(part=>part[0]).join("").slice(0,2).toUpperCase()||"US"}/><span><strong>{session?.name}</strong><small>{session?.role}</small></span><button className={`profile-toggle ${profileMenu?"open":""}`} aria-label="Open account menu" aria-expanded={profileMenu} onClick={()=>setProfileMenu(open=>!open)}><Icon name="chevron"/></button></div></div></aside><div className="main-wrap"><header><Button variant="ghost" icon="menu" className="menu-btn" onClick={()=>setSidebar(true)}/><div className="top-search"><Icon name="search"/><input value={globalSearch} onChange={event=>setGlobalSearch(event.target.value)} onKeyDown={event=>{if(event.key==="Escape")setGlobalSearch("")}} placeholder="Search pages, applications, users..."/><kbd>⌘ K</kbd>{searchTerm&&<div className="global-search-results">{searchResults.length?searchResults.map(result=><button key={result.key} onClick={()=>{result.select();setGlobalSearch("")}}><span><Icon name={result.icon} size={16}/></span><span><strong>{result.label}</strong><small>{result.description}</small></span></button>):<div className="global-search-empty">No results found</div>}</div>}</div><div className="header-actions"><select value={selectedEnvironment} onChange={e=>setSelectedEnvironment(e.target.value)}><option>Production</option><option>Staging</option><option>Development</option></select><button className="icon-button" onClick={()=>{const opening=!notify;setNotify(opening);if(opening)setNotificationRead(true)}}><Icon name="bell"/>{environmentHasDeployment&&!notificationRead&&<i/>}</button><div className="header-user"><Avatar initials={session?.name.split(" ").map(part=>part[0]).join("").slice(0,2).toUpperCase()||"US"} small/><span><strong>{session?.name}</strong><small>{session?.role}</small></span></div></div>{notify&&<div className="notifications"><div className="notification-head"><strong>Notifications</strong></div>{environmentHasDeployment?<div className="notification-item"><span className="notif-icon success"><Icon name="check"/></span><span><strong>Deployment successful</strong><small>{deployedApp?.name} v1.4.3 deployed successfully.</small><em>Just now</em></span></div>:<EmptyState icon="bell" title="No notifications" description="Updates about your applications will appear here."/>}</div>}</header><main>{persistenceError&&<div className="settings-error" role="alert">MongoDB save failed: {persistenceError}</div>}{content}</main></div>{modal==="create"&&<CreateModal close={()=>setModal(null)} create={createApplication}/>} {modal==="deploy"&&activeApp&&<DeployModal app={activeApp} close={()=>setModal(null)} confirm={()=>{setModal(null);startDeployment()}}/>} {modal==="edit"&&activeApp&&<EditApplicationModal app={activeApp} close={()=>setModal(null)} save={updateApplication}/>}</div>;
}

