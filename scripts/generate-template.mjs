import * as XLSX from 'xlsx';

const rows = [
  {
    name: 'Bapak Andi dan Keluarga',
    greeting: 'Bapak/Ibu',
    phone: '081234567801',
    group: 'Keluarga',
    invitation_quota: 4,
    notes: 'Keluarga mempelai pria',
  },
  {
    name: 'Siti Maharani',
    greeting: 'Saudari',
    phone: '081234567802',
    group: 'Sahabat',
    invitation_quota: 2,
    notes: 'Teman kuliah',
  },
  {
    name: 'Rizky Hidayat',
    greeting: 'Saudara',
    phone: '081234567803',
    group: 'Kantor',
    invitation_quota: 1,
    notes: 'Tim kantor',
  },
  {
    name: 'Keluarga Besar Wijaya',
    greeting: 'Bapak/Ibu',
    phone: '081234567804',
    group: 'Keluarga',
    invitation_quota: 5,
    notes: 'Kerabat luar kota',
  },
  {
    name: 'Dewi Lestari',
    greeting: 'Saudari',
    phone: '081234567805',
    group: 'Sahabat',
    invitation_quota: 2,
    notes: 'Sahabat mempelai wanita',
  },
];

const workbook = XLSX.utils.book_new();
const sheet = XLSX.utils.json_to_sheet(rows, {
  header: ['name', 'greeting', 'phone', 'group', 'invitation_quota', 'notes'],
});
sheet['!cols'] = [
  { wch: 30 },
  { wch: 16 },
  { wch: 18 },
  { wch: 16 },
  { wch: 18 },
  { wch: 32 },
];
XLSX.utils.book_append_sheet(workbook, sheet, 'Daftar Tamu');
XLSX.writeFile(workbook, 'public/templates/template-daftar-tamu.xlsx', {
  compression: true,
});
console.log(
  'Template Excel dibuat: public/templates/template-daftar-tamu.xlsx',
);
