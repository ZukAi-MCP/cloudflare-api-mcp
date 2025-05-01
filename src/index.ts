import { WorkerEntrypoint } from "cloudflare:workers" 
import { ProxyToSelf } from "workers-mcp"
import { purgeEverything } from "./cloudflare/cache"
import {
	createDNSRecord,
	deleteDNSRecord,
	editDNSRecord,
	listDNSRecords
} from "./cloudflare/dns"
import {
	createHyperdriveConfig,
	deleteHyperdriveConfig,
	editHyperdriveConfig,
	getHyperdriveConfig,
	listHyperdriveConfigs
} from "./cloudflare/hyperdrive"
import {
	bulkDeleteKeys,
	bulkUpdateKeys,
	createNamespace,
	deleteNamespace,
	deleteValue,
	getMetadata,
	getNamespace,
	getValue,
	listKeys,
	listNamespaces,
	updateNamespace,
	updateValue
} from "./cloudflare/kv"
import {
	acknowledgeMessages,
	createQueue,
	getQueue,
	listQueues,
	pullMessages
} from "./cloudflare/queues"
import {
	createBucket,
	deleteBucketCORS,
	getBucket,
	getBucketCORS,
	listBuckets,
	putBucketCORS
} from "./cloudflare/r2"
import {
	getWorkerSchedules,
	updateWorkerSchedules
} from "./cloudflare/worker-cron"
import {
	deleteDomain,
	getDomain,
	listDomains,
	updateDomain
} from "./cloudflare/workers-domains"
import {
	getWorkflow,
	getWorkflowInstance,
	listWorkflowInstances,
	listWorkflows,
	updateWorkflowInstanceStatus
} from "./cloudflare/workflows"
import { listZones } from "./cloudflare/zones"
import type { DNSRecordType } from "./types"

export default class MyWorker extends WorkerEntrypoint<Env> {
	/**
	 * @ignore
	 */
	async fetch(request: Request): Promise<Response> {
		return new ProxyToSelf(this).fetch(request)
	}

	/**
	 * List all Cloudflare zones for the account.
	 * @return {Promise<any>} List of zones.
	 */
	async listZones() {
		return await listZones(this.env)
	}

	/**
	 * Purge everything from Cloudflare's cache for a zone.
	 * @param zoneId {string} The ID of the zone to purge cache for.
	 * @return {Promise<any>} Response from the purge operation.
	 */
	async purgeCache(zoneId: string) {
		return await purgeEverything(this.env, zoneId)
	}

	/**
	 * Create a new DNS record.
	 * @param zoneId {string} The ID of the zone to create the record in.
	 * @param name {string} The name of the DNS record.
	 * @param content {string} The content of the DNS record.
	 * @param type {string} The type of DNS record (CNAME, A, TXT, or MX).
	 * @param comment {string} Optional comment for the DNS record.
	 * @param proxied {boolean} Optional whether to proxy the record through Cloudflare.
	 * @return {Promise<any>} The created DNS record.
	 */
	async createDNSRecord(
		zoneId: string,
		name: string,
		content: string,
		type: string,
		comment?: string,
		proxied?: boolean
	) {
		return await createDNSRecord(
			this.env,
			zoneId,
			name,
			content,
			type as DNSRecordType,
			comment,
			proxied
		)
	}

	/**
	 * Delete a DNS record.
	 * @param zoneId {string} The ID of the zone containing the record.
	 * @param recordId {string} The ID of the DNS record to delete.
	 * @return {Promise<any>} Response from the delete operation.
	 */
	async deleteDNSRecord(zoneId: string, recordId: string) {
		return await deleteDNSRecord(this.env, zoneId, recordId)
	}

	/**
	 * Edit an existing DNS record.
	 * @param zoneId {string} The ID of the zone containing the record.
	 * @param recordId {string} The ID of the DNS record to edit.
	 * @param content {string} The new content for the DNS record.
	 * @param type {string} The type of DNS record (CNAME, A, TXT, or MX).
	 * @param comment {string} Optional comment for the DNS record.
	 * @param proxied {boolean} Optional whether to proxy the record through Cloudflare.
	 * @return {Promise<any>} The updated DNS record.
	 */
	async editDNSRecord(
		zoneId: string,
		recordId: string,
		content: string,
		type: string,
		comment?: string,
		proxied?: boolean
	) {
		return await editDNSRecord(
			this.env,
			zoneId,
			recordId,
			content,
			type as DNSRecordType,
			comment,
			proxied
		)
	}

