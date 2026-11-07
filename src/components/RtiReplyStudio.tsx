import React, { useState, useEffect } from 'react';
import { MasterDocketFile, EducationLetter, DocumentAttachment } from '../types';
import { 
  Sparkles, 
  Printer, 
  Send, 
  Copy, 
  Check, 
  Save, 
  FileText, 
  UploadCloud, 
  Trash2, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  FileCheck2,
  Image as ImageIcon,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface RtiReplyStudioProps {
  rtiFiles: MasterDocketFile[];
  selectedRtiFile?: MasterDocketFile | null;
  onSaveToRegistry: (letterData: Partial<EducationLetter>) => Promise<void>;
  onUpdateRtiFileStatus?: (fileId: string, status: string, replyRef: string) => Promise<void>;
  onBackToFiles?: () => void;
}

export const RtiReplyStudio: React.FC<RtiReplyStudioProps> = ({
  rtiFiles,
  selectedRtiFile,
  onSaveToRegistry,
  onUpdateRtiFileStatus,
  onBackToFiles,
}) => {
  // Available RTI files filter
  const rtiDocketList = rtiFiles.filter(f => f.isRtiFile || f.section === 'Legal & Grievances');
  
  const [activeFile, setActiveFile] = useState<MasterDocketFile | null>(
    selectedRtiFile || rtiDocketList[0] || null
  );

  const today = new Date().toISOString().split('T')[0];

  // Utility to format date strictly as dd-mm-yyyy
  const formatDdMmYyyy = (dateInput?: string | Date | null): string => {
    if (!dateInput) {
      const t = new Date();
      return `${String(t.getDate()).padStart(2, '0')}-${String(t.getMonth() + 1).padStart(2, '0')}-${t.getFullYear()}`;
    }
    if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) return trimmed;
      const cleanDate = trimmed.split('T')[0];
      const parts = cleanDate.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
      }
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const dateFormatted = formatDdMmYyyy(new Date());

  const getRtiRefNumber = (fileNumber?: string, seq: number | string = '1') => {
    const raw = fileNumber || '85';
    const digits = raw.match(/\d+/)?.[0] || '85';
    return `ಪತ್ರ ಸಂ: ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/${digits}/${seq}/2026-27`;
  };

  // Form Inputs
  const [rtiTransactionType, setRtiTransactionType] = useState<
    'info_reply' | 'acknowledgement' | 'transfer_6_3' | 'additional_fee' | 'rejection_8'
  >('info_reply');
  const [feeAmount, setFeeAmount] = useState('40');
  const [pageCount, setPageCount] = useState('20');
  const [transfereeOffice, setTransfereeOffice] = useState(
    'ಮುಖ್ಯ ಶಿಕ್ಷಕರು, ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ, ಹೊಸಮನೆ, ಭದ್ರಾವತಿ'
  );
  const [rejectionReason, setRejectionReason] = useState(
    'ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 8(1)(j) ರ ಅನ್ವಯ ಇದು ವೈಯಕ್ತಿಕ ವಿವರವಾಗಿದ್ದು, ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿ ಕಂಡುಬಂದಿರುವುದಿಲ್ಲ.'
  );

  const [refNumber, setRefNumber] = useState(
    getRtiRefNumber(activeFile?.fileNumber, '1')
  );
  const [applicantName, setApplicantName] = useState(
    activeFile?.rtiDetails?.applicantName || 'ಶ್ರೀಯುತ ಕೆ. ರಾಮಕೃಷ್ಣ ಭಟ್'
  );
  const [applicantAddress, setApplicantAddress] = useState(
    activeFile?.rtiDetails?.applicantAddress || 'ಹೊಸಮನೆ ಬಡಾವಣೆ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301'
  );
  const [applicationNo, setApplicationNo] = useState(
    activeFile?.rtiDetails?.applicationNumber || 'RTI/BEO/2026/APP-104'
  );
  const [applicationDate, setApplicationDate] = useState(
    activeFile?.rtiDetails?.applicationDate || '2026-08-20'
  );
  const [infoPoints, setInfoPoints] = useState(
    activeFile?.rtiDetails?.informationSought
      ? `1. ಕೋರಿದ ವಿಷಯ: ${activeFile.rtiDetails.informationSought}\n2. ಪರಿಶೀಲನೆ ನಂತರ ಈ ಕಛೇರಿಯಲ್ಲಿ ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣೀಕೃತ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಇದರೊಂದಿಗೆ ಲಗತ್ತಿಸಲಾಗಿದೆ.\n3. ಭದ್ರಾವತಿ ವಲಯದ ಎಲ್ಲಾ ನಿಯಮಾವಳಿಗಳ ಅನ್ವಯ ಪಾರದರ್ಶಕವಾಗಿ ಕ್ರಮ ವಹಿಸಲಾಗಿದೆ.`
      : '1. ಭದ್ರಾವತಿ ಶೈಕ್ಷಣಿಕ ವಲಯದಲ್ಲಿ ಕೋರಿದ ಮಾಹಿತಿಯನ್ನು ನಿಯಮಾನುಸಾರ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.\n2. ಈ ಕಛೇರಿಯಲ್ಲಿ ಲಭ್ಯವಿರುವ ದೃಢೀಕೃತ ದಾಖಲೆಗಳ ಒಟ್ಟು 4 ಪುಟಗಳ ಪ್ರತಿಯನ್ನು ಲಗತ್ತಿಸಲಾಗಿದೆ.\n3. ಉಳಿದಂತೆ ಯಾವುದೇ ಹೆಚ್ಚುವರಿ ಆಕ್ಷೇಪಣೆ ಇರುವುದಿಲ್ಲ.'
  );

  // Attached PDF or JPG documents
  const [attachments, setAttachments] = useState<DocumentAttachment[]>(
    activeFile?.rtiDetails?.uploadedDocs || activeFile?.attachments || []
  );

  // Generated letter state
  const [letterText, setLetterText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize when active file changes
  useEffect(() => {
    if (activeFile) {
      const d = activeFile.rtiDetails;
      if (d) {
        setApplicantName(d.applicantName || '');
        setApplicantAddress(d.applicantAddress || '');
        setApplicationNo(d.applicationNumber || '');
        setApplicationDate(d.applicationDate || today);
        setInfoPoints(
          `1. ಕೋರಿರುವ ಮಾಹಿತಿ: ${d.informationSought}\n2. ಕಛೇರಿ ಕಡತ ಪರಿಶೀಲಿಸಲಾಗಿದ್ದು, ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣೀಕೃತ ದಾಖಲೆ ಪ್ರತಿಗಳನ್ನು ಇದರೊಂದಿಗೆ ಲಗತ್ತಿಸಿ ಒದಗಿಸಲಾಗಿದೆ.\n3. ಶುಲ್ಕ: ₹10/- ಅರ್ಜಿ ಶುಲ್ಕ ಪಾವತಿಯಾಗಿದ್ದು, ಮಾಹಿತಿ ಒದಗಿಸಲಾಗಿದೆ.`
        );
        setAttachments(d.uploadedDocs || activeFile.attachments || []);
      }
    }
  }, [activeFile]);

  // Handle new PDF or JPG uploads directly in the letter studio
  const handleUploadNewDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File, idx: number) => {
      const reader = new FileReader();
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newAtt: DocumentAttachment = {
          id: `att-reply-${Date.now()}-${idx}`,
          fileName: file.name,
          fileSize: file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          fileType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
          pageCount: isPdf ? 1 : undefined,
          uploadedAt: today,
          description: isPdf ? 'ಮಾಹಿತಿಗೆ ಲಗತ್ತಿಸಲಾದ ಪಿಡಿಎಫ್ ದಾಖಲೆ (Enclosed PDF)' : 'ಮಾಹಿತಿಗೆ ಲಗತ್ತಿಸಲಾದ ಜೆಪಿಜಿ ಪ್ರತಿ (Enclosed JPG)',
          dataUrl,
        };
        setAttachments(prev => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveDoc = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Generate Letter Text
  const handleGenerateReply = async () => {
    try {
      setIsGenerating(true);

      const attachedListStr = attachments.length > 0 
        ? attachments.map((a, i) => `${i + 1}. ${a.fileName} (${a.fileType.includes('pdf') ? 'PDF ದಾಖಲೆ' : 'JPG/ಚಿತ್ರ ಪ್ರತಿ'} - ${a.fileSize})`).join('\n')
        : '1. ಈ ಕಛೇರಿಯ ಪ್ರಮಾಣೀಕೃತ ನಡಾವಳಿ ದಾಖಲೆ ಪ್ರತಿ.';

      const res = await fetch('/api/ai/draft-rti-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refNumber,
          applicantName,
          applicantAddress,
          applicationNo,
          applicationDate,
          fileNumber: activeFile?.fileNumber || 'BEO/ಮಾ.ಹ/2026/ಕಡತ-042',
          informationPoints: infoPoints,
          attachedDocumentsList: attachedListStr,
          rtiTransactionType,
          feeAmount,
          pageCount,
          transfereeOffice,
          rejectionReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.letterText) {
        setLetterText(data.letterText);
      } else {
        // High quality official template fallback
        setLetterText(getStandardOfficialKarnatakaBEOFormat(attachedListStr));
      }
    } catch (err) {
      console.error(err);
      const attachedListStr = attachments.length > 0 
        ? attachments.map((a, i) => `${i + 1}. ${a.fileName} (${a.fileType.includes('pdf') ? 'PDF ದಾಖಲೆ' : 'JPG/ಚಿತ್ರ ಪ್ರತಿ'} - ${a.fileSize})`).join('\n')
        : '1. ಈ ಕಛೇರಿಯ ಪ್ರಮಾಣೀಕೃತ ನಡಾವಳಿ ದಾಖಲೆ ಪ್ರತಿ.';
      setLetterText(getStandardOfficialKarnatakaBEOFormat(attachedListStr));
    } finally {
      setIsGenerating(false);
    }
  };

  // Standard Official Karnataka BEO RTI Reply Format for each Transaction Type
  const getStandardOfficialKarnatakaBEOFormat = (enclosures: string) => {
    if (rtiTransactionType === 'acknowledgement') {
      return `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

ಪ್ರಪತ್ರ-2: ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ ಸ್ವೀಕೃತಿ ರಶೀದಿ (Acknowledgement Receipt)
${refNumber}                                     ದಿನಾಂಕ: ${dateFormatted}

ಸ್ವೀಕೃತಿ ವಿವರಗಳು:
ಅರ್ಜಿದಾರರ ಹೆಸರು: ${applicantName}
ವಿಳಾಸ: ${applicantAddress}
ಅರ್ಜಿ ಸ್ವೀಕೃತಿ ದಿನಾಂಕ: ${applicationDate}
ಕಛೇರಿ ಅರ್ಜಿ ಸಂಖ್ಯೆ: ${applicationNo}
ಕಡತ ಸಂಖ್ಯೆ: ${activeFile?.fileNumber || 'ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/85/2026-27'}
ಸ್ವೀಕರಿಸಲಾದ ಅರ್ಜಿ ಶುಲ್ಕ: ₹10/- (ಕೋರ್ಟ್ ಫೀ ಸ್ಟಾಂಪ್ / ನಗದು ರಶೀದಿ)

ಕೋರಿರುವ ಮಾಹಿತಿ ವಿವರ:
"${activeFile?.rtiDetails?.informationSought || infoPoints}"

ಸೂಚನೆ:
1. ತಮ್ಮ ಮೇಲ್ಕಂಡ ಅರ್ಜಿಯನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದ್ದು, ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 7(1) ರನ್ವಯ 30 ದಿನಗಳ ಕಾಲಮಿತಿಯೊಳಗೆ ಸೂಕ್ತ ಮಾಹಿತಿ ಅಥವಾ ವಿಲೇವಾರಿ ಮಾಡಲಾಗುವುದು.
2. ಈ ಕಛೇರಿಯ ಮುಂದಿನ ಎಲ್ಲಾ ಪತ್ರವ್ಯವಹಾರಗಳಲ್ಲಿ ಮೇಲ್ಕಂಡ ಕ್ರ.ಸಂಖ್ಯೆ ಹಾಗೂ ಅರ್ಜಿ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸುವುದು.

(ಸುರೇಶ್ ಕೆ.ಸಿ.)
ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ`;
    }

    if (rtiTransactionType === 'transfer_6_3') {
      return `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

${refNumber}                                     ದಿನಾಂಕ: ${dateFormatted}

ರವಾನೆಗೆ (To):
${transfereeOffice}

ಮಾನ್ಯರೇ,
ವಿಷಯ: ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 6(3) ರನ್ವಯ ಅರ್ಜಿಯನ್ನು ವರ್ಗಾಯಿಸುವ ಬಗ್ಗೆ.
ಉಲ್ಲೇಖ: 1. ಶ್ರೀ/ಶ್ರೀಮತಿ ${applicantName}, ರವರ ಅರ್ಜಿ ಸಂಖ್ಯೆ: ${applicationNo}, ದಿನಾಂಕ: ${applicationDate}.
       2. ಈ ಕಛೇರಿಯ ಕಡತ ಸಂಖ್ಯೆ: ${activeFile?.fileNumber || 'ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/85/2026-27'}.

ಮೇಲ್ಕಂಡ ವಿಷಯ ಮತ್ತು ಉಲ್ಲೇಖಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ, ಅರ್ಜಿದಾರರಾದ ${applicantName}, ರವರು ಈ ಕಛೇರಿಗೆ ಸಲ್ಲಿಸಿರುವ ಅರ್ಜಿಯ ಕೋರಿಕೆಯು ತಮ್ಮ ಕಛೇರಿ/ಶಾಲೆಯ ಕಾರ್ಯವ್ಯಾಪ್ತಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತದೆ. 

ಆದ್ದರಿಂದ ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 6(3) ರನ್ವಯ ಸದರಿ ಮೂಲ ಅರ್ಜಿಯ ಪ್ರತಿಯನ್ನು ಸೂಕ್ತ ಮಾಹಿತಿಯನ್ನು ನೇರವಾಗಿ ಅರ್ಜಿದಾರರಿಗೆ ನಿಗದಿತ 30 ದಿನಗಳ ಕಾಲಮಿತಿಯೊಳಗೆ ಒದಗಿಸಲು ಕೋರಿ ಈ ಮೂಲಕ ತಮ್ಮ ಕಛೇರಿಗೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ.

(ಸುರೇಶ್ ಕೆ.ಸಿ.)
ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ

ಪ್ರತಿ ರವಾನೆ:
1. ${applicantName}, ${applicantAddress} - ತಮ್ಮ ಅರ್ಜಿಯನ್ನು ಕಲಂ 6(3) ರಡಿ ಮೇಲ್ಕಂಡ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ವರ್ಗಾಯಿಸಲಾಗಿದ್ದು, ಮುಂದಿನ ಮಾಹಿತಿಗಾಗಿ ಅವರನ್ನು ಸಂಪರ್ಕಿಸುವುದು.
2. ಕಛೇರಿ ಕಡತ ಪ್ರತಿ.`;
    }

    if (rtiTransactionType === 'additional_fee') {
      return `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

${refNumber}                                     ದಿನಾಂಕ: ${dateFormatted}

ಗೆ:
${applicantName},
${applicantAddress}.

ವಿಷಯ: ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 7(1) ಮತ್ತು 7(3)(a) ರನ್ವಯ ಹೆಚ್ಚುವರಿ ದಾಖಲೆಗಳ ಜೆರಾಕ್ಸ್ ವೆಚ್ಚ ಶುಲ್ಕ ಪಾವತಿಸುವ ಬಗ್ಗೆ.
ಉಲ್ಲೇಖ: ತಮ್ಮ ಅರ್ಜಿ ಸಂಖ್ಯೆ: ${applicationNo}, ದಿನಾಂಕ: ${applicationDate}.

ಮಾನ್ಯರೇ,
ತಾವು ಕೋರಿರುವ ಮಾಹಿತಿಯ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದ್ದು, ಈ ಕಛೇರಿಯಲ್ಲಿ ಒಟ್ಟು ${pageCount} ಪುಟಗಳ ಪ್ರಮಾಣೀಕೃತ ದಾಖಲೆಗಳು ಲಭ್ಯವಿರುತ್ತವೆ.

ಕರ್ನಾಟಕ ಮಾಹಿತಿ ಹಕ್ಕು ನಿಯಮಾವಳಿಗಳ ಪ್ರಕಾರ ಪ್ರತಿ ಪುಟಕ್ಕೆ ₹2/- ರಂತೆ:
• ಒಟ್ಟು ಪುಟಗಳ ಸಂಖ್ಯೆ: ${pageCount} ಪುಟಗಳು
• ದರ: ಪ್ರತಿ ಪುಟಕ್ಕೆ ₹2/- ರಂತೆ
• ಒಟ್ಟು ಪಾವತಿಸಬೇಕಾದ ಶುಲ್ಕ ಮೊತ್ತ: ₹${feeAmount}/- (ರೂಪಾಯಿ ನಲವತ್ತು ಮಾತ್ರ)

ಆದ್ದರಿಂದ ಸದರಿ ₹${feeAmount}/- ಮೊತ್ತವನ್ನು ಕೆ.ಜಿ.ಟಿ-7 ಚಲನ್ ಮೂಲಕ "0202-ಶಿಕ್ಷಣ" ಲೆಕ್ಕಶೀರ್ಷಿಕೆಗೆ ಜಮೆ ಮಾಡಿ ಅಥವಾ ಕಛೇರಿಯಲ್ಲಿ ಡಿ.ಡಿ/ನಗದು ರಶೀದಿ ಮೂಲಕ ಪಾವತಿಸಿ ರಸೀದಿಯನ್ನು ಹಾಜರುಪಡಿಸಿ ದಾಖಲೆಗಳನ್ನು ಪಡೆದುಕೊಳ್ಳಲು ಕೋರಲಾಗಿದೆ.

(ಸುರೇಶ್ ಕೆ.ಸಿ.)
ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ`;
    }

    if (rtiTransactionType === 'rejection_8') {
      return `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

${refNumber}                                     ದಿನಾಂಕ: ${dateFormatted}

ಗೆ:
${applicantName},
${applicantAddress}.

ವಿಷಯ: ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ 2005 ರ ಕಲಂ 7(1) ಜೊತೆಗೆ ಕಲಂ 8/9 ರನ್ವಯ ಮಾಹಿತಿ ನಿರಾಕರಣೆ / ವಿನಾಯಿತಿ ಕುರಿತು.
ಉಲ್ಲೇಖ: ತಮ್ಮ ಅರ್ಜಿ ಸಂಖ್ಯೆ: ${applicationNo}, ದಿನಾಂಕ: ${applicationDate}.

ಮಾನ್ಯರೇ,
ತಾವು ಕೋರಿದ ಮಾಹಿತಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದ್ದು, ಈ ಕೆಳಕಂಡ ಕಾನೂನು ಕಾರಣಗಳ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಸದರಿ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಲು ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮದಡಿ ವಿನಾಯಿತಿ ಇರುವುದರಿಂದ ನಿರಾಕರಿಸಲಾಗಿದೆ:

ನಿರಾಕರಣೆಯ ಕಾನೂನುಬದ್ಧ ಕಾರಣಗಳು:
${rejectionReason}

ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ:
ಸದರಿ ನಿರಾಕರಣೆಯ ವಿರುದ್ಧ ತಮಗೆ ಆಕ್ಷೇಪಣೆ ಇದ್ದಲ್ಲಿ, ಕಲಂ 19(1) ರಡಿ 30 ದಿನಗಳೊಳಗೆ ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ ಇವರಿಗೆ ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಬಹುದಾಗಿದೆ.

(ಸುರೇಶ್ ಕೆ.ಸಿ.)
ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ`;
    }

    // Default info_reply
    return `ಕರ್ನಾಟಕ ಸರ್ಕಾರ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ, ಭದ್ರಾವತಿ
ಬಿ.ಹೆಚ್. ರಸ್ತೆ, ಹಳೇನಗರ, ಭದ್ರಾವತಿ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - 577301

${refNumber}                                     ದಿನಾಂಕ: ${dateFormatted}

ಗೆ:
${applicantName},
${applicantAddress}.

ವಿಷಯ: ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ-2005 ರ ಕಲಂ 6(1) ರಡಿಯಲ್ಲಿ ಕೋರಿರುವ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸುವ ಬಗ್ಗೆ.
ಉಲ್ಲೇಖ: 1. ತಮ್ಮ ಕಛೇರಿ ಸ್ವೀಕೃತಿ ಅರ್ಜಿ ಸಂಖ್ಯೆ: ${applicationNo}, ದಿನಾಂಕ: ${applicationDate}.
        2. ಈ ಕಛೇರಿಯ ಕಡತ ಸಂಖ್ಯೆ: ${activeFile?.fileNumber || 'ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/85/2026-27'}.

ಮಾನ್ಯರೇ,
ಮೇಲ್ಕಂಡ ವಿಷಯ ಹಾಗೂ ಉಲ್ಲೇಖಗಳಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ, ತಾವು ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ-2005 ರ ಅನ್ವಯ ಈ ಕಛೇರಿಗೆ ಸಲ್ಲಿಸಿದ್ದ ಅರ್ಜಿಯಲ್ಲಿ ಕೋರಲಾದ ಅಂಶಗಳನ್ನು ಕೂಲಂಕಷವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದ್ದು, ಕಛೇರಿಯಲ್ಲಿ ಲಭ್ಯವಿರುವ ಮಾಹಿತಿಯನ್ನು ಈ ಕೆಳಕಂಡಂತೆ ಒದಗಿಸಲಾಗಿದೆ:

${infoPoints}

ಲಗತ್ತಿಸಲಾದ ದಾಖಲೆಗಳು (Enclosed Documents):
${enclosures}

ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ (First Appellate Authority):
ಮೇಲ್ಕಂಡ ಮಾಹಿತಿಯಿಂದ ತಾವು ತೃಪ್ತರಾಗದಿದ್ದಲ್ಲಿ ಅಥವಾ ಆಕ್ಷೇಪಣೆಗಳಿದ್ದಲ್ಲಿ, ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ-2005 ರ ಕಲಂ 19(1) ರ ಪ್ರಕಾರ ಈ ಪತ್ರ ತಲುಪಿದ 30 (ಮೂವತ್ತು) ದಿನಗಳ ಕಾಲಮಿತಿಯೊಳಗೆ ಈ ಕೆಳಕಂಡ ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ನಿಯಮಾನುಸಾರ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಬಹುದಾಗಿದೆ:

"ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ,
ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ, ಶಿವಮೊಗ್ಗ - 577201"

ತಮ್ಮ ವಿಶ್ವಾಸಿ,

(ಸುರೇಶ್ ಕೆ.ಸಿ.)
ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹಾಗೂ
ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು, ಭದ್ರಾವತಿ
ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ

ಪ್ರತಿ ರವಾನೆ:
1. ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ ಹಾಗೂ ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ - ಗೌರವಪೂರ್ವಕ ಮಾಹಿತಿಗಾಗಿ.
2. ಕಛೇರಿ ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ ಸಂಖ್ಯೆ: ${activeFile?.fileNumber || 'ಆ2/ಮಾ.ಹ.ಅ.ನಿ.ಮ/85/2026-27'}.
3. ಜಾವಾಕ್ ರಿಜಿಸ್ಟರ್ / ಕಛೇರಿ ಪ್ರತಿ.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Dispatch to Outward Dak and update RTI status
  const handleDispatchToOutwardDak = async () => {
    if (!letterText) return;
    try {
      setIsSaving(true);
      const outRef = refNumber;
      const fileNum = activeFile?.fileNumber || `BEO/ಮಾ.ಹ/2026/ಕಡತ-${Math.floor(100 + Math.random() * 900)}`;

      await onSaveToRegistry({
        direction: 'outward',
        referenceNumber: outRef,
        fileNumber: fileNum,
        subject: `ಮಾಹಿತಿ ಹಕ್ಕು ಉತ್ತರ: ${applicantName} ರವರಿಗೆ ಮಾಹಿತಿ ಒದಗಿಸುವ ಬಗ್ಗೆ (${applicationNo})`,
        category: 'Public Grievance & RTI',
        section: 'Legal & Grievances',
        priority: 'Urgent',
        status: 'Dispatched',
        confidentiality: 'Public / Open',
        senderName: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ',
        senderDesignation: 'Public Information Officer & BEO',
        senderDepartment: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ',
        recipientName: applicantName,
        recipientDesignation: 'ಅರ್ಜಿದಾರರು (RTI Applicant)',
        recipientDepartment: applicantAddress,
        dateReceivedOrIssued: today,
        dueDate: today,
        assignedOfficer: 'ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ (BEO, ಭದ್ರಾವತಿ)',
        bodyText: letterText,
        attachments,
        endorsements: [
          'ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ ಹಾಗೂ ಉಪನಿರ್ದೇಶಕರು (ಆಡಳಿತ), ಶಾಲಾ ಶಿಕ್ಷಣ ಇಲಾಖೆ, ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ',
          `ಕಛೇರಿ ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ ಸಂಖ್ಯೆ: ${fileNum}`,
          'ಜಾವಾಕ್ ರಿಜಿಸ್ಟರ್ (BEO Outward Dak)',
        ],
        tags: ['#RTI2005', '#ಮಾಹಿತಿಹಕ್ಕು', '#BhadravathiBEO', '#PublicInformation'],
      });

      // Update RTI docket status if linked
      if (activeFile && onUpdateRtiFileStatus) {
        await onUpdateRtiFileStatus(activeFile.id, 'ಉತ್ತರ ರವಾನಿಸಲಾಗಿದೆ', outRef);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="rti-reply-studio-container" className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-6 h-6 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900">
                ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿಕೃತ ಉತ್ತರ ಪತ್ರ ತಯಾರಕ (Official B.E.O RTI Reply Letter Studio)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                ಕಲಂ 6(1) & 7(1)
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ • ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿಗಳಿಗೆ ಕಾನೂನುಬದ್ಧ ಉತ್ತರ ಪತ್ರ ಸೃಜನೆ, PDF/JPG ದಾಖಲೆ ಲಗತ್ತಿಸುವಿಕೆ ಹಾಗೂ ಜಾವಾಕ್ ರಿಜಿಸ್ಟರ್ ರವಾನೆ.
            </p>
          </div>
        </div>

        {onBackToFiles && (
          <button
            type="button"
            onClick={onBackToFiles}
            className="px-3.5 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors border border-stone-200"
          >
            ← ಕಡತಗಳ ಪಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: RTI File Parameters & Upload PDF/JPG */}
        <div className="lg:col-span-5 space-y-4 no-print">
          
          {/* Active RTI File Selector */}
          {rtiDocketList.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between">
                <span>ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿ ಹಕ್ಕು ಕಡತ (Select RTI Docket)</span>
                <span className="text-[11px] font-normal text-amber-700 font-mono">
                  {rtiDocketList.length} ಕಡತಗಳು ಲಭ್ಯ
                </span>
              </label>
              <select
                value={activeFile?.id || ''}
                onChange={e => {
                  const f = rtiDocketList.find(d => d.id === e.target.value);
                  if (f) setActiveFile(f);
                }}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-900"
              >
                {rtiDocketList.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.fileNumber} - {f.rtiDetails?.applicantName || f.subject.substring(0, 35)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Letter Inputs Form */}
          <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs space-y-4 text-xs">

            {/* RTI Transaction Type Selector */}
            <div className="space-y-1.5 pb-2 border-b border-stone-200">
              <label className="block font-bold text-stone-800 text-xs">
                ಮಾಹಿತಿ ಹಕ್ಕು ಪತ್ರ ವ್ಯವಹಾರದ ಪ್ರಕಾರ (Select RTI Letter Transaction Type) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setRtiTransactionType('info_reply');
                    setRefNumber(getRtiRefNumber(activeFile?.fileNumber, '1'));
                  }}
                  className={`p-2 rounded-lg text-left border text-[11px] font-semibold transition-all ${
                    rtiTransactionType === 'info_reply'
                      ? 'bg-amber-100 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="block font-bold">1. ಮಾಹಿತಿ ಉತ್ತರ</span>
                  <span className="text-[9px] text-stone-500 font-normal">ಕಲಂ 7(1) ಉತ್ತರ ಪತ್ರ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRtiTransactionType('acknowledgement');
                    setRefNumber(getRtiRefNumber(activeFile?.fileNumber, '2'));
                  }}
                  className={`p-2 rounded-lg text-left border text-[11px] font-semibold transition-all ${
                    rtiTransactionType === 'acknowledgement'
                      ? 'bg-amber-100 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="block font-bold">2. ಅರ್ಜಿ ಸ್ವೀಕೃತಿ</span>
                  <span className="text-[9px] text-stone-500 font-normal">ಪ್ರಪತ್ರ-2 ರಶೀದಿ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRtiTransactionType('transfer_6_3');
                    setRefNumber(getRtiRefNumber(activeFile?.fileNumber, '3'));
                  }}
                  className={`p-2 rounded-lg text-left border text-[11px] font-semibold transition-all ${
                    rtiTransactionType === 'transfer_6_3'
                      ? 'bg-amber-100 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="block font-bold">3. ವರ್ಗಾವಣೆ ಪತ್ರ</span>
                  <span className="text-[9px] text-stone-500 font-normal">ಕಲಂ 6(3) ಶಾಲೆಗೆ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRtiTransactionType('additional_fee');
                    setRefNumber(getRtiRefNumber(activeFile?.fileNumber, '4'));
                  }}
                  className={`p-2 rounded-lg text-left border text-[11px] font-semibold transition-all ${
                    rtiTransactionType === 'additional_fee'
                      ? 'bg-amber-100 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="block font-bold">4. ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ</span>
                  <span className="text-[9px] text-stone-500 font-normal">₹2/ಪುಟ ನೋಟಿಸ್</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRtiTransactionType('rejection_8');
                    setRefNumber(getRtiRefNumber(activeFile?.fileNumber, '5'));
                  }}
                  className={`p-2 rounded-lg text-left border text-[11px] font-semibold transition-all ${
                    rtiTransactionType === 'rejection_8'
                      ? 'bg-amber-100 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="block font-bold">5. ನಿರಾಕರಣೆ ಆದೇಶ</span>
                  <span className="text-[9px] text-stone-500 font-normal">ಕಲಂ 8(1) ವಿನಾಯಿತಿ</span>
                </button>
              </div>
            </div>

            {/* Dynamic transaction specific fields */}
            {rtiTransactionType === 'transfer_6_3' && (
              <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200">
                <label className="block font-semibold text-stone-800 mb-1">
                  ವರ್ಗಾಯಿಸಲಾಗುವ ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರ / ಶಾಲೆ (Transferee Office / School) *
                </label>
                <input
                  type="text"
                  value={transfereeOffice}
                  onChange={e => setTransfereeOffice(e.target.value)}
                  placeholder="ಉದಾ: ಮುಖ್ಯ ಶಿಕ್ಷಕರು, ಸರ್ಕಾರಿ ಪ್ರೌಢಶಾಲೆ, ಹೊಸಮನೆ, ಭದ್ರಾವತಿ"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-medium text-xs"
                />
              </div>
            )}

            {rtiTransactionType === 'additional_fee' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/70 rounded-lg border border-amber-200">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    ದಾಖಲೆಗಳ ಪುಟಗಳ ಸಂಖ್ಯೆ (Pages)
                  </label>
                  <input
                    type="number"
                    value={pageCount}
                    onChange={e => {
                      const count = e.target.value;
                      setPageCount(count);
                      setFeeAmount(String(Number(count || 0) * 2));
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-mono text-stone-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    ಒಟ್ಟು ಶುಲ್ಕ ಮೊತ್ತ (₹2/ಪುಟಕ್ಕೆ)
                  </label>
                  <input
                    type="number"
                    value={feeAmount}
                    onChange={e => setFeeAmount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-mono font-bold text-amber-900 text-xs"
                  />
                </div>
              </div>
            )}

            {rtiTransactionType === 'rejection_8' && (
              <div className="p-3 bg-rose-50/70 rounded-lg border border-rose-200">
                <label className="block font-semibold text-rose-900 mb-1">
                  ಕಾನೂನುಬದ್ಧ ನಿರಾಕರಣೆಯ ಕಾರಣ (Section 8/9 Grounds)
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-stone-900 text-xs"
                />
              </div>
            )}
            
            {/* Reference Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  ಬಿ.ಇ.ಒ ಜಾವಾಕ್ ಸಂಖ್ಯೆ (Outward Dispatch Ref) *
                </label>
                <input
                  type="text"
                  value={refNumber}
                  onChange={e => setRefNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono font-bold text-stone-900 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  ಅರ್ಜಿ ಸಂಖ್ಯೆ (RTI Application No)
                </label>
                <input
                  type="text"
                  value={applicationNo}
                  onChange={e => setApplicationNo(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono text-stone-900 text-xs"
                />
              </div>
            </div>

            {/* Applicant Name & Address */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                ಅರ್ಜಿದಾರರ ಹೆಸರು (Applicant Name) *
              </label>
              <input
                type="text"
                value={applicantName}
                onChange={e => setApplicantName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                ಅರ್ಜಿದಾರರ ಅಂಚೆ ವಿಳಾಸ (Applicant Address)
              </label>
              <textarea
                rows={2}
                value={applicantAddress}
                onChange={e => setApplicantAddress(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 text-xs"
              />
            </div>

            {/* Information Response Points */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                ಒದಗಿಸಲಾದ ಮಾಹಿತಿಯ ಅಂಶಗಳು (Information Points) *
              </label>
              <textarea
                rows={4}
                value={infoPoints}
                onChange={e => setInfoPoints(e.target.value)}
                placeholder="1. ಮಾಹಿತಿ ವಿವರ 1...&#10;2. ಕಛೇರಿ ನಡಾವಳಿ...&#10;3. ನಿಯಮಾನುಸಾರ ಕ್ರಮ..."
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 text-xs font-sans leading-relaxed focus:bg-white focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* UPLOAD PDF OR JPG SECTION (Key User Requirement) */}
            <div className="p-4 bg-amber-50/75 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-amber-700" />
                    <span>ಲಗತ್ತಿಸಲಾದ PDF ಅಥವಾ JPG ದಾಖಲೆಗಳು</span>
                  </span>
                  <span className="text-[11px] text-amber-800 block">
                    ಉತ್ತರ ಪತ್ರದೊಂದಿಗೆ ಲಗತ್ತಿಸಬೇಕಾದ ಪ್ರಮಾಣೀಕೃತ PDF ಅಥವಾ JPG ಫೈಲ್‌ಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.
                  </span>
                </div>
                <label className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>PDF / JPG ಅಪ್‌ಲೋಡ್</span>
                  <input
                    type="file"
                    multiple
                    accept="application/pdf,image/jpeg,image/png,image/jpg"
                    onChange={handleUploadNewDoc}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Attachments list */}
              {attachments.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {attachments.map(att => {
                    const isPdf = att.fileType === 'application/pdf' || att.fileName.toLowerCase().endsWith('.pdf');
                    return (
                      <div
                        key={att.id}
                        className="p-2.5 bg-white rounded-lg border border-stone-200 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isPdf ? (
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                              PDF
                            </div>
                          ) : att.dataUrl ? (
                            <img
                              src={att.dataUrl}
                              alt={att.fileName}
                              className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                              JPG
                            </div>
                          )}
                          <div className="truncate">
                            <span className="text-xs font-bold text-stone-900 block truncate">
                              {att.fileName}
                            </span>
                            <span className="text-[10px] text-stone-500">
                              {att.fileSize} • {isPdf ? 'ಪಿಡಿಎಫ್ ಕಡತ' : 'ಜೆಪಿಜಿ ದಾಖಲೆ ಪ್ರತಿ'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(att.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                          title="ತೆಗೆದುಹಾಕಿ (Remove)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-white/80 rounded-lg border border-dashed border-amber-300 text-center text-xs text-stone-500">
                  ಯಾವುದೇ PDF ಅಥವಾ JPG ದಾಖಲೆಗಳು ಲಗತ್ತಿಸಲ್ಪಟ್ಟಿಲ್ಲ. ಮೇಲಿನ ಬಟನ್ ಒತ್ತಿ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerateReply}
              disabled={isGenerating || !applicantName.trim()}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-amber-400 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>
                {isGenerating 
                  ? 'ಮಾಹಿತಿ ಹಕ್ಕು ಉತ್ತರ ಪತ್ರವನ್ನು ತಯಾರಿಸಲಾಗುತ್ತಿದೆ...' 
                  : 'ಮಾಹಿತಿಗೆ ಅಧಿಕೃತ ಉತ್ತರ ಪತ್ರ ತಯಾರಿಸು (Generate Official RTI Letter)'}
              </span>
            </button>

          </div>
        </div>

        {/* Right Column: Live Karnataka BEO Letterhead & Printable Document */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Action Bar */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div>
              <span className="text-xs font-bold text-stone-900 block">
                ಅಧಿಕೃತ ಬಿ.ಇ.ಒ ಪತ್ರ ದಸ್ತಾವೇಜು (Official B.E.O Letterhead)
              </span>
              <span className="text-[11px] text-stone-500">
                {letterText ? 'ಪತ್ರ ಸಿದ್ಧವಾಗಿದೆ. ಸಂಪಾದಿಸಬಹುದು, ಪ್ರಿಂಟ್/PDF ಪಡೆಯಬಹುದು ಹಾಗೂ ಜಾವಾಕ್ ಮಾಡಬಹುದು.' : 'ಎಡಭಾಗದಲ್ಲಿ ವಿವರ ನಮೂದಿಸಿ "ಪತ್ರ ತಯಾರಿಸು" ಕ್ಲಿಕ್ ಮಾಡಿ.'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {letterText && (
                <>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'ಕಾಪಿ ಆಗಿದೆ' : 'ಕಾಪಿ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    title="ಅಧಿಕೃತ ಲೆಟರ್‌ಹೆಡ್‌ನಲ್ಲಿ ಪ್ರಿಂಟ್ ಅಥವಾ PDF ಸೇವ್ ಮಾಡಿ"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PDF / ಪ್ರಿಂಟ್ (Print/PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDispatchToOutwardDak}
                    disabled={isSaving}
                    className="px-3.5 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{saveSuccess ? 'ರವಾನಿಸಲಾಗಿದೆ!' : isSaving ? 'ಸೇವ್ ಆಗುತ್ತಿದೆ...' : 'ಜಾವಾಕ್ ಮಾಡಿ (Dispatch)'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Printable Letterhead Document */}
          <div 
            id="printable-letter-document" 
            className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 sm:p-10 space-y-4"
          >
            {letterText ? (
              <div className="space-y-3">
                <div className="text-[11px] text-stone-400 italic no-print flex items-center justify-between">
                  <span>* ಅಧಿಕೃತ ಪತ್ರದ ಪಠ್ಯವನ್ನು ಕೆಳಗೆ ನೇರವಾಗಿ ತಿದ್ದಬಹುದು (Directly editable):</span>
                  <span className="text-amber-700 font-medium">ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಛೇರಿ ಭದ್ರಾವತಿ</span>
                </div>

                <textarea
                  rows={24}
                  value={letterText}
                  onChange={e => setLetterText(e.target.value)}
                  className="w-full p-5 bg-stone-50/40 rounded-xl border border-stone-200 font-serif text-xs sm:text-sm text-stone-900 leading-relaxed focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 selection:bg-amber-100"
                />

                {/* Attached docs preview pills */}
                {attachments.length > 0 && (
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 no-print">
                    <span className="text-xs font-bold text-stone-700 block mb-2">
                      ಈ ಪತ್ರದೊಂದಿಗೆ ಲಗತ್ತಿಸಲಾಗಿರುವ ದಾಖಲೆಗಳು ({attachments.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map(att => (
                        <span
                          key={att.id}
                          className="px-2.5 py-1 bg-white border border-stone-300 rounded-md text-[11px] font-medium text-stone-800 flex items-center gap-1.5 shadow-2xs"
                        >
                          {att.fileType.includes('pdf') ? (
                            <FileText className="w-3 h-3 text-rose-600" />
                          ) : (
                            <ImageIcon className="w-3 h-3 text-emerald-600" />
                          )}
                          <span>{att.fileName}</span>
                          <span className="text-[9px] text-stone-400 font-mono">({att.fileSize})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center space-y-4 bg-stone-50/60 rounded-xl border border-dashed border-stone-300">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center shadow-xs">
                  <Sparkles className="w-7 h-7 text-amber-700" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-stone-900">
                    ಮಾಹಿತಿ ಹಕ್ಕು ಉತ್ತರ ಪತ್ರ ಪೂರ್ವವೀಕ್ಷಣೆ (RTI Letter Workspace)
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    ಎಡಭಾಗದಲ್ಲಿ ಅರ್ಜಿದಾರರ ವಿವರಗಳು, ಒದಗಿಸಬೇಕಾದ ಮಾಹಿತಿ ಹಾಗೂ ಲಗತ್ತಿಸುವ PDF/JPG ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ <strong>'ಮಾಹಿತಿಗೆ ಅಧಿಕೃತ ಉತ್ತರ ಪತ್ರ ತಯಾರಿಸು'</strong> ಬಟನ್ ಒತ್ತಿ.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateReply}
                  className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs"
                >
                  ಈಗಲೇ ಉತ್ತರ ಪತ್ರ ತಯಾರಿಸಿ (Generate Letterhead Now)
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
