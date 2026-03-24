export const State = {
    set: (key, value) => {
        localStorage.setItem(`infinity_${key}`, JSON.stringify(value));
    },
    get: (key) => {
        const val = localStorage.getItem(`infinity_${key}`);
        return val ? JSON.parse(val) : null;
    },
    clear: (key) => {
        localStorage.removeItem(`infinity_${key}`);
    }
};
