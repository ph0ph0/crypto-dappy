import {useEffect, useRef} from 'react'

export const usePolling = (callback, delay) => {
    const savedCallback = useRef()

    // Remember the latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback])

    useEffect(() => {
        const tick = () => {
            savedCallback.current()
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => {
                clearInterval(id)
            }
        }
    }, [callback, delay]);

}