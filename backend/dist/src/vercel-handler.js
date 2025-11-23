import { createApp } from "./app.js";
import { bootstrap } from "./bootstrap.js";
const appPromise = (async () => {
    await bootstrap();
    return createApp();
})();
export default async function handler(req, res) {
    const app = await appPromise;
    app(req, res);
}
//# sourceMappingURL=vercel-handler.js.map