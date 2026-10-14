'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import Biscuits from 'universal-cookie'
import { ArrowDown, ArrowUp, CalendarDays, Check, File, FileSpreadsheet, FileText, FileType2, Film, ImageIcon, Loader2, Megaphone, MoreHorizontal, Pencil, Plus, Presentation, Search, ThumbsUp, Trash2, Upload, UserRound, X } from 'lucide-react'
import { deleteObject, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import firebase from '@/app/firebase'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/app/components/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/app/components/ui/hover-card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'
import { Progress } from '@/app/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Textarea } from '@/app/components/ui/textarea'
import { Toaster } from '@/app/components/ui/sonner'
import { useToast } from '@/app/components/ui/use-toast'

const biscuits = new Biscuits()
const storage = getStorage(firebase, 'gs://anjanitek-communications.firebasestorage.app')
const ADMIN_ROLES = new Set(['GlobalAdmin', 'SuperAdmin'])
const MAX_ATTACHMENTS = 5
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024
const ATTACHMENT_TYPES = {
  jpg: { contentType: 'image/jpeg', kind: 'image' },
  jpeg: { contentType: 'image/jpeg', kind: 'image' },
  png: { contentType: 'image/png', kind: 'image' },
  webp: { contentType: 'image/webp', kind: 'image' },
  gif: { contentType: 'image/gif', kind: 'image' },
  mp4: { contentType: 'video/mp4', kind: 'video' },
  pdf: { contentType: 'application/pdf', kind: 'document' },
  doc: { contentType: 'application/msword', kind: 'document' },
  docx: { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', kind: 'document' },
  xls: { contentType: 'application/vnd.ms-excel', kind: 'document' },
  xlsx: { contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', kind: 'document' },
  ppt: { contentType: 'application/vnd.ms-powerpoint', kind: 'document' },
  pptx: { contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', kind: 'document' },
}
const ACCEPTED_ATTACHMENTS = Object.keys(ATTACHMENT_TYPES).map((extension) => `.${extension}`).join(',')

const getInitials = (name) => String(name || 'Anjani Tek').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase()
const getAttachmentUrl = (attachment) => `https://firebasestorage.googleapis.com/v0/b/anjanitek-communications.firebasestorage.app/o/${encodeURIComponent(attachment.storagePath)}?alt=media`
const formatFileSize = (value) => {
  const bytes = Number(value || 0)
  if (!bytes) return 'Attachment'
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`
}
const getAttachmentExtension = (name) => {
  const extension = String(name || '').trim().toLowerCase().split('.').pop()
  return ATTACHMENT_TYPES[extension] ? extension : null
}
const getDocumentIcon = (attachment) => {
  const extension = getAttachmentExtension(attachment.fileName)
  if (extension === 'pdf') return FileType2
  if (['xls', 'xlsx'].includes(extension)) return FileSpreadsheet
  if (['ppt', 'pptx'].includes(extension)) return Presentation
  if (['doc', 'docx'].includes(extension)) return FileText
  return File
}
const makeAttachmentId = () => `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

async function parseResponse(response) {
  const payload = await response.json()
  if (!response.ok || payload.status !== 200 || payload.success === false) throw new Error(payload.message || 'Unable to complete the Feed request')
  return payload
}

const feedUrl = (operation, suffix = '') => `/api/v2/feed/${process.env.NEXT_PUBLIC_API_PASS}/${operation}${suffix}`
const requestJson = async (url, method, body) => parseResponse(await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }))

function AttachmentImage({ attachment, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}><ImageIcon className="h-6 w-6" /></div>
  return <img src={getAttachmentUrl(attachment)} alt={attachment.fileName || 'Feed attachment'} className={className} onError={() => setFailed(true)} />
}

function DocumentAttachment({ attachment }) {
  const Icon = getDocumentIcon(attachment)
  const url = getAttachmentUrl(attachment)
  const isPdf = attachment.contentType === 'application/pdf'
  const content = <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted"><Icon className="h-5 w-5 text-muted-foreground" /></div><div className="min-w-0"><p className="truncate text-sm font-medium">{attachment.fileName}</p><p className="text-xs text-muted-foreground">{formatFileSize(attachment.fileSize)}</p></div></div>
  return <div className="flex items-center justify-between gap-2 rounded-md border bg-background p-3">{isPdf ? <Dialog><DialogTrigger asChild><Button variant="ghost" className="h-auto min-w-0 flex-1 justify-start p-0 text-left hover:bg-transparent">{content}</Button></DialogTrigger><DialogContent className="flex h-[82vh] max-w-5xl flex-col"><DialogHeader><DialogTitle className="truncate">{attachment.fileName}</DialogTitle><DialogDescription>PDF preview</DialogDescription></DialogHeader><iframe title={attachment.fileName} src={url} className="min-h-0 flex-1 rounded-md border" /><DialogFooter><Button asChild variant="outline"><a href={url} target="_blank" rel="noreferrer">Open / download</a></Button></DialogFooter></DialogContent></Dialog> : content}<Button asChild variant="ghost" size="sm" className="shrink-0"><a href={url} target="_blank" rel="noreferrer">Open</a></Button></div>
}

function AttachmentGallery({ attachments }) {
  const images = attachments.filter((attachment) => attachment.kind === 'image')
  const videos = attachments.filter((attachment) => attachment.kind === 'video')
  const documents = attachments.filter((attachment) => attachment.kind === 'document')
  if (attachments.length === 0) return null
  return <div className="mt-5 space-y-3">{images.length > 0 ? <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>{images.map((attachment) => <Dialog key={attachment.id}><DialogTrigger asChild><Button variant="ghost" className="group relative h-48 w-full overflow-hidden rounded-md border p-0 sm:h-64" aria-label={`View ${attachment.fileName}`}><AttachmentImage attachment={attachment} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" /><span className="absolute inset-0 flex items-end justify-end bg-black/20 p-3 opacity-0 transition-opacity group-hover:opacity-100"><ImageIcon className="h-5 w-5 text-white" /></span></Button></DialogTrigger><DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden p-0"><DialogHeader className="sr-only"><DialogTitle>{attachment.fileName}</DialogTitle></DialogHeader><AttachmentImage attachment={attachment} className="max-h-[92vh] w-full object-contain" /></DialogContent></Dialog>)}</div> : null}{videos.map((attachment) => <div key={attachment.id} className="overflow-hidden rounded-md border bg-black"><video controls preload="metadata" className="max-h-[520px] w-full" src={getAttachmentUrl(attachment)}><track kind="captions" /></video></div>)}{documents.length > 0 ? <div className="grid gap-2 sm:grid-cols-2">{documents.map((attachment) => <DocumentAttachment key={attachment.id} attachment={attachment} />)}</div> : null}</div>
}

function FeedPostCard({ post, currentUser, liking, onLike, onEdit, onDelete }) {
  const authorName = post.name || post.sender || 'Anjani Tek'
  const canManage = ADMIN_ROLES.has(currentUser?.role) || String(post.sender) === String(currentUser?.id)
  const likerNames = post.likerPreview?.map((liker) => liker.name).filter(Boolean) || []
  const attachments = Array.isArray(post.attachments) ? post.attachments : []
  return <Card className="w-full overflow-hidden rounded-md shadow-sm"><CardContent className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><Avatar className="h-11 w-11 border"><AvatarFallback className="bg-muted text-sm font-semibold text-foreground">{getInitials(authorName)}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate font-semibold text-foreground">{authorName}</p><p className="mt-0.5 text-xs text-muted-foreground">{post.role || 'Company update'}{Number(post.authorIsActive) !== 1 ? ' · Inactive' : ''}</p></div></div><div className="flex items-center gap-1"><Badge variant="outline" className="hidden shrink-0 border-primary/20 bg-primary/5 text-primary sm:inline-flex"><Megaphone className="mr-1 h-3 w-3" />Update</Badge>{canManage ? <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Manage post by ${authorName}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit(post)}><Pencil className="mr-2 h-4 w-4" />Edit post</DropdownMenuItem><DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(post)}><Trash2 className="mr-2 h-4 w-4" />Delete post</DropdownMenuItem></DropdownMenuContent></DropdownMenu> : null}</div></div><p className="mt-6 whitespace-pre-wrap text-base leading-7 text-foreground">{post.message}</p><AttachmentGallery attachments={attachments} /><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-4 w-4" />{dayjs(post.sentAt).format('DD MMM YYYY, h:mm A')}{post.modifiedOn ? ' · Edited' : ''}</div><HoverCard openDelay={150}><HoverCardTrigger asChild><Button variant={post.likedByCurrentUser ? 'secondary' : 'ghost'} size="sm" disabled={liking} onClick={() => onLike(post)} className={post.likedByCurrentUser ? 'text-primary' : ''}>{liking ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ThumbsUp className={`mr-1.5 h-4 w-4 ${post.likedByCurrentUser ? 'fill-current' : ''}`} />}{post.likedByCurrentUser ? 'Liked' : 'Like'}{Number(post.likeCount || 0) > 0 ? ` · ${post.likeCount}` : ''}</Button></HoverCardTrigger>{Number(post.likeCount || 0) > 0 ? <HoverCardContent className="w-64 text-sm"><p className="font-medium">{post.likeCount} {post.likeCount === 1 ? 'Like' : 'Likes'}</p><p className="mt-1 text-muted-foreground">{likerNames.length ? `${likerNames.join(', ')}${post.likeCount > likerNames.length ? ' and others' : ''}` : 'Liked by workspace users'}</p></HoverCardContent> : null}</HoverCard></div></CardContent></Card>
}

function FeedSkeletons() { return <div className="space-y-4"><Skeleton className="h-[290px] w-full rounded-md" /><Skeleton className="h-[290px] w-full rounded-md" /></div> }

export default function FeedPage() {
  const { toast } = useToast()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [authors, setAuthors] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({ search: '', authorId: '', fromDate: '', toDate: '', media: 'all' })
  const [nextCursor, setNextCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [authorPickerOpen, setAuthorPickerOpen] = useState(false)
  const [composerOpen, setComposerOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [editorMessage, setEditorMessage] = useState('')
  const [editorAttachments, setEditorAttachments] = useState([])
  const [savingPost, setSavingPost] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [deletingPost, setDeletingPost] = useState(null)
  const [likingPostId, setLikingPostId] = useState(null)
  const requestRef = useRef(null)
  const requestVersionRef = useRef(0)
  const sentinelRef = useRef(null)
  const postsRef = useRef([])
  const isPublisher = ADMIN_ROLES.has(user?.role)
  const selectedAuthor = authors.find((author) => String(author.id) === String(filters.authorId))
  const filterKey = useMemo(() => JSON.stringify(filters), [filters])

  useEffect(() => { const cookieValue = biscuits.get('sc_user_detail'); if (!cookieValue) return; try { setUser(JSON.parse(decodeURIComponent(cookieValue))) } catch { toast({ description: 'Your session could not be read. Please sign in again.' }) } }, [toast])
  useEffect(() => { const timer = setTimeout(() => setFilters((current) => current.search === searchInput.trim() ? current : { ...current, search: searchInput.trim() }), 300); return () => clearTimeout(timer) }, [searchInput])
  useEffect(() => { postsRef.current = posts }, [posts])

  const loadAuthors = useCallback(async () => { if (!user?.id) return; try { const result = await parseResponse(await fetch(feedUrl('U8', `/${encodeURIComponent(user.id)}`))); setAuthors(Array.isArray(result.data) ? result.data : []) } catch (error) { toast({ description: error.message || 'Unable to load Feed authors' }) } }, [toast, user?.id])
  const loadPosts = useCallback(async ({ reset = false, cursor = '' } = {}) => { if (!user?.id) return; const version = requestVersionRef.current + 1; requestVersionRef.current = version; requestRef.current?.abort(); const controller = new AbortController(); requestRef.current = controller; if (reset) { setNextCursor(null); setHasMore(true); setLoadError(''); postsRef.current.length === 0 ? setInitialLoading(true) : setRefreshing(true) } else setLoadingMore(true); try { const query = new URLSearchParams({ actorId: user.id, limit: '15' }); if (filters.search) query.set('search', filters.search); if (filters.authorId) query.set('authorId', filters.authorId); if (filters.fromDate) query.set('fromDate', filters.fromDate); if (filters.toDate) query.set('toDate', filters.toDate); if (filters.media !== 'all') query.set('media', filters.media); if (cursor) query.set('cursor', cursor); const result = await parseResponse(await fetch(`${feedUrl('U7', `/${encodeURIComponent(user.id)}`)}?${query}`, { signal: controller.signal })); if (controller.signal.aborted || version !== requestVersionRef.current) return; const incoming = Array.isArray(result.data) ? result.data : []; setPosts((current) => reset ? incoming : [...current, ...incoming.filter((post) => !current.some((item) => String(item.id) === String(post.id)))]); setNextCursor(result.nextCursor || null); setHasMore(Boolean(result.hasMore)) } catch (error) { if (error.name !== 'AbortError' && !controller.signal.aborted) setLoadError(error.message || 'Unable to load Feed posts') } finally { if (version === requestVersionRef.current) { setInitialLoading(false); setRefreshing(false); setLoadingMore(false) } } }, [filters, user?.id])
  useEffect(() => { if (user?.id) loadAuthors() }, [loadAuthors, user?.id])
  useEffect(() => { if (!user?.id) return; loadPosts({ reset: true }); return () => requestRef.current?.abort() }, [filterKey, loadPosts, user?.id])
  useEffect(() => { const node = sentinelRef.current; if (!node || !hasMore || initialLoading || refreshing || loadingMore || !nextCursor) return; const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadPosts({ cursor: nextCursor }) }, { rootMargin: '320px' }); observer.observe(node); return () => observer.disconnect() }, [hasMore, initialLoading, loadPosts, loadingMore, nextCursor, refreshing])

  const updateFilters = (values) => setFilters((current) => ({ ...current, ...values }))
  const clearFilters = () => { setSearchInput(''); setFilters({ search: '', authorId: '', fromDate: '', toDate: '', media: 'all' }) }
  const cleanupPreviews = (attachments) => attachments.forEach((attachment) => { if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl) })
  const closeComposer = (force = false) => { if (savingPost && !force) return; cleanupPreviews(editorAttachments); setComposerOpen(false); setEditingPost(null); setEditorMessage(''); setEditorAttachments([]); setUploadProgress({}) }
  const openCreate = () => { cleanupPreviews(editorAttachments); setEditingPost(null); setEditorMessage(''); setEditorAttachments([]); setUploadProgress({}); setComposerOpen(true) }
  const openEdit = (post) => { cleanupPreviews(editorAttachments); setEditingPost(post); setEditorMessage(post.message || ''); setEditorAttachments((post.attachments || []).map((attachment) => ({ ...attachment, clientId: String(attachment.id), existing: true }))); setUploadProgress({}); setComposerOpen(true) }

  function addAttachments(files) { const accepted = []; for (const file of files) { const extension = getAttachmentExtension(file.name); if (!extension) { toast({ description: `${file.name} is not a supported Feed attachment.` }); continue } if (file.size < 1 || file.size > MAX_ATTACHMENT_BYTES) { toast({ description: `${file.name} must be smaller than 25 MB.` }); continue } const spec = ATTACHMENT_TYPES[extension]; accepted.push({ clientId: makeAttachmentId(), file, fileName: file.name, contentType: spec.contentType, fileSize: file.size, kind: spec.kind, extension, previewUrl: spec.kind === 'image' ? URL.createObjectURL(file) : null, existing: false }) } setEditorAttachments((current) => { const available = MAX_ATTACHMENTS - current.length; const allowed = accepted.slice(0, Math.max(0, available)); if (accepted.length > allowed.length) { cleanupPreviews(accepted.slice(available)); toast({ description: 'A Feed post can have up to five attachments.' }) } return [...current, ...allowed] }) }
  const removeEditorAttachment = (clientId) => setEditorAttachments((current) => { const attachment = current.find((item) => item.clientId === clientId); if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl); return current.filter((item) => item.clientId !== clientId) })
  const moveEditorAttachment = (clientId, direction) => setEditorAttachments((current) => { const index = current.findIndex((item) => item.clientId === clientId); const target = index + direction; if (index < 0 || target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next })
  const removeStoragePaths = async (paths) => { const results = await Promise.all((paths || []).filter(Boolean).map(async (path) => { try { await deleteObject(ref(storage, path)); return true } catch { return false } })); return results.every(Boolean) }

  async function uploadQueuedAttachments() { const newAttachments = editorAttachments.filter((attachment) => !attachment.existing); if (newAttachments.length === 0) return []; const draftId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; const uploaded = []; for (const attachment of newAttachments) { const objectName = `${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 8)}.${attachment.extension}`; const storagePath = `feed/${draftId}/${objectName}`; const task = uploadBytesResumable(ref(storage, storagePath), attachment.file, { contentType: attachment.contentType }); await new Promise((resolve, reject) => task.on('state_changed', (snapshot) => setUploadProgress((current) => ({ ...current, [attachment.clientId]: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) })), reject, resolve)); uploaded.push({ clientId: attachment.clientId, storagePath, fileName: attachment.fileName, contentType: attachment.contentType, fileSize: attachment.fileSize, kind: attachment.kind }) } return uploaded }
  async function savePost() { const message = editorMessage.trim(); if (!message) { toast({ description: 'Enter a message before publishing the post' }); return } setSavingPost(true); let uploaded = []; try { uploaded = await uploadQueuedAttachments(); const uploadedById = new Map(uploaded.map((attachment) => [attachment.clientId, attachment])); const legacyWasPresent = Boolean(editingPost?.attachments?.some((attachment) => attachment.legacy)); const legacyKept = editorAttachments.some((attachment) => attachment.legacy); const attachments = editorAttachments.filter((attachment) => !attachment.legacy).map((attachment) => attachment.existing ? { id: attachment.id } : uploadedById.get(attachment.clientId)); if (attachments.some((attachment) => !attachment)) throw new Error('One or more attachments could not be uploaded'); const payload = { actorId: user.id, message, attachments, removeLegacyMedia: legacyWasPresent && !legacyKept }; const result = editingPost ? await requestJson(feedUrl('U10', `/${editingPost.id}`), 'PATCH', payload) : await requestJson(feedUrl('U9'), 'POST', payload); const { cleanupStoragePaths = [], ...post } = result.data; if (editingPost) { setPosts((current) => current.map((item) => String(item.id) === String(editingPost.id) ? post : item)); if (!await removeStoragePaths(cleanupStoragePaths)) toast({ description: 'The post was updated, but one or more removed files could not be deleted from storage.' }); else toast({ description: 'Feed post updated' }) } else { setPosts((current) => [post, ...current]); toast({ description: 'Feed post published' }) } closeComposer(true) } catch (error) { if (uploaded.length > 0) await removeStoragePaths(uploaded.map((attachment) => attachment.storagePath)); toast({ description: error.message || 'Unable to save Feed post' }) } finally { setSavingPost(false) } }
  async function handleLike(post) { if (!user?.id || likingPostId) return; const previous = { likedByCurrentUser: post.likedByCurrentUser, likeCount: Number(post.likeCount || 0) }; const nextLiked = !previous.likedByCurrentUser; setLikingPostId(post.id); setPosts((current) => current.map((item) => String(item.id) === String(post.id) ? { ...item, likedByCurrentUser: nextLiked, likeCount: Math.max(0, previous.likeCount + (nextLiked ? 1 : -1)) } : item)); try { const result = await requestJson(feedUrl('U12', `/${post.id}`), 'PUT', { actorId: user.id }); setPosts((current) => current.map((item) => String(item.id) === String(post.id) ? { ...item, likedByCurrentUser: result.data.liked, likeCount: result.data.likeCount } : item)) } catch (error) { setPosts((current) => current.map((item) => String(item.id) === String(post.id) ? { ...item, ...previous } : item)); toast({ description: error.message || 'Unable to update Like' }) } finally { setLikingPostId(null) } }
  async function confirmDelete() { if (!deletingPost || !user?.id) return; try { const result = await requestJson(feedUrl('U11', `/${deletingPost.id}`), 'DELETE', { actorId: user.id }); setPosts((current) => current.filter((post) => String(post.id) !== String(deletingPost.id))); if (!await removeStoragePaths(result.data?.storagePaths)) toast({ description: 'The post was deleted, but one or more files could not be deleted from storage.' }); else toast({ description: 'Feed post deleted' }); setDeletingPost(null) } catch (error) { toast({ description: error.message || 'Unable to delete Feed post' }) } }

  const uploadValues = Object.values(uploadProgress)
  const uploadPercent = uploadValues.length ? Math.round(uploadValues.reduce((total, value) => total + value, 0) / uploadValues.length) : 0
  return <div className="flex w-full min-w-0 flex-col gap-5 pb-8"><div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"><div className="flex items-center gap-3"><Megaphone className="h-5 w-5" /><h1 className="text-xl font-bold">Feed</h1></div>{isPublisher ? <Button onClick={openCreate} className="bg-green-600 text-white hover:bg-green-700"><Plus className="mr-2 h-4 w-4" />Post update</Button> : null}</div><Card className="shadow-none"><CardContent className="flex flex-wrap items-end gap-3 p-4"><div className="relative min-w-[220px] flex-1"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search updates or authors..." className="pl-9" /></div><Popover open={authorPickerOpen} onOpenChange={setAuthorPickerOpen}><PopoverTrigger asChild><Button variant="outline" className="w-full justify-between sm:w-[220px]"><span className="flex min-w-0 items-center gap-2"><UserRound className="h-4 w-4 text-muted-foreground" /><span className="truncate">{selectedAuthor?.name || 'All authors'}</span></span></Button></PopoverTrigger><PopoverContent className="w-[280px] p-0" align="start"><Command><CommandInput placeholder="Search authors..." /><CommandList><CommandEmpty>No post authors found.</CommandEmpty><CommandGroup><CommandItem value="all-authors" onSelect={() => { updateFilters({ authorId: '' }); setAuthorPickerOpen(false) }}><Check className={`mr-2 h-4 w-4 ${filters.authorId ? 'opacity-0' : 'opacity-100'}`} />All authors</CommandItem>{authors.map((author) => <CommandItem key={author.id} value={`${author.name || ''} ${author.id}`} onSelect={() => { updateFilters({ authorId: author.id }); setAuthorPickerOpen(false) }}><Check className={`mr-2 h-4 w-4 ${String(filters.authorId) === String(author.id) ? 'opacity-100' : 'opacity-0'}`} /><span className="truncate">{author.name || author.id}</span></CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover><div className="flex items-end gap-2"><div className="space-y-1"><Label htmlFor="feed-from" className="text-xs text-muted-foreground">From</Label><Input id="feed-from" type="date" value={filters.fromDate} max={filters.toDate || undefined} onChange={(event) => updateFilters({ fromDate: event.target.value })} className="w-[148px]" /></div><div className="space-y-1"><Label htmlFor="feed-to" className="text-xs text-muted-foreground">To</Label><Input id="feed-to" type="date" value={filters.toDate} min={filters.fromDate || undefined} onChange={(event) => updateFilters({ toDate: event.target.value })} className="w-[148px]" /></div></div><Select value={filters.media} onValueChange={(value) => updateFilters({ media: value })}><SelectTrigger className="w-full sm:w-[170px]"><SelectValue placeholder="Attachments" /></SelectTrigger><SelectContent><SelectItem value="all">All posts</SelectItem><SelectItem value="with-media">With attachments</SelectItem><SelectItem value="text-only">Text only</SelectItem></SelectContent></Select><Button variant="ghost" size="icon" onClick={clearFilters} aria-label="Clear Feed filters" title="Clear filters"><X className="h-4 w-4" /></Button></CardContent></Card>{refreshing ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Updating results...</div> : null}{initialLoading ? <FeedSkeletons /> : null}{!initialLoading && loadError ? <Card className="border-destructive/30 shadow-none"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-5"><p className="text-sm text-destructive">{loadError}</p><Button variant="outline" size="sm" onClick={() => loadPosts({ reset: true })}>Retry</Button></CardContent></Card> : null}{!initialLoading && !loadError && posts.length === 0 ? <Card className="border-dashed shadow-none"><CardContent className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center"><Megaphone className="h-7 w-7 text-muted-foreground" /><p className="font-medium">No posts match these filters.</p><Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button></CardContent></Card> : null}{!initialLoading && posts.length > 0 ? <div className="flex w-full flex-col gap-4">{posts.map((post) => <FeedPostCard key={post.id} post={post} currentUser={user} liking={likingPostId === post.id} onLike={handleLike} onEdit={openEdit} onDelete={setDeletingPost} />)}</div> : null}<div ref={sentinelRef} className="flex min-h-[48px] items-center justify-center">{loadingMore ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading older posts...</div> : (!initialLoading && posts.length > 0 && !hasMore ? <p className="text-sm text-muted-foreground">You&apos;ve reached the end of the Feed.</p> : null)}</div><Dialog open={composerOpen} onOpenChange={(open) => { if (open) setComposerOpen(true); else closeComposer() }}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{editingPost ? 'Edit post' : 'Post update'}</DialogTitle><DialogDescription>{editingPost ? 'Update the announcement and manage its attachments.' : 'Publish a workspace-wide announcement with up to five attachments.'}</DialogDescription></DialogHeader><div className="space-y-5 py-2"><div className="space-y-2"><Label htmlFor="feed-message">Message</Label><Textarea id="feed-message" value={editorMessage} onChange={(event) => setEditorMessage(event.target.value)} placeholder="Write an update..." maxLength={2000} rows={7} /><p className="text-right text-xs text-muted-foreground">{editorMessage.length}/2000</p></div><div className="space-y-2"><div className="flex flex-wrap items-center justify-between gap-2"><Label htmlFor="feed-attachments">Attachments</Label><span className="text-xs text-muted-foreground">{editorAttachments.length}/{MAX_ATTACHMENTS} · 25 MB each</span></div><Input id="feed-attachments" type="file" multiple accept={ACCEPTED_ATTACHMENTS} onChange={(event) => { addAttachments(Array.from(event.target.files || [])); event.target.value = '' }} disabled={savingPost || editorAttachments.length >= MAX_ATTACHMENTS} />{editorAttachments.length > 0 ? <div className="space-y-2">{editorAttachments.map((attachment, index) => { const Icon = attachment.kind === 'image' ? ImageIcon : attachment.kind === 'video' ? Film : getDocumentIcon(attachment); const progress = uploadProgress[attachment.clientId]; return <div key={attachment.clientId} className="rounded-md border p-3"><div className="flex min-w-0 items-center gap-3">{attachment.previewUrl ? <img src={attachment.previewUrl} alt="" className="h-10 w-10 shrink-0 rounded object-cover" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted"><Icon className="h-5 w-5 text-muted-foreground" /></div>}<div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{attachment.fileName}</p><p className="text-xs text-muted-foreground">{attachment.kind} · {formatFileSize(attachment.fileSize)}</p></div><div className="flex shrink-0 items-center"><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={savingPost || index === 0} onClick={() => moveEditorAttachment(attachment.clientId, -1)} aria-label="Move attachment earlier" title="Move earlier"><ArrowUp className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={savingPost || index === editorAttachments.length - 1} onClick={() => moveEditorAttachment(attachment.clientId, 1)} aria-label="Move attachment later" title="Move later"><ArrowDown className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={savingPost} onClick={() => removeEditorAttachment(attachment.clientId)} aria-label={`Remove ${attachment.fileName}`} title="Remove attachment"><Trash2 className="h-4 w-4" /></Button></div></div>{typeof progress === 'number' ? <Progress className="mt-3 h-1.5" value={progress} /> : null}</div> })}</div> : <div className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground"><Upload className="mx-auto mb-2 h-5 w-5" />Add images, MP4 videos, PDFs, or Office files.</div>}</div>{savingPost && uploadValues.length > 0 ? <div className="space-y-2 rounded-md bg-muted/50 p-3"><div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Uploading attachments...</span><span>{uploadPercent}%</span></div><Progress value={uploadPercent} className="h-1.5" /></div> : null}</div><DialogFooter><Button variant="outline" onClick={closeComposer} disabled={savingPost}>Cancel</Button><Button onClick={savePost} disabled={savingPost || !editorMessage.trim()}>{savingPost ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{editingPost ? 'Save changes' : 'Publish update'}</Button></DialogFooter></DialogContent></Dialog><AlertDialog open={Boolean(deletingPost)} onOpenChange={(open) => { if (!open) setDeletingPost(null) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this post?</AlertDialogTitle><AlertDialogDescription>This permanently removes the post, all attachments, and its Likes. This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>Delete post</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><Toaster /></div>
}
