import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  const data = await request.formData();
  const file = data.get('file');
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
  }
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const filename = Date.now() + '-' + file.name;
  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);

  return new Response(JSON.stringify({ url: `/uploads/${filename}` }), { status: 200 });
}
