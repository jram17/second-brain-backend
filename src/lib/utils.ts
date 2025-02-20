import mql,{HTTPResponseRaw} from "@microlink/mql";

export function random(len: number) {
    let options = "qwertyuioasdfghjklzxcvbnm12345678";
    let length = options.length;

    let ans = "";

    for (let i = 0; i < len; i++) {
        ans += options[Math.floor((Math.random() * length))] 
    }

    return ans;
}


export async function fetchMetadata(url: string) {
    try {
        const response: HTTPResponseRaw = await mql(url);
        console.log(response);
        // @ts-ignore
        const { data } = response;
        return data;
    } catch (error) {
        console.error('Error fetching metadata:', error);
        throw error;
    }
}
export function getMainUrl(fullUrl:string) {
    try {
        const url = new URL(fullUrl);
        return url.origin;
    } catch (error) {
        console.error("Invalid URL:", error);
        return null;
    }
}