package io.postguy.proxy

import kotlinx.serialization.Serializable

@Serializable
data class KeyValuePair(
    val id: String,
    val key: String,
    val value: String,
    val enabled: Boolean
)

@Serializable
data class RequestConfig(
    val method: String,
    val url: String,
    val params: List<KeyValuePair> = emptyList(),
    val headers: List<KeyValuePair> = emptyList(),
    val bodyType: String = "none",  // json, form-data, x-www-form-urlencoded, raw, none
    val body: String = ""
)

@Serializable
data class ResponseData(
    val status: Int,
    val statusText: String,
    val headers: Map<String, String>,
    val body: String,
    val time: Long,
    val size: Long
)

@Serializable
data class ErrorResponse(
    val error: String,
    val message: String
)
