import Cloudflare from "cloudflare"

/**
 * Create a new queue
 */
export async function createQueue(
	env: Env,
	accountId: string,
	queueName: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.queues.create({
		account_id: accountId,
		queue_name: queueName
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

/**
 * Get details about a specific queue
 */
export async function getQueue(env: Env, accountId: string, queueId: string) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.queues.get(queueId, {
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

/**
 * List all queues for an account
 */
export async function listQueues(env: Env, accountId: string) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.queues.list({
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

/**
 * Acknowledge messages from a queue
 */
export async function acknowledgeMessages(
	env: Env,
	accountId: string,
	queueId: string,
	acks: Array<{ lease_id: string }>,
	retries?: Array<{ lease_id: string; delay_seconds?: number }>
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const params: {
		account_id: string
		acks?: Array<{ lease_id: string }>
		retries?: Array<{ lease_id: string; delay_seconds?: number }>
	} = {
		account_id: accountId
	}

	if (acks && acks.length > 0) {
		params.acks = acks
	}

	if (retries && retries.length > 0) {
		params.retries = retries
	}

	const response = await client.queues.messages.ack(queueId, params)

	return {
		content: [
			{
				type: "text",
				text: JSON.stringify(response, null, 2)
			}
		]
	}
}

/**
 * Pull a batch of messages from a queue
 */
export async function pullMessages(
	env: Env,
	accountId: string,
	queueId: string,
	batchSize?: number,
	visibilityTimeoutMs?: number
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const params: {
		account_id: string
		batch_size?: number
		visibility_timeout_ms?: number
	} = {
		account_id: accountId
	}

	if (batchSize !== undefined) {
		params.batch_size = batchSize
	}

	if (visibilityTimeoutMs !== undefined) {
		params.visibility_timeout_ms = visibilityTimeoutMs
	}

	const response = await client.queues.messages.pull(queueId, params)

	return {
		content: [
			{
				type: "text",
				text: JSON.stringify(response, null, 2)
			}
		]
	}
}
