import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Youtube from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import ResizeImage from 'tiptap-extension-resize-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Mathematics } from '@tiptap/extension-mathematics';
import Emoji from '@tiptap/extension-emoji';
import Mention from '@tiptap/extension-mention';
import { Details, DetailsSummary, DetailsContent } from '@tiptap/extension-details';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import 'katex/dist/katex.min.css';

import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Highlighter,
    Heading1, Heading2, Heading3,
    List, ListOrdered, CheckSquare,
    Quote, Terminal,
    Table as TableIcon, Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
    Sigma, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Undo, Redo,
    Plus, Minus, Trash2,
    BookOpen
} from 'lucide-react';
import { Button } from './Button';
import { uploadImage } from '../../api';

interface RichEditorProps {
    content: string;
    onChange: (html: string) => void;
    editable?: boolean;
}

const lowlight = createLowlight(common);

const MenuBar = ({ editor, onSetLink }: { editor: any, onSetLink: () => void }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    if (!editor) return null;

    const addYoutube = () => {
        const url = prompt('Enter YouTube URL');
        if (url) editor.commands.setYoutubeVideo({ src: url });
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const { url } = await uploadImage(file);
                editor.chain().focus().setImage({ src: url }).run();
            } catch (error) {
                alert('Failed to upload image');
            }
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const addMath = () => {
        const latex = prompt('Enter LaTeX formula', '\\frac{a}{b}');
        if (latex) editor.commands.insertInlineMath({ latex });
    };

    return (
        <div className="flex flex-wrap gap-1 border-b border-white/10 p-2 bg-surface/50 backdrop-blur-xl sticky top-0 z-20">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />
            <div className="flex gap-1 pr-2 border-r border-white/10 mr-1">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                    <Undo size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                    <Redo size={14} />
                </Button>
            </div>

            <div className="flex gap-1 pr-2 border-r border-white/10 mr-1">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-primary/20 text-primary' : ''}>
                    <Bold size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-primary/20 text-primary' : ''}>
                    <Italic size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-primary/20 text-primary' : ''}>
                    <UnderlineIcon size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-primary/20 text-primary' : ''}>
                    <Strikethrough size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'bg-primary/20 text-primary' : ''}>
                    <Highlighter size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'bg-primary/20 text-primary' : ''}>
                    <Code size={14} />
                </Button>
            </div>

            <div className="flex gap-1 pr-2 border-r border-white/10 mr-1">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'bg-primary/20 text-primary' : ''}>
                    <AlignLeft size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'bg-primary/20 text-primary' : ''}>
                    <AlignCenter size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'bg-primary/20 text-primary' : ''}>
                    <AlignRight size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'bg-primary/20 text-primary' : ''}>
                    <AlignJustify size={14} />
                </Button>
            </div>

            <div className="flex gap-1 pr-2 border-r border-white/10 mr-1">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-primary/20 text-primary' : ''}>
                    <Heading1 size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : ''}>
                    <Heading2 size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-primary/20 text-primary' : ''}>
                    <Heading3 size={14} />
                </Button>
            </div>

            <div className="flex gap-1 pr-2 border-r border-white/10 mr-1">
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : ''}>
                    <List size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-primary/20 text-primary' : ''}>
                    <ListOrdered size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'bg-primary/20 text-primary' : ''}>
                    <CheckSquare size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-primary/20 text-primary' : ''}>
                    <Quote size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'bg-primary/20 text-primary' : ''}>
                    <Terminal size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setDetails().run()} className={editor.isActive('details') ? 'bg-primary/20 text-primary' : ''}>
                    <BookOpen size={14} />
                </Button>
            </div>

            <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={onSetLink} className={editor.isActive('link') ? 'bg-primary/20 text-primary' : ''}>
                    <LinkIcon size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={triggerImageUpload}>
                    <ImageIcon size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={addYoutube}>
                    <YoutubeIcon size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={addMath}>
                    <Sigma size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                    <TableIcon size={14} />
                </Button>
            </div>

            {editor.isActive('table') && (
                <div className="flex gap-1 pl-2 border-l border-white/10 ml-1">
                    {/* Row Operations (Horizontal) */}
                    <Button variant="ghost" size="sm" title="Add Row" onClick={() => editor.chain().focus().addRowAfter().run()}><Minus size={14} /></Button>
                    <Button variant="ghost" size="sm" title="Delete Row" onClick={() => editor.chain().focus().deleteRow().run()} className="text-red-400"><Minus size={14} /></Button>

                    {/* Column Operations (Vertical) */}
                    <Button variant="ghost" size="sm" title="Add Column" onClick={() => editor.chain().focus().addColumnAfter().run()}><Minus size={14} className="rotate-90" /></Button>
                    <Button variant="ghost" size="sm" title="Delete Column" onClick={() => editor.chain().focus().deleteColumn().run()} className="text-red-400"><Minus size={14} className="rotate-90" /></Button>

                    <Button variant="ghost" size="sm" title="Delete Table" onClick={() => editor.chain().focus().deleteTable().run()} className="text-red-500"><Trash2 size={14} /></Button>
                </div>
            )}
        </div>
    );
};

