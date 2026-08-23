import { useState, useEffect } from 'react';

/**
 * Custom hook to detect user inactivity.
 * @param {number} timeoutMillis - Time in milliseconds before the user is considered idle.
 * @returns {boolean} - True if the user is idle, false otherwise.
 */
const useIdle = (timeoutMillis = 3000) => {
    const [isIdle, setIsIdle] = useState(true);

    useEffect(() => {
        let timeoutId;

        const handleActivity = () => {
            setIsIdle(false);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsIdle(true);
            }, timeoutMillis);
        };

        // Attach event listeners for user activity
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('touchstart', handleActivity);

        // Remove initial handleActivity() call to keep it hidden until actual interaction
        // handleActivity();

        // Cleanup
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
        };
    }, [timeoutMillis]);

    return isIdle;
};

export default useIdle;
