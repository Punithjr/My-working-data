export type GovernmentReference = {
 id:string; title:string; category:string; date?:string; number?:string; url:string; status:'verified-document'|'official-portal'; notes:string;
};
export const GOVERNMENT_REFERENCES:GovernmentReference[]=[
 {id:'edu-2026-registration',title:'2026-27 ಖಾಸಗಿ ಶಾಲೆ ನೋಂದಣಿ ಅವಧಿ ವಿಸ್ತರಣೆ — ಶಾಲಾ ಶಿಕ್ಷಣ ಆಯುಕ್ತರ ಸುತ್ತೋಲೆ',category:'ಶಾಲಾ ಶಿಕ್ಷಣ',date:'2026-06-30',number:'DPI-CPI0C7-2(NWS)/1/2026-E-2062350',url:'https://krcedu.in/pdf/TimelimitforobtainingRegistrationandSchoolacademicyear26_27.pdf',status:'verified-document',notes:'ಮೂರನೇ ಪಕ್ಷದ ಹೋಸ್ಟ್‌ನಲ್ಲಿರುವ ಸರ್ಕಾರಿ ಸುತ್ತೋಲೆಯ ಪ್ರತಿ; ಅಧಿಕೃತ ಮೂಲದೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ'},
 {id:'kcsr-amend-2020',title:'KCSR ತಿದ್ದುಪಡಿ ನಿಯಮಗಳು 2020 — ರಾಜ್ಯಪತ್ರ',category:'ಸೇವಾ ನಿಯಮಗಳು',date:'2020-12-11',number:'FD 6 SRA 2020',url:'https://upload.indiacode.nic.in/showfile?actid=AC_KA_71_412_00009_KARNATAKA+ACT+No.+14+OF+1990_1542864771739&filename=kcsr_ruls.pdf&type=rule',status:'verified-document',notes:'ಇದು ನಿರ್ದಿಷ್ಟ ತಿದ್ದುಪಡಿ; ಸಂಪೂರ್ಣ ಪ್ರಸ್ತುತ KCSR ಸಂಗ್ರಹವಲ್ಲ'},
 {id:'education-rules-1995',title:'ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಗಳ ವರ್ಗೀಕರಣ, ನಿಯಂತ್ರಣ ಮತ್ತು ಪಠ್ಯಕ್ರಮ ನಿಯಮಗಳು 1995',category:'ಶಾಲಾ ಶಿಕ್ಷಣ',date:'1996-10-04',number:'ED 116 VIVIDHA 95',url:'https://upload.indiacode.nic.in/showfile?actid=AC_KA_71_581_00003_KARNATAKA+ACT+No.+1+OF+1995_1543313553975&filename=1_edu.pdf&type=rule',status:'verified-document',notes:'ನಂತರದ ತಿದ್ದುಪಡಿಗಳ ಅನ್ವಯ ಪರಿಶೀಲಿಸಿ'},
 {id:'egazette',title:'ಕರ್ನಾಟಕ ಅಧಿಕೃತ e-Gazette — ರಾಜ್ಯಪತ್ರ ಹುಡುಕಾಟ',category:'ರಾಜ್ಯಪತ್ರ',url:'https://erajyapatra.karnataka.gov.in',status:'official-portal',notes:'ಹೊಸ ಸರ್ಕಾರಿ ಅಧಿಸೂಚನೆ/ತಿದ್ದುಪಡಿ ಹುಡುಕಲು'},
 {id:'council-circulars',title:'ಕರ್ನಾಟಕ ವಿಧಾನ ಪರಿಷತ್ ಸಚಿವಾಲಯ — ಸುತ್ತೋಲೆಗಳ ಸೂಚಿ',category:'ಸುತ್ತೋಲೆಗಳು',url:'https://kla.kar.nic.in/council/secretariatinfo/Circular/Circulars.htm',status:'official-portal',notes:'ಈ ಸಚಿವಾಲಯದ ಸುತ್ತೋಲೆಗಳು BEO ಕಚೇರಿಗೆ ಅನ್ವಯವಾಗುತ್ತವೆ ಎಂದು ಸ್ವಯಂ ಊಹಿಸಬೇಡಿ'}
];
