import { PensionCaseRecord, OfficeConfig } from '../types';
import { formatINR, numberToKannadaWords, formatDDMMYYYY, DEFAULT_PENSION_OFFICE_CONFIG } from './pensionCalculator';

/**
 * ============================================================================
 * KARNATAKA OFFICIAL PENSION DOSSIER TEMPLATES (18 PDF PAGES WORD-FOR-WORD)
 * Matching the exact 18-page Karnataka State Pension Proposal Dossier
 * ============================================================================
 */

const DOSSIER_STYLE = `
  <style>
    .kar-dossier-page {
      font-family: 'Noto Sans Kannada', 'Kannada Sangam MN', 'Kailasa', Arial, sans-serif;
      color: #1c1917;
      background: #ffffff;
      padding: 32px 36px;
      line-height: 1.6;
      font-size: 13px;
      max-width: 820px;
      margin: 0 auto;
      border: 1px solid #d6d3d1;
    }
    .kar-dossier-page table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 8px;
      font-size: 12.5px;
    }
    .kar-dossier-page th, .kar-dossier-page td {
      border: 1.5px solid #1c1917;
      padding: 6px 8px;
      vertical-align: top;
    }
    .kar-dossier-page th {
      background-color: #f5f5f4;
      font-weight: bold;
      text-align: center;
    }
    .kar-sig-block {
      margin-top: 36px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .kar-photo-box {
      border: 2px solid #1c1917;
      width: 220px;
      height: 140px;
      margin: 12px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 11px;
      color: #78716c;
      background-color: #fafaf9;
    }
    .kar-box-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      border: 1.5px solid #1c1917;
      height: 90px;
    }
    .kar-box-cell {
      border-right: 1.5px solid #1c1917;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 4px;
      font-size: 10.5px;
      text-align: center;
    }
    .kar-box-cell:last-child {
      border-right: none;
    }
  </style>
`;

/**
 * 1. FORM 7 - PART 1 & 2 (ಪ್ರಪತ್ರ-7 : PDF Pages 1 & 2)
 * Rows 1 to 21 Complete Official Karnataka KCSR Form 7
 */
export function generateForm7OfficialDossierHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const calc = record.calculation;
  const employeeName = record.employeeName || 'C M SULOCHANA';
  const fatherName = record.parentOrSpouseName || record.fatherName || 'ದಾಸಪ್ಪ';
  const religionNationality = record.religionNationality || 'ಹಿಂದೂ, ಭಾರತೀಯ';
  const address = record.permanentAddress || 'ಸಿ. ಎಂ. ಸುಲೋಚನಾ, ಲೋಯರ್ ಹುತ್ತಾ ಕಾಲೋನಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ';
  const school = record.officeOrSchool || 'GOVT HIGH PRIMARI SCHOOL LOYAR HUTTHA BHADRAVATI';
  const treasury = record.treasuryName || 'ಉಪ ಖಜಾನೆ ಭದ್ರಾವತಿ';
  const basicPay = calc.lastBasicPay || 90200;
  const pension = calc.basicServicePension || 45100;
  const dcrg = calc.dcrgSanctioned || 1443200;
  const height = record.heightFeet || '5.6 ಅಡಿ';
  const mark1 = (record.identificationMarks && record.identificationMarks[0]) || 'ಹಣೆಯ ಬಲಭಾಗ ಹೊಲಿಗೆ ಗಾಯದ ಗುರುತು';
  const mark2 = (record.identificationMarks && record.identificationMarks[1]) || 'ಹೊಟ್ಟೆಯ ಬಲಭಾಗದಲ್ಲಿ ದೊಡ್ಡ ಕಪ್ಪು ಮಚ್ಚೆ ಗುರುತು';

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 12px; border-bottom: 2px solid #1c1917; padding-bottom: 6px;">
      <div style="font-size: 14px; font-weight: bold;">ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿ (KCSR) - ನಿಯಮ 327 & 328</div>
      <div style="font-size: 16px; font-weight: 900; margin-top: 2px;">ಪ್ರಪತ್ರ - 7 (FORM 7)</div>
      <div style="font-size: 12px; font-weight: bold; color: #44403c;">ಪಿಂಚಣಿ ಮತ್ತು ನಿವೃತ್ತಿ ಉಪದಾನ ಮಂಜೂರಾತಿ ಪ್ರಸ್ತಾವನಾ ತಃಖ್ಯೆ (ಭಾಗ - 1 ಮತ್ತು ಭಾಗ - 2)</div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 38px;">ಕ್ರ.ಸಂ</th>
          <th style="width: 58%;">ವಿವರಗಳು (Particulars of Service & Pension)</th>
          <th style="width: 38%;">ನಮೂದು (Entries / Sanction Details)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; font-weight: bold;">1</td>
          <td>ಸರಕಾರಿ ನೌಕರನ ಹೆಸರು</td>
          <td style="font-weight: bold;">${employeeName}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">2</td>
          <td>ತಂದೆಯ ಹೆಸರು / ಸರಕಾರಿ ನೌಕರಳ ಸಂದರ್ಭದಲ್ಲಿ ಗಂಡನ ಹೆಸರು</td>
          <td>${fatherName}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">3</td>
          <td>ಮತ ಮತ್ತು ರಾಷ್ಟ್ರೀಯತೆ</td>
          <td>${religionNationality}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">4</td>
          <td>ಖಾಯಂ ನಿವಾಸದ ವಿಳಾಸ , ಗ್ರಾಮ/ಪಟ್ಟಣ, ಜಿಲ್ಲೆ ಮತ್ತು ರಾಜ್ಯಗಳನ್ನು ತೋರಿಸಿ</td>
          <td>${address}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">5</td>
          <td>ಈಗಿನ ಅಥವಾ ಹಿಂದಿನ ನೇಮಕ ಇಲಾಖೆಯ ಹೆಸರು ಸೇರಿ</td>
          <td>ಶಿಕ್ಷಣ ಇಲಾಖೆ<br/><strong>${school}</strong></td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">6</td>
          <td>ಅರ್ಜಿ ಹಾಕಿದ ನಿವೃತ್ತಿ ವೇತನ ಅಥವಾ ಸೇವಾ ಉಪದಾನದ ಮಾರ್ಗ</td>
          <td>ನಿವೃತ್ತಿ ವೇತನ</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">7</td>
          <td>ಆಯ್ಕೆ ಮಾಡಿದ / ಅನುಮಿತಿಸಿದ ನಿವೃತ್ತಿ ವೇತನ ನಿಯಮಾವಳಿ</td>
          <td>ಕೆ ಸಿ ಎಸ್ ಆರ್ (KCSR)</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">8</td>
          <td>ಯಾವ ಸರಕಾರಗಳ ಅಧೀನದಲ್ಲಿ ನಿಯುಕ್ತಿಕ್ರಮದಲ್ಲಿ ಸೇವೆ ಸಲ್ಲಿಸಲಾಗಿದೆ</td>
          <td>ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಸೇವೆ</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">9</td>
          <td>
            ನಿವೃತ್ತಿ ವೇತನಕ್ಕೆ ಅರ್ಹವಾಗುವ ಸೇವೆಯ ಅವಧಿ<br/>
            ಎ) ಸಿವಿಲ್ ಸೇವೆಯ ಅವಧಿ<br/>
            ಬಿ) ಯುದ್ಧ/ಸೇನಾ ಸೇವೆಯ ಅವಧಿ<br/>
            ಸಿ) ಸೇನಾ ಸೇವೆಯ ಬಗ್ಗೆ ಪಡೆದ ಯಾವುದೇ ನಿವೃತ್ತಿ ವೇತನದ/ಉಪದಾನದ ಮೊಬಲಗು<br/>
            ಡಿ) ಸಿವಿಲ್ ಸೇವೆಯ ಬಗ್ಗೆ ಪಡೆದ ಯಾವುದೇ ನಿವೃತ್ತಿ ವೇತನದ/ಉಪದಾನದ ಮೊಬಲಗು ಮತ್ತು ಸ್ವರೂಪ
          </td>
          <td>
            <strong>-</strong><br/>
            <strong>${calc.netQualifyingYears || 31} ವರ್ಷ - ${calc.netQualifyingMonths || 11} ತಿಂಗಳು - ${calc.netQualifyingDays || 30} ದಿನ</strong><br/>
            -<br/>
            -<br/>
            -
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">10</td>
          <td>
            ಎ) ಸರಕಾರಿ ಉಪಲಬ್ಧಗಳು<br/>
            ಬಿ) ಉಪದಾನದ ಬಗ್ಗೆ ಉಪಲಬ್ಧಗಳು
          </td>
          <td style="font-weight: bold;">
            ${basicPay}<br/>
            ${dcrg}
          </td>
        </tr>
        <tr style="background-color: #fafaf9;">
          <td style="text-align: center; font-weight: bold;">11</td>
          <td>ವೇತನದ * (32) ನಿಯಮದಲ್ಲಿ ಪರಿಭಾವಿಸಿದಂತೆ</td>
          <td style="font-weight: bold;">${basicPay}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">12</td>
          <td>ಪ್ರಸ್ತಾವಿಕ ನಿವೃತ್ತಿ ವೇತನ</td>
          <td style="font-weight: bold;">${pension}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">13</td>
          <td>ಪ್ರಸ್ತಾವಿಕ ಉಪದಾನ</td>
          <td style="font-weight: bold;">${dcrg}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">14</td>
          <td>
            1964ನೆಯ ಕುಟುಂಬ ವೇತನ ನಿಯಮಾವಳಿಯ ಅನ್ವಯವಾಗುವುದೇ? ಹಾಗಿದ್ದರೆ ಸರಕಾರಿ ನೌಕರ/ಳ.ಮರಣವು ಸಂಭವಿಸಿದ ಸಂದರ್ಭದಲ್ಲಿ ಅವನ/ಳ ಕುಟುಂಬದ ಹಕ್ಕುಳ್ಳ ವ್ಯಕ್ತಿಗಳಿಗೆ ಸಂದಾಯವಾಗತಕ್ಕ ಆಜೀವನ ಕುಟುಂಬ ವೇತನದ ಮೊಬಲಗು
          </td>
          <td style="font-weight: bold;">-</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">15</td>
          <td>ನಿವೃತ್ತಿ ವೇತನವು ಪ್ರಾರಂಭವಾಗತಕ್ಕ ದಿನಾಂಕ</td>
          <td style="font-weight: bold; color: #047857;">${record.pensionStartDate || '01-08-2026'}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">16</td>
          <td>
            ಸಂದಾಯದ ಸ್ಥಳ<br/>
            ಎ) ನಿವೃತ್ತಿ ವೇತನ / ಉಪಖಜಾನೆ<br/>
            ಬಿ) ಉಪದಾನ (ಖಜಾನೆ/ಉಪ ಖಜಾನೆ ಕಛೇರಿಯ ಮುಖ್ಯಸ್ಥ)
          </td>
          <td>
            <br/>
            <strong>${treasury}</strong><br/>
            <strong>${treasury}</strong>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">17</td>
          <td>
            ನಾಮ ನಿರ್ದೇಶನವು ಯಾವುದರ ಬಗ್ಗೆ<br/>
            ಎ) ಅನ್ವಯವಾಗುತ್ತಿದ್ದರೆ ಎಂ.ಸಿ.ಎಸ್ ನಿಯಮಾವಳಿಯ ಭಾಗ ರ ಮೇರೆಗಿನ ಕುಟುಂಬ ವೇತನ<br/>
            (ಬಿ) ಮರಣ ಹಾಗೂ ನಿವೃತ್ತಿ ಉಪದಾನ
          </td>
          <td>
            <br/>
            ಎಂ ಸಿ ಎಸ್<br/>
            <strong>${dcrg}</strong>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">18</td>
          <td>ಸರಕಾರಿ ನೌಕರನು ಸರಕಾರದ ಎಲ್ಲಾ ಬಾಕಿಗಳನ್ನು ಸಂದಾಯ ಮಾಡಿರುವನೆ</td>
          <td style="font-weight: bold; color: #15803d;">ಹೌದು</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">19</td>
          <td>
            ಜನ್ಮ ದಿನಾಂಕ (ಕ್ರಿಸ್ತಶಕಾನುಸಾರ)<br/>
            ಎ) ಸರಕಾರಿ ನೌಕರ<br/>
            ಬಿ) ಸರಕಾರಿ ನೌಕರನ ಹೆಂಡತಿ / ಗಂಡ
          </td>
          <td>
            <br/>
            <strong>${formatDDMMYYYY(record.dob) || '08-11-1966'}</strong><br/>
            <strong>${formatDDMMYYYY(record.nomineeDob) || formatDDMMYYYY(record.familyMembers?.[0]?.dob) || '10-05-1960'}</strong>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">20</td>
          <td>ಎತ್ತರ</td>
          <td style="font-weight: bold;">${height}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">21</td>
          <td>ಗುರುತು ಚಿಹ್ನೆಗಳು</td>
          <td>
            1) ${mark1}<br/>
            2) ${mark2}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="kar-sig-block">
      <div>
        ಸ್ಥಳ: ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ: ${formatDDMMYYYY(record.dor) || '30-11-2026'}
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">ಕಛೇರಿಯ ಮುಖ್ಯಸ್ಥರು / ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ</div>
        <div style="font-size: 11px;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 2. SECTION II: AVERAGE EMOLUMENTS (ವಿಭಾಗ - II : ಕಳೆದ ಹನ್ನೆರಡು ತಿಂಗಳಲ್ಲಿ ಪಡೆದ ಉಪಲಬ್ಧಗಳು - PDF Page 3)
 */
