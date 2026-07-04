package pe.uni.software.medical_appointments.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;
import pe.uni.software.medical_appointments.util.ApiResponse;
import tools.jackson.databind.ObjectMapper;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private static final Logger LOG = LoggerFactory.getLogger(SecurityConfig.class);
  private final JwtAuthenticationFilter jwtAuthFilter;
  private final JwtAuthenticationEntryPoint jwtEntryPoint;
  private final CustomAccessDeniedHandler customAccessDeniedHandler;
  private final AuthenticationProvider authenticationProvider;
  private final ObjectMapper objectMapper;
  private final HandlerExceptionResolver handlerExceptionResolver;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationProvider authProvider) throws Exception{
    http
            .cors(cors -> {})
            .csrf(AbstractHttpConfigurer::disable)

            .authorizeHttpRequests( auth -> auth
                    .requestMatchers("/","/api/v1/auth/pub/**").permitAll()
                    //.requestMatchers(HttpMethod.GET, "/api/usuario/").permitAll()
                    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                    .anyRequest().authenticated())

            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authenticationProvider(authProvider)

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint((request, response, authException) ->
                            handlerExceptionResolver.resolveException(request, response, null, authException)
                    )
                    .accessDeniedHandler((request, response, accessDeniedException) ->
                            handlerExceptionResolver.resolveException(request, response, null, accessDeniedException)
                    )
                    /*
                    .accessDeniedHandler(customAccessDeniedHandler)
                    .authenticationEntryPoint(jwtEntryPoint)
                     */
            );

    return http.build();
  }
}
