import Cloudflare from "cloudflare"
import type { DNSRecordType } from "../types"

export async function createDNSRecord(
	env: Env,
	zoneId: string,
	name: string,
	content: string,
	type: DNSRecordType,
	comment?: string,
	proxied?: boolean
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.dns.records.create({
		zone_id: zoneId,
		name,
		content,
		comment,
		type,
		ttl: 60,
		proxied
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

export async function deleteDNSRecord(
	env: Env,
	zoneId: string,
	recordId: string
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.dns.records.delete(recordId, {
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

export async function editDNSRecord(
	env: Env,
	zoneId: string,
	recordId: string,
	content: string,
	type: DNSRecordType,
	comment?: string,
	proxied?: boolean
) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.dns.records.update(recordId, {
		zone_id: zoneId,
		content,
		comment,
		type,
		ttl: 60,
		proxied
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

export async function listDNSRecords(env: Env, zoneId: string) {
	const client = new Cloudflare({
		apiKey: env.CLOUDFLARE_API_KEY,
		apiEmail: env.CLOUDFLARE_API_EMAIL
	})

	const response = await client.dns.records.list({
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
