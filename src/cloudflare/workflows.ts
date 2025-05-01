import Cloudflare from "cloudflare"

// Workflow functions

export async function getWorkflow(
	env: Env,
	accountId: string,
	workflowName: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.workflows.get(workflowName, {
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

export async function listWorkflows(env: Env, accountId: string) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.workflows.list({
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

// Workflow Instance functions

export async function getWorkflowInstance(
	env: Env,
	accountId: string,
	workflowName: string,
	instanceId: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.workflows.instances.get(
		workflowName,
		instanceId,
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

export async function listWorkflowInstances(
	env: Env,
	accountId: string,
	workflowName: string,
	dateStart?: string,
	dateEnd?: string,
	status?:
		| "queued"
		| "running"
		| "paused"
		| "errored"
		| "terminated"
		| "complete"
		| "waitingForPause"
		| "waiting"
		| "unknown"
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const params: {
		account_id: string
		date_start?: string
		date_end?: string
		status?:
			| "queued"
			| "running"
			| "paused"
			| "errored"
			| "terminated"
			| "complete"
			| "waitingForPause"
			| "waiting"
			| "unknown"
	} = {
		account_id: accountId
	}

	if (dateStart) params.date_start = dateStart
	if (dateEnd) params.date_end = dateEnd
	if (status) params.status = status

	const response = await client.workflows.instances.list(workflowName, params)

	return {
		content: [
			{
				type: "text",
				text: JSON.stringify(response, null, 2)
			}
		]
	}
}

export async function updateWorkflowInstanceStatus(
	env: Env,
	accountId: string,
	workflowName: string,
	instanceId: string,
	status: "resume" | "pause" | "terminate"
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.workflows.instances.status.edit(
		workflowName,
		instanceId,
		{
			account_id: accountId,
			status
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
