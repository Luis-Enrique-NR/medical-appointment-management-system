package pe.uni.software.medical_appointments.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

  @Bean
  @Primary
  public ObjectMapper objectMapper() {
    return JsonMapper.builder()
            /*
               Configura la inclusión de propiedades:
               1. NON_NULL: Omite atributos nulos del objeto principal.
               2. ALWAYS: Mantiene elementos nulos dentro de colecciones/listas para evitar descuadres.
            */
            .defaultPropertyInclusion(JsonInclude.Value.construct(JsonInclude.Include.NON_NULL, JsonInclude.Include.ALWAYS))
            // Detecta y registra automáticamente módulos externos
            .findAndAddModules()
            .build();
  }
}
