package com.vigilancia;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI vigilanciaOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("VigíaEscolar API")
                .description("API REST para el sistema de supervisión escolar VigíaEscolar. "
                        + "Gestión de turnos docentes, registros de presencia/recorrido, incidentes, "
                        + "reasignaciones, reportes de limpieza y notificaciones.")
                .version("1.0.0"));
    }
}
