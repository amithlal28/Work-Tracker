import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { db } from './firebase';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, writeBatch, addDoc
} from 'firebase/firestore';

// ─── Firestore Collections ─────────────────────────────────────────────────────
// /users/{username}  → { passkey: string }
// /entries/{id}      → { username, date, task, hours, details, createdAt }

const DEFAULT_USER = 'Amith';
const DEFAULT_PASSKEY = 'cosmos';

const SEED_DATA = [
  { date: "2025-12-03", task: "Clorox-Substance Load", hours: 3, details: "Created custom fields and loaded list types with required values" },
  { date: "2025-12-03", task: "Clorox-Substance Load", hours: 2, details: "Troubleshot SDK error (Name not passed in CAS, CAS Number issue)" },
  { date: "2025-12-03", task: "Clorox-Substance Load", hours: 1, details: "Edited existing fields and created new fields" },
  { date: "2025-12-04", task: "Clorox-Substance Load", hours: 3, details: "Developed test script for Substance Load" },
  { date: "2025-12-04", task: "Clorox-Substance Load", hours: 5, details: "Created load script for Substance Load" },
  { date: "2025-12-04", task: "Clorox-Substance Load", hours: 3, details: "Troubleshot SDK for updating existing CAS" },
  { date: "2025-12-05", task: "Clorox-Substance Load", hours: 3, details: "Tested APIs for updating existing CAS" },
  { date: "2025-12-05", task: "Clorox-Substance Load", hours: 6, details: "Reworked load script to include APIs with SDK (hybrid approach)" },
  { date: "2025-12-05", task: "Clorox-Substance Load", hours: 4, details: "Executed Substance Load" },
  { date: "2025-12-09", task: "Clorox-Raw Materials Load", hours: 4, details: "Created/updated custom fields and loaded list types" },
  { date: "2025-12-09", task: "Clorox-Raw Materials Load", hours: 5, details: "Discussions on dataset and load logic" },
  { date: "2025-12-10", task: "Clorox-Raw Materials Load", hours: 3, details: "Troubleshot target parameter (inventory value in CAS)" },
  { date: "2025-12-10", task: "Clorox-Raw Materials Load", hours: 2, details: "Resolved issue with large inventory name search" },
  { date: "2025-12-11", task: "Clorox-Raw Materials Load", hours: 6, details: "Developed test script for Material Load" },
  { date: "2025-12-11", task: "Clorox-Raw Materials Load", hours: 5, details: "Created load script for Material Load" },
  { date: "2025-12-12", task: "Clorox-Raw Materials Load", hours: 4, details: "Investigated category field implementation in CAS" },
  { date: "2025-12-12", task: "Clorox-Raw Materials Load", hours: 2, details: "Updated load script to include category implementation" },
  { date: "2025-12-12", task: "Clorox-Raw Materials Load", hours: 1, details: "Modified raw material name in load script" },
  { date: "2025-12-12", task: "Clorox-Raw Materials Load", hours: 4, details: "Executed Raw Material Load (4000 materials)" },
  { date: "2025-12-15", task: "Clorox-Raw Materials Load", hours: 3, details: "Reviewed Errors and Made fixes for the failed raw materials." },
  { date: "2025-12-15", task: "Avient - DT Load", hours: 3, details: "Reviewing Dataset and Cleaning before Test Load" },
  { date: "2025-12-15", task: "Clorox-Raw Materials Load", hours: 4, details: "Executed Raw Material Load (3,837 materials)" },
  { date: "2025-12-16", task: "Avient - DT Load", hours: 1, details: "Modifying Load Script" },
  { date: "2025-12-16", task: "Avient - DT Load", hours: 2, details: "Issues with missing Standards support in SDK" },
  { date: "2025-12-16", task: "Avient - DT Load", hours: 2, details: "Testing Standards APIs" },
  { date: "2025-12-16", task: "Avient - DT Load", hours: 4, details: "Created Hybrid Script For data Load Including Standards APIs." },
  { date: "2025-12-17", task: "Avient - DT Load", hours: 1, details: "Test Load for DT" },
  { date: "2025-12-17", task: "Avient - DT Load", hours: 2, details: "Data Template Load and Review" },
  { date: "2025-12-17", task: "Clorox-Formulas Load", hours: 2, details: "Reviewing Formulas Creation Sheet" },
  { date: "2025-12-17", task: "Clorox-Formulas Load", hours: 2, details: "Creating and Updating CustomFields with Values" },
  { date: "2025-12-18", task: "Clorox-Formulas Load", hours: 2, details: "Creating Test Load Script" },
  { date: "2025-12-18", task: "Clorox-Formulas Load", hours: 1, details: "Testing Formulas Loads" },
  { date: "2025-12-18", task: "Clorox-Formulas Load", hours: 3, details: "Creating Load Script" },
  { date: "2025-12-18", task: "Clorox-Formulas Load", hours: 3, details: "Troubleshooting on Circular referencing of Formulas in the Dataset." },
  { date: "2025-12-19", task: "Clorox-Formulas Load", hours: 1, details: "Adjusting the Dataset to avoid the load of Circular referencing." },
  { date: "2025-12-19", task: "Clorox-Formulas Load", hours: 1.5, details: "Modifying the Load Script for updated Load Script" },
  { date: "2025-12-19", task: "Clorox-Raw Materials Load", hours: 2, details: "Formula Load and Review" }
];

