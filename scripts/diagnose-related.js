import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function diagnose() {
    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, category_id, status, slug');

    if (error) {
        console.error(error);
        return;
    }

    const { data: categories } = await supabase.from('categories').select('*');
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    console.log('--- Article Index ---');
    articles.forEach(a => {
        const relatedCount = articles.filter(other =>
            other.category_id === a.category_id &&
            other.id !== a.id &&
            other.status === 'published'
        ).length;

        console.log(`Title: ${a.title}`);
        console.log(`- Slug: ${a.slug}`);
        console.log(`- Category: ${catMap[a.category_id] || 'NULL'}`);
        console.log(`- Status: ${a.status}`);
        console.log(`- Related published articles: ${relatedCount}`);
        console.log('---');
    });
}

diagnose();
