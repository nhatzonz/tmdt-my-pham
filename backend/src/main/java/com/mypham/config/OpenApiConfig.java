package com.mypham.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình OpenAPI / Swagger UI.
 * Truy cập: http://localhost:8080/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    OpenAPI myPhamOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Mỹ Phẩm API")
                        .description("Hệ thống bán mỹ phẩm trực tuyến tích hợp gợi ý cá nhân hóa")
                        .version("v1.0.0")
                        .contact(new Contact().name("Nguyễn Xuân Hoàng").email("2251162016@e.tlu.edu.vn")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
                .components(new Components().addSecuritySchemes(BEARER_SCHEME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
