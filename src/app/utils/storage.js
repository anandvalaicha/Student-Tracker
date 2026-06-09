const PREFIX = "studyflow:";

export function save(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function load(key, fallback = null) {
  const raw = localStorage.getItem(PREFIX + key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

// ✅ These 2 are for your App.jsx usage
const ASSIGNMENTS_KEY = "assignments";

export function saveAssignments(assignments) {
  save(ASSIGNMENTS_KEY, assignments);
}

export function loadAssignments(fallback = []) {
  return load(ASSIGNMENTS_KEY, fallback);
}
