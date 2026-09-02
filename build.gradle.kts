plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ktor)
    alias(libs.plugins.kotlin.plugin.serialization)
}

group = "io.postguy"
version = "0.0.1"

application {
    mainClass = "io.ktor.server.netty.EngineMain"
}

kotlin {
    jvmToolchain(21)
}

val frontendDir = file("frontend")
val frontendDist = file("frontend/dist")
val staticDir = file("src/main/resources/static")

val isWindows = System.getProperty("os.name").lowercase().contains("windows")
val shell = if (isWindows) listOf("cmd", "/c") else listOf("sh", "-c")

tasks.register<Exec>("frontendInstall") {
    description = "Install frontend npm dependencies"
    workingDir = frontendDir
    commandLine(shell + "npm install")
    inputs.file("frontend/package.json")
    outputs.dir("frontend/node_modules")
}

tasks.register<Exec>("frontendBuild") {
    description = "Build the React frontend"
    dependsOn("frontendInstall")
    workingDir = frontendDir
    commandLine(shell + "npm run build")
    inputs.dir("frontend/src")
    inputs.dir("frontend/public")
    inputs.files("frontend/index.html", "frontend/vite.config.ts", "frontend/tsconfig.json")
    outputs.dir(frontendDist)
}

tasks.register<Copy>("copyFrontend") {
    description = "Copy frontend build to Ktor static resources"
    dependsOn("frontendBuild")
    from(frontendDist)
    into(staticDir)
    onlyIf { frontendDist.exists() }
}

tasks.named("processResources") {
    dependsOn("copyFrontend")
}

dependencies {
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j)
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.webjars)
    implementation(libs.jquery)
    implementation(libs.ktor.server.host.common)
    implementation(libs.ktor.server.status.pages)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.server.sessions)
    implementation(libs.ktor.server.default.headers)
    implementation(libs.ktor.server.cors)
    implementation(libs.ktor.server.compression)
    implementation(libs.ktor.server.netty)
    implementation(libs.logback.classic)
    implementation(libs.ktor.server.config.yaml)
    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.cio)
    implementation(libs.ktor.client.content.negotiation)
    implementation(libs.ktor.client.logging)
    testImplementation(libs.ktor.server.test.host)
    testImplementation(libs.kotlin.test.junit)
}
