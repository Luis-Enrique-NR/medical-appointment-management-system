package pe.uni.software.medical_appointments.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.GlobalOpenApiCustomizer;
import org.springdoc.core.models.GroupedOpenApi;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import pe.uni.software.medical_appointments.entity.Usuario;

@Configuration
public class OpenApiConfig {

  static{
    SpringDocUtils.getConfig().addRequestWrapperToIgnore(Usuario.class);
  }

  @Bean
  public OpenAPI customOpenAPI() {
    return new OpenAPI()
            .info(new Info()
                    .title("Sistema de Gestión de Citás Médicas - Documentación API Rest")
                    .description("Proyecto - Aplicación web")
                    .version("1.0.0"))
            // ------------------------------------------------
            .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
            .components(new Components().addSecuritySchemes("Bearer Authentication",
                    new SecurityScheme()
                            .name("Bearer Authentication")
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")));
  }

  @Bean
  public GroupedOpenApi publicAPI() {
    return GroupedOpenApi.builder()
            .group("seguridad-api")
            .packagesToScan("pe.uni.software.medical_appointments.controller")
            .pathsToMatch("/api/**")
            .build();
  }

  @Bean
  public GlobalOpenApiCustomizer globalOpenApiCustomizer() {
    return openApi -> {
      if (openApi.getPaths() != null) {
        openApi.getPaths().values().forEach(pathItem -> {
          pathItem.readOperations().forEach(operation -> {
                    if (operation.getParameters() != null) {
                      operation.getParameters().forEach(parameter -> {
                        if ("page".equals(parameter.getName())) {
                          parameter.setDescription("Número de página (0..N)");
                        }
                        if ("size".equals(parameter.getName())) {
                          parameter.setDescription("Registros por página");
                        }
                        if ("sort".equals(parameter.getName())) {
                          parameter.setDescription("Criterio de ordenación: atributo, (asc|desc)");
                        }
                      });
                    }
                  }
          );
        });
      }
    };
  }
}
