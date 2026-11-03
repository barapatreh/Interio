import fs from 'fs';
import path from 'path';

export function saveBase64File(dataUrl: string, prefix: string = 'file'): string {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return dataUrl || '';
  }

  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return dataUrl;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = 'png';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('pdf')) ext = 'pdf';
    else if (mimeType.includes('word') || mimeType.includes('doc')) ext = 'docx';

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${fileName}`;
  } catch (err) {
    console.error('Error saving base64 file to disk:', err);
    return dataUrl;
  }
}