	/**
	 * List all DNS records for a zone.
	 * @param zoneId {string} The ID of the zone to list records for.
	 * @return {Promise<any>} List of DNS records.
	 */
	async listDNSRecords(zoneId: string) {
		return await listDNSRecords(this.env, zoneId)
	}

	/**
	 * Create a new Hyperdrive configuration.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param name {string} The name for the new Hyperdrive configuration.
	 * @param originType {string} The type of origin ("standard" or "access").
	 * @param database {string} The name of your origin database.
	 * @param host {string} The host (hostname or IP) of your origin database.
	 * @param password {string} The password required to access your origin database.
	 * @param port {number} The port of your origin database.
	 * @param scheme {string} The URL scheme used to connect to your origin database.
	 * @param user {string} The user of your origin database.
	 * @param accessClientId {string} The Client ID of the Access token (required if originType is "access").
	 * @param accessClientSecret {string} The Client Secret of the Access token (required if originType is "access").
	 * @param cachingDisabled {boolean} When true, disables caching of SQL responses.
	 * @param cachingMaxAge {number} Optional max duration for which items should persist in cache.
	 * @param cachingStaleWhileRevalidate {number} Optional duration cache may serve stale responses.
	 * @return {Promise<any>} The created Hyperdrive configuration.
	 */
	async createHyperdriveConfig(
		accountId: string,
		name: string,
		originType: string,
		database: string,
		host: string,
		password: string,
		port: number,
		scheme: string,
		user: string,
		accessClientId?: string,
		accessClientSecret?: string,
		cachingDisabled?: boolean,
		cachingMaxAge?: number,
		cachingStaleWhileRevalidate?: number
	) {
		type StandardOrigin = {
			database: string
			host: string
			password: string
			port: number
			scheme: "postgres" | "postgresql"
			user: string
		}

		type AccessOrigin = {
			access_client_id: string
			access_client_secret: string
			database: string
			host: string
			password: string
			scheme: "postgres" | "postgresql"
			user: string
		}

		let origin: StandardOrigin | AccessOrigin
		if (originType === "access" && accessClientId && accessClientSecret) {
			// Origin for Access-protected database
			origin = {
				access_client_id: accessClientId,
				access_client_secret: accessClientSecret,
				database,
				host,
				password,
				scheme: scheme as "postgres" | "postgresql",
				user
			}
		} else {
			// Standard origin
			origin = {
				database,
				host,
				password,
				port,
				scheme: scheme as "postgres" | "postgresql",
				user
			}
		}

		const caching =
			cachingDisabled !== undefined ||
			cachingMaxAge !== undefined ||
			cachingStaleWhileRevalidate !== undefined
				? {
						disabled: cachingDisabled,
						max_age: cachingMaxAge,
						stale_while_revalidate: cachingStaleWhileRevalidate
					}
				: undefined

		return await createHyperdriveConfig(
			this.env,
			accountId,
			name,
			origin,
			caching
		)
	}

	/**
	 * Delete a Hyperdrive configuration.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param hyperdriveId {string} The ID of the Hyperdrive configuration to delete.
	 * @return {Promise<any>} Response from the delete operation.
	 */
	async deleteHyperdriveConfig(accountId: string, hyperdriveId: string) {
		return await deleteHyperdriveConfig(this.env, accountId, hyperdriveId)
	}

	/**
	 * Edit a Hyperdrive configuration.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param hyperdriveId {string} The ID of the Hyperdrive configuration to edit.
	 * @param name {string} Optional new name for the Hyperdrive configuration.
	 * @param cachingDisabled {boolean} Optional when true, disables caching of SQL responses.
	 * @param cachingMaxAge {number} Optional max duration for which items should persist in cache.
	 * @param cachingStaleWhileRevalidate {number} Optional duration cache may serve stale responses.
	 * @return {Promise<any>} The updated Hyperdrive configuration.
	 */
	async editHyperdriveConfig(
		accountId: string,
		hyperdriveId: string,
		name?: string,
		cachingDisabled?: boolean,
		cachingMaxAge?: number,
		cachingStaleWhileRevalidate?: number
	) {
		const params: {
			name?: string
			caching?: {
				disabled?: boolean
				max_age?: number
				stale_while_revalidate?: number
			}
		} = {}

		if (name !== undefined) {
			params.name = name
		}

		if (
			cachingDisabled !== undefined ||
			cachingMaxAge !== undefined ||
			cachingStaleWhileRevalidate !== undefined
		) {
			params.caching = {
				disabled: cachingDisabled,
				max_age: cachingMaxAge,
				stale_while_revalidate: cachingStaleWhileRevalidate
			}
		}

		return await editHyperdriveConfig(
			this.env,
			accountId,
			hyperdriveId,
			params
		)
	}

