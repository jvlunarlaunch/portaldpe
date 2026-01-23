import { Article, Author } from './types';

const API_URL = 'http://localhost:3001/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

const getUploadHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const login = async (username: string, password: string): Promise<Author> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        localStorage.removeItem('authToken');
    } catch (error) {
        console.error('Logout error:', error);
    }
};

export const fetchAuthors = async (): Promise<Author[]> => {
    try {
        const response = await fetch(`${API_URL}/authors`, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Failed to fetch authors');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching authors:', error);
        return [];
    }
};

export const createAuthor = async (author: Partial<Author> & { password?: string }) => {
    try {
        const response = await fetch(`${API_URL}/authors`, {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(author),
        });
        if (!response.ok) {
            throw new Error('Failed to create author');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating author:', error);
        throw error;
    }
};

export const updateAuthor = async (id: string, author: Partial<Author> & { password?: string }) => {
    try {
        const response = await fetch(`${API_URL}/authors/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(author),
        });
        if (!response.ok) {
            throw new Error('Failed to update author');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating author:', error);
        throw error;
    }
};

export const fetchArticles = async (params: { category?: string, page?: number, limit?: number, status?: string } = {}): Promise<Article[]> => {
    try {
        const query = new URLSearchParams();
        if (params.category) query.append('category', params.category);
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.status) query.append('status', params.status);

        const response = await fetch(`${API_URL}/articles?${query.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch articles');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
};

export const fetchRelatedArticles = async (id: string): Promise<Partial<Article>[]> => {
    try {
        const response = await fetch(`${API_URL}/articles/related/${id}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Error fetching related:', error);
        return [];
    }
};

export const fetchArticleById = async (id: string): Promise<Article | null> => {
    try {
        const response = await fetch(`${API_URL}/articles/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch article');
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching article ${id}:`, error);
        return null;
    }
};

export const fetchCategories = async (): Promise<{ id: number, name: string, slug: string }[]> => {
    try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

export const createArticle = async (article: Partial<Article>) => {
    try {
        const response = await fetch(`${API_URL}/articles`, {
            method: 'POST',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(article),
        });
        if (!response.ok) {
            throw new Error('Failed to create article');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating article:', error);
        throw error;
    }
};

export const updateArticle = async (id: string, article: Partial<Article>) => {
    try {
        const response = await fetch(`${API_URL}/articles/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            credentials: 'include',
            body: JSON.stringify(article),
        });
        if (!response.ok) {
            throw new Error('Failed to update article');
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating article:', error);
        throw error;
    }
};

export const deleteArticle = async (id: string) => {
    try {
        const response = await fetch(`${API_URL}/articles/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to delete article');
        }
        return await response.json();
    } catch (error) {
        console.error('Error deleting article:', error);
        throw error;
    }
};

export const uploadImage = async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: getUploadHeaders(),
            credentials: 'include',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload image');
        }
        return await response.json();
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};
