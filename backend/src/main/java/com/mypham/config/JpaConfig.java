package com.mypham.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Bật JPA auditing để entity có thể dùng
 * @CreatedDate, @LastModifiedDate, @CreatedBy, @LastModifiedBy.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
