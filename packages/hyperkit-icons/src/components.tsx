/**
 * Pre-built shorthand icon components.
 * Each is a SolidJS component bound to a specific IconDef.
 *
 * @example
 * import { MergeIcon, SplitIcon } from '@ybouhjira/hyperkit-icons';
 * <MergeIcon size="lg" style="glossy" />
 */
import { makeIcon } from './makeIcon';
import {
  MergeIconDef,
  SplitIconDef,
  RotateIconDef,
  CropIconDef,
  DeletePagesIconDef,
  ReorderIconDef,
  PagesIconDef,
  FlattenIconDef,
  BatchIconDef,
  ScanIconDef,
} from './icons/transform';
import {
  PdfToWordIconDef,
  PdfToExcelIconDef,
  PdfToImageIconDef,
  WordToPdfIconDef,
  ConvertIconDef,
  ExcelToPdfIconDef,
  PptToPdfIconDef,
  HtmlToPdfIconDef,
  ExtractImagesIconDef,
  PdfToPptIconDef,
  PdfToPdfAIconDef,
  ExportIconDef,
} from './icons/convert';
import {
  AnnotateIconDef,
  HighlightIconDef,
  SignIconDef,
  WatermarkIconDef,
  PageNumbersIconDef,
  EditPdfIconDef,
} from './icons/annotate';
import {
  PasswordProtectIconDef,
  UnlockIconDef,
  RedactIconDef,
  MetadataIconDef,
} from './icons/security';
import {
  CompressIconDef,
  OcrIconDef,
  RepairIconDef,
  CompareIconDef,
} from './icons/optimize';
import {
  AiSummarizeIconDef,
  AiChatIconDef,
  AiFillFormsIconDef,
  AiTranslateIconDef,
} from './icons/ai';

// Transform
export const MergeIcon = makeIcon(MergeIconDef);
export const SplitIcon = makeIcon(SplitIconDef);
export const RotateIcon = makeIcon(RotateIconDef);
export const CropIcon = makeIcon(CropIconDef);
export const DeletePagesIcon = makeIcon(DeletePagesIconDef);
export const ReorderIcon = makeIcon(ReorderIconDef);
export const PagesIcon = makeIcon(PagesIconDef);
export const FlattenIcon = makeIcon(FlattenIconDef);
export const BatchIcon = makeIcon(BatchIconDef);
export const ScanIcon = makeIcon(ScanIconDef);

// Convert
export const PdfToWordIcon = makeIcon(PdfToWordIconDef);
export const PdfToExcelIcon = makeIcon(PdfToExcelIconDef);
export const PdfToImageIcon = makeIcon(PdfToImageIconDef);
export const WordToPdfIcon = makeIcon(WordToPdfIconDef);
export const ConvertIcon = makeIcon(ConvertIconDef);
export const ExcelToPdfIcon = makeIcon(ExcelToPdfIconDef);
export const PptToPdfIcon = makeIcon(PptToPdfIconDef);
export const HtmlToPdfIcon = makeIcon(HtmlToPdfIconDef);
export const ExtractImagesIcon = makeIcon(ExtractImagesIconDef);
export const PdfToPptIcon = makeIcon(PdfToPptIconDef);
export const PdfToPdfAIcon = makeIcon(PdfToPdfAIconDef);
export const ExportIcon = makeIcon(ExportIconDef);

// Annotate
export const AnnotateIcon = makeIcon(AnnotateIconDef);
export const HighlightIcon = makeIcon(HighlightIconDef);
export const SignIcon = makeIcon(SignIconDef);
export const WatermarkIcon = makeIcon(WatermarkIconDef);
export const PageNumbersIcon = makeIcon(PageNumbersIconDef);
export const EditPdfIcon = makeIcon(EditPdfIconDef);

// Security
export const PasswordProtectIcon = makeIcon(PasswordProtectIconDef);
export const UnlockIcon = makeIcon(UnlockIconDef);
export const RedactIcon = makeIcon(RedactIconDef);
export const MetadataIcon = makeIcon(MetadataIconDef);

// Optimize
export const CompressIcon = makeIcon(CompressIconDef);
export const OcrIcon = makeIcon(OcrIconDef);
export const RepairIcon = makeIcon(RepairIconDef);
export const CompareIcon = makeIcon(CompareIconDef);

// AI
export const AiSummarizeIcon = makeIcon(AiSummarizeIconDef);
export const AiChatIcon = makeIcon(AiChatIconDef);
export const AiFillFormsIcon = makeIcon(AiFillFormsIconDef);
export const AiTranslateIcon = makeIcon(AiTranslateIconDef);
