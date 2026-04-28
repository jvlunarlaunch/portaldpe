import { supabase } from './supabase';
import { Article, Author } from './types';

// Map database column names to frontend property names
// Map database column names to frontend property names
const mapArticle = (dbArticle: any): Article => ({
    id: dbArticle.id.toString(),
    slug: dbArticle.slug,
    title: dbArticle.title,
    excerpt: dbArticle.excerpt,
    content: dbArticle.content,
    categories: dbArticle.article_categories
        ? dbArticle.article_categories.map((ac: any) => ac.categories_portaldpe.name)
        : [],
    readTime: dbArticle.read_time,
    date: new Date(dbArticle.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', ''),
    updatedAt: dbArticle.updated_at ? new Date(dbArticle.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : undefined,
    imageUrl: dbArticle.image_url,
    featured: !!dbArticle.featured,
    main: !!dbArticle.main,
    showThumbnail: dbArticle.show_thumbnail !== undefined ? !!dbArticle.show_thumbnail : true,
    showAuthor: dbArticle.show_author !== undefined ? !!dbArticle.show_author : true,
    status: dbArticle.status || 'draft',
    authorName: dbArticle.author_name || undefined,
    author: dbArticle.authors_portaldpe ? {
        id: dbArticle.authors_portaldpe.id.toString(),
        name: dbArticle.authors_portaldpe.name,
        username: dbArticle.authors_portaldpe.username,
        bio: dbArticle.authors_portaldpe.bio,
        avatarUrl: dbArticle.authors_portaldpe.avatar_url
    } : undefined
});

export const login = async (email: string, password: string): Promise<Author> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    // Fetch author metadata from authors_portaldpe table
    const { data: authorData, error: authorError } = await supabase
        .from('authors_portaldpe')
        .select('*')
        .eq('id', data.user.id)
        .single();

    if (authorError) throw authorError;

    return {
        id: authorData.id,
        name: authorData.name,
        username: authorData.username,
        bio: authorData.bio,
        avatarUrl: authorData.avatar_url
    };
};

export const logout = async () => {
    await supabase.auth.signOut();
};

export const fetchAuthors = async (): Promise<Author[]> => {
    const { data, error } = await supabase.from('authors_portaldpe').select('*');
    if (error) return [];
    return data.map(r => ({
        id: r.id,
        name: r.name,
        username: r.username,
        bio: r.bio,
        avatarUrl: r.avatar_url
    }));
};

export const createAuthor = async (author: Partial<Author> & { password?: string }) => {
    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: author.username!,
        password: author.password!,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Sign up failed');

    // 2. Add metadata to authors_portaldpe table
    const { data, error } = await supabase.from('authors_portaldpe').insert([{
        id: authData.user.id,
        name: author.name,
        username: author.username,
        bio: author.bio,
        avatar_url: author.avatarUrl
    }]).select().single();

    if (error) throw error;
    return data;
};

export const updateAuthor = async (id: string, author: Partial<Author> & { password?: string }) => {
    const updateData: any = {
        name: author.name,
        username: author.username,
        bio: author.bio,
        avatar_url: author.avatarUrl
    };

    const { data, error } = await supabase
        .from('authors_portaldpe')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const fetchArticles = async (params: { category?: string, page?: number, limit?: number, status?: string } = {}): Promise<Article[]> => {
    let query = supabase
        .from('articles_portaldpe')
        .select('*, article_categories(categories_portaldpe(name)), authors_portaldpe(*)');

    if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
    } else if (!params.status) {
        query = query.eq('status', 'published');
    }

    // Filter by category if provided
    // Note: Filtering by deep relation in separate step or using !inner if needed
    // Simple approach: Fetch all match status, then filter in memory if category is specific, 
    // OR use a more complex query. Given Supabase limitations on deep filters, 
    // we can filter the ID first if category is present.

    if (params.category && params.category !== 'Todos') {
        const { data: catData } = await supabase.from('categories_portaldpe').select('id').eq('name', params.category).single();
        if (catData) {
            // Find articles that have this category
            // We need to use !inner hint on relation/junction but Supabase JS syntax varies.
            // Alternative: select article_ids from junction table
            const { data: articleIds } = await supabase
                .from('article_categories')
                .select('article_id')
                .eq('category_id', catData.id);

            if (articleIds) {
                const ids = articleIds.map(a => a.article_id);
                query = query.in('id', ids);
            } else {
                return [];
            }
        }
    }

    const page = params.page || 1;
    const limit = params.limit || 100;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
    return data.map(mapArticle);
};

export const fetchArticleById = async (id: string): Promise<Article | null> => {
    const { data, error } = await supabase
        .from('articles_portaldpe')
        .select('*, article_categories(categories_portaldpe(name)), authors_portaldpe(*)')
        .eq('id', id)
        .single();

    if (error) return null;
    return mapArticle(data);
};

export const fetchArticleBySlug = async (slug: string): Promise<Article | null> => {
    const { data, error } = await supabase
        .from('articles_portaldpe')
        .select('*, article_categories(categories_portaldpe(name)), authors_portaldpe(*)')
        .eq('slug', slug)
        .single();

    if (error) return null;
    return mapArticle(data);
};

export const fetchRelatedArticles = async (id: string): Promise<Partial<Article>[]> => {
    // Get categories of current article
    const { data: currentCategories } = await supabase
        .from('article_categories')
        .select('category_id')
        .eq('article_id', id);

    if (!currentCategories || currentCategories.length === 0) return [];

    // Get IDs of articles that share at least one category
    const categoryIds = currentCategories.map(c => c.category_id);
    const { data: relatedIds } = await supabase
        .from('article_categories')
        .select('article_id')
        .in('category_id', categoryIds)
        .neq('article_id', id)
        .limit(20); // Limit pool to search

    if (!relatedIds || relatedIds.length === 0) return [];

    // Fetch actial articles
    const uniqueArticleIds = Array.from(new Set(relatedIds.map(r => r.article_id))).slice(0, 3);

    const { data, error } = await supabase
        .from('articles_portaldpe')
        .select('id, slug, title, image_url, article_categories(categories_portaldpe(name))')
        .in('id', uniqueArticleIds)
        .eq('status', 'published');

    if (error) return [];
    return data.map(r => ({
        id: r.id.toString(),
        slug: r.slug,
        title: r.title,
        imageUrl: r.image_url,
        categories: r.article_categories
            ? r.article_categories.map((ac: any) => ac.categories_portaldpe.name)
            : []
    }));
};

export const fetchCategories = async (): Promise<{ id: number, name: string, slug: string }[]> => {
    const { data, error } = await supabase.from('categories_portaldpe').select('*');
    if (error) return [];
    return data;
};

export const createArticle = async (article: Partial<Article>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get IDs for all selected categories
    const { data: catData } = await supabase.from('categories_portaldpe').select('id, name').in('name', article.categories || []);
    if (!catData || catData.length === 0) throw new Error('Invalid categories');

    const slug = article.slug || article.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Insert article
    const { data: articleData, error } = await supabase.from('articles_portaldpe').insert([{
        title: article.title,
        slug,
        excerpt: article.excerpt,
        content: article.content,
        // category_id: null, // Deprecated
        author_id: user.id,
        read_time: article.readTime,
        image_url: article.imageUrl,
        featured: article.featured,
        main: article.main,
        show_thumbnail: article.showThumbnail,
        show_author: article.showAuthor,
        author_name: article.authorName || null,
        status: article.status || 'draft'
    }]).select().single();

    if (error) throw error;

    // Insert category relationships
    const articleId = articleData.id;
    const categoryInserts = catData.map(c => ({
        article_id: articleId,
        category_id: c.id
    }));

    const { error: catError } = await supabase.from('article_categories').insert(categoryInserts);
    if (catError) throw catError; // Note: might leave orphaned article if this fails. Transaction would be better but simple insert is ok.

    return {};
};

export const updateArticle = async (id: string, article: Partial<Article>) => {
    const updateData: any = {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        read_time: article.readTime,
        image_url: article.imageUrl,
        featured: article.featured,
        main: article.main,
        show_thumbnail: article.showThumbnail,
        show_author: article.showAuthor,
        author_name: article.authorName !== undefined ? article.authorName : undefined,
        status: article.status,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('articles_portaldpe')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;

    // Update categories if provided
    if (article.categories) {
        // 1. Get new category IDs
        const { data: catData } = await supabase.from('categories_portaldpe').select('id').in('name', article.categories);

        if (catData) {
            // 2. Delete existing relationships
            await supabase.from('article_categories').delete().eq('article_id', id);

            // 3. Insert new relationships
            const categoryInserts = catData.map(c => ({
                article_id: id,
                category_id: c.id
            }));
            await supabase.from('article_categories').insert(categoryInserts);
        }
    }

    return { id, ...article };
};

export const deleteArticle = async (id: string) => {
    const { error } = await supabase.from('articles_portaldpe').delete().eq('id', id);
    if (error) throw error;
};

export const uploadImage = async (file: File): Promise<{ url: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('blog-media')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
        .from('blog-media')
        .getPublicUrl(filePath);

    return { url: data.publicUrl };
};
