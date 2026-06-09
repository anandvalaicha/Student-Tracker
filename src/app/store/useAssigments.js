import { useEffect, useState } from "react";
import { load, save } from "../utils/storage";

const STORAGE_KEY = "assignments";

function getFutureDate(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split("T")[0];
}

const DEFAULT_ASSIGNMENTS = [
  {
    id: crypto.randomUUID(),
    title: "Tetris Game Report",
    course: "Java",
    due: getFutureDate(2),
    status: "In Progress",
    priority: "High",
  },
  {
    id: crypto.randomUUID(),
    title: "SQL + Power BI Dashboard",
    course: "Data Analytics",
    due: getFutureDate(4),
    status: "Not Started",
    priority: "Medium",
  },
  {
    id: crypto.randomUUID(),
    title: "Event Website Final Touches",
    course: "Web Dev",
    due: getFutureDate(6),
    status: "Submitted",
    priority: "Low",
  },
];

export default function useAssignments() {
  const [assignments, setAssignments] = useState(() =>
    load(STORAGE_KEY, DEFAULT_ASSIGNMENTS)
  );

  useEffect(() => {
    save(STORAGE_KEY, assignments);
  }, [assignments]);

  const addAssignment = (newItem) => {
    const itemWithId = { id: crypto.randomUUID(), ...newItem };
    setAssignments((prev) => [itemWithId, ...prev]);
  };

  const deleteAssignment = (id) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  return { assignments, setAssignments, addAssignment, deleteAssignment };
}
