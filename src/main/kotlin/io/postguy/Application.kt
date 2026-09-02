package io.postguy

import io.ktor.server.application.*
import io.postguy.config.configureFrameworks
import io.postguy.config.configureHTTP
import io.postguy.config.configureSecurity
import io.postguy.config.configureSerialization
import io.postguy.routing.configureRouting

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    configureFrameworks()
    configureSerialization()
    configureSecurity()
    configureHTTP()
    configureRouting()
}
