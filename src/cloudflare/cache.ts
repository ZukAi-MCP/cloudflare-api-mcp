import { Cloudflare } from "cloudflare"

export async function purgeEverything(env: Env, zoneId: string) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.cache.purge({
		zone_id: zoneId,
		purge_everything: true
	})

	return {
		content: [
			{
				type: "text",
				text: JSON.stringify(response, null, 2)
			}
		]
	}
}
