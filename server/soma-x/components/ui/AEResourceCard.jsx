import { Play, FileText, Volume2, ExternalLink, Clock, BookOpen, Info, Video as VideoIcon } from 'lucide-react';
import { useState } from 'react';
import Typography from './Typography';
import { Button } from './button';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const getAssetUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // For custom-content or local files, use the backend static serve
    return `${SERVER_URL}/content/files${encodeURI(url)}`;
};

const AEResourceCard = ({ item, onPlay, onOpenResource, isEditable, onChange, onSave, onDelete }) => {
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const hasVideo = !!item.video_url || item.type === 'video';
    const hasPdf = !!item.pdf_url || item.type === 'book' || item.type === 'pdf';
    const hasAudio = !!item.audio_url;

    const thumbnail = getAssetUrl(item.thumbnail_url) ||
        (item.video_url?.includes('youtube.com') ? `https://img.youtube.com/vi/${item.video_url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg` : '/imageFallback.png');

    if (isEditable) {
        return (
            <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[#00274c]/10 flex flex-col md:flex-row h-full md:min-h-80 relative p-2">
                {/* Left: Metadata Inputs (42%) */}
                <div className="w-full md:w-[42%] bg-slate-50 rounded-[2rem] p-8 flex flex-col gap-5 shrink-0">
                    <div className="space-y-2">
                        <Typography variant="label" className="text-[10px] text-slate-400 uppercase tracking-widest">Resource Graphics</Typography>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 bg-white border-slate-200 rounded-xl h-12 font-bold text-[10px] uppercase tracking-widest text-[#00274c] hover:bg-slate-100 transition-all border-dashed"
                                onClick={() => document.getElementById(`upload-thumb-${item.id}`).click()}
                            >
                                {item.thumbnail_url ? 'Override Thumbnail' : 'Custom Thumbnail'}
                            </Button>
                            <input
                                id={`upload-thumb-${item.id}`}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => onChange({ ...item, _uploadFile: e.target.files[0], _uploadType: 'thumbnail' })}
                            />
                        </div>
                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" /> 
                            {item.thumbnail_url ? 'Active' : 'Auto-generated on upload'}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Typography variant="label" className="text-[10px] text-slate-400 uppercase tracking-widest">Video Content</Typography>
                        <Button
                            variant="outline"
                            className="w-full bg-white border-slate-200 rounded-xl h-12 font-bold text-[10px] uppercase tracking-widest text-[#00274c] hover:bg-slate-100 transition-all border-dashed"
                            onClick={() => document.getElementById(`upload-video-${item.id}`).click()}
                        >
                            {item.video_url ? 'Change Video File' : 'Upload Video File'}
                        </Button>
                        <input
                            id={`upload-video-${item.id}`}
                            type="file"
                            className="hidden"
                            accept="video/*"
                            onChange={(e) => onChange({ ...item, _uploadFile: e.target.files[0], _uploadType: 'video' })}
                        />
                        {item.video_url && (
                            <div className="text-[9px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1">
                                <span className="h-1 w-1 bg-emerald-500 rounded-full" /> Offline Video Available
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Typography variant="label" className="text-[10px] text-slate-400 uppercase tracking-widest">PDF / Book Material</Typography>
                        <Button
                            variant="outline"
                            className="w-full bg-white border-slate-200 rounded-xl h-12 font-bold text-[10px] uppercase tracking-widest text-[#00274c] hover:bg-slate-100 transition-all border-dashed"
                            onClick={() => document.getElementById(`upload-pdf-${item.id}`).click()}
                        >
                            {item.pdf_url ? 'Change PDF Library' : 'Upload PDF Library'}
                        </Button>
                        <input
                            id={`upload-pdf-${item.id}`}
                            type="file"
                            className="hidden"
                            accept=".pdf"
                            onChange={(e) => onChange({ ...item, _uploadFile: e.target.files[0], _uploadType: 'pdf' })}
                        />
                        {item.pdf_url && (
                            <div className="text-[9px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1">
                                <span className="h-1 w-1 bg-emerald-500 rounded-full" /> Local Document Saved
                            </div>
                        )}
                    </div>

                    <div className="mt-auto flex gap-2 pt-4">
                        <Button onClick={onSave} className="flex-1 bg-[#00274c] text-white rounded-xl h-10 font-black uppercase text-[10px] tracking-widest">Save Changes</Button>
                        <Button variant="outline" onClick={onDelete} className="bg-rose-50 text-rose-500 border-rose-100 rounded-xl h-10 px-3 hover:bg-rose-500 hover:text-white transition-all"><BookOpen size={14} className="rotate-45" /></Button>
                    </div>
                </div>

                {/* Right: Content Inputs (58%) */}
                <div className="p-10 md:p-12 flex-1 flex flex-col justify-start min-w-0 bg-white">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#bf1e2e] whitespace-nowrap">Editing Mode</span>
                        <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">American English Card</span>
                    </div>

                    <div className="space-y-6 max-w-full">
                        <div className="space-y-1">
                            <Typography variant="label" className="text-[10px] text-slate-300 uppercase tracking-widest">Card Title</Typography>
                            <textarea
                                value={item.title || ''}
                                onChange={(e) => onChange({ ...item, title: e.target.value })}
                                placeholder="Enter a catchy title..."
                                className="w-full bg-transparent text-[#00274c] text-2xl lg:text-3xl font-black leading-tight tracking-tight border-none focus:ring-0 p-0 outline-none resize-none min-h-[80px]"
                            />
                        </div>

                        <div className="space-y-1">
                            <Typography variant="label" className="text-[10px] text-slate-300 uppercase tracking-widest">Short Description / Subtitle</Typography>
                            <textarea
                                value={item.description || item.subtitle || ''}
                                onChange={(e) => onChange({ ...item, description: e.target.value, subtitle: e.target.value })}
                                placeholder="Describe this resource briefly..."
                                className="w-full bg-transparent text-sm leading-relaxed font-medium opacity-60 border-none focus:ring-0 p-0 outline-none resize-none min-h-[100px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Left Side Visual Indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ffcc33]" />
            </div>
        );
    }

    return (
        <div className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col md:flex-row h-full md:h-80 relative">
            {/* Left: Visual/Thumbnail (42%) */}
            <div className="w-full md:w-[42%] relative overflow-hidden bg-slate-900 group/thumb shrink-0">
                <img
                    src={thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                {/* Media Type Indicators Overlay (Top Left) */}
                <div className="absolute top-6 left-6 flex gap-2">
                    {hasVideo && (
                        <div className="w-10 h-10 bg-rose-500/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-xl">
                            <VideoIcon size={16} />
                        </div>
                    )}
                    {hasAudio && (
                        <div className="w-10 h-10 bg-amber-500/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-xl">
                            <Volume2 size={16} />
                        </div>
                    )}
                    {hasPdf && (
                        <div className="w-10 h-10 bg-blue-500/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-xl">
                            <FileText size={16} />
                        </div>
                    )}
                </div>

                {/* Left Side Actions (Bottom Overlay) */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2 scale-95 group-hover:scale-100 transition-transform duration-500">
                    {hasVideo && (
                        <Button
                            onClick={(e) => { e.stopPropagation(); onPlay(item); }}
                            className="w-full bg-white text-[#00274c] hover:bg-[#ffcc33] hover:text-[#00274c] rounded-2xl h-12 font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 border-none"
                        >
                            <Play size={14} fill="currentColor" /> Watch Video
                        </Button>
                    )}
                    {hasPdf && (
                        <Button
                            variant="secondary"
                            onClick={(e) => { e.stopPropagation(); onOpenResource(item); }}
                            className="w-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 rounded-2xl h-12 font-black uppercase text-[10px] tracking-[0.2em] border border-white/20 shadow-xl flex items-center justify-center gap-3"
                        >
                            <BookOpen size={14} /> View Material
                        </Button>
                    )}
                </div>
            </div>

            {/* Right: Content Area (58%) */}
            <div className="p-10 md:p-12 flex-1 flex flex-col justify-start min-w-0 bg-white">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#bf1e2e] whitespace-nowrap">Course Resource</span>
                    <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">American English</span>
                </div>

                <div className="space-y-4 max-w-full overflow-hidden">
                    <div className="flex justify-between items-start gap-4">
                        <Typography variant="h2" className="text-[#00274c] text-2xl lg:text-3xl font-black leading-[1.15] tracking-tight group-hover:text-[#bf1e2e] transition-colors break-words">
                            {item.title}
                        </Typography>
                        <Button
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); setIsInfoOpen(true); }}
                            className="p-2 hover:bg-slate-100 rounded-full shrink-0 -mt-1"
                        >
                            <Info size={20} className="text-[#00274c]/40 hover:text-[#bf1e2e] transition-colors" />
                        </Button>
                    </div>

                    <Typography variant="body" color="muted" className="text-sm leading-relaxed font-medium opacity-60 line-clamp-3">
                        {item.description || item.subtitle}
                    </Typography>
                </div>

                {/* Bottom External Link (Optional) */}
                <div className="mt-auto pt-6 flex justify-end">
                    <button
                        onClick={() => hasVideo ? onPlay(item) : onOpenResource(item)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#00274c] hover:text-[#bf1e2e] transition-colors group/explore"
                    >
                        EXPLORE FULL LESSON <ExternalLink size={14} className="group-hover/explore:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Side Accent Line */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ffcc33]/20 group-hover:bg-[#ffcc33] transition-all duration-700" />

            {/* Info Modal */}
            {isInfoOpen && (
                <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsInfoOpen(false)}>
                    <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full z-10"
                            onClick={() => setIsInfoOpen(false)}
                        >
                            <BookOpen size={20} className="rotate-45 text-slate-400" />
                        </Button>

                        <div className="p-10 md:p-14 overflow-y-auto no-scrollbar">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#bf1e2e]">Resource Details</span>
                                <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                            </div>

                            <Typography variant="h2" className="text-[rgb(0,39,76)] text-3xl md:text-4xl font-black mb-8 leading-tight tracking-tight">
                                {item.title}
                            </Typography>

                            <div className="prose prose-slate max-w-none">
                                <Typography variant="body" className="text-slate-600 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                                    {item.description || item.subtitle}
                                </Typography>
                            </div>

                            <div className="mt-12 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-300 border-t pt-8">
                                <VideoIcon size={14} />
                                <span>Part of American English Library</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AEResourceCard;
