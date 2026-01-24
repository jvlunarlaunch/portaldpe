import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Lock, Edit3, Trash2, Plus, FileText, BarChart, ArrowLeft, Save, Loader2, RefreshCw, Upload, User, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { RichEditor } from '../components/ui/RichEditor';
import { fetchArticles, fetchCategories, createArticle, updateArticle, deleteArticle, uploadImage, login as loginApi, logout as logoutApi, fetchAuthors, createAuthor, updateAuthor } from '../api';
import { Article, Author } from '../types';

const slugify = (text: string) => {
  return text
    .toString()
    .normalize('NFD') // Normaliza para decompor acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Troca espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
};

export const Admin: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Author | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'articles' | 'authors'>('articles');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Editor/Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorLanguage, setEditorLanguage] = useState<'en' | 'pt'>('en');

  // English Fields
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSlug, setArticleSlug] = useState('');
  const [slugSource, setSlugSource] = useState<'en' | 'pt'>('en');
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [articleExcerpt, setArticleExcerpt] = useState('');

  // Portuguese Fields
  const [articleTitlePt, setArticleTitlePt] = useState('');
  const [editorContentPt, setEditorContentPt] = useState('');
  const [articleExcerptPt, setArticleExcerptPt] = useState('');

  const [articleCategory, setArticleCategory] = useState('');
  // const [articleReadTime, setArticleReadTime] = useState('5 min'); // Calculated on save
  const [articleImage, setArticleImage] = useState('https://picsum.photos/seed/tech/800/600');
  const [articleImageFile, setArticleImageFile] = useState<File | null>(null);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isMain, setIsMain] = useState(false);

  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Author Form State
  const [isAddingAuthor, setIsAddingAuthor] = useState(false);
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorUser, setNewAuthorUser] = useState('');
  const [newAuthorPass, setNewAuthorPass] = useState('');
  const [newAuthorBio, setNewAuthorBio] = useState('');
  const [newAuthorAvatar, setNewAuthorAvatar] = useState('');
  const [newAuthorAvatarFile, setNewAuthorAvatarFile] = useState<File | null>(null);

  const isAdmin = currentUser?.username === 'admin@luxtech.io';

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    const [arts, cats, auths] = await Promise.all([fetchArticles({ status: 'all' }), fetchCategories(), fetchAuthors()]);
    setArticles(arts);
    setCategories(cats);
    setAuthors(auths);
    // Default category if available
    if (cats.length > 0 && !articleCategory) setArticleCategory(cats[0].name);
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginApi(loginEmail, loginPassword);
      setCurrentUser(user);
    } catch (e) {
      alert('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutApi();
    setCurrentUser(null);
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setArticleTitle('');
    setEditorContent('');
    setArticleExcerpt('');

    setArticleTitlePt('');
    setArticleSlug('');
    setSlugSource('en');
    setIsSlugCustom(false);
    setEditorContentPt('');
    setArticleExcerptPt('');

    // setArticleReadTime('5 min');
    setArticleImage('https://picsum.photos/seed/tech/800/600');
    setArticleImageFile(null);
    setShowThumbnail(true);
    setIsFeatured(false);
    setIsMain(false);
    setStatus('draft');
    if (categories.length > 0) setArticleCategory(categories[0].name);
    setIsEditing(true);
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setArticleTitle(article.title);
    setArticleSlug(article.slug);
    setIsSlugCustom(true); // Don't auto-overwrite existing slugs on edit unless changed
    setEditorContent(article.content || '');
    setArticleExcerpt(article.excerpt);

    setArticleTitlePt(article.title_pt || '');
    setEditorContentPt(article.content_pt || '');
    setArticleExcerptPt(article.excerpt_pt || '');

    setArticleCategory(article.category); // Assuming category name matches
    // setArticleReadTime(article.readTime);
    setArticleImage(article.imageUrl);
    setArticleImageFile(null);
    setShowThumbnail(article.showThumbnail !== false); // Default to true if undefined
    setIsFeatured(!!article.featured);
    setIsMain(!!article.main);
    setStatus(article.status || 'draft');
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      await deleteArticle(id);
      loadData();
    }
  };

  const handleSave = async (newStatus: 'draft' | 'published' = 'published') => {
    if (!articleTitle || !editorContent) return alert("Title and Content are required");

    setLoading(true);
    let finalImageUrl = articleImage;

    try {
      // 1. Upload thumbnail if a new file was selected
      if (articleImageFile) {
        const { url } = await uploadImage(articleImageFile);
        finalImageUrl = url;
      }

      // 2. Calculate read time
      const textContent = editorContent.replace(/<[^>]+>/g, '');
      const wordCount = textContent.trim().split(/\s+/).length;
      const calculatedReadTime = Math.ceil(wordCount / 200) + ' min read';

      const payload: Partial<Article> = {
        title: articleTitle,
        content: editorContent,
        excerpt: articleExcerpt,
        title_pt: articleTitlePt,
        content_pt: editorContentPt,
        excerpt_pt: articleExcerptPt,
        category: articleCategory,
        readTime: calculatedReadTime,
        imageUrl: finalImageUrl,
        featured: isFeatured,
        main: isMain,
        showThumbnail: showThumbnail,
        authorId: currentUser?.id,
        status: newStatus,
        slug: articleSlug
      };

      if (editingId) {
        await updateArticle(editingId, payload);
      } else {
        await createArticle(payload);
      }
      setIsEditing(false);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Error saving article');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAuthor = async () => {
    if (!newAuthorName || !newAuthorUser || !newAuthorPass) return alert("Required fields missing");
    setLoading(true);
    try {
      let finalAvatarUrl = newAuthorAvatar;
      if (newAuthorAvatarFile) {
        const { url } = await uploadImage(newAuthorAvatarFile);
        finalAvatarUrl = url;
      }

      await createAuthor({
        name: newAuthorName,
        username: newAuthorUser,
        password: newAuthorPass,
        bio: newAuthorBio,
        avatarUrl: finalAvatarUrl
      });
      setIsAddingAuthor(false);
      loadData();
      // Reset form
      setNewAuthorName('');
      setNewAuthorUser('');
      setNewAuthorPass('');
      setNewAuthorBio('');
      setNewAuthorAvatar('');
      setNewAuthorAvatarFile(null);
    } catch (e) {
      alert('Error creating author');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAuthor = (author: Author) => {
    setEditingAuthorId(author.id);
    setNewAuthorName(author.name);
    setNewAuthorUser(author.username);
    setNewAuthorPass(''); // Don't show password
    setNewAuthorBio(author.bio || '');
    setNewAuthorAvatar(author.avatarUrl || '');
    setNewAuthorAvatarFile(null);
    setIsAddingAuthor(true);
  };

  const handleUpdateAuthor = async () => {
    if (!editingAuthorId) return;
    setLoading(true);
    try {
      let finalAvatarUrl = newAuthorAvatar;
      if (newAuthorAvatarFile) {
        const { url } = await uploadImage(newAuthorAvatarFile);
        finalAvatarUrl = url;
      }

      const payload: any = {
        name: newAuthorName,
        username: newAuthorUser,
        bio: newAuthorBio,
        avatarUrl: finalAvatarUrl
      };
      if (newAuthorPass) payload.password = newAuthorPass;

      await updateAuthor(editingAuthorId, payload);

      // If updating yourself, update currentUser state
      if (currentUser?.id === editingAuthorId) {
        setCurrentUser({ ...currentUser, ...payload, id: editingAuthorId });
      }

      setIsAddingAuthor(false);
      setEditingAuthorId(null);
      setNewAuthorAvatarFile(null);
      loadData();
    } catch (e) {
      alert('Error updating author');
    } finally {
      setLoading(false);
    }
  };

  // Login Screen
  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-surface p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock size={32} />
            </div>
          </div>
          <h2 className="mb-2 text-center font-display text-2xl font-bold text-white">Restricted Access</h2>
          <div className="space-y-4 mt-8">
            <input
              type="text"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm text-white focus:border-primary focus:outline-none"
              placeholder="admin@luxtech.io"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm text-white focus:border-primary focus:outline-none"
              placeholder="••••••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button className="w-full mt-4" onClick={handleLogin} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Authenticate'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Editor Screen
  if (isEditing) {
    return (
      <div className="min-h-screen w-full pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="pl-0 gap-2">
              <ArrowLeft size={16} /> Cancel
            </Button>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono uppercase text-text-muted">
              Status: <span className={status === 'published' ? 'text-primary' : 'text-yellow-500'}>{status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-center">
            <div className="md:col-span-2 space-y-4">

              {/* Language Tabs */}
              <div className="flex gap-2 mb-2">
                <button onClick={() => setEditorLanguage('en')} className={`px-4 py-2 rounded-lg text-sm font-bold ${editorLanguage === 'en' ? 'bg-primary text-black' : 'bg-white/5 text-text-muted'}`}>English</button>
                <button onClick={() => setEditorLanguage('pt')} className={`px-4 py-2 rounded-lg text-sm font-bold ${editorLanguage === 'pt' ? 'bg-primary text-black' : 'bg-white/5 text-text-muted'}`}>Português</button>
              </div>

              {editorLanguage === 'en' ? (
                <>
                  <input
                    type="text"
                    placeholder="Article Title (EN)..."
                    className="w-full bg-transparent border-none text-4xl font-display font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 px-0"
                    value={articleTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setArticleTitle(val);
                      if (!isSlugCustom && slugSource === 'en') {
                        setArticleSlug(slugify(val));
                      }
                    }}
                  />
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-text-muted">SLUG SOURCE:</span>
                      <button
                        onClick={() => {
                          setSlugSource('en');
                          if (!isSlugCustom) setArticleSlug(slugify(articleTitle));
                        }}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border ${slugSource === 'en' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-text-muted hover:text-white'}`}
                      >
                        TITLE (EN)
                      </button>
                      <button
                        onClick={() => {
                          setSlugSource('pt');
                          if (!isSlugCustom) setArticleSlug(slugify(articleTitlePt));
                        }}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border ${slugSource === 'pt' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-text-muted hover:text-white'}`}
                      >
                        TITULO (PT)
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 group/slug">
                    <span className="text-[10px] font-mono text-text-muted">URL SLUG:</span>
                    <input
                      type="text"
                      className="bg-transparent border-none text-[10px] font-mono text-primary focus:outline-none focus:ring-0 p-0 min-w-[200px]"
                      value={articleSlug}
                      onChange={(e) => {
                        setArticleSlug(e.target.value);
                        setIsSlugCustom(true);
                      }}
                      placeholder="auto-generated-slug"
                    />
                    {isSlugCustom && (
                      <button
                        onClick={() => {
                          setIsSlugCustom(false);
                          setArticleSlug(slugify(slugSource === 'en' ? articleTitle : articleTitlePt));
                        }}
                        className="text-[8px] font-mono text-text-muted hover:text-white"
                      >
                        [RESET]
                      </button>
                    )}
                  </div>
                  <textarea
                    placeholder="Short Excerpt (EN)..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary focus:outline-none"
                    value={articleExcerpt}
                    onChange={(e) => setArticleExcerpt(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Article Title (PT)..."
                    className="w-full bg-transparent border-none text-4xl font-display font-bold text-white placeholder-white/20 focus:outline-none focus:ring-0 px-0"
                    value={articleTitlePt}
                    onChange={(e) => {
                      const val = e.target.value;
                      setArticleTitlePt(val);
                      if (!isSlugCustom && slugSource === 'pt') {
                        setArticleSlug(slugify(val));
                      }
                    }}
                  />
                  <textarea
                    placeholder="Short Excerpt (PT)..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary focus:outline-none"
                    value={articleExcerptPt}
                    onChange={(e) => setArticleExcerptPt(e.target.value)}
                  />
                </>
              )}
            </div>

            <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div>
                <label className="block text-xs font-mono text-text-muted mb-1">CATEGORY</label>
                <select
                  value={articleCategory}
                  onChange={(e) => setArticleCategory(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg p-2 text-white text-sm focus:border-primary outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                {/* Read Time is now auto-calculated */}
              </div>
              <div>
                <label className="block text-xs font-mono text-text-muted mb-1">THUMBNAIL IMAGE</label>
                <div className="relative group aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black flex items-center justify-center cursor-pointer">
                  {articleImage ? (
                    <img src={articleImage} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  ) : (
                    <Upload size={24} className="text-text-muted" />
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setArticleImageFile(file);
                        setArticleImage(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="font-mono text-[10px] text-white bg-black/50 px-2 py-1 rounded">CHANGE_IMAGE</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input type="checkbox" checked={isMain} onChange={e => setIsMain(e.target.checked)} /> Main Hero
                </label>
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input type="checkbox" checked={showThumbnail} onChange={e => setShowThumbnail(e.target.checked)} /> Show Thumbnail in Article
                </label>
              </div>
            </div>
          </div>
        </div>

        <RichEditor
          content={editorLanguage === 'en' ? editorContent : editorContentPt}
          onChange={editorLanguage === 'en' ? setEditorContent : setEditorContentPt}
        />

        <div className="mt-8 flex justify-end gap-4">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>Discard</Button>
          <Button variant="secondary" onClick={() => handleSave('draft')}>
            <FileText size={16} className="mr-2" /> Save as Draft
          </Button>
          <Button className="gap-2" onClick={() => handleSave('published')}>
            <Save size={16} /> {editingId ? 'Update & Publish' : 'Publish Article'}
          </Button>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen w-full pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">Command Center</h1>
          <p className="font-mono text-sm text-text-muted">Welcome back, {currentUser.name}.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          <Button className="gap-2" onClick={handleCreateNew}>
            <Plus size={16} /> New Entry
          </Button>
          <Button variant="ghost" className="gap-2" onClick={() => handleEditAuthor(currentUser!)}>
            <Edit3 size={16} /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-white/5">
        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-4 px-2 font-mono text-xs transition-colors relative ${activeTab === 'articles' ? 'text-primary' : 'text-text-muted hover:text-white'}`}
        >
          ARTICLES
          {activeTab === 'articles' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('authors')}
            className={`pb-4 px-2 font-mono text-xs transition-colors relative ${activeTab === 'authors' ? 'text-primary' : 'text-text-muted hover:text-white'}`}
          >
            AUTHORS
            {activeTab === 'authors' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-primary"><Loader2 className="animate-spin" size={32} /></div>
      ) : isAddingAuthor ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-white">
              {editingAuthorId ? (editingAuthorId === currentUser?.id ? 'Your Profile' : 'Edit Author') : 'New Author'}
            </h2>
            <Button variant="ghost" onClick={() => { setIsAddingAuthor(false); setEditingAuthorId(null); }} className="gap-2">
              <ArrowLeft size={16} /> Cancel
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface p-8 rounded-3xl border border-primary/20 shadow-2xl"
          >
            <h4 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
              {editingAuthorId ? <Edit3 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
              {editingAuthorId ? 'Profile Settings' : 'New Profile Details'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">FULL NAME</label>
                  <input type="text" value={newAuthorName} onChange={e => setNewAuthorName(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary outline-none" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">USERNAME (EMAIL)</label>
                  <input type="email" value={newAuthorUser} onChange={e => setNewAuthorUser(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 font-mono text-white text-sm focus:border-primary outline-none" placeholder="john@luxtech.io" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">NEW PASSWORD (OPTIONAL)</label>
                  <input type="password" value={newAuthorPass} onChange={e => setNewAuthorPass(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary outline-none" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">AVATAR IMAGE</label>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-white/10 bg-black group cursor-pointer hover:border-primary transition-all">
                        <img src={newAuthorAvatar || 'https://via.placeholder.com/200'} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewAuthorAvatarFile(file);
                              setNewAuthorAvatar(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <Upload size={16} className="text-white mb-1" />
                          <span className="text-[8px] font-mono text-white">UPLOAD</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-[10px] text-text-muted leading-tight">Recommended: Square image, at least 400x400px. Click the circle to upload from your device.</p>
                        <div className="flex gap-2">
                          <input type="text" value={newAuthorAvatar} onChange={e => setNewAuthorAvatar(e.target.value)} className="flex-1 bg-black border border-white/10 rounded-xl p-2 text-white text-[10px] font-mono focus:border-primary outline-none" placeholder="Or enter Image URL..." />
                          <Button variant="secondary" size="sm" className="h-9" onClick={() => setNewAuthorAvatar(`https://picsum.photos/seed/${Math.random()}/400/400`)}>Random</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1">BIO / DESCRIPTION</label>
                  <textarea value={newAuthorBio} onChange={e => setNewAuthorBio(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm focus:border-primary outline-none h-[104px]" placeholder="Lead developer and UI enthusiast..." />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={editingAuthorId ? handleUpdateAuthor : handleAddAuthor} disabled={loading} className="px-8">
                {loading ? <Loader2 className="animate-spin" /> : editingAuthorId ? 'Save Changes' : 'Create Account'}
              </Button>
            </div>
          </motion.div>
        </div>
      ) : activeTab === 'articles' ? (
        <div className="rounded-3xl border border-white/5 bg-surface overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-display text-lg font-bold text-white">Recent Entries</h3>
            <button onClick={loadData} className="text-text-muted hover:text-white"><RefreshCw size={14} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 font-mono text-xs text-text-muted">TITLE</th>
                  <th className="px-6 py-4 font-mono text-xs text-text-muted">CATEGORY</th>
                  <th className="px-6 py-4 font-mono text-xs text-text-muted">STATUS</th>
                  <th className="px-6 py-4 font-mono text-xs text-text-muted">DATE</th>
                  <th className="px-6 py-4 font-mono text-xs text-text-muted text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {articles.map((article) => (
                  <tr key={article.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white group-hover:text-primary transition-colors">{article.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-text-muted">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-md px-2 py-1 font-mono text-xs ${article.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {article.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-text-muted">
                      {article.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(isAdmin || article.author?.id === currentUser?.id) && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(article)}
                            className="rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="rounded-full p-2 text-text-muted hover:bg-red-500/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10">
            <div>
              <h3 className="font-display text-xl font-bold text-white">Authors Management</h3>
              <p className="text-sm text-text-muted font-mono">Total Authors: {authors.length}</p>
            </div>
            <Button onClick={() => setIsAddingAuthor(true)} className="gap-2">
              <User size={16} /> New Author
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map(author => (
              <div key={author.id} className="bg-surface rounded-3xl border border-white/5 p-6 flex flex-col items-center text-center group hover:border-primary/30 transition-all shadow-xl">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-primary/20 group-hover:ring-primary transition-all">
                  <img src={author.avatarUrl || 'https://via.placeholder.com/200'} alt={author.name} className="w-full h-full object-cover" />
                </div>
                <h5 className="font-display font-bold text-white mb-1">{author.name}</h5>
                <p className="font-mono text-[10px] text-primary mb-3">{author.username}</p>
                <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{author.bio}</p>
                <div className="mt-6 flex gap-2 w-full pt-6 border-t border-white/5">
                  <Button variant="ghost" size="sm" className="flex-1 text-[10px] font-mono" onClick={() => handleEditAuthor(author)}>EDIT PROFILE</Button>
                  {author.username !== 'admin@luxtech.io' && (
                    <Button variant="ghost" size="sm" className="text-red-500/50 hover:text-red-500"><Trash2 size={12} /></Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};