export function generateAvgEmoluments12mHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const school = record.officeOrSchool || 'GOVT HIGH PRIMARI SCHOOL LOYAR HUTTHA BHADRAVATI';

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 16px; font-weight: 900; text-decoration: underline;">«¨ÁUÀ -11 (ವಿಭಾಗ - 2)</div>
      <div style="font-size: 14px; font-weight: bold; margin-top: 6px;">ಕಳೆದ ಹನ್ನೆರಡು ತಿಂಗಳಲ್ಲಿ ಪಡೆದ ಉಪಲಬ್ಧಗಳು</div>
      <div style="font-size: 11.5px; color: #57534e;">(Emoluments Drawn during the Last 12 Months for Pension Assessment)</div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 44%;">ಧಾರಣ ಮಾಡಿದ ಹುದ್ದೆ</th>
          <th style="width: 14%;">ಇಂದ</th>
          <th style="width: 14%;">ವರೆಗೆ</th>
          <th style="width: 14%;">ವೇತನ ವೈಯಕ್ತಿಕ</th>
          <th style="width: 14%;">ವೈಯಕ್ತಿಕ ವಿಶೇಷ ವೇತನ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="color: #047857; font-weight: bold;">
            ${school}
          </td>
          <td style="text-align: center; font-weight: bold;">01-07-2025</td>
          <td style="text-align: center; font-weight: bold;">30-06-2026</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace;">87900</td>
          <td style="text-align: center;">-</td>
        </tr>
        <tr>
          <td style="color: #047857; font-weight: bold;">
            ${school}
          </td>
          <td style="text-align: center; font-weight: bold;">01-07-2026</td>
          <td style="text-align: center; font-weight: bold;">31-07-2026</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace;">90200</td>
          <td style="text-align: center;">-</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 30px; padding: 14px; border: 1.5px dashed #44403c; background: #fafaf9;">
      <div style="font-weight: bold; text-decoration: underline; margin-bottom: 6px;">ಲೆಕ್ಕ ಪರಿಶೋಧನಾ ಟಿಪ್ಪಣಿ (Verification Scrutiny Note):</div>
      <p style="text-align: justify; font-size: 12px; margin: 0;">
        ಕರ್ನಾಟಕ ನಾಗರಿಕ ಸೇವಾ ನಿಯಮಾವಳಿ (KCSR) ನಿಯಮ 296 ರನ್ವಯ ನೌಕರರು ನಿವೃತ್ತಿಯ ಹಿಂದಿನ 12 ತಿಂಗಳಲ್ಲಿ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿ ಪಡೆದ ವೇತನ ವಿವರಗಳನ್ನು
        ವೇತನ ಬಟವಾಡೆ ರಿಜಿಸ್ಟರ್ (Acquittance Roll) ಹಾಗೂ ಸೇವಾ ಪುಸ್ತಕದ ದಾಖಲೆಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ.
        ಕೊನೆಯ ಮೂಲ ವೇತನ ರೂ. <strong>90,200/-</strong> ಆಗಿರುತ್ತದೆ.
      </p>
    </div>

    <div class="kar-sig-block">
      <div>
        ಸ್ಥಳ: ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ: ${formatDDMMYYYY(record.dor) || '30-11-2026'}
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">ಕಛೇರಿಯ ಮುಖ್ಯಸ್ಥರ ಸಹಿ</div>
        <div style="font-size: 11px;">${school}</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 3. SECTION I: WORK HISTORY SCHOOLS SERVICE DETAILS (ವಿಭಾಗ - 1 : ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿದ ಶಾಲೆಗಳ ಸೇವಾ ವಿವರಗಳು - PDF Page 4)
 */
export function generateSchoolsServiceHistoryHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const employeeName = record.employeeName || 'C M SULOCHANA';
  const school = record.officeOrSchool || 'GOVT HIGH PRIMARI SCHOOL LOYAR HUTTHA BHADRAVATI';
  const dob = record.dob || '1966-11-08';

  const defaultSchools = (record.workHistorySchools && record.workHistorySchools.length > 0)
    ? record.workHistorySchools.map(s => ({
        school: s.schoolName,
        desig: s.designation,
        type: s.appointmentType,
        start: s.startDate,
        end: s.endDate,
        duration: s.qualifyingServiceString
      }))
    : [
    {
      school: 'ಸ.ಕಿ.ಪ್ರಾ.ಶಾಲೆ ಸಂಕ್ಲಪುರ ತೀರ್ಥಹಳ್ಳಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ',
      desig: 'ಸಹ ಶಿಕ್ಷಕರು',
      type: 'ಮೂಲ',
      start: '01-08-1994',
      end: '14-12-2002',
      duration: '8-4-13'
    },
    {
      school: 'ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ ಹಳೆಗೌರ ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ',
      desig: 'ಸಹ ಶಿಕ್ಷಕರು',
      type: 'ಮೂಲ',
      start: '15-12-2002',
      end: '17-06-2011',
      duration: '8-6-2'
    },
    {
      school: 'ಸ.ಹಿ.ಪ್ರಾ.ಶಾಲೆ ಅಂತರಗಂಗೆ ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ',
      desig: 'ಸಹ ಶಿಕ್ಷಕರು',
      type: 'ಮೂಲ',
      start: '17-06-2011',
      end: '31-07-2026',
      duration: '15-1-14'
    }
  ];

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 16px;">
      <div style="font-size: 16px; font-weight: 900; text-decoration: underline;">«¨ÁUÀ -1 (ವಿಭಾಗ - 1)</div>
      <div style="font-size: 13.5px; font-weight: bold; margin-top: 4px;">
        ${employeeName}&nbsp;&nbsp;&nbsp;&nbsp;${school}
      </div>
      <div style="font-size: 12px; margin-top: 2px;">
        ಇವರ ಸೇವಾ ವಿವರಗಳು&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ಜನ್ಮ ದಿನಾಂಕ: <strong>${formatDDMMYYYY(dob) || '08-11-1966'}</strong>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 28%;">ಸಿಬ್ಬಂದಿ (ಕಛೇರಿ)</th>
          <th style="width: 10%;">ನೇಮಕ</th>
          <th style="width: 8%;">ಸ್ಥಾಪನ್ನ</th>
          <th style="width: 12%;">ಪ್ರಾರಂಭ ದಿನಾಂಕ</th>
          <th style="width: 12%;">ಮುಕ್ತಾಯ ದಿನಾಂಕ</th>
          <th style="width: 12%;">ಸೇವೆಯೆಂದು ಗಣನೆಯಾಗತಕ್ಕ ಅವಧಿ (ವರ್ಷ+ತಿಂಗ+ದಿನ)</th>
          <th style="width: 10%;">ಸೇವೆಯೆಂದು ಗಣನೆಯಾಗದ ಅವಧಿ</th>
          <th style="width: 8%;">ಪರಿಶೋಧನಾ ಅಧಿಕಾರಿಯ ಷರಾ</th>
        </tr>
      </thead>
      <tbody>
        ${defaultSchools.map(s => `
          <tr>
            <td style="color: #047857; font-weight: bold;">${s.school}</td>
            <td style="text-align: center;">${s.desig}</td>
            <td style="text-align: center;">${s.type}</td>
            <td style="text-align: center; font-weight: bold;">${formatDDMMYYYY(s.start)}</td>
            <td style="text-align: center; font-weight: bold;">${formatDDMMYYYY(s.end)}</td>
            <td style="text-align: center; font-weight: bold; font-family: monospace;">${s.duration}</td>
            <td style="text-align: center;">__</td>
            <td style="text-align: center;">__</td>
          </tr>
        `).join('')}
        <tr style="background-color: #f5f5f4; font-weight: bold;">
          <td colspan="5" style="text-align: right; padding-right: 12px;">ಒಟ್ಟು ಸೇವಾ ಅವಧಿ:</td>
          <td style="text-align: center; font-size: 13px; font-family: monospace; color: #047857;">31-11-30</td>
          <td style="text-align: center;">0</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div class="kar-sig-block">
      <div>
        ಸ್ಥಳ: ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ: ${formatDDMMYYYY(record.dor) || '30-11-2026'}
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">ಪರಿಶೋಧನಾ ಅಧಿಕಾರಿಯ ಸಹಿ</div>
        <div style="font-size: 11px;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 4. PENSION SANCTIONING AUTHORITY ORDER (ನಿವೃತ್ತಿ ವೇತನ ಮಂಜೂರು ಮಾಡುವ ಅಧಿಕಾರಿಯ ಆದೇಶ - PDF Pages 5 & 6)
 */
export function generateSanctionOrderOfficialHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const calc = record.calculation;
  const employeeName = record.employeeName || 'C M SULOCHANA';
  const fatherName = record.parentOrSpouseName || record.fatherName || 'ದಾಸಪ್ಪ';
  const school = record.officeOrSchool || 'GOVT HIGH PRIMARI SCHOOL LOYAR HUTTHA BHADRAVATI';
  const nominee = record.nomineeName || 'ದಾಸಪ್ಪ';
  const pension = calc.basicServicePension || 45100;
  const dcrg = calc.dcrgSanctioned || 1443200;
  const familyPension = calc.familyPensionNormal || 27060;

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 16px; border-bottom: 2px solid #1c1917; padding-bottom: 4px;">
      <div style="font-size: 15px; font-weight: 900;">ನಿವೃತ್ತಿ ವೇತನ ಮಂಜೂರು ಮಾಡುವ ಅಧಿಕಾರಿಯ ಆದೇಶ</div>
      <div style="font-size: 12px; color: #44403c;">(Sanction Order of Pension Sanctioning Authority - KCSR Form 7 Part II)</div>
    </div>

    <table>
      <tbody>
        <tr>
          <td style="width: 38px; text-align: center; font-weight: bold;">1</td>
          <td style="width: 48%;">ಸರಕಾರಿ ನೌಕರನ ಹೆಸರು</td>
          <td style="font-weight: bold;">${employeeName}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">2</td>
          <td>ತಂದೆಯ ಹೆಸರು ( ಸರಕಾರಿ ನೌಕರಳ ಸಂದರ್ಭದಲ್ಲಿ ಗಂಡನ ಹೆಸರನ್ನು ಬರೆಯಿರಿ )</td>
          <td>${fatherName}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">3</td>
          <td>
            ಎ) ಈಗಿನ ಇಲ್ಲವೆ ಹಿಂದಿನ ನಿಯುಕ್ತಿ ಕಚೇರಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ<br/>
            ಆ) ಮೂಲ ನಿಯುಕ್ತಿ<br/>
            ಇ) ಸ್ಥಾಪನ್ನ ಇದ್ದರೆ
          </td>
          <td>
            ಶಿಕ್ಷಣ ಇಲಾಖೆ<br/>
            <strong>${school}</strong><br/>
            -
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">4</td>
          <td>
            ಬಿ) ಸ್ವೀಕರಣಾಧಿಕಾರಿಯ ಷರಾ<br/>
            ಅ) ಸರಕಾರಿ ನೌಕರನ ಶೀಲ ಮತ್ತು ಹಿಂದಿನ ನಡತೆಗೆ ಸಂಬಂಧಿಸಿ<br/>
            ಆ) ಯಾವುದೇ ನಿಲಂಬನೆಗಳ ಇಲ್ಲವೆ ಪಾವತಿಗಳ ಬಗ್ಗೆ ಸ್ಪಷ್ಟೀಕರಣ<br/>
            ಇ) ಇತರ ಯಾವುದೇ ಷರಾ
          </td>
          <td>
            <br/>
            <strong>ಉತ್ತಮ / ತೃಪ್ತಿಕರ</strong><br/>
            <strong>ಇಲ್ಲ</strong><br/>
            <strong>ಇಲ್ಲ</strong>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">5</td>
          <td>
            ಈ ) ಹಕ್ಕು ಕೋರಿದ ಸೇವೆಯು ರುಜುವಾತಾಗಿದೆಯೇ ಅದನ್ನು ಅಂಗೀಕರಿಸಬೇಕೇ ಇಲ್ಲವೇ ಎಂಬ ಬಗ್ಗೆ ಸ್ವೀಕರಣಾಧಿಕಾರಿಯ ಸ್ಪಷ್ಟಾಭಿಪ್ರಾಯ
          </td>
          <td style="font-weight: bold; color: #047857;">
            ಹಕ್ಕು ಕೋರಿದ ಸೇವೆಯು ರುಜುವಾತಾಗಿದೆ ಅಂಗೀಕರಿಸಬಹುದು
          </td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 14px; padding: 12px; border: 1.5px solid #1c1917; background-color: #fafaf9;">
      <div style="font-weight: bold; text-decoration: underline; margin-bottom: 6px;">ಸಿ ) ನಿವೃತ್ತಿ ವೇತನ ಮಂಜೂರು ಮಾಡುವ ಅಧಿಕಾರಿಯ ಆದೇಶ:</div>
      <p style="text-align: justify; margin: 0; line-height: 1.8;">
        <strong>${employeeName}</strong>, ${school} ಇವರ ಸೇವೆಯು ತೃಪ್ತಿಕರವಾಗಿದೆಯೆಂದು ಈ ಕೆಳಗೆ ಸಹಿ ಮಾಡಿರುವ ನನಗೆ ಸಂಪೂರ್ಣ ತೃಪ್ತಿಕರವಾಗಿದೆಯೆಂದು
        ಮನದಟ್ಟಾಗಿರುವುದರಿಂದ ಅವರು ಈ ಮೂಲಕ ಸಂಪೂರ್ಣ ನಿವೃತ್ತಿ ವೇತನ, ಮರಣ ಹಾಗೂ ನಿವೃತ್ತಿ ಉಪದಾನಗಳನ್ನು ಮಂಜೂರು ಮಾಡಬೇಕೆಂದು ಆದೇಶ ಮಾಡಿರುತ್ತಾರೆ ಮತ್ತು
        ಪರಿಶೋಧನಾ ಅಧಿಕಾರಿಯು ಈ ನಿಯಮಾವಳಿಯ ಮೇರೆಗೆ ಅಂಗೀಕರಿಸಬೇಕಾಗಿ ಕೋರುತ್ತಾರೆ.
      </p>
      <div style="margin-top: 8px; font-size: 12px;">
        ಡಿ) <strong>${employeeName}</strong> ನಿವೃತ್ತ ಶಿಕ್ಷಕರು ಅವರ ಮರಣ ಹೊಂದಿದ ಸಂದರ್ಭದಲ್ಲಿ <strong>${nominee}</strong> ಇವರಿಗೆ
        1964 ನೆಯ ಕುಟುಂಬ ವೇತನ ನಿಯಮಾವಳಿಯ ಮೇರೆಗೆ ಅನುಮತಿಸಲ್ಪಡುವಂತೆ ರೂಪಾಯಿ <strong>${familyPension}/-</strong> ಕುಟುಂಬ ವೇತನವು ಅನುಮತಿಸಲ್ಪಡತಕ್ಕದ್ದು.
      </div>
    </div>

    <table style="margin-top: 14px;">
      <tbody>
        <tr>
          <td style="width: 48%; font-weight: bold;">ಅನುಮತಿಸಿದ ನಿವೃತ್ತಿ ವೇತನ ಮತ್ತು ಉಪದಾನದ ಮೊಬಲಗು</td>
          <td style="font-weight: bold; font-family: monospace;">${pension} (ನಿವೃತ್ತಿ ವೇತನ)<br/>${dcrg} (ಉಪದಾನ)</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">ವಜಾಗಳೇನಾದರೂ ಇದ್ದರೆ</td>
          <td>-</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">ನಿವೃತ್ತಿ ವೇತನ / ಉಪದಾನವನ್ನು ಅನುಮತಿಸಿದಕ್ಕೆ ದಿನಾಂಕ</td>
          <td style="font-weight: bold; color: #047857;">${record.pensionStartDate || '01-08-2026'}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">ವೆಚ್ಚ ಹಾಕತಕ್ಕ ಲೆಕ್ಕ ಶೀರ್ಷಿಕೆ</td>
          <td style="font-weight: bold;">2071-01-101 (ನಿವೃತ್ತಿ ವೇತನ ಮತ್ತು ಇತರೆ ಸೌಲಭ್ಯಗಳು)</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">ಆಜೀವನ ಕುಟುಂಬ ವೇತನದ ಮೊಬಲಗು</td>
          <td style="font-weight: bold; font-family: monospace; color: #047857;">${familyPension}</td>
        </tr>
      </tbody>
    </table>

    <div class="kar-sig-block">
      <div>
        ಸ್ಥಳ: ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ: ${record.dor || '31-07-2026'}
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">ನಿವೃತ್ತಿ ವೇತನ ಮಂಜೂರು ಮಾಡುವ ಅಧಿಕಾರಿ</div>
        <div style="font-size: 11px;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 5. DETAILED EARNED LEAVE AVAILED RECORD (ವಿಭಾಗ - 1 : ರಜೆ ವಿವರಣೆ - PDF Page 7 with 17 rows, total 356 days)
 */
export function generateEarnedLeaveSheetHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const employeeName = record.employeeName || 'C M SULOCHANA';
  const school = record.officeOrSchool || 'GOVT HIGH PRIMARI SCHOOL LOYAR HUTTHA BHADRAVATI';
  const designation = record.designation || 'ಸಹ ಶಿಕ್ಷಕರು';

  // Use record's yearly leave history if available, else standard series (2020-2026)
  const leaveRows = (record.yearlyLeaveHistory && record.yearlyLeaveHistory.length > 0)
    ? record.yearlyLeaveHistory
    : [
        { id: 'yl-2020', year: 2020, openingBalance: 240, credited: 10, otherSanctionedDays: 15, specialCovidDutyDays: 15, totalAvailable: 265, availed: 5, leaveTakenDetails: 'ಕೋವಿಡ್-19 ಕರ್ತವ್ಯ 15 ದಿನ ಇತರೆ ಮಂಜೂರಾದ ರಜೆ', availedSpellDetails: '5 ದಿನ ರಜೆ ಬಳಕೆ', closingBalance: 260 },
        { id: 'yl-2021', year: 2021, openingBalance: 260, credited: 10, otherSanctionedDays: 14, specialCovidDutyDays: 14, totalAvailable: 284, availed: 0, leaveTakenDetails: 'ಕೋವಿಡ್ ಕರ್ತವ್ಯ 14 ದಿನ ವಿಶೇಷ ಕರ್ತವ್ಯ ರಜೆ', availedSpellDetails: '15 ದಿನಗಳ ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣ', closingBalance: 284 },
        { id: 'yl-2022', year: 2022, openingBalance: 284, credited: 10, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 294, availed: 0, leaveTakenDetails: 'ಪೂರ್ಣ ವರ್ಷ ಸೇವೆ', availedSpellDetails: 'ಗಳಿಕೆ ರಜೆ ಜಮೆ', closingBalance: 294 },
        { id: 'yl-2023', year: 2023, openingBalance: 294, credited: 10, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 304, availed: 4, leaveTakenDetails: 'ಗಳಿಕೆ ರಜೆ ಬಳಕೆ', availedSpellDetails: '4 ದಿನ ರಜೆ ಬಳಕೆ', closingBalance: 300 },
        { id: 'yl-2024', year: 2024, openingBalance: 300, credited: 10, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 310, availed: 10, leaveTakenDetails: 'ಸಾಮಾನ್ಯ ಗಳಿಕೆ ರಜೆ ಬಳಕೆ', availedSpellDetails: '10 ದಿನ ರಜೆ ಬಳಕೆ', closingBalance: 300 },
        { id: 'yl-2025', year: 2025, openingBalance: 300, credited: 10, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 310, availed: 10, leaveTakenDetails: 'ಗಳಿಕೆ ರಜೆ ಬಳಕೆ', availedSpellDetails: '10 ದಿನ ರಜೆ ಬಳಕೆ', closingBalance: 300 },
        { id: 'yl-2026', year: 2026, openingBalance: 300, credited: 5, otherSanctionedDays: 0, specialCovidDutyDays: 0, totalAvailable: 305, availed: 0, leaveTakenDetails: 'ನಿವೃತ್ತಿ ವರ್ಷ (ಜನವರಿ-ಜುಲೈ)', availedSpellDetails: 'ಗಳಿಕೆ ರಜೆ ನಗದೀಕರಣಕ್ಕೆ ಶಿಫಾರಸ್ಸು 300 ದಿನ', closingBalance: 300 }
      ];

  const totalAvailed = leaveRows.reduce((sum, r) => sum + (r.availed || 0), 0);
  const finalClosing = leaveRows[leaveRows.length - 1]?.closingBalance || 300;

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 16px;">
      <div style="font-size: 16px; font-weight: 900; text-decoration: underline;">«¨ÁUÀ -1 (ವಿಭಾಗ - 1)</div>
      <div style="font-size: 13.5px; font-weight: bold; margin-top: 4px;">
        ${employeeName}&nbsp;&nbsp;&nbsp;&nbsp;${designation}&nbsp;&nbsp;&nbsp;&nbsp;${school}
      </div>
      <div style="font-size: 12px; margin-top: 2px;">
        ಇವರ ಸೇವಾ ಅವಧಿಯಲ್ಲಿ ತೆಗೆದುಕೊಂಡ ರಜೆಯ ವಿವರಣೆ (Detailed Earned Leave Availed Record)
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 10%;">ವರ್ಷ<br/>(Year)</th>
          <th style="width: 16%;">ಅವಧಿ ದಿನಗಳು<br/>(ನೀಡಲಾದ / ಭರ್ತಿ ಮಾಡಲಾದ ಗಳಿಕೆ ರಜೆ)</th>
          <th style="width: 10%;">ಜಮೆ<br/>(Credited)</th>
          <th style="width: 14%;">ಇತರೆ ಮಂಜೂರು ರಜೆ<br/>(Other Sanctioned)</th>
          <th style="width: 13%;">ಒಟ್ಟು<br/>(ಜಮೆ + ಇತರೆ ಮಂಜೂರು ರಜೆ)</th>
          <th style="width: 25%;">ತೆಗೆಯಲಾದ ರಜೆಯ ವಿವರ<br/>(ದಿನಗಳು / ವಿವರಣೆ)</th>
          <th style="width: 12%;">ಉಳಿಕೆ ಶಿಲ್ಕು<br/>(ಗರಿಷ್ಠ 300 ದಿನ)</th>
        </tr>
      </thead>
      <tbody>
        ${leaveRows.map(r => `
          <tr>
            <td style="text-align: center; font-weight: bold; font-family: monospace;">${r.year}</td>
            <td style="text-align: center; font-family: monospace;">${r.openingBalance}</td>
            <td style="text-align: center; font-weight: bold; color: #047857; font-family: monospace;">+${r.credited}</td>
            <td style="text-align: center; font-weight: bold; color: #0284c7; font-family: monospace;">${(r.otherSanctionedDays || r.specialCovidDutyDays || 0) > 0 ? `+${r.otherSanctionedDays || r.specialCovidDutyDays}` : '-'}</td>
            <td style="text-align: center; font-weight: bold; background-color: #f8fafc; font-family: monospace;">${r.totalAvailable}</td>
            <td style="font-size: 11px;">
              ${r.availed > 0 ? `<strong style="color: #b91c1c;">${r.availed} ದಿನಗಳು:</strong> ` : ''}
              ${r.leaveTakenDetails || ''}
              ${r.availedSpellDetails ? `<br/><span style="color: #475569;">(${r.availedSpellDetails})</span>` : ''}
            </td>
            <td style="text-align: center; font-weight: bold; color: #047857; font-family: monospace; background-color: #f0fdf4;">${r.closingBalance}</td>
          </tr>
        `).join('')}
        <tr style="background-color: #f5f5f4; font-weight: bold;">
          <td colspan="5" style="text-align: right; padding-right: 12px;">ಒಟ್ಟು ತೆಗೆದುಕೊಂಡ ರಜೆ:</td>
          <td style="text-align: center; font-size: 13px; font-family: monospace; color: #b91c1c;">${totalAvailed} ದಿನಗಳು</td>
          <td></td>
        </tr>
        <tr style="background-color: #ecfdf5; font-weight: bold;">
          <td colspan="5" style="text-align: right; padding-right: 12px;">ನಿವೃತ್ತಿ ದಿನಾಂಕಕ್ಕೆ ಉಳಿದ ಗಳಿಕೆ ರಜೆ ಶಿಲ್ಕು (ನಗದೀಕರಣಕ್ಕೆ):</td>
          <td colspan="2" style="text-align: center; font-size: 13.5px; font-family: monospace; color: #047857;">
            ${Math.min(finalClosing, 300)} ದಿನಗಳು (ಗರಿಷ್ಠ 300 ದಿನ ಮಿತಿ)
          </td>
        </tr>
      </tbody>
    </table>

    <div class="kar-sig-block">
      <div>
        ಸ್ಥಳ: ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ: ${record.dor || '31-07-2026'}
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">ಸಹಿ</div>
        <div style="font-weight: bold;">ಕಛೇರಿಯ ಮುಖ್ಯಸ್ಥರು</div>
        <div style="font-size: 11.5px;">${school}</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 6. PROVISIONAL PENSION & DCRG SANCTION (ತಾತ್ಕಾಲಿಕ ನಿವೃತ್ತಿ ವೇತನ ಮತ್ತು ಉಪದಾನ - PDF Page 8)
 */
export function generateProvisionalSanctionOfficialHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const calc = record.calculation;
  const pension = calc.basicServicePension || 45100;
  const dcrg = calc.dcrgSanctioned || 1443200;
  const treasury = record.treasuryName || 'ಉಪ ಖಜಾನೆ ಭದ್ರಾವತಿ';

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1c1917; padding-bottom: 6px;">
      <div style="font-size: 15px; font-weight: 900;">ತಾತ್ಕಾಲಿಕ ನಿವೃತ್ತಿ ವೇತನ ಮತ್ತು ಉಪದಾನದ ವಿವರ</div>
      <div style="font-size: 12px; color: #44403c;">(Anticipatory / Provisional Pension Sanction Order - KCSR Rule 34 / 341)</div>
    </div>

    <table style="margin-bottom: 16px;">
      <tbody>
        <tr>
          <td style="width: 50%; font-weight: bold;">ಧಾರಣ ಮಾಡಿದ ಹುದ್ದೆ / ಹುದ್ದೆಗಳು</td>
          <td style="font-weight: bold;">ಸಹ ಶಿಕ್ಷಕರು</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">ಸೇವಾ ಅವಧಿ</td>
          <td style="font-weight: bold;">31 ವರ್ಷ - 11 ತಿಂಗಳು - 30 ದಿನ</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">ನಿವೃತ್ತಿ ವೇತನ</td>
          <td style="font-weight: bold; font-family: monospace;">${pension}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">ಉಪದಾನಗಳು</td>
          <td style="font-weight: bold; font-family: monospace;">${dcrg}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">ಸಂದಾಯವಾಗತಕ್ಕ ಖಜಾನೆ</td>
          <td style="font-weight: bold;">${treasury}</td>
        </tr>
      </tbody>
    </table>

    <div style="border: 1px solid #1c1917; padding: 12px; font-size: 12px; background: #fafaf9; text-align: justify; line-height: 1.8;">
      ಖಜಾನೆ-ಉಪಖಜಾನೆಯಲ್ಲಿ ಸಂದಾಯವಾಗತಕ್ಕವುಗಳಾಗಿವೆ ಮತ್ತು ಅವುಗಳನ್ನು ಲೆಕ್ಕಶೀರ್ಷಿಕೆಗೆ ಖರ್ಚು ಹಾಕಬೇಕು. ಈ ಆದೇಶವು ಇಲ್ಲಿ ಅಧಿಕೃತವಾದ ನಿವೃತ್ತಿ ವೇತನ ಮತ್ತು /
      ಅಥವಾ ಉಪದಾನದ ಮೊಬಲಗು ಈ ನಿಯಮಾವಳಿಯ ಮೇರೆಗೆ ನಿವೃತ್ತಿ ವೇತನಿಯು ಹಕ್ಕುಳ್ಳವನಾಗಿರತಕ್ಕ ಮೊಬಲಗಿಗಿಂತ ಅಧಿಕವಾಗಿದೆಯೆಂದು ಆ ತರುವಾಯ ಕಂಡುಬಂದ ಪಕ್ಷದಲ್ಲಿ
      ಅವನು / ಅವಳು ಅಂಥ ಅಧಿಕ ಮೊಬಲಗನ್ನು ಮರು ಸಂದಾಯ ಮಾಡುವಂತೆ ಆದೇಶಿತನಾಗತಕ್ಕದ್ದು ಎಂಬ ಷರತ್ತಿಗೆ ಒಳಪಟ್ಟಿದೆ.
    </div>

    <div style="margin-top: 16px; font-size: 12px; font-weight: bold;">
      34ನೆಯ ನಿಯಮದ ಅಡಿಪಟ್ಟಿಯಲ್ಲಿ ಗೊತ್ತುಪಡಿಸಿದ ವಿಧಾನಕ್ಕನುಸಾರವಾಗಿ ಕಚೇರಿಯ ಮುಖ್ಯಾಧಿಕಾರಿಯು ಹಣ ತೆಗೆಯತಕ್ಕ ತಾತ್ಕಾಲಿಕ ನಿವೃತ್ತಿ ವೇತನ ಮತ್ತು ಉಪದಾನದ ವಿವರ:
    </div>

    <table style="margin-top: 8px;">
      <tbody>
        <tr>
          <td style="width: 60%;">ತಾತ್ಕಾಲಿಕ ನಿವೃತ್ತಿ ವೇತನ ತಿಂಗಳಿಗೆ</td>
          <td style="font-weight: bold; font-family: monospace;">${pension}</td>
        </tr>
        <tr>
          <td>ಉಪದಾನದ (7ನೆಯ ಪ್ರಪತ್ರದ 13ನೆ ಬಾಬಿನ ಎದುರು ನಮೂದಿಸಿದ ಪೂರ್ಣ ಉಪದಾನದ 3/4)</td>
          <td style="font-weight: bold; font-family: monospace;">${Math.round(dcrg * 0.75)}</td>
        </tr>
        <tr>
          <td>ವಜಾ : 1964ನೆಯ ಕುಟುಂಬ ವೇತನ ನಿಯಮಾವಳಿಯ ಮೇರೆಗೆ ಅಂಶದಾನ</td>
          <td>-</td>
        </tr>
        <tr>
          <td>ತಾತ್ಕಾಲಿಕವಾಗಿ ಸಂದಾಯವಾಗತಕ್ಕ ಉಪದಾನದ ಮೊಬಲಗು</td>
          <td style="font-weight: bold; font-family: monospace; color: #047857;">${dcrg}</td>
        </tr>
      </tbody>
    </table>

    <div class="kar-sig-block">
      <div>
        ದಿನಾಂಕ: ${record.dor || '31-07-2026'}
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">ನಿವೃತ್ತಿ ವೇತನ ಮಂಜೂರು ಮಾಡುವ ಅಧಿಕಾರಿಯ ಸಹಿ ಮತ್ತು ಪದನಾಮ</div>
        <div style="font-size: 11px;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 7. DECLARATION OF NON-RECEIPT & RECOVERY CONSENT (ಯಾವುದೇ ನಿವೃತ್ತಿ ವೇತನ ಸ್ವೀಕರಿಸದಿರುವ ಘೋಷಣೆ & ವಸೂಲಿ ಒಪ್ಪಿಗೆ ಪತ್ರ - PDF Page 9)
 */
export function generateNonReceiptRecoveryHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const employeeName = record.employeeName || 'ಶ್ರೀ ಹೆಚ್.ಡಿ. ಗಿರಿಯಪ್ಪ';
  const school = record.officeOrSchool || 'ಸ.ಶಿ. ಕರ್ನಾಟಕ ಪಬ್ಲಿಕ್ ಶಾಲೆ ಅಂತರಗಂಗೆ';

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 15px; font-weight: 900; text-decoration: underline;">
        ಯಾವುದೇ ನಿವೃತ್ತಿ ವೇತನ ಅಥವಾ ಉಪದಾನವನ್ನು ಸ್ವೀಕರಿಸದಿರುವ ಬಗ್ಗೆ ನಿವೃತ್ತಿ ವೇತನೀಯ ಘೋಷಣೆ
      </div>
    </div>

    <div style="font-size: 12.5px; line-height: 2; text-align: justify; margin-bottom: 28px;">
      <strong>${school}</strong> ಕಛೇರಿಯ ಸಹಶಿಕ್ಷಕರು ಹುದ್ದೆಯಿಂದ ನಿವೃತ್ತಿ ಹೊಂದಿದ ನಾನು <strong>${employeeName}</strong>
      ಈ ಮೂಲಕ ದೃಢೀಕರಿಸುವುದೇನೆಂದರೆ ಅರ್ಜಿಯಲ್ಲಿ ನಮೂದಿಸಿರುವ ನನ್ನ ಸೇವೆಯ ಭಾಗ ಮತ್ತು ಯಾವುದರ ಬಗ್ಗೆ ನಿವೃತ್ತಿ ವೇತನ ಅಥವಾ ಉಪದಾನಕ್ಕಾಗಿ
      ಹಕ್ಕು ಸಾಧಿಸಲ್ಪಟ್ಟಿದೆಯೋ ಅದಕ್ಕಾಗಿ ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಿಯೂ ಇಲ್ಲ ಹಾಗೂ ಸ್ವೀಕರಿಸಿಯೂ ಇಲ್ಲ ಹಾಗೂ ಈ ಅರ್ಜಿಗೆ ಉಲ್ಲೇಖಿಸಿದ ಈ ಮುಂದೆ
      ಯಾವುದೇ ಬೇರೆ ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಿರುವುದಿಲ್ಲ.
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px;">
      <div>
        ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ : ${record.dor || '31-07-2026'}
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">ಸಹಿ</div>
        <div style="font-size: 11px;">ಪದನಾಮ</div>
      </div>
    </div>

    <hr style="border: 0; border-top: 1.5px solid #1c1917; margin: 30px 0;" />

    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 15px; font-weight: 900; text-decoration: underline;">
        ವಸೂಲಿ ಮಾಡಲು ಒಪ್ಪಿಗೆ ಪತ್ರ (Consent / Indemnity Undertaking)
      </div>
    </div>

    <div style="font-size: 12.5px; line-height: 2; text-align: justify; margin-bottom: 28px;">
      <strong>${school}</strong> ಕಛೇರಿಯ ಸಹಶಿಕ್ಷಕರು ಹುದ್ದೆಯಿಂದ ನಿವೃತ್ತಿ ಹೊಂದಿದ ನಾನು <strong>${employeeName}</strong>
      ಈ ಮೂಲಕ ಒಪ್ಪಿಕೊಳ್ಳುವುದೇನೆಂದರೆ ನನ್ನಿಂದ ವಸೂಲಾಗದೆ ಇರುವ ಹಣವೇನಾದರೂ ಇದ್ದಲ್ಲಿ ನನ್ನ ನಿವೃತ್ತಿ ವೇತನದಲ್ಲಿ ವಜಾ ಮಾಡಬಹುದು.
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ : ${record.dor || '31-07-2026'}
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">ಸಹಿ</div>
        <div style="font-size: 11px;">ಪದನಾಮ</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 8. SPECIMEN SIGNATURES, HEIGHT & MARKS, JOINT PHOTO (ಮಾದರಿ ಸಹಿ, ಎತ್ತರ ಮತ್ತು ಗುರುತು ಚಿಹ್ನೆ, ಜಂಟಿ ಭಾವಚಿತ್ರ - PDF Page 10)
 */
export function generateSpecimenSignaturesPhotoHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const employeeName = record.employeeName || 'ಶ್ರೀ ಹೆಚ್.ಡಿ. ಗಿರಿಯಪ್ಪ';
  const school = record.officeOrSchool || 'ಸ.ಶಿ. ಕರ್ನಾಟಕ ಪಬ್ಲಿಕ್ ಶಾಲೆ ಅಂತರಗಂಗೆ';
  const height = record.heightFeet || '5.6 ಅಡಿ';
  const mark1 = (record.identificationMarks && record.identificationMarks[0]) || 'ಹಣೆಯ ಬಲಭಾಗ ಹೊಲಿಗೆ ಗಾಯದ ಗುರುತು';
  const mark2 = (record.identificationMarks && record.identificationMarks[1]) || 'ಹೊಟ್ಟೆಯ ಬಲಭಾಗದಲ್ಲಿ ದೊಡ್ಡ ಕಪ್ಪು ಮಚ್ಚೆ ಗುರುತು';

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <!-- SECTION 1: SPECIMEN SIGNATURES -->
    <div style="margin-bottom: 24px;">
      <div style="font-weight: bold; font-size: 13px;">
        ${employeeName} ಸಹ ಶಿಕ್ಷಕರು ${school} ಇವರ ಮಾದರಿ ಸಹಿ
      </div>
      <div style="margin-top: 14px; line-height: 2.2;">
        1 __________________________________________________ ( ಮಾದರಿಯ ರುಜು )<br/>
        2 __________________________________________________ ( ಮಾದರಿಯ ರುಜು )<br/>
        3 __________________________________________________ ( ಮಾದರಿಯ ರುಜು )
      </div>
      <div style="text-align: right; margin-top: 6px; font-weight: bold;">ದೃಢೀಕರಿಸಿದೆ</div>
      <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-top: 6px;">
        <div>ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>ದಿನಾಂಕ : ${record.dor || '31-07-2026'}</div>
        <div style="text-align: center;">ಪತ್ರಾಂಕಿತ ಅಧಿಕಾರಿ<br/>ಪದನಾಮ</div>
      </div>
    </div>

    <hr style="border: 0; border-top: 1px dashed #78716c; margin: 18px 0;" />

    <!-- SECTION 2: HEIGHT & MARKS -->
    <div style="margin-bottom: 24px;">
      <div style="font-weight: bold; font-size: 13px;">
        ${employeeName} ಸಹ ಶಿಕ್ಷಕರು ${school} ಇವರ ಎತ್ತರ ಮತ್ತು ಗುರುತು ಚಿಹ್ನೆಗಳನ್ನು ತೋರಿಸುವ ಚೀಟಿ
      </div>
      <div style="margin-top: 10px; font-size: 13px;">
        <div><strong>ಎತ್ತರ :-</strong> ${height}</div>
        <div style="margin-top: 4px;"><strong>ಗುರುತು ಚಿಹ್ನೆ :</strong></div>
        <div style="margin-left: 20px;">
          1) ${mark1}<br/>
          2) ${mark2}
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-top: 10px;">
        <div>ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>ದಿನಾಂಕ : ${record.dor || '31-07-2026'}</div>
        <div style="text-align: center;">ಪತ್ರಾಂಕಿತ ಅಧಿಕಾರಿ<br/>ಪದನಾಮ</div>
      </div>
    </div>

    <hr style="border: 0; border-top: 1px dashed #78716c; margin: 18px 0;" />

    <!-- SECTION 3: JOINT PHOTO -->
    <div>
      <div style="font-weight: bold; font-size: 13px;">
        ${employeeName} ಸಹ ಶಿಕ್ಷಕರು ${school} ಇವರ ಪಾಸ್ ಪೋರ್ಟ್ ಗಾತ್ರದ ಜಂಟಿ ಭಾವಚಿತ್ರ
      </div>
      <div class="kar-photo-box">
        [ ಇಲ್ಲಿ ನಿವೃತ್ತ ನೌಕರ ಮತ್ತು ಪತಿ/ಪತ್ನಿಯ ಜಂಟಿ ಭಾವಚಿತ್ರ ಅಂಟಿಸಿ ಪತ್ರಾಂಕಿತ ಅಧಿಕಾರಿಯಿಂದ ದೃಢೀಕರಿಸಬೇಕು ]
      </div>
      <div style="text-align: right; font-weight: bold;">ದೃಢೀಕರಿಸಿದೆ</div>
      <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-top: 6px;">
        <div>ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>ದಿನಾಂಕ : ${record.dor || '31-07-2026'}</div>
        <div style="text-align: center;">ಪತ್ರಾಂಕಿತ ಅಧಿಕಾರಿ<br/>ಪದನಾಮ</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 9. NO ENQUIRY CERTIFICATE, NO DUES & RECEIPT (ಇಲಾಖಾ/ನ್ಯಾಯಾಂಗ ತನಿಖೆ ಇಲ್ಲದ ಘೋಷಣೆ, ಬಾಕಿ ಇಲ್ಲದ ಸರ್ಟಿಫಿಕೇಟ್ & ಸ್ವೀಕೃತಿ ರಶೀದಿ - PDF Page 11)
 */
export function generateNoDuesAndReceiptHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const employeeName = record.employeeName || 'ಶ್ರೀ ಹೆಚ್.ಡಿ. ಗಿರಿಯಪ್ಪ';
  const school = record.officeOrSchool || 'ಸ.ಶಿ. ಕರ್ನಾಟಕ ಪಬ್ಲಿಕ್ ಶಾಲೆ ಅಂತರಗಂಗೆ';

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <!-- NO ENQUIRY -->
    <div style="margin-bottom: 28px;">
      <div style="text-align: center; font-weight: bold; font-size: 14px; text-decoration: underline; margin-bottom: 10px;">
        ಯಾವುದೇ ಇಲಾಖಾ, ನ್ಯಾಯಾಂಗ ತನಿಖೆ ಅಥವಾ ದಾವೆ ಇಲ್ಲದ ಬಗ್ಗೆ ಘೋಷಣೆ
      </div>
      <div style="text-align: justify; line-height: 1.8;">
        <strong>${employeeName}</strong> ಸಹ ಶಿಕ್ಷಕರು ${school} ಇವರ ವಿರುದ್ಧ ಇಲಾಖಾ ಮತ್ತು ನ್ಯಾಯಾಂಗ ತನಿಖೆಯಾಗಲೀ ಇರುವುದಿಲ್ಲ ಎಂಬುದಾಗಿ ದೃಢೀಕರಿಸುತ್ತೇನೆ.
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 14px; font-size: 11.5px;">
        <div>ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>ದಿನಾಂಕ : ${record.dor || '31-07-2026'}</div>
        <div style="text-align: center;">ಪತ್ರಾಂಕಿತ ಅಧಿಕಾರಿ<br/>ಪದನಾಮ</div>
      </div>
    </div>

    <hr style="border: 0; border-top: 1.5px solid #1c1917; margin: 24px 0;" />

    <!-- NO DUES -->
    <div style="margin-bottom: 28px;">
      <div style="text-align: center; font-weight: bold; font-size: 14px; text-decoration: underline; margin-bottom: 10px;">
        ಬಾಕಿ ಇಲ್ಲದ ಬಗ್ಗೆ ಸರ್ಟಿಫಿಕೇಟ್ (No Dues Certificate)
      </div>
      <div style="text-align: justify; line-height: 1.8;">
        ${school} ಸಹ ಶಿಕ್ಷಕರು ಹುದ್ದೆಯಿಂದ ನಿವೃತ್ತಿ ಹೊಂದಿದ <strong>${employeeName}</strong> ಇವರು ವಸೂಲಾದ ಬಾಕಿ ಯಾವುದೂ ಇರುವುದಿಲ್ಲ ವೆಂದು ದೃಢೀಕರಿಸುತ್ತೇನೆ.
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 14px; font-size: 11.5px;">
        <div>ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>ದಿನಾಂಕ : ${record.dor || '31-07-2026'}</div>
        <div style="text-align: center;">ಪತ್ರಾಂಕಿತ ಅಧಿಕಾರಿ<br/>ಪದನಾಮ</div>
      </div>
    </div>

    <hr style="border: 0; border-top: 1.5px solid #1c1917; margin: 24px 0;" />

    <!-- ACKNOWLEDGEMENT RECEIPT -->
    <div>
      <div style="text-align: center; font-weight: bold; font-size: 14px; text-decoration: underline; margin-bottom: 10px;">
        ಸ್ವೀಕೃತಿ ರಶೀದಿ (Formal Application Acknowledgement Receipt)
      </div>
      <div style="text-align: justify; line-height: 1.8;">
        <strong>${employeeName}</strong> ಸಹ ಶಿಕ್ಷಕರು ${school} ಇವರ ನಿವೃತ್ತಿ ವೇತನದ ಔಪಚಾರಿಕ ಅರ್ಜಿಯನ್ನು ದಿನಾಂಕ <strong>24-06-2026</strong> ರಂದು ಸ್ವೀಕರಿಸಿದೆ.
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 14px; font-size: 11.5px;">
        <div>ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>ದಿನಾಂಕ : 24-06-2026</div>
        <div style="text-align: center;">ಪತ್ರಾಂಕಿತ ಅಧಿಕಾರಿ<br/>ಪದನಾಮ</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 10. SELF-ADDRESS SLIPS (ಸ್ವವಿಳಾಸ ಚೀಟಿ - PDF Page 12)
 */
export function generateSelfAddressSlipsHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const employeeName = record.employeeName || 'C M SULOCHANA';
  const school = record.officeOrSchool || 'GOVT HIGH PRIMARI SCHOOL LOYAR HUTTHA BHADRAVATI';
  const address = record.permanentAddress || 'ಸಿ. ಎಂ. ಸುಲೋಚನಾ, ಲೋಯರ್ ಹುತ್ತಾ ಕಾಲೋನಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ';

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <!-- SLIP 1 -->
    <div style="margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px dashed #44403c;">
      <div style="text-align: center; font-weight: bold; font-size: 15px; text-decoration: underline; margin-bottom: 12px;">
        ಸ್ವವಿಳಾಸ ಚೀಟಿ (Self-Address Slip - 1)
      </div>
      <div style="font-weight: bold; margin-bottom: 10px;">
        ${employeeName} ಸಹ ಶಿಕ್ಷಕರು ${school}<br/>
        ಇವರ ನಿವೃತ್ತಿ ತರವಾಯದ ಸ್ವ ವಿಳಾಸ ತೋರಿಸುವ ವಿವರ:
      </div>
      <div style="margin: 20px 0; font-size: 14px; line-height: 1.8; text-align: center; font-weight: bold; background: #fafaf9; padding: 14px; border: 1.5px solid #1c1917;">
        ${address}
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-top: 20px;">
        <div>ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>ದಿನಾಂಕ : ${formatDDMMYYYY(record.dor) || '30-11-2026'}</div>
        <div style="text-align: center;">ಪತ್ರಾಂಕಿತ ಅಧಿಕಾರಿ<br/>ಪದನಾಮ</div>
      </div>
    </div>

    <!-- SLIP 2 -->
    <div>
      <div style="text-align: center; font-weight: bold; font-size: 15px; text-decoration: underline; margin-bottom: 12px;">
        ಸ್ವವಿಳಾಸ ಚೀಟಿ (Self-Address Slip - 2)
      </div>
      <div style="font-weight: bold; margin-bottom: 10px;">
        ${employeeName} ಸಹ ಶಿಕ್ಷಕರು ${school}<br/>
        ಇವರ ನಿವೃತ್ತಿ ತರವಾಯದ ಸ್ವ ವಿಳಾಸ ತೋರಿಸುವ ವಿವರ:
      </div>
      <div style="margin: 20px 0; font-size: 14px; line-height: 1.8; text-align: center; font-weight: bold; background: #fafaf9; padding: 14px; border: 1.5px solid #1c1917;">
        ${address}
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-top: 20px;">
        <div>ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>ದಿನಾಂಕ : ${formatDDMMYYYY(record.dor) || '30-11-2026'}</div>
        <div style="text-align: center;">ಪತ್ರಾಂಕಿತ ಅಧಿಕಾರಿ<br/>ಪದನಾಮ</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 11. GPF NON-DRAWAL & LAST DEDUCTION CERTIFICATE (GPF ಮುಂಗಡ ಸಾಲ ಬಾಕಿ ಇಲ್ಲದ ಬಗ್ಗೆ ಹಾಗೂ ಕೊನೆ ಕಂತು ವಸೂಲಾತಿ ಪ್ರಮಾಣಪತ್ರ - PDF Page 13)
 */
export function generateGpfFinalWithdrawalCertHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const employeeName = record.employeeName || 'ಶ್ರೀ ಹೆಚ್.ಡಿ. ಗಿರಿಯಪ್ಪ';
  const treasury = record.treasuryName || 'ಉಪ ಖಜಾನೆ ಭದ್ರಾವತಿ';

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1c1917; padding-bottom: 6px;">
      <div style="font-size: 15px; font-weight: 900;">ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ (GPF) ಅಂತಿಮ ಹಿಂಪಡೆಯುವಿಕೆ ದೃಢೀಕರಣ ಪತ್ರ</div>
      <div style="font-size: 12px; color: #44403c;">(Certificate of Last GPF Deduction & No Advance in Last 12 Months)</div>
    </div>

    <div style="line-height: 2; font-size: 12.5px; text-align: justify;">
      <p>
        3. ಅವನು / ಅವಳು ಸರಕಾರಿ ಸೇವೆಯಿಂದ ಅಂತಿಮವಾಗಿ ನಿವೃತ್ತಿ ಹೊಂದಿದ್ದಾನೆ.
      </p>
      <p>
        4. ಕಡತಗಳ ಕೊನೆ ಕಂತನ್ನು ಅವನ/ಅವಳ ವೇತನದಿಂದ <strong>12000.00 (ಹನ್ನೆರಡು ಸಾವಿರ ರೂ.)</strong> ಗಳ
        ಜನವರಿ 2026 ರ ವೇತನ ಬಿಲ್ಲಿನಲ್ಲಿ ಕಳೆಯಲಾಗಿದೆ. ಮತ್ತು ತಾಲೂಕು ಖಜಾನೆ <strong>${treasury}</strong>
        ಖಜಾನೆ ನಗದು ವೋಚರ್ ಸಂಖ್ಯೆ ನಲ್ಲಿ ಕಳೆಯಲಾಗಿದೆ. ಕಡತ ಮೊತ್ತವು ರೂ 0 ರೋಗಳ ಮುಂಗಡ ವಾಪಸಾತಿ ಬಗೆಗಿನ ವಸೂಲಾತಿಯಾಗಿದೆ.
      </p>
      <p>
        5. ಅವನು/ಅವಳು ಸೇವೆಯನ್ನು ತ್ಯಜಿಸುವ , ನಿವೃತ್ತಿಪೂರ್ವ ರಜೆ ಮೇಲೆ ತೆರಳುವ ದಿನಾಂಕದಿಂದ ನಿಕಟ ಪೂರ್ವ 12 ತಿಂಗಳ
        ಅಥವಾ ನಂತರದಾವಧಿಯಲ್ಲಿ ಅವನ/ಅವಳ ಭವಿಷ್ಯ ನಿಧಿ ಖಾತೆಯಿಂದ ಯಾವುದೇ ಅಂತಿಮ ವಾಪಸಾತಿಗಾಗಿ ಯಾವುದೇ ತಾತ್ಕಾಲಿಕ ಮುಂಗಡವನ್ನು ಮಂಜೂರು ಮಾಡಿಲ್ಲವೆಂದು ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ.
      </p>
      <div style="margin: 14px 0; padding: 10px; border: 1.5px solid #1c1917; background: #fafaf9;">
        <strong>ದೃಢೀಕರಣ:</strong><br/>
        ಸದರಿ ಶಿಕ್ಷಕರು ನಿವೃತ್ತಿ ಹೊಂದುವ ದಿನಾಂಕ <strong>31-07-2026</strong> ರ ಹಿಂದೆ 12 ತಿಂಗಳಿಂದ ಸದರಿ ಖಾತೆಯಿಂದ
        ಯಾವುದೇ ಮುಂಗಡ / ಭಾಗಶಃ ಹಿಂಪಡೆದಿರುವುದಿಲ್ಲ ಎಂದು ದೃಢೀಕರಿಸಿದೆ. ಹಾಗೂ ಇವರಿಂದ ಮುಂಗಡ ಸಾಲದ ಬಾಕಿಯಾವೂದು ಇರುವುದಿಲ್ಲವೆಂದು ದೃಢೀಕರಿಸಿದೆ.
      </div>
      <p>
        6. ಯಾವುದೇ ಬೇಡಿಕೆಗಳು ಕೆಳಕಂಡ ಬೇಡಿಕೆ ವಸೂಲಾತಿಗಾಗಿ ಬಾಕಿ ಇಲ್ಲವೆಂದು ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ.
      </p>
    </div>

    <div class="kar-sig-block">
      <div>
        ಸ್ಥಳ: ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ: ${record.dor || '31-07-2026'}
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">ಇಲಾಖೆ ಕಚೇರಿ ಮುಖ್ಯಸ್ಥರ ಸಹಿ</div>
        <div style="font-size: 11px;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 12. GPF FORM 6(B) FINAL PAYMENT TO AG (ನಮೂನೆ 6 (ಬಿ) : ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ ಅಂತಿಮ ಸಂದಾಯಕ್ಕೆ ಅರ್ಜಿ - PDF Page 14)
 */