export const RichEditor: React.FC<RichEditorProps> = ({ content, onChange, editable = true }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            // Underline and Link reported as duplicates. Removing temporarily to check stability.
            // If functionality is missing, we must re-enable or check package versions.
            // Re-enabling essentials but ignoring warnings if they persist, focusing on crash fix first.
            // Actually, let's keep Link but maybe pure default? No, let's keep them and focus on BubbleMenu crash.
            Underline,
            Link.configure({ openOnClick: false }),
            ResizeImage,
            Youtube.configure({ width: 640, height: 480 }),
            Table.configure({ resizable: true }),
            TableRow, TableHeader, TableCell,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight.configure({ multicolor: true }),
            Subscript, Superscript, CharacterCount, Typography, Color, TextStyle,
            TaskList, TaskItem.configure({ nested: true }),
            CodeBlockLowlight.configure({ lowlight }),
            Mathematics, Emoji.configure({ enableEmoticons: true }),
            Details, DetailsSummary, DetailsContent,
            Mention.configure({
                suggestion: {
                    items: ({ query }) => ['AI', 'LuxTech', 'Future', 'Quantum'].filter(i => i.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5),
                }
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: { class: 'tiptap prose prose-invert max-w-none focus:outline-none min-h-[400px] p-8' },
        },
    });

    const setLink = React.useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    // Sync content when prop changes (e.g. language switch)
    React.useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) return null;

    return (
        <div className="bg-surface/30 rounded-2xl border border-white/10 overflow-hidden shadow-2xl transition-all hover:border-white/20">
            {editable && <MenuBar editor={editor} onSetLink={setLink} />}

            {editable && editor && !editor.isDestroyed && editor.isEditable && (
                <BubbleMenu
                    editor={editor}
                    shouldShow={({ state, editor }) => {
                        return !!editor && !!editor.view && !state.selection.empty && editor.isEditable;
                    }}
                >
                    <div className="flex gap-1 bg-surface border border-white/10 p-1 rounded-lg shadow-xl backdrop-blur-md">
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-primary/20 text-primary' : ''}><Bold size={14} /></Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-primary/20 text-primary' : ''}><Italic size={14} /></Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-primary/20 text-primary' : ''}><Strikethrough size={14} /></Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive('highlight') ? 'bg-primary/20 text-primary' : ''}><Highlighter size={14} /></Button>
                        <Button variant="ghost" size="sm" onClick={setLink}><LinkIcon size={14} /></Button>
                    </div>
                </BubbleMenu>
            )}

            <EditorContent editor={editor} />

            {editable && (
                <div className="px-4 py-2 border-t border-white/5 bg-black/40 flex justify-between items-center text-[10px] text-text-muted font-mono uppercase tracking-widest">
                    <div>{editor.storage.characterCount.words()} words / {editor.storage.characterCount.characters()} characters</div>
                    <div>Rich Editor v3.0</div>
                </div>
            )}
        </div>
    );
};