	/**
	 * Get a Hyperdrive configuration.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param hyperdriveId {string} The ID of the Hyperdrive configuration to retrieve.
	 * @return {Promise<any>} The Hyperdrive configuration.
	 */
	async getHyperdriveConfig(accountId: string, hyperdriveId: string) {
		return await getHyperdriveConfig(this.env, accountId, hyperdriveId)
	}

	/**
	 * List all Hyperdrive configurations in an account.
	 * @param accountId {string} The Cloudflare account ID.
	 * @return {Promise<any>} List of Hyperdrive configurations.
	 */
	async listHyperdriveConfigs(accountId: string) {
		return await listHyperdriveConfigs(this.env, accountId)
	}

	/**
	 * Create a KV namespace.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param title {string} A human-readable string name for a Namespace.
	 * @return {Promise<any>} The created namespace.
	 */
	async createKVNamespace(accountId: string, title: string) {
		return await createNamespace(this.env, accountId, title)
	}

	/**
	 * Update a KV namespace title.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param namespaceId {string} The ID of the namespace to update.
	 * @param title {string} New human-readable string name for the Namespace.
	 * @return {Promise<any>} Response from the update operation.
	 */
	async updateKVNamespace(
		accountId: string,
		namespaceId: string,
		title: string
	) {
		return await updateNamespace(this.env, accountId, namespaceId, title)
	}

	/**
	 * List KV namespaces for an account.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param order {string} Optional field to order results by: 'id' or 'title'.
	 * @param direction {string} Optional direction to order namespaces: 'asc' or 'desc'.
	 * @return {Promise<any>} List of namespaces.
	 */
	async listKVNamespaces(
		accountId: string,
		order?: "id" | "title",
		direction?: "asc" | "desc"
	) {
		return await listNamespaces(this.env, accountId, order, direction)
	}

	/**
	 * Delete a KV namespace.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param namespaceId {string} The ID of the namespace to delete.
	 * @return {Promise<any>} Response from the delete operation.
	 */
	async deleteKVNamespace(accountId: string, namespaceId: string) {
		return await deleteNamespace(this.env, accountId, namespaceId)
	}

	/**
	 * Get a specific KV namespace.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param namespaceId {string} The ID of the namespace to retrieve.
	 * @return {Promise<any>} The namespace details.
	 */
	async getKVNamespace(accountId: string, namespaceId: string) {
		return await getNamespace(this.env, accountId, namespaceId)
	}

	/**
	 * List keys in a KV namespace.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param namespaceId {string} The ID of the namespace.
	 * @param prefix {string} Optional string prefix to filter key names.
	 * @param cursor {string} Optional cursor for pagination.
	 * @param limit {number} Optional limit on number of keys to return.
	 * @return {Promise<any>} List of keys.
	 */
	async listKVKeys(
		accountId: string,
		namespaceId: string,
		prefix?: string,
		cursor?: string,
		limit?: number
	) {
		return await listKeys(
			this.env,
			accountId,
			namespaceId,
			prefix,
			cursor,
			limit
		)
	}

	/**
	 * Get metadata for a key in a KV namespace.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param namespaceId {string} The ID of the namespace.
	 * @param keyName {string} The name of the key.
	 * @return {Promise<any>} The metadata for the key.
	 */
	async getKVMetadata(
		accountId: string,
		namespaceId: string,
		keyName: string
	) {
		return await getMetadata(this.env, accountId, namespaceId, keyName)
	}

