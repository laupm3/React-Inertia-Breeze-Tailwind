const folderStructure = {
  'Mis Carpetas': {
    folders: [
      { name: 'Personal', key: 'personal' },
      { name: 'Trabajo', key: 'trabajo' },
      { name: 'Seguridad', key: 'seguridad', requiresPassword: true },
    ],
    files: [],
  },
  personal: {
    folders: [],
    files: [
      { name: 'DNI.pdf', location: 'Documentación personal', date: '1 ene 2023' },
      { name: 'Cuenta bancaria.pdf', location: 'Documentación personal', date: '15 mar 2023' },
      { name: 'Licencia de conducir.pdf', location: 'Documentación personal', date: '10 may 2023' },
    ],
  },
  trabajo: {
    folders: [
      { name: 'Nóminas y Contratos', key: 'nominas' },
      { name: 'Certificados', key: 'certificados' },
      { name: 'Permisos', key: 'permisos' },
      { name: 'Justificantes de Bajas', key: 'bajas' },
    ],
    files: [],
  },
  nominas: {
    folders: [
      { name: 'Contratos', key: 'contratos' },
      ...generateYearFolders(2015, 2024), // Genera carpetas de año desde 2019 a 2024
    ],
    files: [],
  },
  contratos: {
    folders: [],
    files: [
      { name: 'Contrato_Gomez_Tania.pdf', location: 'Contratos', date: '1 nov 2023' },
      { name: 'Contrato_Lopez_Maria.pdf', location: 'Contratos', date: '10 oct 2023' },
      { name: 'Contrato_Perez_Juan.pdf', location: 'Contratos', date: '15 sep 2023' },
    ],
  },
  certificados: {
    folders: [],
    files: [
      { name: 'Certificado_Trabajo.pdf', location: 'Certificados', date: '1 jul 2023' },
      { name: 'Certificado_Antiguedad.pdf', location: 'Certificados', date: '1 ago 2023' },
      { name: 'Certificado_Horas.pdf', location: 'Certificados', date: '1 sep 2023' },
    ],
  },
  permisos: {
    folders: [],
    files: [
      { name: 'Permiso_Licencia_Medica.pdf', location: 'Permisos', date: '1 oct 2023' },
      { name: 'Permiso_Personal.pdf', location: 'Permisos', date: '15 oct 2023' },
      { name: 'Permiso_Vacaciones.pdf', location: 'Permisos', date: '30 oct 2023' },
    ],
  },
  bajas: {
    folders: [],
    files: [
      { name: 'Justificante_Baja_Medica_1.pdf', location: 'Justificantes de Bajas', date: '5 nov 2023' },
      { name: 'Justificante_Baja_Medica_2.pdf', location: 'Justificantes de Bajas', date: '10 nov 2023' },
      { name: 'Justificante_Baja_Medica_3.pdf', location: 'Justificantes de Bajas', date: '15 nov 2023' },
    ],
  },
  year_2019: {
    folders: [],
    files: [
      { name: 'Nómina_Enero_2019.pdf', location: '2019', date: '1 ene 2019' },
      { name: 'Nómina_Febrero_2019.pdf', location: '2019', date: '1 feb 2019' },
      { name: 'Nómina_Marzo_2019.pdf', location: '2019', date: '1 mar 2019' },
    ],
  },
  year_2020: {
    folders: [],
    files: [
      { name: 'Nómina_Enero_2020.pdf', location: '2020', date: '1 ene 2020' },
      { name: 'Nómina_Febrero_2020.pdf', location: '2020', date: '1 feb 2020' },
      { name: 'Nómina_Marzo_2020.pdf', location: '2020', date: '1 mar 2020' },
    ],
  },
  year_2021: {
    folders: [],
    files: [
      { name: 'Nómina_Enero_2021.pdf', location: '2021', date: '1 ene 2021' },
      { name: 'Nómina_Febrero_2021.pdf', location: '2021', date: '1 feb 2021' },
      { name: 'Nómina_Marzo_2021.pdf', location: '2021', date: '1 mar 2021' },
    ],
  },
  year_2022: {
    folders: [],
    files: [
      { name: 'Nómina_Enero_2022.pdf', location: '2022', date: '1 ene 2022' },
      { name: 'Nómina_Febrero_2022.pdf', location: '2022', date: '1 feb 2022' },
      { name: 'Nómina_Marzo_2022.pdf', location: '2022', date: '1 mar 2022' },
    ],
  },
  year_2023: {
    folders: [],
    files: [
      { name: 'Nómina_Enero_2023.pdf', location: '2023', date: '1 ene 2023' },
      { name: 'Nómina_Febrero_2023.pdf', location: '2023', date: '1 feb 2023' },
      { name: 'Nómina_Marzo_2023.pdf', location: '2023', date: '1 mar 2023' },
    ],
  },
  year_2024: {
    folders: [],
    files: [
      { name: 'Nómina_Enero_2024.pdf', location: '2024', date: '1 ene 2024' },
      { name: 'Nómina_Febrero_2024.pdf', location: '2024', date: '1 feb 2024' },
      { name: 'Nómina_Marzo_2024.pdf', location: '2024', date: '1 mar 2024' },
    ],
  },
  seguridad: {
    folders: [],
    files: [
      { name: 'Documento_Seguridad.pdf', location: 'Carpeta de seguridad', date: '1 ene 2023' },
      { name: 'Certificado_Seguridad.pdf', location: 'Carpeta de seguridad', date: '15 mar 2023' },
      { name: 'Contrato_Seguridad.pdf', location: 'Carpeta de seguridad', date: '10 may 2023' },
    ],
  },
};

function generateYearFolders(startYear = 2015, endYear = 2024) {
  const yearFolders = [];
  for (let year = startYear; year <= endYear; year++) {
    yearFolders.push({ name: `${year}`, key: `year_${year}` });
  }
  return yearFolders;
}

export default folderStructure;
