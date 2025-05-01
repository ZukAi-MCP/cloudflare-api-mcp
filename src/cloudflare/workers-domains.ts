import Cloudflare from "cloudflare"

export async function deleteDomain(
	env: Env,
	accountId: string,
	domainId: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.workers.domains.delete(domainId, {
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

export async function getDomain(env: Env, accountId: string, domainId: string) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.workers.domains.get(domainId, {
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

export async function listDomains(
	env: Env,
	accountId: string,
	environment?: string,
	hostname?: string,
	service?: string,
	zoneId?: string,
	zoneName?: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.workers.domains.list({
		account_id: accountId,
		environment,
		hostname,
		service,
		zone_id: zoneId,
		zone_name: zoneName
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

export async function updateDomain(
	env: Env,
	accountId: string,
	environment: string,
	hostname: string,
	service: string,
	zoneId: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.workers.domains.update({
		account_id: accountId,
		environment,
		hostname,
		service,
		zone_id: zoneId
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
