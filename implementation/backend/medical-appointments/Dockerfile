# --- Etapa 1: Construcción (Build) ---
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copiar el archivo de configuración de Maven para descargar dependencias en caché
COPY pom.xml .

# Descargar las dependencias necesarias sin compilar el código (optimiza el tiempo de build)
RUN mvn dependency:go-offline -B

# Copiar el código fuente del proyecto
COPY src ./src

# Compilar y empaquetar el .jar saltándose los tests para agilizar el despliegue
RUN mvn clean package -DskipTests

# --- Etapa 2: Ejecución (Run) ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiar el archivo .jar generado en la etapa anterior
COPY --from=builder /app/target/medical-appointments-0.0.1-SNAPSHOT.jar app.jar

# Configuración de optimización de memoria para el recolector de basura en entornos de 512MB RAM
ENV JAVA_OPTS="-XX:+UseSerialGC -Xss512k -XX:MaxRAMPercentage=75.0"

# Exponer el puerto por defecto de Spring Boot
EXPOSE 8080

# Comando para arrancar la aplicación
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]