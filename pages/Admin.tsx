import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Lock, Edit3, Trash2, Plus, FileText, BarChart, ArrowLeft, Save, Loader2, RefreshCw, Upload, User, Users, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { RichEditor } from '../components/ui/RichEditor';
import { fetchArticles, fetchCategories, createArticle, updateArticle, deleteArticle, uploadImage, login as loginApi, logout as logoutApi, fetchAuthors, createAuthor, updateAuthor } from '../api';
import { Article, Author } from '../types';

const slugify = (text: string) => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const Admin: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Author | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'articles' | 'authors'>('articles');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSlug, setArticleSlug] = useState('');
  const [isSlugCustom, setIsSlugCustom] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [articleExcerpt, setArticleExcerpt] = useState('');
  const [articleCategories, setArticleCategories] = useState<string[]>([]);
  const [articleImage, setArticleImage] = useState('https://picsum.photos/seed/tech/800/600');
  const [articleImageFile, setArticleImageFile] = useState<File | null>(null);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [showAuthor, setShowAuthor] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isMain, setIsMain] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [isAddingAuthor, setIsAddingAuthor] = useState(false);
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorUser, setNewAuthorUser] = useState('');
  const [newAuthorPass, setNewAuthorPass] = useState('');
  const [newAuthorBio, setNewAuthorBio] = useState('');
  const [newAuthorAvatar, setNewAuthorAvatar] = useState('');
  const [newAuthorAvatarFile, setNewAuthorAvatarFile] = useState<File | null>(null);

  const isAdmin = currentUser?.username === 'joaovictor@lunarlaunch.com.br';

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    const [arts, cats, auths] = await Promise.all([fetchArticles({ status: 'all' }), fetchCategories(), fetchAuthors()]);
    setArticles(arts || []);
    setCategories(cats || []);
    setAuthors(auths || []);
    if (cats && cats.length > 0 && articleCategories.length === 0) setArticleCategories([cats[0].name]);
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginApi(loginEmail, loginPassword);
      setCurrentUser(user);
    } catch (e) {
      alert('Credenciais inválidas');
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
    setArticleSlug('');
    setIsSlugCustom(false);
    setArticleImage('https://picsum.photos/seed/tech/800/600');
    setArticleImageFile(null);
    setShowThumbnail(true);
    setShowAuthor(false);
    setIsFeatured(false);
    setIsMain(false);
    setStatus('draft');
    if (categories.length > 0) setArticleCategories([categories[0].name]);
    setIsEditing(true);
    window.scrollTo(0, 0);
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setArticleTitle(article.title);
    setArticleSlug(article.slug);
    setIsSlugCustom(true);
    setEditorContent(article.content || '');
    setArticleExcerpt(article.excerpt);
    setArticleCategories(article.categories || []);
    setArticleImage(article.imageUrl);
    setArticleImageFile(null);
    setShowThumbnail(article.showThumbnail !== false);
    setShowAuthor(article.showAuthor === true);
    setIsFeatured(!!article.featured);
    setIsMain(!!article.main);
    setStatus(article.status || 'draft');
    setIsEditing(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Você tem certeza que deseja excluir esta notícia?')) {
      await deleteArticle(id);
      loadData();
    }
  };

  const handleSave = async (newStatus: 'draft' | 'published' = 'published') => {
    if (!articleTitle || !editorContent) return alert("Título e Conteúdo são obrigatórios");
    setLoading(true);
    let finalImageUrl = articleImage;
    try {
      if (articleImageFile) {
        const { url } = await uploadImage(articleImageFile);
        finalImageUrl = url;
      }
      const textContent = editorContent.replace(/<[^>]+>/g, '');
      const wordCount = textContent.trim().split(/\s+/).length;
      const calculatedReadTime = Math.ceil(wordCount / 200) + ' min de leitura';
      const payload: Partial<Article> = {
        title: articleTitle,
        content: editorContent,
        excerpt: articleExcerpt,
        categories: articleCategories,
        readTime: calculatedReadTime,
        imageUrl: finalImageUrl,
        featured: isFeatured,
        main: isMain,
        showThumbnail: showThumbnail,
        showAuthor: showAuthor,
        authorId: currentUser?.id,
        status: newStatus,
        slug: articleSlug ? slugify(articleSlug) : slugify(articleTitle)
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
      alert('Erro ao salvar artigo');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAuthor = async () => {
    if (!newAuthorName || !newAuthorUser || !newAuthorPass) return alert("Campos obrigatórios ausentes");
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
      setNewAuthorName('');
      setNewAuthorUser('');
      setNewAuthorPass('');
      setNewAuthorBio('');
      setNewAuthorAvatar('');
      setNewAuthorAvatarFile(null);
    } catch (e) {
      alert('Erro ao criar autor');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAuthor = (author: Author) => {
    setEditingAuthorId(author.id);
    setNewAuthorName(author.name);
    setNewAuthorUser(author.username);
    setNewAuthorPass('');
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
        avatar_url: finalAvatarUrl
      };
      if (newAuthorPass) payload.password = newAuthorPass;
      await updateAuthor(editingAuthorId, payload);
      if (currentUser?.id === editingAuthorId) {
        setCurrentUser({ ...currentUser, ...payload, id: editingAuthorId });
      }
      setIsAddingAuthor(false);
      setEditingAuthorId(null);
      setNewAuthorAvatarFile(null);
      loadData();
    } catch (e) {
      alert('Erro ao atualizar autor');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-20 bg-slate-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock size={32} />
            </div>
          </div>
          <h2 className="mb-2 text-center font-display text-2xl font-bold text-white">Acesso Restrito</h2>
          <div className="space-y-4 mt-8">
            <input
              type="text"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-sm text-white focus:border-primary focus:outline-none"
              placeholder="seu-email@portaldpe.com.br"
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
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Autenticar'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen w-full pt-32 pb-20 px-4 md:px-8 bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => setIsEditing(false)} className="pl-0 gap-2 font-mono text-xs uppercase text-slate-400">
                <ArrowLeft size={16} /> Voltar
              </Button>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono uppercase text-text-muted">
                Status: <span className={status === 'published' ? 'text-primary' : 'text-yellow-500'}>{status === 'published' ? 'Publicado' : 'Rascunho'}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label className="block text-[10px] font-mono text-text-muted mb-2 uppercase tracking-widest">Título do Artigo</label>
                  <input
                    type="text"
                    placeholder="Digite o título principal..."
                    className="w-full bg-transparent border-none text-4xl font-display font-bold text-white placeholder-white/10 focus:outline-none focus:ring-0 px-0"
                    value={articleTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setArticleTitle(val);
                      if (!isSlugCustom) setArticleSlug(slugify(val));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">URL Slug:</span>
                    <input
                      type="text"
                      className="bg-transparent border-none text-[10px] font-mono text-primary focus:outline-none focus:ring-0 p-0 min-w-[200px]"
                      value={articleSlug}
                      onChange={(e) => {
                        setArticleSlug(e.target.value);
                        setIsSlugCustom(true);
                      }}
                      placeholder="url-do-artigo"
                    />
                    {isSlugCustom && (
                      <button onClick={() => { setIsSlugCustom(false); setArticleSlug(slugify(articleTitle)); }} className="text-[8px] font-mono text-text-muted hover:text-white uppercase">[Resetar]</button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-text-muted mb-2 uppercase tracking-widest">Resumo Curto (SEO)</label>
                  <textarea
                    placeholder="Uma breve descrição..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-primary focus:outline-none transition-all h-24 resize-none"
                    value={articleExcerpt}
                    onChange={(e) => setArticleExcerpt(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10 h-fit">
                <div>
                  <label className="block text-[10px] font-mono text-text-muted mb-2 uppercase tracking-widest">Categoria</label>
                  <label className="block text-[10px] font-mono text-text-muted mb-2 uppercase tracking-widest">Categorias</label>
                  <div className="bg-black border border-white/10 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-4 h-4 border rounded transition-colors flex items-center justify-center ${articleCategories.includes(cat.name) ? 'bg-primary border-primary' : 'border-white/20 group-hover:border-white/40'}`}>
                          {articleCategories.includes(cat.name) && <Check size={10} className="text-black" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={articleCategories.includes(cat.name)}
                          onChange={() => {
                            if (articleCategories.includes(cat.name)) {
                              setArticleCategories(articleCategories.filter(c => c !== cat.name));
                            } else {
                              setArticleCategories([...articleCategories, cat.name]);
                            }
                          }}
                        />
                        <span className={`text-sm ${articleCategories.includes(cat.name) ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-text-muted mb-2 uppercase tracking-widest">Capa do Artigo</label>
                  <div className="relative group aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all">
                    {articleImage ? <img src={articleImage} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" /> : <Upload size={24} className="text-text-muted" />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setArticleImageFile(file); setArticleImage(URL.createObjectURL(file)); } }} />
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-black checked:bg-primary" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} /> Em Destaque
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-black checked:bg-primary" checked={isMain} onChange={e => setIsMain(e.target.checked)} /> Hero Principal
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-black checked:bg-primary" checked={showThumbnail} onChange={e => setShowThumbnail(e.target.checked)} /> Mostrar Capa no Artigo
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-black checked:bg-primary" checked={showAuthor} onChange={e => setShowAuthor(e.target.checked)} /> Mostrar Autor no Artigo
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2 mb-8">
            <label className="block text-[10px] font-mono text-text-muted mb-2 uppercase tracking-widest">Conteúdo do Artigo</label>
            <RichEditor content={editorContent} onChange={setEditorContent} />
          </div>
          <div className="mt-8 flex flex-col md:flex-row justify-end gap-4 border-t border-white/5 pt-8">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="font-mono text-xs uppercase tracking-widest text-slate-400">Descartar</Button>
            <Button variant="secondary" onClick={() => handleSave('draft')} className="font-mono text-xs uppercase tracking-widest text-white"><FileText size={16} className="mr-2" /> Salvar Rascunho</Button>
            <Button className="gap-2 font-mono text-xs uppercase tracking-widest px-8" onClick={() => handleSave('published')}><Save size={16} /> {editingId ? 'Atualizar Artigo' : 'Publicar Agora'}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pt-32 pb-20 px-4 md:px-8 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-white mb-2">Painel de Controle</h1>
            <p className="font-mono text-sm text-text-muted">Bem-vindo de volta, {currentUser.name}.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={handleLogout}>Sair</Button>
            <Button className="gap-2" onClick={handleCreateNew}><Plus size={16} /> Nova Notícia</Button>
            <Button variant="ghost" className="gap-2 text-[10px] font-mono tracking-widest text-slate-400" onClick={() => handleEditAuthor(currentUser!)}><Edit3 size={16} /> Editar Perfil</Button>
          </div>
        </div>
        <div className="flex gap-4 mb-8 border-b border-white/5">
          <button onClick={() => setActiveTab('articles')} className={`pb-4 px-2 font-mono text-xs transition-colors relative tracking-widest ${activeTab === 'articles' ? 'text-primary' : 'text-text-muted hover:text-white'}`}>NOTÍCIAS{activeTab === 'articles' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}</button>
          {isAdmin && <button onClick={() => setActiveTab('authors')} className={`pb-4 px-2 font-mono text-xs transition-colors relative tracking-widest ${activeTab === 'authors' ? 'text-primary' : 'text-text-muted hover:text-white'}`}>AUTORES{activeTab === 'authors' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}</button>}
        </div>
        {loading ? (
          <div className="flex justify-center py-20 text-primary"><Loader2 className="animate-spin" size={32} /></div>
        ) : isAddingAuthor ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-bold text-white">{editingAuthorId ? (editingAuthorId === currentUser?.id ? 'Seu Perfil' : 'Editar Autor') : 'Novo Autor'}</h2>
              <Button variant="ghost" onClick={() => { setIsAddingAuthor(false); setEditingAuthorId(null); }} className="gap-2 text-slate-400"><ArrowLeft size={16} /> Cancelar</Button>
            </div>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 p-8 rounded-3xl border border-primary/20 shadow-2xl">
              <h4 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">{editingAuthorId ? <Edit3 size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}{editingAuthorId ? 'Configurações de Perfil' : 'Detalhes do Novo Perfil'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div><label className="block text-xs font-mono text-text-muted mb-1">NOME COMPLETO</label><input type="text" value={newAuthorName} onChange={e => setNewAuthorName(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm outline-none" placeholder="Nome" /></div>
                  <div><label className="block text-xs font-mono text-text-muted mb-1">USUÁRIO (EMAIL)</label><input type="email" value={newAuthorUser} onChange={e => setNewAuthorUser(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm outline-none" placeholder="email@portaldpe.com.br" /></div>
                  <div><label className="block text-xs font-mono text-text-muted mb-1">NOVA SENHA (OPCIONAL)</label><input type="password" value={newAuthorPass} onChange={e => setNewAuthorPass(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm outline-none" placeholder="••••••••" /></div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-text-muted mb-1">IMAGEM DE AVATAR</label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-white/10 bg-black group"><img src={newAuthorAvatar || 'https://via.placeholder.com/200'} className="w-full h-full object-cover" /><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) { setNewAuthorAvatarFile(file); setNewAuthorAvatar(URL.createObjectURL(file)); } }} /></div>
                      <input type="text" value={newAuthorAvatar} onChange={e => setNewAuthorAvatar(e.target.value)} className="flex-1 bg-black border border-white/10 rounded-xl p-2 text-white text-[10px] outline-none" placeholder="URL da imagem..." />
                    </div>
                  </div>
                  <div><label className="block text-xs font-mono text-text-muted mb-1">BIO / DESCRIÇÃO</label><textarea value={newAuthorBio} onChange={e => setNewAuthorBio(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-sm outline-none h-[104px]" /></div>
                </div>
              </div>
              <div className="mt-8 flex justify-end"><Button onClick={editingAuthorId ? handleUpdateAuthor : handleAddAuthor} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : editingAuthorId ? 'Salvar Alterações' : 'Criar Conta'}</Button></div>
            </motion.div>
          </div>
        ) : activeTab === 'articles' ? (
          <div className="rounded-3xl border border-white/5 bg-slate-900 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5"><h3 className="font-display text-lg font-bold text-white">Notícias Recentes</h3><button onClick={loadData} className="text-text-muted hover:text-white"><RefreshCw size={14} /></button></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="border-b border-white/5 bg-white/5"><th className="px-6 py-4 font-mono text-xs text-text-muted uppercase tracking-widest">TÍTULO</th><th className="px-6 py-4 font-mono text-xs text-text-muted uppercase tracking-widest">CATEGORIA</th><th className="px-6 py-4 font-mono text-xs text-text-muted uppercase tracking-widest">STATUS</th><th className="px-6 py-4 font-mono text-xs text-text-muted uppercase tracking-widest">DATA</th><th className="px-6 py-4 font-mono text-xs text-text-muted text-right tracking-widest uppercase">AÇÕES</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {articles.map((article) => (
                    <tr key={article.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4"><div className="font-medium text-white group-hover:text-primary transition-colors">{article.title}</div></td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {article.categories?.map(cat => (
                            <span key={cat} className="inline-block rounded-md bg-white/5 px-2 py-1 font-mono text-[10px] text-text-muted uppercase">{cat}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className={`inline-block rounded-md px-2 py-1 font-mono text-[10px] uppercase ${article.status === 'published' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>{article.status === 'published' ? 'Publicado' : 'Rascunho'}</span></td>
                      <td className="px-6 py-4 font-mono text-[10px] text-text-muted">{article.date}</td>
                      <td className="px-6 py-4 text-right">{(isAdmin || article.author?.id === currentUser?.id) && <div className="flex items-center justify-end gap-2"><button onClick={() => handleEdit(article)} className="rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-all"><Edit3 size={16} /></button><button onClick={() => handleDelete(article.id)} className="rounded-full p-2 text-text-muted hover:bg-red-500/20 hover:text-red-500 transition-all"><Trash2 size={16} /></button></div>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-white/10 shadow-xl">
              <div><h3 className="font-display text-xl font-bold text-white">Gerenciamento de Autores</h3><p className="text-sm text-text-muted font-mono">Total de Autores: {authors.length}</p></div>
              <Button onClick={() => setIsAddingAuthor(true)} className="gap-2"><User size={16} /> Novo Autor</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authors.map(author => (
                <div key={author.id} className="bg-slate-900 rounded-3xl border border-white/5 p-6 flex flex-col items-center text-center group hover:border-primary/30 transition-all shadow-xl">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4 ring-2 ring-primary/20"><img src={author.avatarUrl || 'https://via.placeholder.com/200'} alt={author.name} className="w-full h-full object-cover" /></div>
                  <h5 className="font-display font-bold text-white mb-1 leading-tight">{author.name}</h5>
                  <p className="font-mono text-[10px] text-primary mb-3 uppercase">{author.username}</p>
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{author.bio}</p>
                  <div className="mt-6 flex gap-2 w-full pt-6 border-t border-white/5"><Button variant="ghost" size="sm" className="flex-1 text-[10px] font-mono text-slate-400" onClick={() => handleEditAuthor(author)}>EDITAR PERFIL</Button></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};