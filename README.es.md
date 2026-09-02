[English](README.md) · [Português (BR)](README.pt-BR.md) · [Español](README.es.md)

# Postguy

Un cliente HTTP para el navegador — envía solicitudes, inspecciona respuestas, sin instalar nada.

Un backend en Kotlin/Ktor realiza las llamadas HTTP (evitando restricciones de CORS) y sirve la interfaz de React en el mismo puerto.

## Ejecutar localmente

Requisitos: JDK 21+, Node.js 18+

```bash
./gradlew run
```

Abre **http://localhost:8080**

## Stack

Kotlin · Ktor · React · TypeScript · Vite · Tailwind · Zustand

## Licencia

Postguy se distribuye bajo **doble licencia**:

- [AGPLv3](LICENSE) — gratuita, siempre que cualquier versión modificada
  (incluido el uso como servicio en red) también se ponga a disposición
  bajo la misma licencia.
- [Licencia comercial](COMMERCIAL-LICENSE.es.md) — para empresas que quieran
  usar, incorporar u ofrecer Postguy como servicio sin las obligaciones de
  código abierto de la AGPLv3.

Las contribuciones están sujetas a los términos en [CONTRIBUTING.es.md](CONTRIBUTING.es.md).