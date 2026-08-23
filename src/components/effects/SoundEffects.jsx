import { useEffect, useRef } from 'react';
import useIdle from '../../hooks/useIdle';

const SoundEffects = () => {
    const audioContextRef = useRef(null);

    useEffect(() => {
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        };

        const playClickSound = (e) => {
            // Only play on button or clickable element clicks
            const target = e.target.closest('button, a, .cursor-pointer');
            if (!target) return;

            initAudio();

            if (!audioContextRef.current) return;

            const ctx = audioContextRef.current;
            const t = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);

            gainNode.gain.setValueAtTime(0, t);
            gainNode.gain.linearRampToValueAtTime(0.08, t + 0.005);
            gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(t);
            osc.stop(t + 0.06);
        };

        window.addEventListener('click', playClickSound);
        window.addEventListener('mousedown', initAudio);

        return () => {
            window.removeEventListener('click', playClickSound);
            window.removeEventListener('mousedown', initAudio);
        };
    }, []);

    return null;
};

export default SoundEffects;
