/**
 * Deterministic SAMPLE booking generator for the infinite glass wall.
 * Every grid cell (col,row) always produces the same booking, so the wall is
 * infinite, stable while dragging, and needs no backend.
 *
 * ALL DATA IS FICTIONAL. Names are first name + last initial only. Never
 * replace this with real patient data on the marketing site.
 */

export interface SampleBooking {
  id: string;            // e.g. "APR-4F2A"
  first: string;
  lastInitial: string;
  initials: string;      // "AS"
  doctor: string;        // "Dr. Mehta"
  specialty: string;     // "Dermatology"
  day: "Today" | "Tomorrow";
  time: string;          // "4:15 PM"
  token: number;         // 1..40
  tint: 0 | 1 | 2 | 3 | 4; // maps to a soft tint token for the avatar ring
}

const FIRST = [
  "Aarav","Vivaan","Aditya","Ishaan","Kabir","Reyansh","Arjun","Rohan","Karan","Dev",
  "Ananya","Diya","Meera","Isha","Kavya","Riya","Saanvi","Tara","Nisha","Priya",
  "Neha","Pooja","Simran","Anjali","Harleen","Gurpreet","Manpreet","Jaspreet","Sunita","Rajesh",
  "Vikram","Sanjay","Deepak","Mohit","Naveen","Pankaj","Suresh","Lakshmi","Kiran","Sneha",
  "Aisha","Zoya","Imran","Farhan","Sahil","Tanvi","Yash","Nikhil","Rhea","Ira",
  "Aman","Bhavna","Chetan","Divya","Esha","Gaurav","Hema","Jatin","Komal","Lavanya",
];
const LAST_INITIALS = "ABCDGJKMNPRSTVY".split("");

const DOCTORS: ReadonlyArray<[string, string]> = [
  ["Dr. Mehta", "Dermatology"],
  ["Dr. Rao", "Pediatrics"],
  ["Dr. Kapoor", "Dental"],
  ["Dr. Nair", "Ophthalmology"],
  ["Dr. Bansal", "Orthopedics"],
  ["Dr. Sethi", "Physiotherapy"],
  ["Dr. Iyer", "Fertility & IVF"],
  ["Dr. Malhotra", "General OPD"],
];

/** 15-minute slots from 9:00 AM to 7:30 PM */
const SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let m = 9 * 60; m <= 19 * 60 + 30; m += 15) {
    const h24 = Math.floor(m / 60);
    const mm = m % 60;
    const h12 = ((h24 + 11) % 12) + 1;
    out.push(`${h12}:${mm.toString().padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`);
  }
  return out;
})();

/** 32-bit integer hash of (col,row,seed). Pure and deterministic. */
export function hash3(a: number, b: number, seed = 0): number {
  let h = (seed ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (a | 0), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13) ^ (b | 0), 0xc2b2ae35);
  h ^= h >>> 16;
  h = Math.imul(h, 0x27d4eb2f);
  h ^= h >>> 15;
  return h >>> 0;
}

/** Tiny PRNG stream seeded from a hash, so one cell can draw several values. */
function stream(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function bookingAt(col: number, row: number, seed = 7): SampleBooking {
  const rnd = stream(hash3(col, row, seed));
  const pick = <T,>(arr: ReadonlyArray<T>) => arr[Math.floor(rnd() * arr.length)];
  const first = pick(FIRST);
  const lastInitial = pick(LAST_INITIALS);
  const [doctor, specialty] = pick(DOCTORS);
  const idNum = Math.floor(rnd() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
  return {
    id: `APR-${idNum}`,
    first,
    lastInitial,
    initials: `${first[0]}${lastInitial}`,
    doctor,
    specialty,
    day: rnd() < 0.78 ? "Today" : "Tomorrow",
    time: pick(SLOTS),
    token: 1 + Math.floor(rnd() * 40),
    tint: Math.floor(rnd() * 5) as SampleBooking["tint"],
  };
}
