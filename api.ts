import { supabase } from './supabase';
import { Article, Author } from './types';

// Map database column names to frontend property names
const mapArticle = (dbArticle: any): Article => ({
    id: dbArticle.id.toString(),
    slug: dbArticle.slug,
    title: dbArticle.title,
    excerpt: dbArticle.excerpt,
    content: dbArticle.content,
    category: dbArticle.categories_portaldpe?.name || 'Uncategorized',
    readTime: dbArticle.read_time,
    date: new Date(dbArticle.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', ''),
    updatedAt: dbArticle.updated_at ? new Date(dbArticle.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : undefined,
    imageUrl: dbArticle.image_url,
    featured: !!dbArticle.featured,
    main: !!dbArticle.main,
    showThumbnail: dbArticle.show_thumbnail !== undefined ? !!dbArticle.show_thumbnail : true,
    showAuthor: dbArticle.show_author !== undefined ? !!dbArticle.show_author : true,
    status: dbArticle.status || 'draft',
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
        .select('*, categories_portaldpe(name), authors_portaldpe(*)');

    if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
    } else if (!params.status) {
        query = query.eq('status', 'published');
    }

    if (params.category && params.category !== 'Todos') {
        // Find category ID
        const { data: catData } = await supabase.from('categories_portaldpe').select('id').eq('name', params.category).single();
        if (catData) {
            query = query.eq('category_id', catData.id);
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
        .select('*, categories_portaldpe(name), authors_portaldpe(*)')
        .eq('id', id)
        .single();

    if (error) return null;
    return mapArticle(data);
};

export const fetchArticleBySlug = async (slug: string): Promise<Article | null> => {
    const { data, error } = await supabase
        .from('articles_portaldpe')
        .select('*, categories_portaldpe(name), authors_portaldpe(*)')
        .eq('slug', slug)
        .single();

    if (error) return null;
    return mapArticle(data);
};

export const fetchRelatedArticles = async (id: string): Promise<Partial<Article>[]> => {
    const { data: current } = await supabase.from('articles_portaldpe').select('category_id').eq('id', id).single();
    if (!current) return [];

    const { data, error } = await supabase
        .from('articles_portaldpe')
        .select('id, slug, title, image_url, categories_portaldpe(name)')
        .eq('category_id', current.category_id)
        .eq('status', 'published')
        .neq('id', id)
        .limit(3);

    if (error) return [];
    return data.map(r => ({
        id: r.id.toString(),
        slug: r.slug,
        title: r.title,
        imageUrl: r.image_url,
        category: (r.categories_portaldpe as any)?.name
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

    const { data: catData } = await supabase.from('categories_portaldpe').select('id').eq('name', article.category).single();
    if (!catData) throw new Error('Invalid category');

    const slug = article.slug || article.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const { data, error } = await supabase.from('articles_portaldpe').insert([{
        title: article.title,
        slug,
        excerpt: article.excerpt,
        content: article.content,
        category_id: catData.id,
        author_id: user.id,
        read_time: article.readTime,
        image_url: article.imageUrl,
        featured: article.featured,
        main: article.main,
        show_thumbnail: article.showThumbnail,
        show_author: article.showAuthor,
        status: article.status || 'draft'
    }]);

    if (error) throw error;
    return {};
};

export const updateArticle = async (id: string, article: Partial<Article>) => {
    const { data: catData } = await supabase.from('categories_portaldpe').select('id').eq('name', article.category).single();

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
        status: article.status,
        updated_at: new Date().toISOString()
    };

    if (catData) updateData.category_id = catData.id;

    const { error } = await supabase
        .from('articles_portaldpe')
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
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
