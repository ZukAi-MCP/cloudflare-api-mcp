import Cloudflare from "cloudflare"

// Bucket functions

export async function createBucket(env: Env, accountId: string, name: string) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.r2.buckets.create({
		account_id: accountId,
		name
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

export async function getBucket(
	env: Env,
	accountId: string,
	bucketName: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.r2.buckets.get(bucketName, {
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

export async function listBuckets(env: Env, accountId: string) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.r2.buckets.list({
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

// CORS functions

export async function deleteBucketCORS(
	env: Env,
	accountId: string,
	bucketName: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.r2.buckets.cors.delete(bucketName, {
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

export async function getBucketCORS(
	env: Env,
	accountId: string,
	bucketName: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.r2.buckets.cors.get(bucketName, {
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

export async function putBucketCORS(
	env: Env,
	accountId: string,
	bucketName: string,
	corsRules: Array<{
		allowedOrigins: string[]
		allowedMethods?: Array<"GET" | "PUT" | "POST" | "DELETE" | "HEAD">
		allowedHeaders?: string[]
		exposeHeaders?: string[]
		maxAge?: number
	}>
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	// Transform the input corsRules to the format expected by the Cloudflare API
	const rules = corsRules.map((rule) => ({
		allowed: {
			origins: rule.allowedOrigins,
			methods: rule.allowedMethods || ["GET"],
			headers: rule.allowedHeaders
		},
		exposeHeaders: rule.exposeHeaders,
		maxAgeSeconds: rule.maxAge
	}))

	const response = await client.r2.buckets.cors.update(bucketName, {
		account_id: accountId,
		rules
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