export function generateGpfForm6bHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const employeeName = record.employeeName || 'ಶ್ರೀ ಹೆಚ್.ಡಿ. ಗಿರಿಯಪ್ಪ';
  const school = record.officeOrSchool || 'ಸ.ಶಿ. ಕರ್ನಾಟಕ ಪಬ್ಲಿಕ್ ಶಾಲೆ ಅಂತರಗಂಗೆ';
  const treasury = record.treasuryName || 'ಉಪ ಖಜಾನೆ ಭದ್ರಾವತಿ';

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 16px;">
      <div style="font-size: 15px; font-weight: 900;">ನಮೂನೆ 6 (ಬಿ) / FORM 6(B)</div>
      <div style="font-size: 11.5px; font-weight: bold; color: #57534e;">(ನಾನ್ ಗೆಜೆಟೆಡ್ ಅಧಿಕಾರಿಗಳಿಗೆ ಮಾತ್ರ)</div>
      <div style="font-size: 13.5px; font-weight: bold; margin-top: 4px; text-decoration: underline;">
        ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ನಿಧಿ ಖಾತೆಯಲ್ಲಿನ ಶಿಲ್ಲಿನ ಅಂತಿಮ ಸಂದಾಯಕ್ಕಾಗಿ ಅರ್ಜಿ ನಮೂನೆ
      </div>
    </div>

    <div style="font-size: 12.5px; line-height: 1.8;">
      <div><strong>ಇವರಿಗೆ:</strong></div>
      <div style="margin-left: 20px;">
        ಮಹಾಲೆಕ್ಕಪಾಲರು (A&E),<br/>
        ಕರ್ನಾಟಕ, ಬೆಂಗಳೂರು<br/>
        (ಇಲಾಖಾ ಮುಖ್ಯಸ್ಥರ ಮೂಲಕ)
      </div>

      <div style="margin-top: 12px;"><strong>ಮಾನ್ಯರೇ,</strong></div>
      <p style="text-indent: 24px; text-align: justify; margin: 6px 0;">
        1) <strong>${employeeName}</strong> ಸಹ ಶಿಕ್ಷಕರು ${school} ನಾನೇ ಸರ್ಕಾರಿ ಸೇವೆಯಿಂದ ನಿವೃತ್ತಿ ಹೊಂದಿದ್ದೇನೆ.
      </p>
      <p style="text-align: justify; margin: 6px 0;">
        2) ಭವಿಷ್ಯ ನಿಧಿಯಲ್ಲಿ ನನ್ನ ಹಣವನ್ನು ನಿರಂತರವಾಗಿ ಇರಿಸಿಕೊಳ್ಳಲು ನಾನು ಇಚ್ಛಿಸಿಲ್ಲ. ಆದ್ದರಿಂದ ನನ್ನ ಖಾತೆಯಲ್ಲಿರುವ ಸಂಪೂರ್ಣ ಹಣವನ್ನು ನಿಯಮಗಳ ಮೇರೆಗೆ ಬರುವ ಬಡ್ಡಿಯೊಂದಿಗೆ ಸಂದಾಯ ಮಾಡುವ ವ್ಯವಸ್ಥೆ ಮಾಡಬೇಕಾಗಿ ಕೋರುತ್ತೇನೆ.
      </p>
      <p style="text-align: justify; margin: 6px 0;">
        3) ನನ್ನ ಭವಿಷ್ಯ ನಿಧಿ ಸಂ. <strong>ಇ ಡಿ ಎನ್ : 164360</strong>. ನಾನು ಹಣ ಸಂದಾಯವನ್ನು ನನ್ನ ಕಚೇರಿ <strong>${treasury}</strong> ಮೂಲಕ ಸ್ವೀಕರಿಸಲು ಇಚ್ಛಿಸಿರುತ್ತೇನೆ.
        ನನ್ನ ಬೆರಳು ಗುರುತುಗಳನ್ನು ದ್ವಿಪ್ರತಿಯಲ್ಲಿ ಲಗತ್ತಿಸಲಾಗಿದೆ.
      </p>
      <p style="text-align: justify; margin: 6px 0;">
        4) ನನ್ನ ಭವಿಷ್ಯ ನಿಧಿ ಖಾತೆಯಿಂದ ನೀಡಿದ ಜೀವ ವಿಮಾ ಪಾಲಿಸಿಗಳನ್ನು ದಯವಿಟ್ಟು ಬಿಡುಗಡೆ ಮಾಡಬೇಕಾಗಿ ಕೋರುತ್ತೇನೆ:
      </p>

      <table style="margin-top: 8px;">
        <thead>
          <tr>
            <th style="width: 33%;">ಪಾಲಿಸಿಗಳ ಸಂಖ್ಯೆ</th>
            <th style="width: 33%;">ಕಂಪನಿಯ ಹೆಸರು</th>
            <th style="width: 33%;">ವಿಮೆ ಮಾಡಿದ ಹಣ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; font-weight: bold; font-family: monospace;">ಇ ಡಿ ಎನ್ 162070</td>
            <td style="text-align: center; font-weight: bold;">ಜಿ ಪಿ ಎಫ್</td>
            <td style="text-align: center;">-</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ : ${record.dor || '31-07-2026'}
      </div>
      <div style="text-align: right;">
        <div style="font-weight: bold;">ತಮ್ಮ ವಿಶ್ವಾಸಿ</div>
        <div style="margin-top: 14px; font-weight: bold;">ಹೆಸರು : ${employeeName}</div>
        <div style="font-size: 11px;">ವಿಳಾಸ : ${school}</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 13. FAMILY PENSION NOMINATION (1964 ರ ಕುಟುಂಬ ವೇತನದ ಬಗ್ಗೆ ನಾಮ ನಿರ್ದೇಶನ - PDF Page 15)
 */
export function generateFamilyPensionNominationHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const employeeName = record.employeeName || 'C M SULOCHANA';
  const school = record.officeOrSchool || 'GOVT HIGH PRIMARI SCHOOL LOYAR HUTTHA BHADRAVATI';
  const nominee = record.nomineeName || 'ದಾಸಪ್ಪ';
  const address = record.permanentAddress || 'ಸಿ. ಎಂ. ಸುಲೋಚನಾ, ಲೋಯರ್ ಹುತ್ತಾ ಕಾಲೋನಿ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ';

  const familyList = (record.familyMembers && record.familyMembers.length > 0)
    ? record.familyMembers
    : [
        { name: nominee, relation: record.nomineeRelation || 'ಗಂಡ (Husband)', dob: record.nomineeDob || '1960-05-10', maritalStatus: 'ವಿವಾಹಿತ' }
      ];

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 16px; font-weight: 900; text-decoration: underline;">
        ಕುಟುಂಬ ವೇತನದ ಬಗ್ಗೆ ನಾಮ ನಿರ್ದೇಶನ (Nomination for Family Pension)
      </div>
      <div style="font-size: 11.5px; color: #57534e;">(1964 ರ ಕುಟುಂಬ ವೇತನ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ)</div>
    </div>

    <div style="font-size: 12.5px; line-height: 1.8; text-align: justify; margin-bottom: 14px;">
      ನನ್ನ ಕುಟುಂಬದವರಾಗಿರುವ ಈ ಕೆಳಗೆ ನಮೂದಿಸಿದ ವ್ಯಕ್ತಿಗಳನ್ನು 10 ವರ್ಷಗಳ ಅರ್ಹತಾ ಸೇವೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ ತರುವಾಯ
      ನನ್ನ ಮರಣವು ಸಂಭವಿಸಿದ ಸಂದರ್ಭದಲ್ಲಿ ಸರಕಾರದಿಂದ ನನಗೆ ಮಂಜೂರಾಗಬಹುದಾದ ಕುಟುಂಬ ವೇತನವನ್ನು ಕೆಳಗೆ ಕಾಣಿಸಿದ ಕ್ರಮದಲ್ಲಿ ಪಡೆಯಲು ನಾಮ ನಿರ್ದೇಶನ ಮಾಡುತ್ತೇನೆ.
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 8%;">ಕ್ರಮ ಸಂಖ್ಯೆ</th>
          <th style="width: 42%;">ನಾಮ ನಿರ್ದೇಶಿತರ ಹೆಸರು ಮತ್ತು ವಿಳಾಸ</th>
          <th style="width: 20%;">ಸರಕಾರಿ ನೌಕರನೊಂದಿಗೆ ಸಂಬಂಧ</th>
          <th style="width: 14%;">ಜನ್ಮ ದಿನಾಂಕ / ವಯಸ್ಸು</th>
          <th style="width: 16%;">ವಿವಾಹಿತನೋ / ಅವಿವಾಹಿತನೋ</th>
        </tr>
      </thead>
      <tbody>
        ${familyList.map((m, idx) => `
          <tr>
            <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
            <td>
              <strong>${m.name}</strong><br/>
              <span style="font-size: 11px; color: #44403c;">${address}</span>
            </td>
            <td style="text-align: center; font-weight: bold;">${m.relation}</td>
            <td style="text-align: center; font-weight: bold; font-family: monospace;">${formatDDMMYYYY(m.dob) || m.dob || '10-05-1960'}</td>
            <td style="text-align: center;">${m.maritalStatus || 'ವಿವಾಹಿತ'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="font-size: 12px; margin-top: 14px; line-height: 1.8; text-align: justify;">
      ಈ ನಾಮ ನಿರ್ದೇಶನವು ನಾನು ಈ ಹಿಂದೆ ಮಾಡಿದ ನಾಮ ನಿರ್ದೇಶನದ ಬದಲಾಗಿ ಪ್ರತಿಷ್ಠಾಪನೆಯಾಗತಕ್ಕದ್ದು. ಹಿಂದಿನ ನಾಮ ನಿರ್ದೇಶನವು ರದ್ದಾಗಿ ಹೋಗಿರುವುದು.
    </div>

    <div style="margin-top: 24px; display: flex; justify-content: space-between;">
      <div>
        ದಿನಾಂಕ: ${formatDDMMYYYY(record.dor) || '30-11-2026'}<br/>
        ಸ್ಥಳ: ಭದ್ರಾವತಿ<br/><br/>
        ಸಹಿಗೆ ಸಾಕ್ಷಿದಾರರು:<br/>
        1) _________________________________<br/>
        2) _________________________________
      </div>
      <div style="text-align: center;">
        <div style="margin-top: 30px; font-weight: bold;">ಸರಕಾರಿ ನೌಕರನ ಸಹಿ</div>
        <div style="font-size: 11px; margin-top: 4px;">(${employeeName})</div>
      </div>
    </div>

    <div style="margin-top: 30px; border-top: 1.5px solid #1c1917; padding-top: 10px;">
      <div style="font-weight: bold; font-size: 12px;">( ಕಛೇರಿಯ ಮುಖ್ಯಾಧಿಕಾರಿಯು ತುಂಬಬೇಕಾದುದು )</div>
      <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 11.5px;">
        <div>
          ${employeeName} ಸಹಶಿಕ್ಷಕರು<br/>
          ${school}
        </div>
        <div style="text-align: center;">
          <div style="font-weight: bold;">ಕಛೇರಿಯ ಮುಖ್ಯಾಧಿಕಾರಿಯ ಸಹಿ ಮತ್ತು ಪದನಾಮ</div>
          <div>ದಿನಾಂಕ: ${record.dor || '31-07-2026'}</div>
        </div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 14. NON-RE-EMPLOYMENT & RECOVERY UNDERTAKING (ಮರು ನೌಕರಿಯಿಲ್ಲ ದೃಢೀಕರಣ ಪತ್ರ & ನಿಯಮದ ಪ್ರಕಾರ ಅಗತ್ಯವಾದ ಘೋಷಣೆ - PDF Page 16)
 */
export function generateNonReemploymentUndertakingHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const calc = record.calculation;
  const employeeName = record.employeeName || 'ಶ್ರೀ ಹೆಚ್.ಡಿ. ಗಿರಿಯಪ್ಪ';
  const school = record.officeOrSchool || 'ಸ.ಶಿ. ಕರ್ನಾಟಕ ಪಬ್ಲಿಕ್ ಶಾಲೆ ಅಂತರಗಂಗೆ';
  const pension = calc.basicServicePension || 45100;

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <!-- NON RE-EMPLOYMENT -->
    <div style="margin-bottom: 30px; padding-bottom: 24px; border-bottom: 1.5px solid #1c1917;">
      <div style="font-size: 12.5px; line-height: 2; text-align: justify;">
        ${school} ಕಛೇರಿಯ ಸಹಶಿಕ್ಷಕರು ಹುದ್ದೆಯಿಂದ ನಿವೃತ್ತಿ ಹೊಂದಿದ ನಾನು <strong>${employeeName}</strong>
        ಈ ಮೂಲಕ ದೃಢೀಕರಿಸುವುದೇನೆಂದರೆ ಮೇಲ್ಕಾಣಿಸಿದ ಕಚೇರಿಯಿಂದ ನಿವೃತ್ತಿ ಹೊಂದಿದ ನಂತರ ನಾನು <strong>ಮರು ನೌಕರಿಯಲಿಲ್ಲ</strong>.
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 16px; font-size: 11.5px;">
        <div>ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>ದಿನಾಂಕ : ${record.dor || '31-07-2026'}</div>
        <div style="text-align: center;">ಸಹಿ<br/>ಪದನಾಮ</div>
      </div>
    </div>

    <!-- UNDERTAKING -->
    <div>
      <div style="text-align: center; font-weight: bold; font-size: 15px; text-decoration: underline; margin-bottom: 16px;">
        ನಿಯಮದ ಪ್ರಕಾರ ಅಗತ್ಯವಾದ ಘೋಷಣೆ (Statutory Undertaking)
      </div>
      <div style="font-size: 12.5px; line-height: 2; text-align: justify;">
        ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ ಇವರು ನನ್ನನ್ನು ಸಂಪರ್ಕಿಸಿ ನನಗೆ ನಿವೃತ್ತಿ ವೇತನ ಹಣವನ್ನು
        ತಿಂಗಳೊಂದಕ್ಕೆ ರೂ. <strong>${pension}.00</strong> ರಂತೆ ಕೊಡಲು ಒಪ್ಪಿರುತ್ತಾರೆ. ನಾನು ಈ ಹಣವನ್ನು ಪಡೆದುಕೊಂಡು . ಈ ಮೂಲಕ
        ಒಪ್ಪಿಕೊಳ್ಳುವುದೇನೆಂದರೆ ನಿವೃತ್ತಿ ವೇತನವು ಪರಿಷ್ಕರಣೆಗೊಳಪಟ್ಟಲ್ಲಿ ನಿವೃತ್ತಿ ವೇತನವು ಹೆಚ್ಚೆಂದು ಕಂಡುಬಂದಲ್ಲಿ ನಾನು ನಿಯಮದ ಪ್ರಕಾರ ಅರ್ಹನಾಗಿದ್ದೇನೆ
        ಎಂದು ನಾನು ಸಂಪೂರ್ಣವಾಗಿ ತಿಳಿದುಕೊಂಡಿದ್ದೇನೆ ಮತ್ತು ಅಂತಹ ಪರಿಷ್ಕರಣೆಗೆ ನನ್ನ ಯಾವ ಆಕ್ಷೇಪಣೆಯೂ ಇರುವುದಿಲ್ಲ ಎಂದು ವಾಗ್ದಾನ ಮಾಡುತ್ತೇನೆ.
        ಇದಲ್ಲದೆ ಅಂತಹ ಸಂದರ್ಭದಲ್ಲಿ ನನಗೆ ಕೊಟ್ಟಂತಹ ಯಾವುದೇ ಹಣವನ್ನು ಮರುಪಾವತಿ ಮಾಡಲು ನಾನು ಬದ್ಧನಾಗಿರುತ್ತೇನೆಂದು ವಾಗ್ದಾನ ಮಾಡುತ್ತೇನೆ.
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 24px; font-size: 11.5px;">
        <div>ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>ದಿನಾಂಕ : ${record.dor || '31-07-2026'}</div>
        <div style="text-align: center;">
          <div style="font-weight: bold;">ಸಹಿ</div>
          <div style="margin-top: 4px;">(${employeeName})</div>
        </div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 15. PENSION APPLICATION & SANCTION SUMMARY SLIP (ನಿವೃತ್ತಿ ವೇತನದ ವಿವರ ಸಾರಾಂಶ - PDF Page 17)
 */
export function generatePensionSanctionSummaryHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const calc = record.calculation;
  const employeeName = record.employeeName || 'ಶ್ರೀ ಹೆಚ್.ಡಿ. ಗಿರಿಯಪ್ಪ';
  const pension = calc.basicServicePension || 45100;
  const dcrg = calc.dcrgSanctioned || 1443200;
  const familyPension = calc.familyPensionNormal || 27060;

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1c1917; padding-bottom: 6px;">
      <div style="font-size: 16px; font-weight: 900;">ನಿವೃತ್ತಿ ವೇತನ ಮಂಜೂರಾತಿ ಸಾರಾಂಶ ಪಟ್ಟಿ</div>
      <div style="font-size: 12px; color: #44403c;">(Pension Application & Sanction Particulars Slip)</div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 8%;">ಕ್ರ.ಸಂ</th>
          <th style="width: 58%;">ವಿವರ</th>
          <th style="width: 34%;">ಮಂಜೂರಾತಿ ವಿವರ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; font-weight: bold;">1</td>
          <td>ಸರಕಾರಿ ನೌಕರನು ನಿವೃತ್ತಿ ವೇತನ ಅರ್ಜಿಯನ್ನು ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ</td>
          <td style="font-weight: bold; font-family: monospace;">08-07-2026</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">2</td>
          <td>ಸರಕಾರಿ ನೌಕರನ ಹೆಸರು</td>
          <td style="font-weight: bold;">${employeeName}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">3</td>
          <td>ನಿವೃತ್ತಿ ವೇತನದ ಅಥವಾ ಉಪದಾನದ ವರ್ಗ</td>
          <td>ನಿವೃತ್ತಿ ವೇತನ</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">4</td>
          <td>ಮಂಜೂರು ಮಾಡುವ ಅಧಿಕಾರಿ</td>
          <td>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು ಭದ್ರಾವತಿ</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">5</td>
          <td>ಮಂಜೂರಾದ ನಿವೃತ್ತಿ ವೇತನ</td>
          <td style="font-weight: bold; font-family: monospace; color: #047857;">${pension}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">6</td>
          <td>ಮಂಜೂರಾದ ಉಪದಾನ</td>
          <td style="font-weight: bold; font-family: monospace; color: #047857;">${dcrg}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">7</td>
          <td>ನಿವೃತ್ತಿ ವೇತನ ಪ್ರಾರಂಭ ದಿನಾಂಕ</td>
          <td style="font-weight: bold; font-family: monospace;">01-08-2026</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">8</td>
          <td>ಮಂಜೂರಾದ ದಿನಾಂಕ</td>
          <td style="font-weight: bold; font-family: monospace;">31-07-2026</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">9</td>
          <td>ನಿವೃತ್ತಿ ವೇತನಿಯು ಮರಣ ಹೊಂದಿದ ಸಂದರ್ಭದಲ್ಲಿ ಅನುಮತಿಸತಕ್ಕ ಕುಟುಂಬ ವೇತನದ ಮೊಬಲಗು</td>
          <td style="font-weight: bold; font-family: monospace; color: #047857;">${familyPension}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">10</td>
          <td>1964 ನೆಯ ಇಸವಿಯ ಕುಟುಂಬ ವೇತನ ನಿಯಮಾವಳಿಯ 10ನೆಯ ನಿಯಮದ ಮೇರೆಗೆ ಉಪದಾನದ ವಸೂಲಾಗತಕ್ಕ ಮೊಬಲಗು</td>
          <td>ಇಲ್ಲ</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">11</td>
          <td>ಉಪದಾನದಿಂದ ಮುಂದೆ ಹಾಕಿದ ಸರ್ಕಾರಿ ಬಾಕಿಗಳು</td>
          <td style="font-weight: bold; color: #15803d;">ಇಲ್ಲ</td>
        </tr>
      </tbody>
    </table>

    <div class="kar-sig-block">
      <div>
        ಸ್ಥಳ: ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ: ${record.dor || '31-07-2026'}
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">ಸಕ್ಷಮ ಪ್ರಾಧಿಕಾರ</div>
        <div style="font-size: 11px;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 16. NON-QUALIFYING SERVICE & UNVERIFIED SERVICE (ವಿಭಾಗ - III & IV : ಅನರ್ಹತಾ ಸೇವೆ & ಶೋಧಿಸದಿದ್ದ ಸೇವಾ ಅವಧಿ - PDF Page 18)
 */
export function generateNonQualifyingServiceHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 16px; font-weight: 900; text-decoration: underline;">«¨ÁUÀ -111 (ವಿಭಾಗ - 3)</div>
      <div style="font-size: 14px; font-weight: bold; margin-top: 4px;">ಅನರ್ಹತಾ ಸೇವೆಯ ಅವಧಿಗಳು (Non-Qualifying Service Periods)</div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 10%;">ಕ್ರ.ಸಂ</th>
          <th style="width: 55%;">ವಿವರ</th>
          <th style="width: 35%;">ಅವಧಿ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; font-weight: bold;">1</td>
          <td>ಅಂತರಗಳು (Breaks in Service)</td>
          <td style="text-align: center;">----------------</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">2</td>
          <td>ನಿವೃತ್ತಿ ವೇತನಕ್ಕೆ ಅರ್ಹವಾಗದ ಅಸಾಧಾರಣ ರಜೆ (EOL without MC)</td>
          <td style="text-align: center;">----------------</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">3</td>
          <td>ಅರ್ಹವೆಂದು ಪರಿಗಣಿಸದ ನಿಲಂಬನಾ ಅವಧಿ (Suspension Period)</td>
          <td style="text-align: center;">----------------</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">4</td>
          <td>ಅರ್ಹವೆಂದು ಪರಿಗಣಿಸದ ಯಾವುದೇ ಸೇವೆ</td>
          <td style="text-align: center;">----------------</td>
        </tr>
        <tr style="background-color: #f5f5f4; font-weight: bold;">
          <td colspan="2" style="text-align: right; padding-right: 16px;">ಜುಮ್ಲಾ (Total):</td>
          <td style="text-align: center; color: #15803d;">ಇಲ್ಲ (ಶೂನ್ಯ)</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 36px; text-align: center;">
      <div style="font-size: 16px; font-weight: 900; text-decoration: underline;">«¨ÁUÀ -IV (ವಿಭಾಗ - 4)</div>
      <div style="font-size: 13.5px; font-weight: bold; margin-top: 4px;">ವೇತನ ಪಟ್ಟಿಗೆ ಸಂಬಂಧಿಸಿದ ಶೋಧಿಸದಿದ್ದ ಸೇವಾ ಅವಧಿ</div>
      <div style="font-size: 11.5px; color: #57534e;">ವೃದ್ಧಾಪ್ಯ / ನಿವೃತ್ತಿ / ವಿಕಲತೆ / ಪರಿಹಾರ ವೇತನ</div>
    </div>

    <table style="margin-top: 14px;">
      <tbody>
        <tr>
          <td style="width: 50%; font-weight: bold;">1 ಎ) ಲೆಕ್ಕ ಪರಿಶೋಧನೆ</td>
          <td style="font-weight: bold; color: #047857;">ಪೂರ್ಣಗೊಂಡಿದೆ (ಸೇವಾ ಪುಸ್ತಕದಲ್ಲಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ)</td>
        </tr>
      </tbody>
    </table>

    <div class="kar-sig-block">
      <div>
        ಸ್ಥಳ: ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ: ${record.dor || '31-07-2026'}
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">ಪರಿಶೋಧನಾ ಅಧಿಕಾರಿಯ ಸಹಿ</div>
        <div style="font-size: 11px;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 17. LEFT HAND FINGERPRINTS SHEET (ಎಡಗೈ ಬೆರಳು ಗುರುತುಗಳು - PDF Page 19)
 */
export function generateFingerprintsSheetHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const employeeName = record.employeeName || 'ಶ್ರೀ ಹೆಚ್.ಡಿ. ಗಿರಿಯಪ್ಪ';

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 16px; font-weight: 900; text-decoration: underline;">
        ಎಡಗೈ ಬೆರಳು ಗುರುತುಗಳು (Left Hand Finger Impressions)
      </div>
      <div style="font-size: 12px; color: #57534e; margin-top: 4px;">
        (ನಿವೃತ್ತ ನೌಕರ ಮತ್ತು ಪತಿ / ಪತ್ನಿಯ ಎಡಗೈ ಬೆರಳು ಗುರುತುಗಳ ಪಟ್ಟಿ)
      </div>
    </div>

    <!-- PENSIONER IMPRESSIONS -->
    <div style="margin-bottom: 24px;">
      <div style="font-weight: bold; font-size: 13px; margin-bottom: 8px;">
        1. ಸರಕಾರಿ ನೌಕರನ ಎಡಗೈ ಬೆರಳು ಗುರುತುಗಳು: (${employeeName})
      </div>
      <div class="kar-box-grid">
        <div class="kar-box-cell"><span>ಹೆಬ್ಬೆರಳು</span><span>Thumb</span></div>
        <div class="kar-box-cell"><span>ತೋರುಬೆರಳು</span><span>Index</span></div>
        <div class="kar-box-cell"><span>ನಡುಬೆರಳು</span><span>Middle</span></div>
        <div class="kar-box-cell"><span>ಉಂಗುರ ಬೆರಳು</span><span>Ring</span></div>
        <div class="kar-box-cell"><span>ಕಿರುಬೆರಳು</span><span>Little</span></div>
      </div>
    </div>

    <!-- SPOUSE IMPRESSIONS -->
    <div style="margin-bottom: 30px;">
      <div style="font-weight: bold; font-size: 13px; margin-bottom: 8px;">
        2. ಸರಕಾರಿ ನೌಕರನ ಪತ್ನಿ / ಪತಿಯ ಎಡಗೈ ಬೆರಳು ಗುರುತುಗಳು:
      </div>
      <div class="kar-box-grid">
        <div class="kar-box-cell"><span>ಹೆಬ್ಬೆರಳು</span><span>Thumb</span></div>
        <div class="kar-box-cell"><span>ತೋರುಬೆರಳು</span><span>Index</span></div>
        <div class="kar-box-cell"><span>ನಡುಬೆರಳು</span><span>Middle</span></div>
        <div class="kar-box-cell"><span>ಉಂಗುರ ಬೆರಳು</span><span>Ring</span></div>
        <div class="kar-box-cell"><span>ಕಿರುಬೆರಳು</span><span>Little</span></div>
      </div>
    </div>

    <table style="margin-top: 16px;">
      <tbody>
        <tr>
          <td style="width: 60%; font-weight: bold;">
            23. 1ನೇ ಪತ್ರದಲ್ಲಿ ಸರಕಾರಿ ನೌಕರನು ನಿವೃತ್ತಿ ವೇತನಕ್ಕೆ ಅರ್ಜಿ ಹಾಕಿದ ದಿನಾಂಕ
          </td>
          <td style="font-weight: bold; font-family: monospace; font-size: 13.5px; color: #047857;">
            24-06-2026
          </td>
        </tr>
      </tbody>
    </table>

    <div class="kar-sig-block">
      <div>
        ಸ್ಥಳ : ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ : ${record.dor || '31-07-2026'}
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">ಕಛೇರಿಯ / ಇಲಾಖೆಯ ಮುಖ್ಯಾಧಿಕಾರಿಯ ಸಹಿ</div>
        <div style="font-size: 11px;">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</div>
      </div>
    </div>
  </div>
  `;
}

/**
 * 18. RETIREMENT PREPARATION BIO-DATA FORM 1 YEAR IN ADVANCE (ನಿವೃತ್ತಿ ದಿನಾಂಕಕ್ಕಿಂತ 1 ವರ್ಷ ಮುಂಚಿತವಾಗಿ ಪಡೆಯಬೇಕಾದ ವಿವರ - PDF Page 20)
 */
export function generateRetirementAdvanceFormHtml(
  record: PensionCaseRecord,
  office: OfficeConfig = DEFAULT_PENSION_OFFICE_CONFIG
): string {
  const employeeName = record.employeeName || 'ಶ್ರೀ ಹೆಚ್.ಡಿ. ಗಿರಿಯಪ್ಪ';
  const school = record.officeOrSchool || 'ಸ.ಶಿ. ಕರ್ನಾಟಕ ಪಬ್ಲಿಕ್ ಶಾಲೆ ಅಂತರಗಂಗೆ';
  const address = record.permanentAddress || 'ಗಿರಿಯಪ್ಪ ಹೆಚ್.ಡಿ. ಮನೆ ನಂ: 152/ಸಿ ಹುಡ್ಕೋಕಾಲೋನಿ ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ';
  const treasury = record.treasuryName || 'ಉಪ ಖಜಾನೆ ಭದ್ರಾವತಿ';

  const defaultFamily = [
    { name: 'ರೇಣುಕಾ ಬಿ.ಎಸ್', relation: 'ಹೆಂಡತಿ', dob: '15-06-1972', status: 'ವಿವಾಹಿತೆ' },
    { name: 'ಕೀರ್ತನಾ ಹೆಚ್.ಜಿ.', relation: 'ಮಗಳು', dob: '14-12-1997', status: 'ವಿವಾಹಿತೆ' },
    { name: 'ದೀಪಕ್ ಹೆಚ್.ಜಿ.', relation: 'ಮಗ', dob: '24-06-2000', status: 'ವಿವಾಹಿತ' }
  ];

  const familyList = (record.familyMembers && record.familyMembers.length > 0)
    ? record.familyMembers.map(m => ({
        name: m.name,
        relation: m.relation,
        dob: formatDDMMYYYY(m.dob),
        status: m.maritalStatus || 'ವಿವಾಹಿತ'
      }))
    : defaultFamily;

  return `
  ${DOSSIER_STYLE}
  <div class="kar-dossier-page">
    <div style="text-align: center; margin-bottom: 16px; border-bottom: 2px solid #1c1917; padding-bottom: 4px;">
      <div style="font-size: 15px; font-weight: 900;">ನಮೂನೆ (BIO-DATA FORM)</div>
      <div style="font-size: 12px; font-weight: bold; color: #44403c;">
        ಕಛೇರಿಯ ಮುಖ್ಯಸ್ಥರು ನಿವೃತ್ತಿಯಾಗುವ ಸರಕಾರಿ ನೌಕರರಿಂದ ನಿವೃತ್ತಿ ದಿನಾಂಕಕ್ಕಿಂತ ಒಂದು ವರ್ಷ ಮುಂಚಿತವಾಗಿ ಪಡೆಯಬೇಕಾದ ವಿವರ
      </div>
    </div>

    <table>
      <tbody>
        <tr>
          <td style="width: 8%; text-align: center; font-weight: bold;">1</td>
          <td style="width: 44%;">ಹೆಸರು</td>
          <td style="font-weight: bold;">${employeeName}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">2</td>
          <td>
            (ಎ) ಹುಟ್ಟಿದ ದಿನಾಂಕ<br/>
            (ಬಿ) ಸೇವೆಗೆ ಸೇರಿದ ದಿನಾಂಕ<br/>
            (ಸಿ) ನಿವೃತ್ತಿ ದಿನಾಂಕ
          </td>
          <td style="font-weight: bold; font-family: monospace;">
            ${formatDDMMYYYY(record.dob) || '20-07-1966'}<br/>
            ${formatDDMMYYYY(record.doa) || '01-08-1994'}<br/>
            ${formatDDMMYYYY(record.dor) || '31-07-2026'}
          </td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">3</td>
          <td>ಪತ್ರಾಂಕಿತ ಸರಕಾರಿ ನೌಕರರಿಂದ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟ ಸರಕಾರಿ ನೌಕರನ ಎದುರು ಮಾಡಿದ ಹಸ್ತಾಕ್ಷರ (ಎರಡು ಬೇರೆ ಹಾಳೆಗಳಲ್ಲಿ ಒದಗಿಸಬೇಕು)</td>
          <td style="font-weight: bold; color: #047857;">ಲಗತ್ತಿಸಿದೆ</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">4</td>
          <td>ಮೂರು ಪಾಸ್ ಪೋರ್ಟ್ ಗಾತ್ರದ ಹೆಂಡತಿ/ಗಂಡನ ಜೊತೆಗಿರುವ ಭಾವಚಿತ್ರ (ಪತ್ರಾಂಕಿತ ಅಧಿಕಾರಿಯಿಂದ ದೃಢೀಕರಿಸಬೇಕು)</td>
          <td style="font-weight: bold; color: #047857;">ಲಗತ್ತಿಸಿದೆ</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">5</td>
          <td>ಎತ್ತರ ಮತ್ತು ಗುರುತು ಚಿಹ್ನೆಗಳನ್ನು ತೋರಿಸುವ ಪತ್ರಾಂಕಿತ ಅಧಿಕಾರಿಯಿಂದ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟ ಎರಡು ಚೀಟಿ</td>
          <td style="font-weight: bold; color: #047857;">ಲಗತ್ತಿಸಿದೆ</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">6</td>
          <td>ಈಗಿನ ವಿಳಾಸ</td>
          <td><strong>${employeeName}</strong><br/>${school}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">7</td>
          <td>ನಿವೃತ್ತಿ ತರುವಾಯ ವಿಳಾಸ</td>
          <td>${address}</td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">8</td>
          <td>ನಿವೃತ್ತಿ ವೇತನವನ್ನು ಪಡೆಯ ಬಯಸುವ ಖಜಾನೆ ಹೆಸರು</td>
          <td style="font-weight: bold;">${treasury}</td>
        </tr>
      </tbody>
    </table>

    <!-- FAMILY MEMBERS TABLE -->
    <div style="margin-top: 12px;">
      <div style="font-weight: bold; font-size: 12.5px; margin-bottom: 4px;">9. ಕುಟುಂಬ ಸದಸ್ಯರ ವಿವರ:</div>
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">ಕ್ರಮ ಸಂಖ್ಯೆ</th>
            <th style="width: 32%;">ಹೆಸರು</th>
            <th style="width: 20%;">ಸರಕಾರಿ ನೌಕರನಿಗೆ ಇರುವ ಸಂಬಂಧ</th>
            <th style="width: 20%;">ಹುಟ್ಟಿದ ದಿನಾಂಕ</th>
            <th style="width: 20%;">ವಿವಾಹಿತರೇ ಅಥವಾ ಅವಿವಾಹಿತರೇ</th>
          </tr>
        </thead>
        <tbody>
          ${familyList.map((f, i) => `
            <tr>
              <td style="text-align: center; font-weight: bold;">${i + 1}</td>
              <td style="font-weight: bold;">${f.name}</td>
              <td style="text-align: center;">${f.relation}</td>
              <td style="text-align: center; font-family: monospace;">${f.dob}</td>
              <td style="text-align: center;">${f.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- COMMUTATION DECLARATION -->
    <div style="margin-top: 14px; padding: 10px; border: 1.5px solid #1c1917; background-color: #fafaf9; font-size: 12px; line-height: 1.8;">
      <div style="font-weight: bold; text-decoration: underline; margin-bottom: 4px;">10. ನಿವೃತ್ತಿ ವೇತನದ ಒಂದು ಭಾಗವನ್ನು ಪರಿವರ್ತನೆ ಮಾಡಲು ಘೋಷಣೆ:</div>
      <div>
        <strong>${employeeName}</strong> ಸಹ ಶಿಕ್ಷಕರು ಎಂಬ ನಾನು ನನ್ನ ಮಾಸಿಕ ವೇತನದ ಪೈಕಿ ರೂಪಾಯಿಗಳನ್ನು <strong>1/3 ಭಾಗ</strong> ಪರಿವರ್ತನೆ ಮಾಡಿಕೊಳ್ಳಬಯಸುತ್ತೇನೆ.
      </div>
    </div>

    <div class="kar-sig-block">
      <div>
        ಸ್ಥಳ: ಭದ್ರಾವತಿ<br/>
        ದಿನಾಂಕ: 29-06-2026
      </div>
      <div style="text-align: center;">
        <div style="font-weight: bold;">${employeeName}</div>
        <div style="font-size: 11px;">ಸಹ ಶಿಕ್ಷಕರು, ${school}</div>
      </div>
    </div>
  </div>
  `;
}
