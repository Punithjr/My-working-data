// Curated reference links. These are external sources, not bundled copyrighted books.
// Check amendments and applicability before relying on any rule in an official letter.
export interface OfficeReferenceBook {
  id: string;
  title: string;
  category: string;
  source: string;
  url: string;
  note: string;
}
export const OFFICE_REFERENCE_BOOKS: OfficeReferenceBook[] = [
  {id:'kcsr',title:'ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿಗಳು (KCSR), Volume I',category:'ಸೇವಾ ನಿಯಮಗಳು',source:'India Code',url:'https://upload.indiacode.nic.in/showfile?actid=AC_KA_71_412_00009_KARNATAKA+ACT+No.+14+OF+1990_1542864771739&filename=kcsr_2017.pdf&type=rule',note:'ರಜೆ, ವೇತನ, ಸೇವಾ ದಾಖಲೆ ಮತ್ತು ಪಿಂಚಣಿ; ನಂತರದ ತಿದ್ದುಪಡಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ'},
  {id:'edu-act',title:'ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ ಕಾಯ್ದೆ, 1983 ಮತ್ತು ಸಂಬಂಧಿತ ನಿಯಮಗಳು',category:'ಶಾಲಾ ಶಿಕ್ಷಣ',source:'India Code catalogue',url:'https://indiacode.ecourtsindia.com/karnataka-education-act-1983/',note:'ಶಾಲಾ ನೋಂದಣಿ, ಮಾನ್ಯತೆ ಮತ್ತು ಆಡಳಿತ; ಅಧಿಕೃತ ಅಧಿಸೂಚನೆಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ'},
  {id:'edu-rules',title:'ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆಯ ಕಾಯ್ದೆಗಳು, ನಿಯಮಗಳು ಮತ್ತು Grant-in-Aid Codes',category:'ಶಾಲಾ ಶಿಕ್ಷಣ',source:'Government of Karnataka, Chamarajanagar District',url:'https://chamrajnagar.nic.in/en/welfareschemes/',note:'ಶಿಕ್ಷಣ ಇಲಾಖೆ ನಿಯಮಗಳು ಮತ್ತು ಅನುದಾನ ಸಂಹಿತೆಗಳ ಮೂಲ ಸೂಚಿ'},
  {id:'rte',title:'ಮಕ್ಕಳ ಉಚಿತ ಮತ್ತು ಕಡ್ಡಾಯ ಶಿಕ್ಷಣ ಹಕ್ಕು ಕಾಯ್ದೆ, 2009 (RTE)',category:'ಶಾಲಾ ಶಿಕ್ಷಣ',source:'India Code',url:'https://www.indiacode.nic.in/indiacode/handle/123456789/2086?view_type=browse',note:'ಮಕ್ಕಳ ಹಕ್ಕು, ಶಾಲಾ ಮಾನ್ಯತೆ ಮತ್ತು ಶಿಕ್ಷಕರ ಕರ್ತವ್ಯ'},
  {id:'rti',title:'ಮಾಹಿತಿ ಹಕ್ಕು ಕಾಯ್ದೆ, 2005 (RTI)',category:'ಮಾಹಿತಿ ಹಕ್ಕು',source:'India Code',url:'https://www.indiacode.nic.in/bitstream/123456789/15691/1/rti_act_2005.pdf',note:'RTI ಅರ್ಜಿ, ಮಾಹಿತಿ ಒದಗಿಸುವಿಕೆ ಮತ್ತು ವಿನಾಯಿತಿಗಳು'},
  {id:'pension-guidelines',title:'ಕರ್ನಾಟಕ Accountant General — ಪಿಂಚಣಿ ಮಾರ್ಗಸೂಚಿಗಳು',category:'ಪಿಂಚಣಿ',source:'CAG Karnataka',url:'https://cag.gov.in/ae/karnataka/en/page-ae-karnataka-pension-guidelines',note:'ನಿವೃತ್ತಿ ಪ್ರಸ್ತಾವನೆ ಸಿದ್ಧತೆ ಮತ್ತು ಸಲ್ಲಿಕೆ'},
  {id:'pension-intro',title:'ಕರ್ನಾಟಕ Accountant General — ಪಿಂಚಣಿ ನಿಯಮಗಳ ಪರಿಚಯ',category:'ಪಿಂಚಣಿ',source:'CAG Karnataka',url:'https://cag.gov.in/ae/karnataka/en/page-ae-karnataka-pension-introduction',note:'ಅರ್ಹತಾ ಸೇವೆ ಮತ್ತು ಪಿಂಚಣಿ ಪದಗಳ ವಿವರಣೆ; ಇತ್ತೀಚಿನ ಆದೇಶಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ'},
  {id:'pension-2024',title:'ಏಳನೇ ರಾಜ್ಯ ವೇತನ ಆಯೋಗ — ಪರಿಷ್ಕೃತ ಪಿಂಚಣಿ ಆದೇಶ, 28-08-2024',category:'ಪಿಂಚಣಿ',source:'Government of Karnataka order copy',url:'https://ag.ap.nic.in/pagae/Pensions/OGGRS/KARNATAKA-625316.pdf',note:'ಪಿಂಚಣಿ ಮೊತ್ತ ಮತ್ತು ಮಿತಿಗಳ ಪರಿಷ್ಕರಣೆ; ಅಧಿಕೃತ ಆದೇಶದ ಪ್ರಸ್ತುತ ಅನ್ವಯ ಪರಿಶೀಲಿಸಿ'}
];
