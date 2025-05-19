package com.gearvn.entities;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.util.AlternativeJdkIdGenerator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gearvn.domain.RequestContext;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties(value = {"createdAt", "updatedAt"}, allowGetters = true)
public abstract class Auditable {
	@Id
	@SequenceGenerator(name="primary_key_seq",sequenceName = "primary_key_seq", allocationSize=1)
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "primary_key_seq")
	@Column(name="id" , updatable = false )
	private Integer id;
	private String referenceId= new AlternativeJdkIdGenerator().generateId().toString();
	@NotNull
	private Integer createdBy;
	@NotNull
	private Integer updatedBy;
	@NotNull
	@CreatedDate
	@Column(name="created_at", updatable = false, nullable = false)
	private LocalDateTime createdAt;
	@CreatedDate
	@Column(name="updated_at", nullable = false)
	private LocalDateTime updatedAt;
	
	@PrePersist
	public void beforeCreate() {
		
		var userId = 0;
				//		RequestContext.getUserId();
//		if (userId == null) {
//			throw new ApiException("createdBy is required");
//		}
		  
		setCreatedAt(LocalDateTime.now());
		setUpdatedAt(LocalDateTime.now());
		setCreatedBy(userId);
		setUpdatedBy(userId);
	}
	
	@PreUpdate
	public void beforeUpdate() {
		var userId = 0;
//		var userId = RequestContext.getUserId();
//		if (userId == null) {
//			throw new ApiException("updatedBy is required");
//		}
		setUpdatedAt(LocalDateTime.now());
		setUpdatedBy(userId);
	}
}
