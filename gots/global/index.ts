import type { GotModule } from "../../classes/got.js";

const globalGot: GotModule = {
    name: "Global",
    optionsType: "object",
    options: {
        headers: {
            "accept": "*/*",
            "accept-language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "application/json",
            "sec-ch-ua": "\"Google Chrome\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
        },
        timeout: { request: 30000 },
    },
    parent: null,
    description: "Base HTTP client with common browser headers",
};

export default globalGot;
