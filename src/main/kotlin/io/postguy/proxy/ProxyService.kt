package io.postguy.proxy

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.http.content.*
import kotlin.time.measureTimedValue

class ProxyService {
    private val client = HttpClient(CIO) {
        followRedirects = false
        expectSuccess = false
        engine {
            requestTimeout = 30_000
        }
    }

    suspend fun execute(config: RequestConfig): ResponseData {
        val method = HttpMethod(config.method.uppercase())

        // Build URL with query params
        val urlBuilder = URLBuilder(config.url)
        config.params
            .filter { it.enabled && it.key.isNotBlank() }
            .forEach { urlBuilder.parameters.append(it.key, it.value) }
        val targetUrl = urlBuilder.buildString()

        val (response, time) = measureTimedValue {
            client.request(targetUrl) {
                this.method = method

                // Add request headers
                config.headers
                    .filter { it.enabled && it.key.isNotBlank() }
                    .forEach { headers.append(it.key, it.value) }

                // Set body
                when (config.bodyType) {
                    "json" -> {
                        if (config.body.isNotBlank()) {
                            setBody(TextContent(config.body, ContentType.Application.Json))
                        }
                    }
                    "raw" -> {
                        if (config.body.isNotBlank()) {
                            setBody(TextContent(config.body, ContentType.Text.Plain))
                        }
                    }
                    "x-www-form-urlencoded" -> {
                        // body is a URL-encoded form string (e.g. key1=val1&key2=val2)
                        if (config.body.isNotBlank()) {
                            val params = Parameters.build {
                                config.body.split("&").forEach { pair ->
                                    val parts = pair.split("=", limit = 2)
                                    if (parts.size == 2) {
                                        append(parts[0].trim(), parts[1].trim())
                                    }
                                }
                            }
                            setBody(FormDataContent(params))
                        }
                    }
                    "form-data" -> {
                        // The frontend serializes the form-data key-value pairs as a JSON array string.
                        // We decode it here and build a multipart form body.
                        if (config.body.isNotBlank()) {
                            try {
                                val pairs = kotlinx.serialization.json.Json.decodeFromString<List<KeyValuePair>>(config.body)
                                setBody(MultiPartFormDataContent(
                                    formData {
                                        pairs.filter { it.enabled && it.key.isNotBlank() }.forEach { pair ->
                                            append(pair.key, pair.value)
                                        }
                                    }
                                ))
                            } catch (e: Exception) {
                                setBody(TextContent(config.body, ContentType.Text.Plain))
                            }
                        }
                    }
                    // "none" — no body
                }
            }
        }

        val bodyBytes = response.readBytes()
        val bodyStr = bodyBytes.toString(Charsets.UTF_8)
        val responseHeaders = response.headers.entries()
            .associate { it.key to it.value.joinToString(", ") }

        return ResponseData(
            status = response.status.value,
            statusText = response.status.description,
            headers = responseHeaders,
            body = bodyStr,
            time = time.inWholeMilliseconds,
            size = bodyBytes.size.toLong()
        )
    }

    fun close() = client.close()
}