	/**
	 * Update a value in a KV namespace.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param namespaceId {string} The ID of the namespace.
	 * @param keyName {string} The name of the key.
	 * @param value {string} The value to store.
	 * @param metadata {string} Optional JSON metadata to associate with the key/value pair.
	 * @param expiration {number} Optional time at which the key should expire.
	 * @param expiration_ttl {number} Optional time-to-live in seconds for the key.
	 * @return {Promise<any>} Response from the update operation.
	 */
	async updateKVValue(
		accountId: string,
		namespaceId: string,
		keyName: string,
		value: string,
		metadata?: string,
		expiration?: number,
		expiration_ttl?: number
	) {
		return await updateValue(
			this.env,
			accountId,
			namespaceId,
			keyName,
			value,
			metadata,
			expiration,
			expiration_ttl
		)
	}

	/**
	 * Delete a value from a KV namespace.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param namespaceId {string} The ID of the namespace.
	 * @param keyName {string} The name of the key to delete.
	 * @return {Promise<any>} Response from the delete operation.
	 */
	async deleteKVValue(
		accountId: string,
		namespaceId: string,
		keyName: string
	) {
		return await deleteValue(this.env, accountId, namespaceId, keyName)
	}

	/**
	 * Get a value from a KV namespace.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param namespaceId {string} The ID of the namespace.
	 * @param keyName {string} The name of the key to retrieve.
	 * @return {Promise<any>} The value associated with the key.
	 */
	async getKVValue(accountId: string, namespaceId: string, keyName: string) {
		return await getValue(this.env, accountId, namespaceId, keyName)
	}

	/**
	 * Create a new queue.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param queueName {string} Name for the new queue.
	 * @return {Promise<any>} The created queue.
	 */
	async createQueue(accountId: string, queueName: string) {
		return await createQueue(this.env, accountId, queueName)
	}

	/**
	 * Get details about a specific queue.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param queueId {string} The ID of the queue to retrieve.
	 * @return {Promise<any>} The queue details.
	 */
	async getQueue(accountId: string, queueId: string) {
		return await getQueue(this.env, accountId, queueId)
	}

	/**
	 * List all queues for an account.
	 * @param accountId {string} The Cloudflare account ID.
	 * @return {Promise<any>} List of queues.
	 */
	async listQueues(accountId: string) {
		return await listQueues(this.env, accountId)
	}

	/**
	 * Acknowledge messages from a queue.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param queueId {string} The ID of the queue.
	 * @param acks {string} JSON string of message lease IDs to acknowledge. Format: [{lease_id: "string"}]
	 * @param retries {string} Optional JSON string of message lease IDs to retry with optional delay. Format: [{lease_id: "string", delay_seconds?: number}]
	 * @return {Promise<any>} Response from the acknowledge operation.
	 */
	async acknowledgeQueueMessages(
		accountId: string,
		queueId: string,
		acks: string,
		retries?: string
	) {
		// Parse the JSON strings to get the actual objects
		const parsedAcks = JSON.parse(acks) as Array<{ lease_id: string }>
		const parsedRetries = retries
			? (JSON.parse(retries) as Array<{
					lease_id: string
					delay_seconds?: number
				}>)
			: undefined

		return await acknowledgeMessages(
			this.env,
			accountId,
			queueId,
			parsedAcks,
			parsedRetries
		)
	}

	/**
	 * Pull a batch of messages from a queue.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param queueId {string} The ID of the queue.
	 * @param batchSize {number} Optional maximum number of messages to include in the batch.
	 * @param visibilityTimeoutMs {number} Optional number of milliseconds that messages are exclusively leased.
	 * @return {Promise<any>} The pulled messages.
	 */
	async pullQueueMessages(
		accountId: string,
		queueId: string,
		batchSize?: number,
		visibilityTimeoutMs?: number
	) {
		return await pullMessages(
			this.env,
			accountId,
			queueId,
			batchSize,
			visibilityTimeoutMs
		)
	}

	/**
	 * Bulk delete keys from a KV namespace.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param namespaceId {string} The ID of the namespace.
	 * @param keys {string} JSON string array of key names to delete. Format: ["key1", "key2", "key3"]
	 * @return {Promise<any>} Response from the bulk delete operation.
	 */
	async bulkDeleteKVKeys(
		accountId: string,
		namespaceId: string,
		keys: string
	) {
		// Parse the JSON string to get the array of keys
		const parsedKeys = JSON.parse(keys) as string[]

		return await bulkDeleteKeys(
			this.env,
			accountId,
			namespaceId,
			parsedKeys
		)
	}

