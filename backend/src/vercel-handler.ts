import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "./app.js";
import { bootstrap } from "./bootstrap.js";

const appPromise = (async () => {
	await bootstrap();
	return createApp();
})();

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
	const app = await appPromise;
	app(req as never, res as never);
}
