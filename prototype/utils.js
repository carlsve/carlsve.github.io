window.cachedFetch = {}

async function cacheFetch(url) {
    if (window.cachedFetch[url]) {
        return window.cachedFetch[url]
    }

    const response = await fetch(url)

    if (response.status !== 200) {
        throw new Error(response)
    }

    const result = await response.json()

    window.cachedFetch[url] = result

    return result
}