	/**
	 * Bulk update key-value pairs in a KV namespace.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param namespaceId {string} The ID of the namespace.
	 * @param keyValues {string} JSON string array of key-value objects. Format: [{key: "string", value: "string", expiration?: number, expiration_ttl?: number, base64?: boolean}]
	 * @return {Promise<any>} Response from the bulk update operation.
	 */
	async bulkUpdateKVKeys(
		accountId: string,
		namespaceId: string,
		keyValues: string
	) {
		// Parse the JSON string to get the array of key-value objects
		const parsedKeyValues = JSON.parse(keyValues) as Array<{
			key: string
			value: string
			expiration?: number
			expiration_ttl?: number
			base64?: boolean
			metadata?: Record<string, unknown>
		}>

		return await bulkUpdateKeys(
			this.env,
			accountId,
			namespaceId,
			parsedKeyValues
		)
	}

	/**
	 * Create a new R2 bucket.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param name {string} The name for the new bucket.
	 * @return {Promise<any>} The created bucket.
	 */
	async createR2Bucket(accountId: string, name: string) {
		return await createBucket(this.env, accountId, name)
	}

	/**
	 * Get a specific R2 bucket.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param bucketName {string} The name of the bucket to retrieve.
	 * @return {Promise<any>} The bucket details.
	 */
	async getR2Bucket(accountId: string, bucketName: string) {
		return await getBucket(this.env, accountId, bucketName)
	}

	/**
	 * List all R2 buckets for an account.
	 * @param accountId {string} The Cloudflare account ID.
	 * @return {Promise<any>} List of buckets.
	 */
	async listR2Buckets(accountId: string) {
		return await listBuckets(this.env, accountId)
	}

	/**
	 * Delete CORS configuration for an R2 bucket.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param bucketName {string} The name of the bucket.
	 * @return {Promise<any>} Response from the delete operation.
	 */
	async deleteR2BucketCORS(accountId: string, bucketName: string) {
		return await deleteBucketCORS(this.env, accountId, bucketName)
	}

	/**
	 * Get CORS configuration for an R2 bucket.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param bucketName {string} The name of the bucket.
	 * @return {Promise<any>} The CORS configuration.
	 */
	async getR2BucketCORS(accountId: string, bucketName: string) {
		return await getBucketCORS(this.env, accountId, bucketName)
	}

	/**
	 * Update CORS configuration for an R2 bucket.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param bucketName {string} The name of the bucket.
	 * @param corsRules {string} JSON string array of CORS rules. Format: [{allowedOrigins: ["example.com"], allowedMethods: ["GET"], allowedHeaders: ["Content-Type"], exposeHeaders: ["Content-Length"], maxAge: 86400}]
	 * @return {Promise<any>} Response from the update operation.
	 */
	async updateR2BucketCORS(
		accountId: string,
		bucketName: string,
		corsRules: string
	) {
		// Parse the JSON string to get the array of CORS rules
		const parsedRules = JSON.parse(corsRules) as Array<{
			allowedOrigins: string[]
			allowedMethods?: Array<"GET" | "PUT" | "POST" | "DELETE" | "HEAD">
			allowedHeaders?: string[]
			exposeHeaders?: string[]
			maxAge?: number
		}>

		return await putBucketCORS(this.env, accountId, bucketName, parsedRules)
	}

	/**
	 * Delete a Worker domain.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param domainId {string} The ID of the domain to delete.
	 * @return {Promise<any>} Response from the delete operation.
	 */
	async deleteWorkerDomain(accountId: string, domainId: string) {
		return await deleteDomain(this.env, accountId, domainId)
	}

	/**
	 * Get a Worker domain.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param domainId {string} The ID of the domain to retrieve.
	 * @return {Promise<any>} The domain details.
	 */
	async getWorkerDomain(accountId: string, domainId: string) {
		return await getDomain(this.env, accountId, domainId)
	}

