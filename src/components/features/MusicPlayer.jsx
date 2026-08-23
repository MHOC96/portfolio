import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import YouTube from 'react-youtube';

const INITIAL_TRACKS = [
  {
    title: "Sunflower",
    artist: "Post Malone, Swae Lee",
    videoId: "ApXoWvfEYVU" // YouTube Video ID
  },
  {
    title: "Am I Dreaming",
    artist: "Metro Boomin, A$AP Rocky",
    videoId: "jXpdO2R6TXY"
  },
  {
    title: "Starboy",
    artist: "The Weeknd, Daft Punk",
    videoId: "34Na4j8HLjc"
  }
];

const MusicPlayer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [player, setPlayer] = useState(null);
    
    const progressBarRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Listen for custom event to open player
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-music-player', handleOpen);
        return () => window.removeEventListener('open-music-player', handleOpen);
    }, []);

    // Update progress bar
    useEffect(() => {
        let interval;
        if (isPlaying && player) {
            interval = setInterval(() => {
                if (player.getCurrentTime && player.getDuration) {
                    setProgress(player.getCurrentTime() || 0);
                    setDuration(player.getDuration() || 0);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, player]);

    const togglePlay = () => {
        if (player) {
            if (isPlaying) {
                player.pauseVideo();
                setIsPlaying(false);
            } else {
                player.playVideo();
                setIsPlaying(true);
            }
        }
    };

    const nextTrack = () => {
        setIsLoading(true);
        setProgress(0);
        setIsPlaying(true);
        setCurrentTrack((prev) => (prev + 1) % INITIAL_TRACKS.length);
    };

    const prevTrack = () => {
        setIsLoading(true);
        setProgress(0);
        setIsPlaying(true);
        setCurrentTrack((prev) => (prev - 1 + INITIAL_TRACKS.length) % INITIAL_TRACKS.length);
    };

    const handleProgressClick = (e) => {
        if (progressBarRef.current && player && duration > 0) {
            const rect = progressBarRef.current.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const newTime = pos * duration;
            player.seekTo(newTime, true);
            setProgress(newTime);
        }
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "00:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const onPlayerReady = (event) => {
        setPlayer(event.target);
        if (event.target.getDuration) {
            setDuration(event.target.getDuration());
        }
        setIsLoading(false);
        // Play if intended (e.g. track changed while playing)
        if (isPlaying) {
            event.target.playVideo();
        }
    };

    const onPlayerStateChange = (event) => {
        // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0, BUFFERING = 3, CUED = 5
        if (event.data === 1) { // PLAYING
            setIsPlaying(true);
            setIsLoading(false);
            if (event.target.getDuration) {
                setDuration(event.target.getDuration());
            }
        } else if (event.data === 2) { // PAUSED
            // Only update playing state if the user manually paused it, otherwise it could be buffering pause
            setIsPlaying(false);
        } else if (event.data === 0) { // ENDED
            nextTrack();
        } else if (event.data === 3) { // BUFFERING
            setIsLoading(true);
        } else if (event.data === 5) { // CUED
            // If we changed tracks while playing, autoplay the next one once cued
            if (isPlaying) {
                event.target.playVideo();
            } else {
                setIsLoading(false);
            }
        }
    };

    const ytOptions = {
        height: '0',
        width: '0',
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0
        },
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                drag
                dragMomentum={false}
                style={{ x, y, position: 'fixed' }}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bottom-20 right-8 z-[9999] w-72 bg-[#0a0a0a] backdrop-blur-md border-2 border-[#333] font-mono shadow-[6px_6px_0px_rgba(0,0,0,0.8)] flex flex-col select-none"
            >
                {/* Hidden YouTube Player */}
                <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
                    <YouTube 
                        videoId={INITIAL_TRACKS[currentTrack].videoId} 
                        opts={ytOptions} 
                        onReady={onPlayerReady} 
                        onStateChange={onPlayerStateChange}
                        onError={() => {
                            console.error("YouTube Player Error");
                            nextTrack(); // skip to next if error (like region block)
                        }}
                    />
                </div>

                {/* Header (Drag Handle) */}
                <div className="flex items-center justify-between px-2 py-1.5 border-b-2 border-[#333] bg-[#111] cursor-move">
                    <div className="flex items-center gap-2 text-[10px] tracking-widest text-[#aaaaaa] uppercase">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                        YASHAMP v1.0 {isLoading && <span className="animate-pulse text-[#ff4444]">[NET]</span>}
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-[#aaaaaa] hover:text-[#ff4444] transition-colors focus:outline-none"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Main Player Display */}
                <div className="p-3 border-b-2 border-[#333] bg-[#1a1a1a] relative overflow-hidden">
                    {/* Visualizer Background */}
                    <div className="absolute inset-0 flex items-end justify-between px-2 opacity-10 pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                            <motion.div 
                                key={i}
                                className="w-4 bg-[#ff4444]"
                                animate={{ height: isPlaying && !isLoading ? [10, Math.random() * 40 + 10, 10] : 4 }}
                                transition={{ repeat: Infinity, duration: 0.5 + Math.random(), ease: "linear" }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 flex flex-col gap-1">
                        <div className="text-[10px] text-[#ff4444] uppercase font-bold tracking-widest mb-1 truncate">
                            {INITIAL_TRACKS[currentTrack].artist}
                        </div>
                        
                        {/* Marquee for title */}
                        <div className="bg-[#050505] border border-[#333] px-2 py-1 overflow-hidden relative">
                            <motion.div 
                                animate={{ x: isPlaying && !isLoading ? ["100%", "-100%"] : 0 }}
                                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                className="text-sm font-bold text-[#e0e0e0] whitespace-nowrap"
                            >
                                {INITIAL_TRACKS[currentTrack].title} {isLoading ? "(Buffering...)" : ""}
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar & Time */}
                <div className="px-3 py-2 bg-[#0a0a0a] flex items-center gap-3">
                    <span className="text-[9px] text-[#888888]">{formatTime(progress)}</span>
                    <div 
                        ref={progressBarRef}
                        className="flex-1 h-2 bg-[#111] border border-[#333] cursor-pointer relative"
                        onClick={handleProgressClick}
                    >
                        <div 
                            className="absolute top-0 left-0 h-full bg-[#ff4444]"
                            style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
                        />
                    </div>
                    <span className="text-[9px] text-[#888888]">{formatTime(duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center px-4 py-3 bg-[#111] border-t-2 border-[#333]">
                    <button onClick={prevTrack} className="p-2 text-[#888888] hover:text-[#ffffff] transition-colors active:scale-95">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
                    </button>
                    
                    <button 
                        onClick={togglePlay} 
                        disabled={isLoading && !player}
                        className={`p-3 bg-[#0a0a0a] border-2 border-[#333] text-[#ff4444] hover:border-[#ff4444] transition-all active:scale-95 shadow-[2px_2px_0px_#333] ${isLoading && !player ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isPlaying ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        )}
                    </button>

                    <button onClick={nextTrack} className="p-2 text-[#888888] hover:text-[#ffffff] transition-colors active:scale-95">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MusicPlayer;
