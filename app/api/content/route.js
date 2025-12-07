import supabase from '../../../lib/supabase';
import { readContents, writeContents } from '../../../lib/storage';
import { query as dbQuery } from '../../../lib/db'

export async function GET() {
  try {
    console.log('GET /api/content called');
    console.log('Environment check:', {
      hasSupabase: !!supabase,
      hasDbQuery: !!dbQuery,
      hasSupabaseDbUrl: !!process.env.SUPABASE_DB_URL
    });

    // If Supabase is configured, try it first (fastest)
    if (supabase) {
      try {
        console.log('Attempting to fetch contents from Supabase...');

        // Try different possible table names
        const tableNames = ['contents', 'Contents', 'content', 'Content'];
        let data = null;
        let error = null;

        for (const tableName of tableNames) {
          console.log('Trying table:', tableName);
          const result = await supabase
            .from(tableName)
            .select('*')
            .limit(100);

          if (!result.error && result.data && result.data.length > 0) {
            console.log('Found data in table:', tableName, 'with', result.data.length, 'records');
            data = result.data;
            break;
          } else if (result.error) {
            console.log('Error with table', tableName, ':', result.error.message);
          } else {
            console.log('Table', tableName, 'exists but has', result.data ? result.data.length : 0, 'records');
          }
        }

        console.log('Final Supabase response:', { data: data ? data.length : 'null', error });

        if (error) {
          console.error('Supabase GET error:', error);
          throw error;
        }

        if (Array.isArray(data) && data.length > 0) {
          console.log('Returning', data.length, 'contents from Supabase');
          // Normalize columns so frontend always gets camelCase
          const mapped = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description ?? item.text ?? null,
            contentType: item.contentType ?? item.contenttype ?? null,
            image: item.image ?? null,
            externalUrl: item.externalUrl ?? item.externalurl ?? null,
            platform: item.platform ?? null,
            createdAt: item.createdAt ?? item.createdat ?? item.created_at ?? null,
            updatedAt: item.updatedAt ?? item.updatedat ?? item.updated_at ?? null,
          }))
          return new Response(JSON.stringify(mapped), { status: 200 });
        } else {
          console.log('Supabase returned empty data, falling back to other sources');
        }
      } catch (supabaseError) {
        console.error('Supabase connection failed, falling back to direct DB:', supabaseError.message || supabaseError);
      }
    }

    // If a direct DB connection string is provided, use it server-side
    if (dbQuery && process.env.SUPABASE_DB_URL) {
      try {
        const res = await dbQuery('SELECT id, title, description, contenttype, image, externalurl, platform, "createdAt", "updatedAt" FROM public.contents ORDER BY "createdAt" DESC LIMIT 100')
        const rows = res.rows || []
        if (rows.length > 0) {
          const mapped = rows.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description ?? item.text ?? null,
            contentType: item.contenttype ?? null,
            image: item.image ?? null,
            externalUrl: item.externalurl ?? null,
            platform: item.platform ?? null,
            createdAt: item.createdAt ?? null,
            updatedAt: item.updatedAt ?? null,
          }))
          return new Response(JSON.stringify(mapped), { status: 200 })
        } else {
          console.log('Direct DB returned empty results, falling back to local storage')
        }
      } catch (err) {
        console.error('Direct DB GET failed, falling back to local storage:', err.message || err)
      }
    }

    // Fallback to file storage
    console.log('Falling back to file storage');
    const contents = await readContents();
    console.log('File storage contents:', contents.length, 'items');
    return new Response(JSON.stringify(contents), { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch contents' }), { status: 500 });
  }
}

export async function POST(request) {
  try {
    let body = await request.json();
    
    // Use exact column names as defined in Supabase
    const mappedBody = {
      title: body.title,
      description: body.text || body.description,
      contentType: body.contentType,
      image: body.image || null,
      externalUrl: body.externalUrl || null,
      platform: body.platform || null,
    };
    
    // If a direct DB connection string is provided, use it server-side for inserts
    if (dbQuery && process.env.SUPABASE_DB_URL) {
      try {
        const now = new Date()
        const sql = `INSERT INTO public.contents (title, description, contenttype, image, externalurl, platform, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`
        const values = [mappedBody.title, mappedBody.description, mappedBody.contentType, mappedBody.image, mappedBody.externalUrl, mappedBody.platform, now, now]
        const res = await dbQuery(sql, values)
        const out = res.rows && res.rows[0] ? res.rows[0] : null
        if (out) {
          const response = {
            ...out,
            contentType: out.contenttype ?? null,
            externalUrl: out.externalurl ?? null,
            createdAt: out.createdAt ?? null,
            updatedAt: out.updatedAt ?? null,
          }
          return new Response(JSON.stringify(response), { status: 201 })
        }
      } catch (err) {
        console.error('Direct DB INSERT failed, falling back to supabase:', err.message || err)
      }
    }

    // If Supabase is configured, try it first
    if (supabase) {
      try {
        // Try inserting using camelCase keys first
        const camel = { ...mappedBody }
        let res = await supabase.from('contents').insert([camel]).select().single();
        if (res.error) {
          // If column not found, retry with lowercase keys
          if (res.error.code === 'PGRST204' || String(res.error.message).includes('Could not find')) {
            const lower = {
              title: mappedBody.title,
              description: mappedBody.description,
              contenttype: mappedBody.contentType,
              image: mappedBody.image,
              externalurl: mappedBody.externalUrl,
              platform: mappedBody.platform,
            }
            res = await supabase.from('contents').insert([lower]).select().single();
          }
        }

        if (res.error) {
          console.error('Supabase POST error:', res.error);
          throw res.error;
        }

        const out = res.data;
        const response = {
          ...out,
          contentType: out.contentType ?? out.contenttype ?? null,
          externalUrl: out.externalUrl ?? out.externalurl ?? null,
          createdAt: out.createdAt ?? out.createdat ?? null,
          updatedAt: out.updatedAt ?? out.updatedat ?? null,
        }
        return new Response(JSON.stringify(response), { status: 201 });
      } catch (supabaseError) {
        console.error('Supabase connection failed, falling back to local storage:', supabaseError.message || supabaseError);
      }
    }

    // Fallback to file storage
    const contents = await readContents();
    const newContent = { 
      ...mappedBody, 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(),
      _id: Date.now().toString(),
      text: mappedBody.description
    };
    contents.push(newContent);
    await writeContents(contents);
    return new Response(JSON.stringify(newContent), { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create content', details: error.message }), { status: 500 });
  }
}
