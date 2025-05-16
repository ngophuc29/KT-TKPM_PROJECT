package com.gearvn.configs;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSourceConfig {

	
	@Bean
	public DataSource dataSource() {
		DataSourceBuilder<?>dataSourceBuilder=DataSourceBuilder.create();
		dataSourceBuilder.driverClassName("org.mariadb.jdbc.Driver");
		dataSourceBuilder.url("jdbc:mariadb://localhost:3306/gearvn");
		dataSourceBuilder.username("root");
		dataSourceBuilder.password("sapassword");
		return dataSourceBuilder.build();
	}
}
