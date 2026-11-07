/**
 * Generates an authentic high-resolution Karnataka Government Official Memorandum
 * for testing document scanner, perspective cropping, Xerox/B&W filters, and PDF export.
 */
export function generateSampleKarnatakaGovtDocument(): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1240;
    canvas.height = 1754; // Standard A4 at 150 DPI
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    // 1. Paper Background (Warm off-white archival paper with subtle texture)
    ctx.fillStyle = '#FDFBF7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle paper edge border
    ctx.strokeStyle = '#E2DCD2';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Inner margin guide line (like official court/govt bond paper)
    ctx.strokeStyle = '#F0EAE1';
    ctx.lineWidth = 1;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // 2. Official Emblem Header
    // Crest circle
    ctx.save();
    ctx.translate(canvas.width / 2, 130);
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#8B2500';
    ctx.fill();

    // Emblem inner star / lion representation
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8B2500';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏛️', 0, -2);
    ctx.restore();

    // 3. Government Header Typography
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1C1917';

    ctx.font = 'bold 32px "Noto Sans Kannada", sans-serif';
    ctx.fillText('ಕರ್ನಾಟಕ ಸರ್ಕಾರ', canvas.width / 2, 205);

    ctx.font = 'bold 22px "Noto Sans Kannada", sans-serif';
    ctx.fillStyle = '#292524';
    ctx.fillText('ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ', canvas.width / 2, 245);

    ctx.font = '18px "Noto Sans Kannada", sans-serif';
    ctx.fillStyle = '#44403C';
    ctx.fillText('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಮಧುಗಿರಿ ಶೈಕ್ಷಣಿಕ ವಲಯ, ತುಮಕೂರು ಜಿಲ್ಲೆ - 572 132', canvas.width / 2, 278);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#78716C';
    ctx.fillText('ದೂರವಾಣಿ: 08137-282245 | ಇಮೇಲ್: beo.madhugiri@karnataka.gov.in', canvas.width / 2, 304);

    // Double Rule Under Header
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(80, 325);
    ctx.lineTo(canvas.width - 80, 325);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, 331);
    ctx.lineTo(canvas.width - 80, 331);
    ctx.stroke();

    // 4. Meta Reference & Date
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 17px "Noto Sans Kannada", monospace';
    ctx.fillText('ಕಡತ ಸಂ: ಕಶಿಅ/ಮಧು/ಆಡಳಿತ/ದಾಖಲೆ-88/2026-27', 90, 375);

    ctx.textAlign = 'right';
    ctx.fillText('ದಿನಾಂಕ: 07-10-2026', canvas.width - 90, 375);

    // Dispatch number
    ctx.textAlign = 'left';
    ctx.font = '14px monospace';
    ctx.fillStyle = '#57534E';
    ctx.fillText('e-Office File ID: KA-MDU-EDU-2026-F882', 90, 400);

    // 5. Title Banner
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 24px "Noto Sans Kannada", sans-serif';
    ctx.fillText(':: ಅಧಿಕೃತ ಜ್ಞಾಪನ ಪತ್ರ (OFFICIAL MEMORANDUM) ::', canvas.width / 2, 455);

    // Underline
    ctx.strokeStyle = '#A8A29E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 260, 465);
    ctx.lineTo(canvas.width / 2 + 260, 465);
    ctx.stroke();

    // 6. Subject & Reference
    ctx.textAlign = 'left';
    ctx.font = 'bold 18px "Noto Sans Kannada", sans-serif';
    ctx.fillStyle = '#0F172A';
    ctx.fillText('ವಿಷಯ:', 90, 520);

    ctx.font = '17px "Noto Sans Kannada", sans-serif';
    ctx.fillStyle = '#1E293B';
    const subText = 'ಶಾಲಾ ದಾಖಲೆಗಳು, ಸಿಬ್ಬಂದಿ ಸೇವಾ ವಿವರ ಹಾಗೂ ಅನುದಾನ ಬಳಕೆಯ ನೈಜ ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ ಮತ್ತು ಡಿಜಿಟಲ್ ಇ-ಕಡತ ಸೃಜನೆ ಕುರಿತು.';
    wrapText(ctx, subText, 160, 520, canvas.width - 250, 28);

    ctx.font = 'bold 18px "Noto Sans Kannada", sans-serif';
    ctx.fillStyle = '#0F172A';
    ctx.fillText('ಉಲ್ಲೇಖ:', 90, 600);

    ctx.font = '16px "Noto Sans Kannada", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('1. ಮಾನ್ಯ ಆಯುಕ್ತರ ಕಛೇರಿ ಸುತ್ತೋಲೆ ಸಂಖ್ಯೆ: ಇಡಿ/44/ಶಾಸೆ/2026, ದಿನಾಂಕ: 15-01-2026.', 160, 600);
    ctx.fillText('2. ಈ ಕಛೇರಿಯ ಸಮಸಂಖ್ಯೆಯ ಹಿಂದಿನ ಜ್ಞಾಪನ ಪತ್ರ ದಿನಾಂಕ: 22-05-2026.', 160, 630);

    // 7. Divider Line
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(90, 665);
    ctx.lineTo(canvas.width - 90, 665);
    ctx.stroke();

    // 8. Body Paragraphs (Kannada Official Text)
    ctx.font = '17px "Noto Sans Kannada", sans-serif';
    ctx.fillStyle = '#0F172A';

    const p1 = 'ಪ್ರಸ್ತಾವನೆ: ಮೇಲ್ಕಂಡ ವಿಷಯ ಹಾಗೂ ಉಲ್ಲೇಖಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಮಧುಗಿರಿ ಶೈಕ್ಷಣಿಕ ವಲಯದ ವ್ಯಾಪ್ತಿಗೆ ಒಳಪಡುವ ಎಲ್ಲಾ ಸರ್ಕಾರಿ, ಅನುದಾನಿತ ಹಾಗೂ ಪ್ರಾಥಮಿಕ/ಪ್ರೌಢಶಾಲೆಗಳ ಭೌತಿಕ ಕಡತಗಳು, ಸೇವಾ ಪುಸ್ತಕಗಳು, ಶಿಕ್ಷಕರ ಹಾಜರಾತಿ ಹಾಗೂ ಅನುದಾನ ಬಳಕೆ ಪ್ರಮಾಣಪತ್ರಗಳನ್ನು ಇ-ಆಫೀಸ್ (e-Office) ವ್ಯವಸ್ಥೆಯಲ್ಲಿ ಪೂರ್ಣಪ್ರಮಾಣದಲ್ಲಿ ದಾಖಲಿಸಲು ಆದೇಶಿಸಲಾಗಿದೆ.';
    wrapText(ctx, p1, 90, 715, canvas.width - 180, 32);

    const p2 = 'ಆದೇಶ: ಆದ್ದರಿಂದ, ಎಲ್ಲಾ ಶಾಲಾ ಮುಖ್ಯ ಶಿಕ್ಷಕರುಗಳು ಮತ್ತು ಸಿಬ್ಬಂದಿ ವರ್ಗದವರು ತಮ್ಮ ಶಾಲಾ ದಾಖಲೆಗಳನ್ನು ಹಾಗೂ ಕಛೇರಿ ಪತ್ರ ವ್ಯವಹಾರಗಳನ್ನು ನಿಗದಿತ ನಮೂನೆಯಲ್ಲಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ, ಅಧಿಕೃತ ಸಹಿ ಮತ್ತು ಮೊಹರಿನೊಂದಿಗೆ ಈ ಕಛೇರಿಗೆ ಸಕಾಲದಲ್ಲಿ ಸಲ್ಲಿಸತಕ್ಕದ್ದು. ದಾಖಲೆಗಳಲ್ಲಿ ಯಾವುದೇ ಲೋಪದೋಷಗಳು ಕಂಡುಬಂದಲ್ಲಿ ಸಂಬಂಧಿಸಿದ ಮುಖ್ಯೋಪಾಧ್ಯಾಯರೇ ನೇರ ಹೊಣೆಗಾರರಾಗಿರುತ್ತಾರೆ.';
    wrapText(ctx, p2, 90, 860, canvas.width - 180, 32);

    const p3 = 'ಸದರಿ ಆದೇಶವು ತಕ್ಷಣದಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ಹಾಗೂ ದಿನಾಂಕ 15-10-2026ರೊಳಗೆ ಎಲ್ಲಾ ಕಡತಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ವರದಿ ನೀಡುವಂತೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ಕಟ್ಟುನಿಟ್ಟಿನ ಸೂಚನೆ ನೀಡಲಾಗಿದೆ.';
    wrapText(ctx, p3, 90, 1005, canvas.width - 180, 32);

    // 9. Official Circular Rubber Stamp (Blue Ink)
    ctx.save();
    ctx.translate(canvas.width - 320, 1180);
    ctx.rotate(-0.06); // Slight realistic angle

    // Outer circle
    ctx.strokeStyle = '#1D4ED8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, Math.PI * 2);
    ctx.stroke();

    // Inner circle
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.stroke();

    // Stamp text
    ctx.fillStyle = '#1D4ED8';
    ctx.font = 'bold 12px "Noto Sans Kannada", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ★', 0, -32);
    ctx.font = 'bold 14px "Noto Sans Kannada", sans-serif';
    ctx.fillText('ಮಧುಗಿರಿ ವಲಯ', 0, -2);
    ctx.font = '11px sans-serif';
    ctx.fillText('OFFICIAL SEAL', 0, 18);
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('07-OCT-2026', 0, 36);
    ctx.restore();

    // 10. Official Signature in Blue Fountain Pen Ink
    ctx.save();
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    // Realistic signature stroke curve
    ctx.moveTo(canvas.width - 360, 1310);
    ctx.bezierCurveTo(canvas.width - 340, 1280, canvas.width - 310, 1330, canvas.width - 270, 1290);
    ctx.bezierCurveTo(canvas.width - 240, 1260, canvas.width - 220, 1320, canvas.width - 180, 1295);
    ctx.moveTo(canvas.width - 350, 1325);
    ctx.lineTo(canvas.width - 170, 1318);
    ctx.stroke();
    ctx.restore();

    // Signature Title
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 18px "Noto Sans Kannada", sans-serif';
    ctx.fillText('(ಅಧಿಕೃತ ಸಹಿ)', canvas.width - 190, 1350);

    ctx.font = 'bold 17px "Noto Sans Kannada", sans-serif';
    ctx.fillText('ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು', canvas.width - 160, 1380);

    ctx.font = '15px "Noto Sans Kannada", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('ಮಧುಗಿರಿ ಶೈಕ್ಷಣಿಕ ವಲಯ, ಮಧುಗಿರಿ', canvas.width - 160, 1408);

    // 11. Red Entry Stamp on Left (Official Inward / Dispatch mark)
    ctx.save();
    ctx.translate(140, 1310);
    ctx.rotate(0.04);
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(0, 0, 230, 85);

    ctx.fillStyle = '#DC2626';
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px "Noto Sans Kannada", sans-serif';
    ctx.fillText('ಕಛೇರಿ ಸ್ವೀಕೃತಿ - ಅಧಿಕೃತ ದಾಖಲೆ', 115, 24);
    ctx.font = '12px monospace';
    ctx.fillText('ಕ್ರ.ಸಂ: 289/2026-27', 115, 48);
    ctx.fillText('ಸ್ವೀಕರಿಸಿದ ದಿನ: 07-10-2026', 115, 70);
    ctx.restore();

    // 12. Bottom Footer
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(90, 1660);
    ctx.lineTo(canvas.width - 90, 1660);
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px "Noto Sans Kannada", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ಕರ್ನಾಟಕ ರಾಜ್ಯಪತ್ರ ಅನುಮೋದಿತ ನಮೂನೆ • ಅಧಿಕೃತ ಕಛೇರಿ ನಕಲು ಪ್ರತಿ', 90, 1685);

    ctx.textAlign = 'right';
    ctx.fillText('ಪುಟ 1 (Page 1 of 1)', canvas.width - 90, 1685);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
    resolve(dataUrl);
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, curY);
}
