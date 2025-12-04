import { readContents, writeContents } from '../../../lib/storage';

export async function GET() {
  try {
    const contents = await readContents();
    return new Response(JSON.stringify(contents), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch contents' }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const contents = await readContents();
    const newContent = { ...body, _id: Date.now().toString(), createdAt: new Date() };
    contents.push(newContent);
    await writeContents(contents);
    return new Response(JSON.stringify(newContent), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create content' }), { status: 500 });
  }
}