	/**
	 * List all Worker domains for an account.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param environment {string} Optional worker environment to filter by.
	 * @param hostname {string} Optional hostname to filter by.
	 * @param service {string} Optional worker service to filter by.
	 * @param zoneId {string} Optional zone ID to filter by.
	 * @param zoneName {string} Optional zone name to filter by.
	 * @return {Promise<any>} List of domains.
	 */
	async listWorkerDomains(
		accountId: string,
		environment?: string,
		hostname?: string,
		service?: string,
		zoneId?: string,
		zoneName?: string
	) {
		return await listDomains(
			this.env,
			accountId,
			environment,
			hostname,
			service,
			zoneId,
			zoneName
		)
	}

	/**
	 * Attach a Worker to a zone and hostname.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param environment {string} Worker environment to associate with the zone and hostname.
	 * @param hostname {string} Hostname of the Worker Domain.
	 * @param service {string} Worker service to associate with the zone and hostname.
	 * @param zoneId {string} ID of the zone.
	 * @return {Promise<any>} The updated domain.
	 */
	async updateWorkerDomain(
		accountId: string,
		environment: string,
		hostname: string,
		service: string,
		zoneId: string
	) {
		return await updateDomain(
			this.env,
			accountId,
			environment,
			hostname,
			service,
			zoneId
		)
	}

	/**
	 * Get Cron Triggers for a Worker.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param scriptName {string} The name of the Worker script.
	 * @return {Promise<any>} The Worker's cron schedules.
	 */
	async getWorkerCronTriggers(accountId: string, scriptName: string) {
		return await getWorkerSchedules(this.env, accountId, scriptName)
	}

	/**
	 * Update Cron Triggers for a Worker.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param scriptName {string} The name of the Worker script.
	 * @param schedules {string} JSON string array of cron schedules. Format: [{"cron": "* * * * *"}]
	 * @return {Promise<any>} The updated cron schedules.
	 */
	async updateWorkerCronTriggers(
		accountId: string,
		scriptName: string,
		schedules: string
	) {
		// Parse the JSON string to get the array of schedules
		const parsedSchedules = JSON.parse(schedules) as Array<{ cron: string }>

		return await updateWorkerSchedules(
			this.env,
			accountId,
			scriptName,
			parsedSchedules
		)
	}

	/**
	 * Get details about a workflow.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param workflowName {string} The name of the workflow.
	 * @return {Promise<any>} The workflow details.
	 */
	async getWorkflow(accountId: string, workflowName: string) {
		return await getWorkflow(this.env, accountId, workflowName)
	}

	/**
	 * List all workflows for an account.
	 * @param accountId {string} The Cloudflare account ID.
	 * @return {Promise<any>} List of workflows.
	 */
	async listWorkflows(accountId: string) {
		return await listWorkflows(this.env, accountId)
	}

	/**
	 * Get details about a workflow instance including logs and status.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param workflowName {string} The name of the workflow.
	 * @param instanceId {string} The ID of the workflow instance.
	 * @return {Promise<any>} The workflow instance details.
	 */
	async getWorkflowInstance(
		accountId: string,
		workflowName: string,
		instanceId: string
	) {
		return await getWorkflowInstance(
			this.env,
			accountId,
			workflowName,
			instanceId
		)
	}

	/**
	 * List all instances of a workflow.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param workflowName {string} The name of the workflow.
	 * @param dateStart {string} Optional start date in ISO 8601 format (UTC).
	 * @param dateEnd {string} Optional end date in ISO 8601 format (UTC).
	 * @param status {string} Optional status to filter by (queued, running, paused, errored, terminated, complete, waitingForPause, waiting, unknown).
	 * @return {Promise<any>} List of workflow instances.
	 */
	async listWorkflowInstances(
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
		return await listWorkflowInstances(
			this.env,
			accountId,
			workflowName,
			dateStart,
			dateEnd,
			status
		)
	}

	/**
	 * Change the status of a workflow instance.
	 * @param accountId {string} The Cloudflare account ID.
	 * @param workflowName {string} The name of the workflow.
	 * @param instanceId {string} The ID of the workflow instance.
	 * @param status {string} The new status (resume, pause, or terminate).
	 * @return {Promise<any>} The updated workflow instance status.
	 */
	async updateWorkflowInstanceStatus(
		accountId: string,
		workflowName: string,
		instanceId: string,
		status: "resume" | "pause" | "terminate"
	) {
		return await updateWorkflowInstanceStatus(
			this.env,
			accountId,
			workflowName,
			instanceId,
			status
		)
	}
}
