import { Cloudflare } from "cloudflare"

export async function listZones(env: Env) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.zones.list()

	return {
		content: [
			{
				type: "text",
				text: JSON.stringify(response, null, 2)
			}
		]
	}
}
