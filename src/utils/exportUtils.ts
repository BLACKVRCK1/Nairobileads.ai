import { Lead } from '../types';

export function exportToCSV(leads: Lead[], filename = 'nairobi-b2b-leads.csv') {
  const headers = [
    'Company Name',
    'Category',
    'Sub-Sector',
    'Nairobi Location',
    'Physical Office Address',
    'Official Website',
    'Public Inquiry Email',
    'Public Phone Line',
    'ICP Score',
    'Status',
    'Confidence Score',
    'Data Protection Status',
    'Google Maps URI',
    'Primary Source Citations',
    'Date Researched',
  ];

  const rows = leads.map((lead) => {
    const sourceUrls = (lead.sources || []).map((s) => `${s.title}: ${s.uri}`).join(' | ');
    return [
      escapeCSV(lead.name),
      escapeCSV(lead.category),
      escapeCSV(lead.subSector),
      escapeCSV(lead.location),
      escapeCSV(lead.officeAddress || lead.locationDetail),
      escapeCSV(lead.officialWebsite || ''),
      escapeCSV(lead.publicEmail || ''),
      escapeCSV(lead.publicPhone || ''),
      lead.deepQualification?.icpScore ?? lead.confidenceScore ?? '',
      escapeCSV(lead.status),
      lead.confidenceScore ?? '',
      escapeCSV(lead.dataProtectionStatus || 'ODPC Compliant - Public Corporate Record'),
      escapeCSV(lead.mapsUri || ''),
      escapeCSV(sourceUrls),
      escapeCSV(lead.savedAt || new Date().toISOString()),
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(leads: Lead[], filename = 'nairobi-b2b-leads.json') {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(leads, null, 2))}`;
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCSV(str: string): string {
  if (!str) return '""';
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}
