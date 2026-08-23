import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import YouTube from 'react-youtube';

const INITIAL_TRACKS = [
  {
    title: 'Sunflower',
    artist: 'Post Malone, Swae Lee',
    videoId: 'ApXoWvfEYVU',
  },
  {
    title: 'Am I Dreaming',
    artist: 'Metro Boomin, A$AP Rocky',
    videoId: '7aUZtDaxS60',
  },
  {
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    videoId: '34Na4j8HLjc',
  },
  {
    title: 'Sandawathiye',
    artist: 'Ridma Weerawardena, Charitha Attalage',
    videoId: 'eM61Vfiq7as',
  },
];

const YT_OPTS = {
  height: '0',
  width: '0',
  playerVars: {
    autoplay: 0,
    controls: 0,
    disablekb: 1,
    fs: 0,
    modestbranding: 1,
    rel: 0,
    playsinline: 1,
  },
};

const MusicPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [player, setPlayer] = useState(null);
  const [isTouch, setIsTouch] = useState(false);
  const [trackError, setTrackError] = useState(null);

  const progressBarRef = useRef(null);
  const playIntentRef = useRef(false);
  const skipOnErrorRef = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const currentVideoId = INITIAL_TRACKS[currentTrack].videoId;

  useEffect(() => {
    const touch =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(touch);
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-music-player', handleOpen);
    return () => window.removeEventListener('open-music-player', handleOpen);
  }, []);

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

  const goToTrack = useCallback((getNextIndex) => {
    playIntentRef.current = isPlaying || playIntentRef.current;
    skipOnErrorRef.current = false;
    setTrackError(null);
    setPlayer(null);
    setIsLoading(true);
    setProgress(0);
    setDuration(0);
    setCurrentTrack(getNextIndex);
  }, [isPlaying]);

  const nextTrack = useCallback(() => {
    goToTrack((prev) => (prev + 1) % INITIAL_TRACKS.length);
  }, [goToTrack]);

  const prevTrack = useCallback(() => {
    goToTrack((prev) => (prev - 1 + INITIAL_TRACKS.length) % INITIAL_TRACKS.length);
  }, [goToTrack]);

  const togglePlay = () => {
    if (!player) {
      playIntentRef.current = true;
      return;
    }
    if (isPlaying) {
      player.pauseVideo();
      playIntentRef.current = false;
    } else {
      playIntentRef.current = true;
      player.playVideo();
    }
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
    if (!time || Number.isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const onPlayerReady = (event) => {
    const ytPlayer = event.target;
    setPlayer(ytPlayer);
    setDuration(ytPlayer.getDuration?.() || 0);
    setIsLoading(false);
    setTrackError(null);

    if (playIntentRef.current) {
      ytPlayer.playVideo();
    }
  };

  const onPlayerStateChange = (event) => {
    const YT = window.YT;
    if (!YT) return;

    if (event.data === YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      setIsLoading(false);
      setTrackError(null);
      playIntentRef.current = false;
      setDuration(event.target.getDuration?.() || 0);
    } else if (event.data === YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === YT.PlayerState.ENDED) {
      playIntentRef.current = true;
      nextTrack();
    } else if (event.data === YT.PlayerState.BUFFERING) {
      setIsLoading(true);
    } else if (event.data === YT.PlayerState.CUED) {
      setIsLoading(false);
      if (playIntentRef.current) {
        event.target.playVideo();
      }
    }
  };

  const onPlayerError = () => {
    setIsLoading(false);
    setIsPlaying(false);

    if (!skipOnErrorRef.current) {
      skipOnErrorRef.current = true;
      setTrackError('Track unavailable — skipping…');
      playIntentRef.current = true;
      nextTrack();
      return;
    }

    setTrackError('Unable to load this track.');
    playIntentRef.current = false;
  };

  const handleClose = () => {
    if (player) {
      player.pauseVideo();
    }
    setIsPlaying(false);
    playIntentRef.current = false;
    setIsOpen(false);
    x.set(0);
    y.set(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="music-player"
          drag={!isTouch}
          dragMomentum={false}
          dragElastic={0}
          style={{ x, y }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-20 right-4 sm:right-8 z-[9999] w-[min(18rem,calc(100vw-2rem))] max-w-full bg-[#0a0a0a] max-md:backdrop-blur-none backdrop-blur-md border-2 border-[#333] font-mono shadow-[6px_6px_0px_rgba(0,0,0,0.8)] flex flex-col select-none touch-manipulation"
        >
          <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden" aria-hidden>
            <YouTube
              key={currentVideoId}
              videoId={currentVideoId}
              opts={YT_OPTS}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              onError={onPlayerError}
            />
          </div>

          <div className="flex items-center justify-between px-2 py-1.5 border-b-2 border-[#333] bg-[#111] cursor-move">
            <div className="flex items-center gap-2 text-[10px] tracking-widest text-[#aaaaaa] uppercase">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              MHOC v1.0 {isLoading && <span className="animate-pulse text-[#ff4444]">[NET]</span>}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-[#aaaaaa] hover:text-[#ff4444] transition-colors focus:outline-none p-1"
              aria-label="Close music player"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="p-3 border-b-2 border-[#333] bg-[#1a1a1a] relative overflow-hidden">
            <div className="absolute inset-0 flex items-end justify-between px-2 opacity-10 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-4 bg-[#ff4444]"
                  animate={{ height: isPlaying && !isLoading ? [10, 24, 10] : 4 }}
                  transition={{ repeat: Infinity, duration: 0.6 + i * 0.05, ease: 'linear' }}
                />
              ))}
            </div>

            <div className="relative z-10 flex flex-col gap-1 min-w-0">
              <div className="text-[10px] text-[#ff4444] uppercase font-bold tracking-widest mb-1 truncate">
                {INITIAL_TRACKS[currentTrack].artist}
              </div>

              <div className="bg-[#050505] border border-[#333] px-2 py-1 overflow-hidden relative">
                <div className="text-sm font-bold text-[#e0e0e0] truncate">
                  {INITIAL_TRACKS[currentTrack].title}
                  {isLoading ? ' (Buffering...)' : ''}
                </div>
                {trackError && (
                  <div className="text-[9px] text-[#ff4444] mt-1 truncate">{trackError}</div>
                )}
              </div>
            </div>
          </div>

          <div className="px-3 py-2 bg-[#0a0a0a] flex items-center gap-3">
            <span className="text-[9px] text-[#888888] shrink-0">{formatTime(progress)}</span>
            <div
              ref={progressBarRef}
              className="flex-1 h-2 bg-[#111] border border-[#333] cursor-pointer relative min-w-0"
              onClick={handleProgressClick}
              onKeyDown={() => {}}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={progress}
              tabIndex={0}
            >
              <div
                className="absolute top-0 left-0 h-full bg-[#ff4444]"
                style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[9px] text-[#888888] shrink-0">{formatTime(duration)}</span>
          </div>

          <div className="flex justify-between items-center px-4 py-3 bg-[#111] border-t-2 border-[#333]">
            <button type="button" onClick={prevTrack} className="p-2 text-[#888888] hover:text-[#ffffff] transition-colors active:scale-95" aria-label="Previous track">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="19 20 9 12 19 4 19 20" />
                <line x1="5" y1="19" x2="5" y2="5" />
              </svg>
            </button>

            <button
              type="button"
              onClick={togglePlay}
              disabled={isLoading && !player}
              className={`p-3 bg-[#0a0a0a] border-2 border-[#333] text-[#ff4444] hover:border-[#ff4444] transition-all active:scale-95 shadow-[2px_2px_0px_#333] ${isLoading && !player ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            <button type="button" onClick={nextTrack} className="p-2 text-[#888888] hover:text-[#ffffff] transition-colors active:scale-95" aria-label="Next track">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MusicPlayer;
