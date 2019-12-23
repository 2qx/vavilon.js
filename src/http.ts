/**
 * Performs a GET HTTP request and optionally executes a callback
 *
 * @param url - URL of the JSON resource
 *
 * @param callback - an optional callback to execute after the request is successful. The response text is given as a parameter
 */
export function get(url: string, callback?: Function): void {
    fetch(url).then((response: Response) => {
        return response.json()
    }).then( (data: { [id: string]: string }) => {
        callback(data)
    });
}
