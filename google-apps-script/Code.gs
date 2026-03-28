// =============================================
// Dentix Lab - Google Sheets Database API
// =============================================
// Spreadsheet ID
const SPREADSHEET_ID = '1h5tVrkYvuh2ziNNFbvuErN7Vf8h2ybSIhf918Qt5Z6A';

// Sheet Names
const SHEETS = {
  PATIENTS: 'Patients',
  DOCTORS: 'Doctors',
  SERVICES: 'Services',
  APPOINTMENTS: 'Appointments',
  INVOICES: 'Invoices',
  SETTINGS: 'Settings',
  TESTIMONIALS: 'Testimonials',
  MESSAGES: 'Messages'
};

// =============================================
// MAIN REQUEST HANDLER
// =============================================
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const action = e.parameter.action;
    const sheet = e.parameter.sheet;
    
    let result;
    
    switch(action) {
      case 'getAll':
        result = getAllRecords(sheet);
        break;
      case 'getById':
        result = getRecordById(sheet, e.parameter.id);
        break;
      case 'create':
        const createData = e.postData ? JSON.parse(e.postData.contents) : {};
        result = createRecord(sheet, createData);
        break;
      case 'update':
        const updateData = e.postData ? JSON.parse(e.postData.contents) : {};
        result = updateRecord(sheet, e.parameter.id, updateData);
        break;
      case 'delete':
        result = deleteRecord(sheet, e.parameter.id);
        break;
      case 'batchUpdateSettings':
        const settingsData = e.postData ? JSON.parse(e.postData.contents) : {};
        result = batchUpdateSettings(settingsData);
        break;
      case 'initialize':
        result = initializeSheets();
        break;
      default:
        result = { success: false, error: 'Invalid action: ' + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// =============================================
// BATCH UPDATE SETTINGS (FAST!)
// =============================================
function batchUpdateSettings(settingsObj) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Settings');
    
    if (!sheet) {
      return { success: false, error: 'Settings sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const keyIndex = headers.indexOf('key');
    const valueIndex = headers.indexOf('value');
    const updatedAtIndex = headers.indexOf('updatedAt');
    
    const existingKeys = {};
    for (let i = 1; i < data.length; i++) {
      existingKeys[data[i][keyIndex]] = i + 1;
    }
    
    const now = new Date().toISOString();
    let updated = 0;
    let created = 0;
    
    for (const [key, value] of Object.entries(settingsObj)) {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
      
      if (existingKeys[key]) {
        const row = existingKeys[key];
        sheet.getRange(row, valueIndex + 1).setValue(stringValue);
        if (updatedAtIndex >= 0) {
          sheet.getRange(row, updatedAtIndex + 1).setValue(now);
        }
        updated++;
      } else {
        const newRow = [Utilities.getUuid(), key, stringValue, '', now];
        sheet.appendRow(newRow);
        created++;
      }
    }
    
    return { success: true, message: 'Settings saved', updated, created };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// =============================================
// CRUD OPERATIONS
// =============================================

// Get All Records
function getAllRecords(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { success: false, error: 'Sheet not found: ' + sheetName };
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return { success: true, data: [] };
    }
    
    const headers = data[0];
    const records = [];
    
    for (let i = 1; i < data.length; i++) {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = data[i][index];
      });
      record._row = i + 1;
      records.push(record);
    }
    
    return { success: true, data: records };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Get Record by ID
function getRecordById(sheetName, id) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { success: false, error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf('id');
    
    if (idIndex === -1) {
      return { success: false, error: 'ID column not found' };
    }
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] == id) {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = data[i][index];
        });
        record._row = i + 1;
        return { success: true, data: record };
      }
    }
    
    return { success: false, error: 'Record not found' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Create Record
function createRecord(sheetName, recordData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { success: false, error: 'Sheet not found: ' + sheetName };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    if (!recordData.id) {
      recordData.id = Utilities.getUuid();
    }
    recordData.createdAt = new Date().toISOString();
    recordData.updatedAt = new Date().toISOString();
    
    const rowData = headers.map(header => {
      return recordData[header] !== undefined ? recordData[header] : '';
    });
    
    sheet.appendRow(rowData);
    
    return { success: true, data: recordData, message: 'Record created successfully' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Update Record
function updateRecord(sheetName, id, updateData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { success: false, error: 'Sheet not found: ' + sheetName };
    }
    
    if (!id) {
      return { success: false, error: 'ID is required for update' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf('id');
    
    if (idIndex === -1) {
      return { success: false, error: 'ID column not found' };
    }
    
    updateData.updatedAt = new Date().toISOString();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] == id) {
        headers.forEach((header, index) => {
          if (updateData[header] !== undefined) {
            sheet.getRange(i + 1, index + 1).setValue(updateData[header]);
          }
        });
        return { success: true, message: 'Record updated successfully' };
      }
    }
    
    return { success: false, error: 'Record not found with id: ' + id };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Delete Record
function deleteRecord(sheetName, id) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { success: false, error: 'Sheet not found: ' + sheetName };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idIndex = headers.indexOf('id');
    
    if (idIndex === -1) {
      return { success: false, error: 'ID column not found' };
    }
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] == id) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Record deleted successfully' };
      }
    }
    
    return { success: false, error: 'Record not found' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// =============================================
// INITIALIZE SHEETS
// =============================================
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const sheetStructures = {
    'Patients': ['id', 'name', 'email', 'phone', 'dateOfBirth', 'address', 'medicalHistory', 'createdAt', 'updatedAt'],
    'Doctors': ['id', 'name', 'email', 'phone', 'specialization', 'photo', 'availability', 'createdAt', 'updatedAt'],
    'Services': ['id', 'name', 'description', 'price', 'duration', 'category', 'createdAt', 'updatedAt'],
    'Appointments': ['id', 'patientId', 'patientName', 'doctorId', 'doctorName', 'serviceId', 'serviceName', 'date', 'time', 'status', 'notes', 'createdAt', 'updatedAt'],
    'Invoices': ['id', 'patientId', 'patientName', 'appointmentId', 'services', 'amount', 'currency', 'status', 'dueDate', 'paidDate', 'createdAt', 'updatedAt'],
    'Settings': ['id', 'key', 'value', 'description', 'updatedAt'],
    'Testimonials': ['id', 'patientName', 'rating', 'review', 'photo', 'approved', 'createdAt', 'updatedAt'],
    'Messages': ['id', 'name', 'email', 'phone', 'subject', 'message', 'status', 'createdAt', 'updatedAt']
  };
  
  const results = [];
  
  for (const [sheetName, headers] of Object.entries(sheetStructures)) {
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f97316');
      headerRange.setFontColor('#ffffff');
      
      results.push('Created sheet: ' + sheetName);
    } else {
      results.push('Sheet already exists: ' + sheetName);
    }
  }
  
  // Add sample services if empty
  const servicesSheet = ss.getSheetByName('Services');
  const servicesData = servicesSheet.getDataRange().getValues();
  
  if (servicesData.length <= 1) {
    const sampleServices = [
      [Utilities.getUuid(), 'Teeth Whitening', 'Professional teeth whitening treatment', '150', '60', 'Cosmetic', new Date().toISOString(), new Date().toISOString()],
      [Utilities.getUuid(), 'Dental Implants', 'Permanent tooth replacement', '2000', '120', 'Restorative', new Date().toISOString(), new Date().toISOString()],
      [Utilities.getUuid(), 'Root Canal Treatment', 'Save damaged teeth', '500', '90', 'Restorative', new Date().toISOString(), new Date().toISOString()],
      [Utilities.getUuid(), 'Routine Checkup', 'Dental examination and cleaning', '80', '30', 'Preventive', new Date().toISOString(), new Date().toISOString()],
      [Utilities.getUuid(), 'Dental Crown', 'Custom crown for damaged teeth', '600', '60', 'Restorative', new Date().toISOString(), new Date().toISOString()],
      [Utilities.getUuid(), 'Orthodontic Consultation', 'Braces and aligners consultation', '100', '45', 'Orthodontics', new Date().toISOString(), new Date().toISOString()]
    ];
    
    sampleServices.forEach(service => servicesSheet.appendRow(service));
    results.push('Added sample services');
  }
  
  // Add default settings if empty
  const settingsSheet = ss.getSheetByName('Settings');
  const settingsData = settingsSheet.getDataRange().getValues();
  
  if (settingsData.length <= 1) {
    const defaultSettings = [
      [Utilities.getUuid(), 'clinicName', 'Dentix Lab', 'Clinic name', new Date().toISOString()],
      [Utilities.getUuid(), 'currency', 'USD', 'Currency code', new Date().toISOString()],
      [Utilities.getUuid(), 'currencySymbol', '$', 'Currency symbol', new Date().toISOString()],
      [Utilities.getUuid(), 'phone', '+1 234 567 8900', 'Contact phone', new Date().toISOString()],
      [Utilities.getUuid(), 'email', 'info@dentixlab.com', 'Contact email', new Date().toISOString()],
      [Utilities.getUuid(), 'address', '123 Dental Street, City, Country', 'Clinic address', new Date().toISOString()],
      [Utilities.getUuid(), 'workingHours', 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM', 'Working hours', new Date().toISOString()],
      [Utilities.getUuid(), 'adminEmail', 'mr.gulnawaz008@gmail.com', 'Admin email', new Date().toISOString()]
    ];
    
    defaultSettings.forEach(setting => settingsSheet.appendRow(setting));
    results.push('Added default settings');
  }
  
  // Add sample doctors if empty
  const doctorsSheet = ss.getSheetByName('Doctors');
  const doctorsData = doctorsSheet.getDataRange().getValues();
  
  if (doctorsData.length <= 1) {
    const sampleDoctors = [
      [Utilities.getUuid(), 'Dr. Ahmad Khan', 'ahmad@dentixlab.com', '+1 234 567 8901', 'General Dentistry', '', 'Mon-Fri 9AM-5PM', new Date().toISOString(), new Date().toISOString()],
      [Utilities.getUuid(), 'Dr. Sarah Ali', 'sarah@dentixlab.com', '+1 234 567 8902', 'Orthodontics', '', 'Mon-Wed-Fri 10AM-6PM', new Date().toISOString(), new Date().toISOString()],
      [Utilities.getUuid(), 'Dr. Muhammad Usman', 'usman@dentixlab.com', '+1 234 567 8903', 'Oral Surgery', '', 'Tue-Thu 9AM-4PM', new Date().toISOString(), new Date().toISOString()]
    ];
    
    sampleDoctors.forEach(doctor => doctorsSheet.appendRow(doctor));
    results.push('Added sample doctors');
  }
  
  return { success: true, message: 'Sheets initialized successfully', details: results };
}
