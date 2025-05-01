import Cloudflare from "cloudflare"

export async function createHyperdriveConfig(
	env: Env,
	accountId: string,
	name: string,
	origin:
		| {
				database: string
				host: string
				password: string
				port: number
				scheme: "postgres" | "postgresql"
				user: string
		  }
		| {
				access_client_id: string
				access_client_secret: string
				database: string
				host: string
				password: string
				scheme: "postgres" | "postgresql"
				user: string
		  },
	caching?: {
		disabled?: boolean
		max_age?: number
		stale_while_revalidate?: number
	}
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.hyperdrive.configs.create({
		account_id: accountId,
		name,
		origin,
		caching
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

export async function deleteHyperdriveConfig(
	env: Env,
	accountId: string,
	hyperdriveId: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.hyperdrive.configs.delete(hyperdriveId, {
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

export async function editHyperdriveConfig(
	env: Env,
	accountId: string,
	hyperdriveId: string,
	params: {
		name?: string
		caching?: {
			disabled?: boolean
			max_age?: number
			stale_while_revalidate?: number
		}
		origin?: {
			database?: string
			host?: string
			password?: string
			port?: number
			scheme?: "postgres" | "postgresql"
			user?: string
			access_client_id?: string
			access_client_secret?: string
		}
	}
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.hyperdrive.configs.edit(hyperdriveId, {
		account_id: accountId,
		...params
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

export async function getHyperdriveConfig(
	env: Env,
	accountId: string,
	hyperdriveId: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.hyperdrive.configs.get(hyperdriveId, {
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

export async function listHyperdriveConfigs(env: Env, accountId: string) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.hyperdrive.configs.list({
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
