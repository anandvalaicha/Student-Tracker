export const PAGE_KEYS = {
  login: "login",
  dashboard: "dashboard",
  assignments: "assignments",
  calendar: "calendar",
  profile: "profile",
};

export const ROUTES = {
  [PAGE_KEYS.login]: "/",
  [PAGE_KEYS.dashboard]: "/dashboard",
  [PAGE_KEYS.assignments]: "/assignments",
  [PAGE_KEYS.calendar]: "/calendar",
  [PAGE_KEYS.profile]: "/profile",
};

export const PAGE_TITLES = {
  [PAGE_KEYS.login]: "Login",
  [PAGE_KEYS.dashboard]: "Dashboard",
  [PAGE_KEYS.assignments]: "Assignments",
  [PAGE_KEYS.calendar]: "Calendar",
  [PAGE_KEYS.profile]: "Profile",
};

export const PAGE_ICONS = {
  [PAGE_KEYS.dashboard]: "LayoutDashboard",
  [PAGE_KEYS.assignments]: "FileText",
  [PAGE_KEYS.calendar]: "Calendar",
  [PAGE_KEYS.profile]: "User",
};

export const NAV_PAGES = [
  PAGE_KEYS.dashboard,
  PAGE_KEYS.assignments,
  PAGE_KEYS.calendar,
  PAGE_KEYS.profile,
];
