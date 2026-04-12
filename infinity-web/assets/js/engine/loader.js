/**
 * INFINITY-ENGINE: Loader
 * Handles configuration fetching and initial state.
 */
export const loadConfig = async () => {
    const paths = {
        site: 'config/site.json',
        forms: 'config/forms.json',
        scripts: 'config/scripts.json'
    };

    const results = await Promise.all(
        Object.values(paths).map(url => fetch(url).then(r => r.json()))
    );

    return {
        site: results[0],
        forms: results[1],
        scripts: results[2]
    };
};
