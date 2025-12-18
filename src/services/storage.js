import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

const USERS_KEY = 'work_tracker_users'; // Stores { username: passkey }
const DATA_KEY_PREFIX = 'work_tracker_data_';

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
  // --- Auth & User Management ---

  getUsers: () => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    } catch {
      return {};
    }
  },

  getAllUsersList: () => {
    return Object.entries(StorageService.getUsers()).map(([username, passkey]) => ({ username, passkey }));
  },

  createUser: (username, passkey) => {
    const users = StorageService.getUsers();
    if (users[username]) {
      throw new Error("Username already exists");
    }
    users[username] = passkey;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  },

  verifyUser: (username, passkey) => {
    const users = StorageService.getUsers();
    return users[username] === passkey;
  },

  resetUserPasskey: (username, newPasskey) => {
    const users = StorageService.getUsers();
    if (users[username]) {
      users[username] = newPasskey;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    }
    return false;
  },

  initSeeding: () => {
    const users = StorageService.getUsers();

    // Seed Admin
    if (!users['admin']) {
      StorageService.createUser('admin', 'cosmos');
    }

    // Seed Default User (Create if not exists)
    if (!users[DEFAULT_USER]) {
      StorageService.createUser(DEFAULT_USER, DEFAULT_PASSKEY);
    }

    // Force Load/Merge Seed Data (Ensure this data always exists)
    const currentData = StorageService.load(DEFAULT_USER);
    const existingIds = new Set(currentData.map(d => d.task + d.date + d.details)); // Simple dedup key

    let addedCount = 0;
    SEED_DATA.forEach(item => {
      const key = item.task + item.date + item.details;
      if (!existingIds.has(key)) {
        currentData.push({
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          ...item
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      StorageService.save(DEFAULT_USER, currentData);
      console.log(`Seeded user ${DEFAULT_USER} with ${addedCount} new entries.`);
    }
  },

  // --- Data Management ---

  _getDataKey: (username) => `${DATA_KEY_PREFIX}${username}`,

  load: (username) => {
    if (!username) return [];
    try {
      const key = StorageService._getDataKey(username);
      const serialized = localStorage.getItem(key);
      if (serialized === null) return [];
      return JSON.parse(serialized);
    } catch (e) {
      console.error("Failed to load data:", e);
      return [];
    }
  },

  save: (username, data) => {
    if (!username) return false;
    try {
      const key = StorageService._getDataKey(username);
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      console.error("Failed to save data:", e);
      return false;
    }
  },

  addEntry: (username, entry) => {
    const data = StorageService.load(username);
    const newEntry = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...entry
    };
    data.push(newEntry);
    StorageService.save(username, data);
    return newEntry;
  },

  updateEntry: (username, updatedEntry) => {
    const data = StorageService.load(username);
    const index = data.findIndex(item => item.id === updatedEntry.id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedEntry };
      StorageService.save(username, data);
      return true;
    }
    return false;
  },

  deleteEntry: (username, id) => {
    const data = StorageService.load(username);
    const newData = data.filter(item => item.id !== id);
    StorageService.save(username, newData);
    return newData;
  },

  clear: (username) => {
    if (!username) return;
    localStorage.removeItem(StorageService._getDataKey(username));
    return [];
  },

  exportToExcel: (username, startDate, endDate, selectedTasks = []) => {
    const data = StorageService.load(username);

    const filteredData = data.filter(item => {
      const itemDate = new Date(item.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const itemDay = new Date(itemDate);
      itemDay.setHours(12, 0, 0, 0);

      const dateInRange = itemDay >= start && itemDay <= end;

      // If selectedTasks is empty or contains "All" (conceptually), we show all.
      // But typically UI passes [] for all? Or we check length.
      // Logic: If selectedTasks has items, require match.
      const taskMatch = selectedTasks.length === 0 || selectedTasks.includes(item.task);

      return dateInRange && taskMatch;
    });

    if (filteredData.length === 0) {
      alert("No data found for the selected criteria.");
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Work Log");

    const filename = `WorkLog_${username}_${startDate}_to_${endDate}.xlsx`;
    XLSX.writeFile(workbook, filename);
  },

  exportToJson: (username) => {
    const data = StorageService.load(username);
    if (!data || data.length === 0) {
      alert("No data found to export.");
      return;
    }
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
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
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let importedCount = 0;
          jsonData.forEach(row => {
            // Start Basic Validation
            if (!row.Date || !row.Task) return; // Skip invalid rows or total row
            if (row.Date === 'Total') return;

            // Create Entry
            const newEntry = {
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              date: row.Date,
              task: row.Task,
              hours: row.Hours || 0,
              details: row.Details || ''
            };

            // Add directly to storage (appending)
            StorageService.addEntry(username, newEntry);
            importedCount++;
          });
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
