const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString();

export const PASSWORD = "NoahDemo2026!";

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    storage: "25 GB",
    seats: "3 members",
    features: ["1 workspace", "Basic tags", "Viewer + editor seats"],
  },
  {
    id: "team",
    name: "Team",
    price: "$29 / mo",
    storage: "1 TB",
    seats: "25 members",
    features: ["Unlimited workspaces", "Timestamp annotations", "Activity log"],
  },
  {
    id: "business",
    name: "Business",
    price: "$79 / mo",
    storage: "5 TB",
    seats: "Unlimited",
    features: ["SSO-ready", "Retention policies", "Priority support"],
  },
];

const VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const VIDEO_2 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";

export function buildSeed() {
  const org = {
    id: "org_northwind",
    name: "Northwind Pictures",
    planId: "team",
  };

  const users = [
    {
      id: "usr_maya",
      orgId: org.id,
      name: "Maya Chen",
      email: "demo@noah.app",
      password: PASSWORD,
      role: "Super Admin",
    },
    {
      id: "usr_jordan",
      orgId: org.id,
      name: "Jordan Hale",
      email: "editor@noah.app",
      password: PASSWORD,
      role: "Editor",
    },
    {
      id: "usr_priya",
      orgId: org.id,
      name: "Priya Nair",
      email: "collab@noah.app",
      password: PASSWORD,
      role: "Collaborator",
    },
    {
      id: "usr_chris",
      orgId: org.id,
      name: "Chris Adeyemi",
      email: "viewer@noah.app",
      password: PASSWORD,
      role: "Viewer",
    },
  ];

  const workspaces = [
    { id: "ws_brand", orgId: org.id, name: "Brand Studio", color: "#8e44ad" },
    { id: "ws_series", orgId: org.id, name: "Series Production", color: "#16a085" },
  ];

  const projects = [
    { id: "prj_winter", workspaceId: "ws_brand", name: "Winter Campaign" },
    { id: "prj_ep04", workspaceId: "ws_series", name: "Episode 04" },
  ];

  const folders = [
    { id: "fld_trailers", workspaceId: "ws_brand", projectId: "prj_winter", name: "Trailers" },
    { id: "fld_stills", workspaceId: "ws_brand", projectId: "prj_winter", name: "Stills" },
    { id: "fld_dailies", workspaceId: "ws_series", projectId: "prj_ep04", name: "Dailies" },
    { id: "fld_audio", workspaceId: "ws_series", projectId: "prj_ep04", name: "Audio" },
  ];

  const tags = [
    { id: "tag_hero", name: "hero", color: "#d28cff" },
    { id: "tag_legal", name: "needs-legal", color: "#e07a6e" },
    { id: "tag_final", name: "picture-lock", color: "#16a085" },
    { id: "tag_social", name: "social", color: "#5b8def" },
    { id: "tag_vo", name: "vo", color: "#e8b86d" },
  ];

  const media = [
    {
      id: "med_trailer",
      workspaceId: "ws_brand",
      folderId: "fld_trailers",
      projectId: "prj_winter",
      type: "video",
      title: "Northwind Trailer — Cut 03",
      duration: 596,
      size: "1.8 GB",
      codec: "H.264",
      thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80",
      src: VIDEO,
      tagIds: ["tag_hero", "tag_legal"],
      uploadedBy: "usr_jordan",
      createdAt: hoursAgo(30),
    },
    {
      id: "med_teaser",
      workspaceId: "ws_brand",
      folderId: "fld_trailers",
      projectId: "prj_winter",
      type: "video",
      title: "Launch Teaser — Vertical Cut",
      duration: 653,
      size: "410 MB",
      codec: "H.264",
      thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80",
      src: VIDEO_2,
      tagIds: ["tag_social"],
      uploadedBy: "usr_priya",
      createdAt: hoursAgo(18),
    },
    {
      id: "med_keyart",
      workspaceId: "ws_brand",
      folderId: "fld_stills",
      projectId: "prj_winter",
      type: "image",
      title: "Key Art — Winter Campaign",
      duration: 0,
      size: "48 MB",
      codec: "TIFF",
      thumbnail: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80",
      src: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&q=80",
      tagIds: ["tag_hero", "tag_final"],
      uploadedBy: "usr_maya",
      createdAt: hoursAgo(22),
    },
    {
      id: "med_look",
      workspaceId: "ws_brand",
      folderId: "fld_stills",
      projectId: "prj_winter",
      type: "image",
      title: "Color Still — Look 07 Amber",
      duration: 0,
      size: "18 MB",
      codec: "EXR",
      thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49ea17?w=1200&q=80",
      src: "https://images.unsplash.com/photo-1440404653325-ab127d49ea17?w=1600&q=80",
      tagIds: ["tag_final"],
      uploadedBy: "usr_jordan",
      createdAt: hoursAgo(10),
    },
    {
      id: "med_ep04",
      workspaceId: "ws_series",
      folderId: "fld_dailies",
      projectId: "prj_ep04",
      type: "video",
      title: "Episode 04 Picture Lock",
      duration: 596,
      size: "86 GB",
      codec: "DNxHR HQX",
      thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
      src: VIDEO,
      tagIds: ["tag_final", "tag_legal"],
      uploadedBy: "usr_jordan",
      createdAt: hoursAgo(8),
    },
    {
      id: "med_bts",
      workspaceId: "ws_series",
      folderId: "fld_dailies",
      projectId: "prj_ep04",
      type: "video",
      title: "BTS — Lighting Setup Day 3",
      duration: 653,
      size: "2.1 GB",
      codec: "H.264",
      thumbnail: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1200&q=80",
      src: VIDEO_2,
      tagIds: [],
      uploadedBy: "usr_priya",
      createdAt: hoursAgo(40),
    },
    {
      id: "med_vo",
      workspaceId: "ws_series",
      folderId: "fld_audio",
      projectId: "prj_ep04",
      type: "audio",
      title: "Product Launch VO — Take 12",
      duration: 38,
      size: "12 MB",
      codec: "WAV",
      thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80",
      src: "",
      tagIds: ["tag_vo"],
      uploadedBy: "usr_priya",
      createdAt: hoursAgo(6),
    },
    {
      id: "med_score",
      workspaceId: "ws_series",
      folderId: "fld_audio",
      projectId: "prj_ep04",
      type: "audio",
      title: "Score Cue — Main Titles",
      duration: 72,
      size: "28 MB",
      codec: "WAV",
      thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80",
      src: "",
      tagIds: ["tag_final"],
      uploadedBy: "usr_maya",
      createdAt: hoursAgo(14),
    },
  ];

  const annotations = [
    {
      id: "ann_1",
      mediaId: "med_trailer",
      tSeconds: 330,
      body: "Opening lockup is 4 frames late here. Recut on your NLE — we do not edit picture in Noah.",
      authorId: "usr_jordan",
      xPercent: 52,
      yPercent: 38,
      createdAt: hoursAgo(5),
    },
    {
      id: "ann_2",
      mediaId: "med_trailer",
      tSeconds: 48,
      body: "Legal: talent release still missing for the extra on the left.",
      authorId: "usr_maya",
      xPercent: 28,
      yPercent: 44,
      createdAt: hoursAgo(4),
    },
    {
      id: "ann_3",
      mediaId: "med_trailer",
      tSeconds: 512,
      body: "End card CTA is below brand minimum. Bump type size in After Effects.",
      authorId: "usr_priya",
      xPercent: 70,
      yPercent: 78,
      createdAt: hoursAgo(2),
    },
    {
      id: "ann_4",
      mediaId: "med_keyart",
      tSeconds: 0,
      body: "Crop is tight on the left title. Keep a 6% safety for print.",
      authorId: "usr_maya",
      xPercent: 18,
      yPercent: 42,
      createdAt: hoursAgo(3),
    },
    {
      id: "ann_5",
      mediaId: "med_ep04",
      tSeconds: 330,
      body: "Temp VFX plate. Flag for vendor — not something we finish in this app.",
      authorId: "usr_jordan",
      xPercent: 60,
      yPercent: 50,
      createdAt: hoursAgo(1),
    },
  ];

  const activities = [
    { id: "act_1", orgId: org.id, actorId: "usr_maya", message: "Maya Chen created workspace Brand Studio", at: hoursAgo(48) },
    { id: "act_2", orgId: org.id, actorId: "usr_maya", message: "Maya Chen created project Winter Campaign", at: hoursAgo(47) },
    { id: "act_3", orgId: org.id, actorId: "usr_jordan", message: "Jordan Hale uploaded Northwind Trailer — Cut 03 to Trailers", at: hoursAgo(30) },
    { id: "act_4", orgId: org.id, actorId: "usr_maya", message: "Maya Chen tagged Key Art — Winter Campaign with picture-lock", at: hoursAgo(22) },
    { id: "act_5", orgId: org.id, actorId: "usr_jordan", message: "Jordan Hale annotated Northwind Trailer at 05:30", at: hoursAgo(5) },
    { id: "act_6", orgId: org.id, actorId: "usr_priya", message: "Priya Nair uploaded Launch Teaser — Vertical Cut", at: hoursAgo(18) },
    { id: "act_7", orgId: org.id, actorId: "usr_chris", message: "Chris Adeyemi viewed Episode 04 Picture Lock", at: minutesAgo(40) },
  ];

  return {
    org,
    plans: PLANS,
    users,
    workspaces,
    projects,
    folders,
    tags,
    media,
    annotations,
    activities,
  };
}

export function canWrite(role) {
  return ["Super Admin", "Admin", "Editor", "Collaborator"].includes(role);
}

export function canAdmin(role) {
  return role === "Super Admin" || role === "Admin";
}
