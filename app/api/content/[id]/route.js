import { readContents, writeContents } from '../../../../lib/storage';

export async function GET(request, { params }) {
  try {
    const contents = await readContents();
    const content = contents.find(c => c._id === params.id);
    if (!content) {
      return new Response(JSON.stringify({ error: 'Content not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(content), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch content' }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const contents = await readContents();
    const index = contents.findIndex(c => c._id === params.id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Content not found' }), { status: 404 });
    }
    contents[index] = { ...contents[index], ...body };
    await writeContents(contents);
    return new Response(JSON.stringify(contents[index]), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update content' }), { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const contents = await readContents();
    const index = contents.findIndex(c => c._id === params.id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Content not found' }), { status: 404 });
    }
    contents.splice(index, 1);
    await writeContents(contents);
    return new Response(JSON.stringify({ message: 'Content deleted' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete content' }), { status: 500 });
  }
}
