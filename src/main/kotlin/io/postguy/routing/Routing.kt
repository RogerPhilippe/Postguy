package io.postguy.routing

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.postguy.proxy.ErrorResponse
import io.postguy.proxy.ProxyService
import io.postguy.proxy.RequestConfig

fun Application.configureRouting() {
    val proxyService = ProxyService()
    environment.monitor.subscribe(ApplicationStopped) { proxyService.close() }

    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                ErrorResponse(error = cause::class.simpleName ?: "Error", message = cause.message ?: "Unknown error")
            )
        }
    }

    routing {
        // Health check
        get("/health") {
            call.respond(mapOf("status" to "ok"))
        }

        // Proxy endpoint — receives RequestConfig, executes HTTP call, returns ResponseData
        post("/proxy") {
            try {
                val config = call.receive<RequestConfig>()
                val result = proxyService.execute(config)
                call.respond(HttpStatusCode.OK, result)
            } catch (e: Exception) {
                val (httpStatus, errorType) = when {
                    e.message?.contains("Connection refused") == true ->
                        HttpStatusCode.BadGateway to "ECONNREFUSED"
                    e.message?.contains("timeout", ignoreCase = true) == true ->
                        HttpStatusCode.GatewayTimeout to "ETIMEDOUT"
                    e.message?.contains("Unable to resolve host") == true ||
                    e.message?.contains("UnknownHostException") == true ->
                        HttpStatusCode.BadGateway to "ENOTFOUND"
                    else -> HttpStatusCode.InternalServerError to "PROXY_ERROR"
                }
                call.respond(httpStatus, ErrorResponse(error = errorType, message = e.message ?: "Unknown error"))
            }
        }

        // Serve frontend static files from resources/static (production build)
        staticResources("/", "static") {
            default("index.html")
        }
    }
}
