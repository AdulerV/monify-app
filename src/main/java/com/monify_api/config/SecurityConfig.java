package com.monify_api.config;

import com.monify_api.security.JwtAuthFilter;
import com.monify_api.security.JwtService;
import com.monify_api.service.UsuarioService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    @Value("${app.cors.origens}")
    private List<String> origensPermitidas;

    public SecurityConfig(UsuarioService usuarioService, JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
    }

    // CORS tratado no Spring Security para que respostas 401/403 tambem
    // cheguem ao front-end com os cabecalhos corretos.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origensPermitidas);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Documentacao (Swagger / OpenAPI)
                .requestMatchers(
                        "/",
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html")
                    .permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                // Cadastro de usuario e autenticacao
                .requestMatchers(HttpMethod.POST, "/api/v1/usuarios", "/api/v1/usuarios/auth")
                    .permitAll()
                .requestMatchers("/api/v1/usuarios/**")
                    .hasAnyRole("ADMIN")
                // Recursos financeiros
                .requestMatchers(
                        "/api/v1/receitas/**",
                        "/api/v1/despesas/**",
                        "/api/v1/parcelas/**",
                        "/api/v1/formaspagamento/**",
                        "/api/v1/categoriasreceita/**",
                        "/api/v1/categoriasdespesa/**",
                        "/api/v1/metasfinanceiras/**",
                        "/api/v1/aportes/**")
                    .hasAnyRole("USER", "ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(new JwtAuthFilter(jwtService, usuarioService),
                    UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
