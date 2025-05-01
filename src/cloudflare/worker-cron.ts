import Cloudflare from "cloudflare"

export async function getWorkerSchedules(
	env: Env,
	accountId: string,
	scriptName: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.workers.scripts.schedules.get(scriptName, {
		account_id: accountId
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

export async function updateWorkerSchedules(
	env: Env,
	accountId: string,
	scriptName: string,
	schedules: Array<{ cron: string }>
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.workers.scripts.schedules.update(scriptName, {
		account_id: accountId,
		body: schedules
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