export const StorageService = {
  // ─── Auth & User Management ──────────────────────────────────────────────────

  getUsers: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const users = {};
      snapshot.forEach(d => { users[d.id] = d.data().passkey; });
      return users;
    } catch {
      return {};
    }
  },

  getAllUsersList: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(d => ({ username: d.id, passkey: d.data().passkey }));
    } catch {
      return [];
    }
  },

  createUser: async (username, passkey) => {
    const userRef = doc(db, 'users', username);
    const existing = await getDoc(userRef);
    if (existing.exists()) {
      throw new Error('Username already exists');
    }
    await setDoc(userRef, { passkey });
    return true;
  },

  verifyUser: async (username, passkey) => {
    try {
      const userRef = doc(db, 'users', username);
      const snap = await getDoc(userRef);
      return snap.exists() && snap.data().passkey === passkey;
    } catch {
      return false;
    }
  },

  resetUserPasskey: async (username, newPasskey) => {
    try {
      const userRef = doc(db, 'users', username);
      const snap = await getDoc(userRef);
      if (!snap.exists()) return false;
      await updateDoc(userRef, { passkey: newPasskey });
      return true;
    } catch {
      return false;
    }
  },

  initSeeding: async () => {
    // Seed admin user
    const adminRef = doc(db, 'users', 'admin');
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists()) {
      await setDoc(adminRef, { passkey: 'cosmos' });
    }

    // Seed default user
    const userRef = doc(db, 'users', DEFAULT_USER);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, { passkey: DEFAULT_PASSKEY });
    }

    // Seed entries (only add missing ones)
    const currentData = await StorageService.load(DEFAULT_USER);
    const existingKeys = new Set(currentData.map(d => d.task + d.date + d.details));

    const batch = writeBatch(db);
    let addedCount = 0;

    SEED_DATA.forEach(item => {
      const key = item.task + item.date + item.details;
      if (!existingKeys.has(key)) {
        const newRef = doc(collection(db, 'entries'));
        batch.set(newRef, {
          username: DEFAULT_USER,
          id: newRef.id,
          createdAt: new Date().toISOString(),
          ...item
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      await batch.commit();
      console.log(`Seeded ${DEFAULT_USER} with ${addedCount} new entries.`);
    }
  },

  // ─── Data Management ─────────────────────────────────────────────────────────

  load: async (username) => {
    if (!username) return [];
    try {
      const q = query(collection(db, 'entries'), where('username', '==', username));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      // Sort by date descending
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      return data;
    } catch (e) {
      console.error('Firestore load failed:', e);
      return [];
    }
  },

  addEntry: async (username, entry) => {
    const newRef = doc(collection(db, 'entries'));
    const newEntry = {
      id: newRef.id,
      username,
      createdAt: new Date().toISOString(),
      ...entry
    };
    await setDoc(newRef, newEntry);
    return newEntry;
  },

  updateEntry: async (username, updatedEntry) => {
    try {
      const entryRef = doc(db, 'entries', updatedEntry.id);
      await updateDoc(entryRef, { ...updatedEntry });
      return true;
    } catch (e) {
      console.error('Firestore updateEntry failed:', e);
      return false;
    }
  },

  deleteEntry: async (username, id) => {
    try {
      await deleteDoc(doc(db, 'entries', id));
      return await StorageService.load(username);
    } catch (e) {
      console.error('Firestore deleteEntry failed:', e);
      return [];
    }
  },

  // save() kept for backward compatibility (import flow uses it)
  save: async (username, data) => {
    if (!username || !Array.isArray(data)) return false;
    try {
      // Delete existing entries for this user, then bulk-write new ones
      const q = query(collection(db, 'entries'), where('username', '==', username));
      const snapshot = await getDocs(q);

      const batch = writeBatch(db);
      snapshot.docs.forEach(d => batch.delete(d.ref));

      data.forEach(entry => {
        const ref = entry.id
          ? doc(db, 'entries', entry.id)
          : doc(collection(db, 'entries'));
        batch.set(ref, { ...entry, username });
      });

      await batch.commit();
      return true;
    } catch (e) {
      console.error('Firestore save failed:', e);
      return false;
    }
  },

  clear: async (username) => {
    if (!username) return;
    await StorageService.save(username, []);
    return [];
  },

  // ─── Export / Import (unchanged logic, just uses async load/save) ─────────────

  exportToExcel: async (username, startDate, endDate, selectedTasks = []) => {
    const data = await StorageService.load(username);

    const filteredData = data.filter(item => {
      const itemDate = new Date(item.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const itemDay = new Date(itemDate);
      itemDay.setHours(12, 0, 0, 0);
      const dateInRange = itemDay >= start && itemDay <= end;
      const taskMatch = selectedTasks.length === 0 || selectedTasks.includes(item.task);
      return dateInRange && taskMatch;
    });

    if (filteredData.length === 0) {
      alert('No data found for the selected criteria.');
      return;
    }

    const excelData = filteredData.map(item => ({
      Date: item.date,
      Task: item.task,
      Hours: item.hours,
      Details: item.details
    }));

    const totalHours = excelData.reduce((sum, item) => sum + (item.Hours || 0), 0);
    excelData.push({ Date: 'Total', Task: '', Hours: totalHours, Details: '' });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Work Log');

    const filename = `WorkLog_${username}_${startDate}_to_${endDate}.xlsx`;
    XLSX.writeFile(workbook, filename);
  },

  exportToJson: async (username) => {
    const data = await StorageService.load(username);
    if (!data || data.length === 0) {
      alert('No data found to export.');
      return;
    }
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WorkLog_${username}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  importFromExcel: async (username, file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const currentData = await StorageService.load(username);
          let importedCount = 0;

          const batch = writeBatch(db);

          jsonData.forEach(row => {
            if (!row.Date || !row.Task) return;
            if (row.Date === 'Total') return;
            const newRef = doc(collection(db, 'entries'));
            batch.set(newRef, {
              id: newRef.id,
              username,
              createdAt: new Date().toISOString(),
              date: row.Date,
              task: row.Task,
              hours: row.Hours || 0,
              details: row.Details || ''
            });
            importedCount++;
          });

          await batch.commit();
          resolve(importedCount);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }
};
