import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = 'WorkLog_Amith_2025-12-03_to_2025-12-19.xlsx';
const buffer = fs.readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet);

// Filter out total row and bad data
const cleanData = jsonData.filter(row => row.Date && row.Date !== 'Total').map(row => ({
    date: row.Date,
    task: row.Task,
    hours: row.Hours || 0,
    details: row.Details || ''
}));

fs.writeFileSync('temp_data.json', JSON.stringify(cleanData, null, 2));
console.log("Data written to temp_data.json");
