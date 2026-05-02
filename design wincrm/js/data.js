// WIN CRM — shared data + helpers
window.WIN = window.WIN || {};

WIN.STAGES = [
  { id: 1, key: "NEW", label: "Nouveau contact", color: "#64748b" },
  { id: 2, key: "QUAL_WAIT", label: "À qualifier", color: "#0ea5e9" },
  { id: 3, key: "QUAL", label: "Qualifié", color: "#3b82f6" },
  { id: 4, key: "PROPOSED", label: "Biens proposés", color: "#8b5cf6" },
  { id: 5, key: "VISIT_SCHED", label: "Visite programmée", color: "#a855f7" },
  { id: 6, key: "VISIT_DONE", label: "Visite effectuée", color: "#d946ef" },
  { id: 7, key: "FOLLOWUP", label: "Relance après visite", color: "#f59e0b" },
  { id: 8, key: "OFFER", label: "Offre / Négociation", color: "#f97316" },
  { id: 9, key: "WON", label: "Conclu", color: "#10b981", tone: "pos" },
  { id: 10, key: "LOST", label: "Perdu", color: "#ef4444", tone: "neg" },
];

WIN.STATES = {
  NEW: { label: "Nouveau", tone: "info" },
  REPLIED: { label: "Réponse envoyée", tone: "info" },
  CALLED: { label: "Contacté", tone: "info" },
  REJECTED: { label: "Non validé", tone: "neg" },
  QUALIFIED: { label: "Qualifié", tone: "accent" },
  VISITED: { label: "Visite OK", tone: "accent" },
  OFFERING: { label: "Offre en cours", tone: "warn" },
  ACCEPTED: { label: "Offre acceptée", tone: "pos" },
};

WIN.AGENTS = [
  { id: "AF", name: "Antony Fantapie", email: "antony.f@wincrm.fr", color: "#10b981" },
  { id: "MS", name: "Marie Simon", email: "marie.s@wincrm.fr", color: "#3b82f6" },
  { id: "JD", name: "Julien Durand", email: "julien.d@wincrm.fr", color: "#f59e0b" },
  { id: "CL", name: "Claire Leroy", email: "claire.l@wincrm.fr", color: "#a855f7" },
  { id: "TH", name: "Thomas Hubert", email: "thomas.h@wincrm.fr", color: "#ef4444" },
];

WIN.rng = (s) => () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

WIN.fmt = {
  money: (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " €",
  moneyShort: (n) => n >= 1e6 ? (n/1e6).toFixed(2) + "M€" : n >= 1e3 ? Math.round(n/1e3) + "k€" : n + "€",
  num: (n) => new Intl.NumberFormat("fr-FR").format(n),
  date: (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
  dateShort: (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
  rel: (d) => {
    const ms = +new Date(d) - Date.now();
    const days = Math.round(ms / 86400000);
    if (Math.abs(days) < 1) return "aujourd'hui";
    if (days === 1) return "demain";
    if (days === -1) return "hier";
    if (days > 0) return `dans ${days}j`;
    return `il y a ${-days}j`;
  },
};

(function generateLeads() {
  const rand = WIN.rng(42);
  const firstM = ["Antoine","Pierre","Lucas","Maxime","Hugo","Thomas","Étienne","Romain","Nicolas","Olivier","Vincent","Julien","Bastien","Damien","Alexandre","Benoît"];
  const firstF = ["Camille","Léa","Sophie","Marie","Charlotte","Élodie","Anaïs","Manon","Pauline","Clara","Émilie","Inès","Margaux","Julie","Sarah","Laura"];
  const last = ["Martin","Bernard","Dubois","Thomas","Robert","Petit","Durand","Leroy","Moreau","Simon","Laurent","Lefèvre","Roux","Fournier","Girard","Bonnet","Dupont","Lambert","Fontaine","Rousseau","Vincent","Muller","Faure","Chevalier","Garnier","Henry","Mercier","Boyer"];
  const types = ["Appartement","Maison","Studio","T2","T3","T4"];
  const natures = ["Achat","Location","Investissement"];
  const cities = ["Paris 11e","Paris 15e","Lyon 3e","Bordeaux","Marseille 8e","Toulouse","Nantes","Lille","Strasbourg","Nice","Rennes","Montpellier","Grenoble","Aix-en-Provence"];
  const stateKeys = Object.keys(WIN.STATES);
  const leads = [];
  for (let i = 0; i < 64; i++) {
    const isM = rand() > 0.5;
    const fn = (isM ? firstM : firstF)[Math.floor(rand() * (isM ? firstM.length : firstF.length))];
    const ln = last[Math.floor(rand() * last.length)];
    const stage = WIN.STAGES[Math.floor(rand() * WIN.STAGES.length)];
    const state = stateKeys[Math.floor(rand() * stateKeys.length)];
    const agent = WIN.AGENTS[Math.floor(rand() * WIN.AGENTS.length)];
    const bmin = Math.round((150 + rand() * 600) / 10) * 10000;
    const bmax = bmin + Math.round((30 + rand() * 200) / 10) * 10000;
    const created = new Date(Date.now() - rand() * 1000 * 3600 * 24 * 90);
    const nextAction = new Date(Date.now() + (rand() - 0.4) * 1000 * 3600 * 24 * 14);
    leads.push({
      id: "L-" + String(10482 + i).padStart(5, "0"),
      genre: isM ? "M." : "Mme",
      firstName: fn, lastName: ln,
      age: 28 + Math.floor(rand() * 35),
      email: (fn[0] + ln).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "@" + ["gmail.com","outlook.fr","free.fr","orange.fr"][Math.floor(rand() * 4)],
      phone: "06 " + ("" + Math.floor(rand() * 100000000)).padStart(8, "0").match(/.{2}/g).join(" "),
      city: cities[Math.floor(rand() * cities.length)],
      maritalStatus: ["Marié(e)","Célibataire","Divorcé(e)","Veuf(ve)"][Math.floor(rand() * 4)],
      heir: rand() > 0.7,
      nature: natures[Math.floor(rand() * natures.length)],
      type: types[Math.floor(rand() * types.length)],
      budgetMin: bmin, budgetMax: bmax,
      criteria: ["Ascenseur","Parking","Balcon","Calme","Lumineux","Étage élevé"].filter(() => rand() > 0.6).join(", "),
      stageId: stage.id, stage, state, agent,
      createdAt: created, nextAction,
      nextActionType: ["Appel","Email","Visite","RDV","Relance"][Math.floor(rand() * 5)],
      visits: Math.floor(rand() * 4),
    });
  }
  WIN.LEADS = leads;
})();

WIN.applyTheme = function(t) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem("win-theme", t); } catch (e) {}
};
WIN.initTheme = function() {
  let t = "light";
  try { t = localStorage.getItem("win-theme") || "light"; } catch (e) {}
  WIN.applyTheme(t);
};
WIN.toggleTheme = function() {
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  WIN.applyTheme(cur === "light" ? "dark" : "light");
};
WIN.initTheme();

// Icons (Lucide-like inline SVG)
WIN.icon = function(name, size = 18) {
  const I = {
    home: '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5Z"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8"/><path d="M22 21a7 7 0 0 0-5-6.7"/>',
    columns: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-6"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    filter: '<path d="M3 5h18M6 12h12M10 19h4"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    home2: '<path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/>',
    map: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    arrowR: '<path d="M5 12h14M13 5l7 7-7 7"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${I[name] || ""}</svg>`;
};
