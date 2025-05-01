import Cloudflare from "cloudflare"

// Namespace functions

export async function createNamespace(
	env: Env,
	accountId: string,
	title: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.kv.namespaces.create({
		account_id: accountId,
		title
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

export async function updateNamespace(
	env: Env,
	accountId: string,
	namespaceId: string,
	title: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.kv.namespaces.update(namespaceId, {
		account_id: accountId,
		title
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

export async function listNamespaces(
	env: Env,
	accountId: string,
	order?: "id" | "title",
	direction?: "asc" | "desc"
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.kv.namespaces.list({
		account_id: accountId,
		order,
		direction
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

export async function deleteNamespace(
	env: Env,
	accountId: string,
	namespaceId: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.kv.namespaces.delete(namespaceId, {
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

export async function getNamespace(
	env: Env,
	accountId: string,
	namespaceId: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.kv.namespaces.get(namespaceId, {
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

export async function bulkDeleteKeys(
	env: Env,
	accountId: string,
	namespaceId: string,
	keys: string[]
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.kv.namespaces.bulkDelete(namespaceId, {
		account_id: accountId,
		body: keys
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

export async function bulkUpdateKeys(
	env: Env,
	accountId: string,
	namespaceId: string,
	keyValues: Array<{
		key: string
		value: string
		expiration?: number
		expiration_ttl?: number
		base64?: boolean
		metadata?: Record<string, unknown>
	}>
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.kv.namespaces.bulkUpdate(namespaceId, {
		account_id: accountId,
		body: keyValues
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

// Keys functions

export async function listKeys(
	env: Env,
	accountId: string,
	namespaceId: string,
	prefix?: string,
	cursor?: string,
	limit?: number
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.kv.namespaces.keys.list(namespaceId, {
		account_id: accountId,
		prefix,
		cursor,
		limit
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

// Metadata functions

export async function getMetadata(
	env: Env,
	accountId: string,
	namespaceId: string,
	keyName: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.kv.namespaces.metadata.get(
		namespaceId,
		keyName,
		{
			account_id: accountId
		}
	)

	return {
		content: [
			{
				type: "text",
				text: JSON.stringify(response, null, 2)
			}
		]
	}
}

// Values functions

export async function updateValue(
	env: Env,
	accountId: string,
	namespaceId: string,
	keyName: string,
	value: string,
	metadata?: string,
	expiration?: number,
	expiration_ttl?: number
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	// Create the base params with required fields
	const params = {
		account_id: accountId,
		value,
		metadata: metadata || "" // Always provide a string for metadata
	}

	// Add optional expiration parameters directly to the API call
	const response = await client.kv.namespaces.values.update(
		namespaceId,
		keyName,
		{
			...params,
			expiration,
			expiration_ttl
		}
	)

	return {
		content: [
			{
				type: "text",
				text: JSON.stringify(response, null, 2)
			}
		]
	}
}

export async function deleteValue(
	env: Env,
	accountId: string,
	namespaceId: string,
	keyName: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.kv.namespaces.values.delete(
		namespaceId,
		keyName,
		{
			account_id: accountId
		}
	)

	return {
		content: [
			{
				type: "text",
				text: JSON.stringify(response, null, 2)
			}
		]
	}
}

export async function getValue(
	env: Env,
	accountId: string,
	namespaceId: string,
	keyName: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.kv.namespaces.values.get(
		namespaceId,
		keyName,
		{
			account_id: accountId
		}
	)

	// Since the response is a binary stream, we need to convert it to text
	const text = await response.text()

	return {
		content: [
			{
				type: "text",
				text
			}
		]
	}
}
