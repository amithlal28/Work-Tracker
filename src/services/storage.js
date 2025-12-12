import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

const USERS_KEY = 'work_tracker_users'; // Stores { username: passkey }
const DATA_KEY_PREFIX = 'work_tracker_data_';

const DEFAULT_USER = 'Amith';
const DEFAULT_PASSKEY = 'cosmos';

const SEED_DATA = [
  // Substance Load (03 Dec - 05 Dec)
  { date: '2025-12-03', task: 'Substance Load', hours: 3, details: 'Created custom fields and loaded list types with required values' },
  { date: '2025-12-03', task: 'Substance Load', hours: 2, details: 'Troubleshot SDK error (Name not passed in CAS, CAS Number issue)' },
  { date: '2025-12-04', task: 'Substance Load', hours: 1, details: 'Edited existing fields and created new fields' },
  { date: '2025-12-04', task: 'Substance Load', hours: 3, details: 'Developed test script for Substance Load' },
  { date: '2025-12-05', task: 'Substance Load', hours: 5, details: 'Created load script for Substance Load' },
  { date: '2025-12-05', task: 'Substance Load', hours: 3, details: 'Troubleshot SDK for updating existing CAS' },
  { date: '2025-12-05', task: 'Substance Load', hours: 3, details: 'Tested APIs for updating existing CAS' },
  { date: '2025-12-05', task: 'Substance Load', hours: 6, details: 'Reworked load script to include APIs with SDK (hybrid approach)' },
  { date: '2025-12-05', task: 'Substance Load', hours: 4, details: 'Executed Substance Load' },

  // Raw Materials Load (09 Dec - 12 Dec)
  { date: '2025-12-09', task: 'Raw Materials Load', hours: 4, details: 'Created/updated custom fields and loaded list types' },
  { date: '2025-12-09', task: 'Raw Materials Load', hours: 5, details: 'Discussions on dataset and load logic' },
  { date: '2025-12-10', task: 'Raw Materials Load', hours: 3, details: 'Troubleshot target parameter (inventory value in CAS)' },
  { date: '2025-12-10', task: 'Raw Materials Load', hours: 2, details: 'Resolved issue with large inventory name search' },
  { date: '2025-12-11', task: 'Raw Materials Load', hours: 6, details: 'Developed test script for Material Load' },
  { date: '2025-12-11', task: 'Raw Materials Load', hours: 5, details: 'Created load script for Material Load' },
  { date: '2025-12-12', task: 'Raw Materials Load', hours: 4, details: 'Investigated category field implementation in CAS' },
  { date: '2025-12-12', task: 'Raw Materials Load', hours: 2, details: 'Updated load script to include category implementation' },
  { date: '2025-12-12', task: 'Raw Materials Load', hours: 1, details: 'Modified raw material name in load script' },
  { date: '2025-12-12', task: 'Raw Materials Load', hours: 8, details: 'Executed Raw Material Load (7,837 materials)' },
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

    // Seed Default User
    if (!users[DEFAULT_USER]) {
      StorageService.createUser(DEFAULT_USER, DEFAULT_PASSKEY);

      // Seed Data
      const entries = SEED_DATA.map(item => ({
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        ...item
      }));
      StorageService.save(DEFAULT_USER, entries);
      console.log(`Seeded user ${DEFAULT_USER} with ${entries.length} entries.`);
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

  exportToExcel: (username, startDate, endDate) => {
    const data = StorageService.load(username);

    const filteredData = data.filter(item => {
      const itemDate = new Date(item.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const itemDay = new Date(itemDate);
      itemDay.setHours(12, 0, 0, 0);

      return itemDay >= start && itemDay <= end;
    });

    if (filteredData.length === 0) {
      alert("No data found for the selected date range.");
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
  }
};
